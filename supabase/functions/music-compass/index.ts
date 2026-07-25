import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS",
};

type CompassTone =
    | "discovery"
    | "fire"
    | "legendary"
    | "quiet"
    | "library"
    | "artist"
    | "spanish"
    | "travel"
    | "memory"
    | "reflection"
    | "heart"
    | "map"
    | "data";

type CompassAction = {
    type: "navigate";
    path: string;
    state?: Record<string, unknown>;
};

type Compass = {
    id: string;
    tone: CompassTone;
    icon: string;
    eyebrow: string;
    title: string;
    text: string;
    button: string | null;
    action: CompassAction | null;
};

type UserAlbumRow = {
    id: string;
    album_id: string;
    status: string | null;

    generated_at: string | null;
    accepted_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    rejected_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    known_at: string | null;
    abandoned_at: string | null;
    paused_at: string | null;

    source: string | null;
    recommended_by: string | null;
};

type AlbumRow = {
    id: string;
    title: string;
    artist_name: string;
    release_year: number | null;
    genres: string[] | null;
    track_count: number | null;
    total_tracks: number | null;
    duration_ms: number | null;
    language: string | null;
    country: string | null;
    spanish_region: string | null;
    spanish_style: string | null;
    discovery_source: string | null;
};

type ReviewRow = {
    id: string;
    user_album_id: string;
    album_id: string;
    reaction: string | null;
    rating: number | string | null;
    review_text: string | null;
    would_listen_again: boolean | null;
    created_at: string | null;
    updated_at: string | null;
};

type ListeningItem = {
    userAlbum: UserAlbumRow;
    album: AlbumRow | null;
    review: ReviewRow | null;
};

type ForgottenGenre = {
    genre: string;
    days: number;
    rating: number | null;
};

type CompassStats = {
    completedCount: number;
    pendingCount: number;
    listeningCount: number;
    pausedCount: number;
    abandonedCount: number;
    recentAbandonedCount: number;

    currentStreak: number;
    bestStreak: number;

    sameGenre: string | null;
    sameGenreStreak: number;

    sameArtist: string | null;
    sameArtistStreak: number;

    favoriteGenre: string | null;
    favoriteGenreAverage: number | null;
    favoriteGenreCount: number;

    averageRating: number | null;
    recentAverageRating: number | null;
    previousAverageRating: number | null;

    lowRecentRatings: boolean;
    highRecentRatings: boolean;

    albumsSinceSpanish: number;
    spanishStreak: number;

    uniqueGenreCount: number;
    uniqueCountryCount: number;

    forgottenGenre: ForgottenGenre | null;

    totalTracks: number;
    totalMinutes: number;

    wouldListenAgainCount: number;
    reviewCount: number;
    perfectRatingsCount: number;

    completedThisMonth: number;
    completedThisWeek: number;

    latestAlbumTitle: string | null;
    latestArtistName: string | null;
};

type CompassRule = {
    id: string;
    priority: number;
    condition: (stats: CompassStats) => boolean;
    build: (stats: CompassStats) => Compass;
};

const FINISHED_STATUSES = new Set([
    "finished",
    "completed",
]);

const PENDING_STATUSES = new Set([
    "to_listen",
    "pending",
]);

const LISTENING_STATUSES = new Set([
    "listening",
    "started",
]);

const PAUSED_STATUSES = new Set([
    "paused",
]);

const ABANDONED_STATUSES = new Set([
    "abandoned",
    "rejected",
]);

const SPANISH_COUNTRIES = new Set([
    "spain",
    "espana",
    "mexico",
    "argentina",
    "chile",
    "colombia",
    "peru",
    "uruguay",
    "venezuela",
    "ecuador",
    "bolivia",
    "paraguay",
    "costa rica",
    "cuba",
    "puerto rico",
    "republica dominicana",
    "guatemala",
    "honduras",
    "el salvador",
    "nicaragua",
    "panama",
]);

function jsonResponse(
    body: unknown,
    status = 200,
) {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type":
                    "application/json",
            },
        },
    );
}

function normalize(value: unknown) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            "",
        )
        .trim()
        .toLowerCase();
}

function parseDate(
    value: string | null | undefined,
) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

function getDaysBetween(
    fromValue: string | Date | null,
    to = new Date(),
) {
    const from =
        fromValue instanceof Date
            ? fromValue
            : parseDate(fromValue);

    if (!from) {
        return null;
    }

    const difference =
        to.getTime() -
        from.getTime();

    return Math.max(
        0,
        Math.floor(
            difference /
                (1000 * 60 * 60 * 24),
        ),
    );
}

function getRating(
    review: ReviewRow | null,
) {
    if (
        review?.rating === null ||
        review?.rating === undefined
    ) {
        return null;
    }

    const rating =
        Number(review.rating);

    return Number.isFinite(rating)
        ? rating
        : null;
}

function roundOne(value: number | null) {
    if (
        value === null ||
        !Number.isFinite(value)
    ) {
        return null;
    }

    return Number(value.toFixed(1));
}

function average(
    values: Array<number | null>,
) {
    const valid =
        values.filter(
            (
                value,
            ): value is number =>
                typeof value ===
                    "number" &&
                Number.isFinite(value),
        );

    if (!valid.length) {
        return null;
    }

    return (
        valid.reduce(
            (total, value) =>
                total + value,
            0,
        ) / valid.length
    );
}

function getCompletedDate(
    item: ListeningItem,
) {
    return (
        item.userAlbum.completed_at ??
        item.review?.created_at ??
        item.userAlbum.updated_at ??
        item.userAlbum.created_at
    );
}

function sortByCompletedDate(
    items: ListeningItem[],
) {
    return [...items].sort(
        (a, b) => {
            const dateA =
                parseDate(
                    getCompletedDate(a),
                )?.getTime() ?? 0;

            const dateB =
                parseDate(
                    getCompletedDate(b),
                )?.getTime() ?? 0;

            return dateB - dateA;
        },
    );
}

function getGenres(
    item: ListeningItem,
) {
    if (
        !Array.isArray(
            item.album?.genres,
        )
    ) {
        return [];
    }

    return item.album.genres
        .map((genre) =>
            String(genre).trim()
        )
        .filter(Boolean);
}

function genresMatch(
    firstGenre: string,
    secondGenre: string,
) {
    const first =
        normalize(firstGenre);

    const second =
        normalize(secondGenre);

    if (!first || !second) {
        return false;
    }

    return (
        first === second ||
        first.includes(second) ||
        second.includes(first)
    );
}

function isSpanishAlbum(
    item: ListeningItem,
) {
    const language =
        normalize(
            item.album?.language,
        );

    const country =
        normalize(
            item.album?.country,
        );

    return (
        language === "es" ||
        language === "spa" ||
        language === "spanish" ||
        language === "espanol" ||
        Boolean(
            item.album
                ?.spanish_region,
        ) ||
        Boolean(
            item.album
                ?.spanish_style,
        ) ||
        SPANISH_COUNTRIES.has(
            country,
        )
    );
}

function getMostCommon(
    values: string[],
) {
    const entries = new Map<
        string,
        {
            label: string;
            count: number;
        }
    >();

    for (const value of values) {
        const key =
            normalize(value);

        if (!key) {
            continue;
        }

        const current =
            entries.get(key);

        entries.set(key, {
            label:
                current?.label ??
                value,
            count:
                (current?.count ??
                    0) + 1,
        });
    }

    return (
        [...entries.values()].sort(
            (a, b) =>
                b.count - a.count,
        )[0] ?? null
    );
}

function getConsecutiveArtist(
    completed: ListeningItem[],
) {
    const firstArtist =
        completed[0]?.album
            ?.artist_name;

    if (!firstArtist) {
        return {
            artist: null,
            count: 0,
        };
    }

    const normalizedArtist =
        normalize(firstArtist);

    let count = 0;

    for (const item of completed) {
        const artist =
            normalize(
                item.album
                    ?.artist_name,
            );

        if (
            artist !==
            normalizedArtist
        ) {
            break;
        }

        count += 1;
    }

    return {
        artist: firstArtist,
        count,
    };
}

function getConsecutiveGenre(
    completed: ListeningItem[],
) {
    const firstGenres =
        getGenres(
            completed[0],
        );

    if (!firstGenres.length) {
        return {
            genre: null,
            count: 0,
        };
    }

    let bestGenre:
        | string
        | null = null;

    let bestCount = 0;

    for (
        const candidateGenre
        of firstGenres
    ) {
        let count = 0;

        for (
            const item
            of completed
        ) {
            const matches =
                getGenres(item).some(
                    (genre) =>
                        genresMatch(
                            candidateGenre,
                            genre,
                        ),
                );

            if (!matches) {
                break;
            }

            count += 1;
        }

        if (count > bestCount) {
            bestGenre =
                candidateGenre;

            bestCount = count;
        }
    }

    return {
        genre: bestGenre,
        count: bestCount,
    };
}

function getGenreRatings(
    completed: ListeningItem[],
) {
    const genreData =
        new Map<
            string,
            {
                label: string;
                ratings: number[];
                count: number;
            }
        >();

    for (const item of completed) {
        const rating =
            getRating(
                item.review,
            );

        for (
            const genre
            of getGenres(item)
        ) {
            const key =
                normalize(genre);

            if (!key) {
                continue;
            }

            const current =
                genreData.get(key) ?? {
                    label: genre,
                    ratings: [],
                    count: 0,
                };

            current.count += 1;

            if (rating !== null) {
                current.ratings.push(
                    rating,
                );
            }

            genreData.set(
                key,
                current,
            );
        }
    }

    return [...genreData.values()]
        .map((entry) => ({
            genre: entry.label,
            count: entry.count,
            average:
                average(
                    entry.ratings,
                ),
        }))
        .filter(
            (entry) =>
                entry.count >= 2,
        )
        .sort((a, b) => {
            const averageA =
                a.average ?? -1;

            const averageB =
                b.average ?? -1;

            if (
                averageB !==
                averageA
            ) {
                return (
                    averageB -
                    averageA
                );
            }

            return (
                b.count -
                a.count
            );
        });
}

function getForgottenGenre(
    completed: ListeningItem[],
) {
    const history =
        new Map<
            string,
            {
                genre: string;
                latestDate:
                    | Date
                    | null;
                latestRating:
                    | number
                    | null;
            }
        >();

    for (const item of completed) {
        const date =
            parseDate(
                getCompletedDate(
                    item,
                ),
            );

        const rating =
            getRating(
                item.review,
            );

        for (
            const genre
            of getGenres(item)
        ) {
            const key =
                normalize(genre);

            if (!key) {
                continue;
            }

            const previous =
                history.get(key);

            if (
                !previous ||
                (date &&
                    (!previous.latestDate ||
                        date >
                            previous.latestDate))
            ) {
                history.set(key, {
                    genre,
                    latestDate:
                        date,
                    latestRating:
                        rating,
                });
            }
        }
    }

    const result =
        [...history.values()]
            .map((entry) => ({
                genre:
                    entry.genre,

                days:
                    entry.latestDate
                        ? getDaysBetween(
                              entry.latestDate,
                          ) ?? 0
                        : 0,

                rating:
                    entry.latestRating,
            }))
            .filter(
                (entry) =>
                    entry.days >=
                        25 &&
                    (entry.rating ===
                        null ||
                        entry.rating >=
                            7.5),
            )
            .sort(
                (a, b) =>
                    b.days -
                    a.days,
            )[0] ?? null;

    return result;
}

function isWithinDays(
    value: string | null,
    days: number,
) {
    const difference =
        getDaysBetween(value);

    return (
        difference !== null &&
        difference < days
    );
}

function buildStats({
    items,
    currentStreak,
    bestStreak,
}: {
    items: ListeningItem[];
    currentStreak: number;
    bestStreak: number;
}): CompassStats {
    const completed =
        sortByCompletedDate(
            items.filter(
                (item) => {
                    const status =
                        normalize(
                            item
                                .userAlbum
                                .status,
                        );

                    return (
                        FINISHED_STATUSES.has(
                            status,
                        ) ||
                        Boolean(
                            item
                                .userAlbum
                                .completed_at,
                        )
                    );
                },
            ),
        );

    const pending =
        items.filter((item) =>
            PENDING_STATUSES.has(
                normalize(
                    item.userAlbum
                        .status,
                ),
            )
        );

    const listening =
        items.filter((item) =>
            LISTENING_STATUSES.has(
                normalize(
                    item.userAlbum
                        .status,
                ),
            )
        );

    const paused =
        items.filter(
            (item) =>
                PAUSED_STATUSES.has(
                    normalize(
                        item
                            .userAlbum
                            .status,
                    ),
                ) ||
                Boolean(
                    item.userAlbum
                        .paused_at,
                ),
        );

    const abandoned =
        items.filter(
            (item) =>
                ABANDONED_STATUSES.has(
                    normalize(
                        item
                            .userAlbum
                            .status,
                    ),
                ) ||
                Boolean(
                    item.userAlbum
                        .abandoned_at,
                ),
        );

    const recentAbandoned =
        abandoned.filter(
            (item) =>
                isWithinDays(
                    item.userAlbum
                        .abandoned_at ??
                        item.userAlbum
                            .updated_at,
                    14,
                ),
        );

    const recentTen =
        completed.slice(0, 10);

    const recentFive =
        completed.slice(0, 5);

    const previousFive =
        completed.slice(5, 10);

    const allRatings =
        completed.map((item) =>
            getRating(
                item.review,
            )
        );

    const recentRatings =
        recentFive.map((item) =>
            getRating(
                item.review,
            )
        );

    const previousRatings =
        previousFive.map((item) =>
            getRating(
                item.review,
            )
        );

    const consecutiveGenre =
        getConsecutiveGenre(
            completed,
        );

    const consecutiveArtist =
        getConsecutiveArtist(
            completed,
        );

    const genreRatings =
        getGenreRatings(
            completed,
        );

    const favoriteGenre =
        genreRatings[0] ?? null;

    let albumsSinceSpanish = 0;

    for (const item of completed) {
        if (isSpanishAlbum(item)) {
            break;
        }

        albumsSinceSpanish += 1;
    }

    let spanishStreak = 0;

    for (const item of completed) {
        if (!isSpanishAlbum(item)) {
            break;
        }

        spanishStreak += 1;
    }

    const uniqueGenres =
        new Set(
            completed
                .flatMap(getGenres)
                .map(normalize)
                .filter(Boolean),
        );

    const uniqueCountries =
        new Set(
            completed
                .map(
                    (item) =>
                        normalize(
                            item.album
                                ?.country,
                        ),
                )
                .filter(Boolean),
        );

    const totalTracks =
        completed.reduce(
            (total, item) => {
                const count =
                    Number(
                        item.album
                            ?.track_count ??
                            item.album
                                ?.total_tracks ??
                            0,
                    );

                return (
                    total +
                    (Number.isFinite(
                        count,
                    )
                        ? count
                        : 0)
                );
            },
            0,
        );

    const totalDurationMs =
        completed.reduce(
            (total, item) => {
                const duration =
                    Number(
                        item.album
                            ?.duration_ms ??
                            0,
                    );

                return (
                    total +
                    (Number.isFinite(
                        duration,
                    )
                        ? duration
                        : 0)
                );
            },
            0,
        );

    const reviewCount =
        completed.filter(
            (item) =>
                item.review !==
                null,
        ).length;

    const wouldListenAgainCount =
        completed.filter(
            (item) =>
                item.review
                    ?.would_listen_again ===
                true,
        ).length;

    const perfectRatingsCount =
        completed.filter(
            (item) =>
                getRating(
                    item.review,
                ) === 10,
        ).length;

    const now = new Date();

    const completedThisWeek =
        completed.filter(
            (item) =>
                isWithinDays(
                    getCompletedDate(
                        item,
                    ),
                    7,
                ),
        ).length;

    const completedThisMonth =
        completed.filter(
            (item) => {
                const date =
                    parseDate(
                        getCompletedDate(
                            item,
                        ),
                    );

                return (
                    date !== null &&
                    date.getFullYear() ===
                        now.getFullYear() &&
                    date.getMonth() ===
                        now.getMonth()
                );
            },
        ).length;

    const recentAverage =
        average(
            recentRatings,
        );

    return {
        completedCount:
            completed.length,

        pendingCount:
            pending.length,

        listeningCount:
            listening.length,

        pausedCount:
            paused.length,

        abandonedCount:
            abandoned.length,

        recentAbandonedCount:
            recentAbandoned.length,

        currentStreak:
            Math.max(
                0,
                currentStreak,
            ),

        bestStreak:
            Math.max(
                0,
                bestStreak,
            ),

        sameGenre:
            consecutiveGenre.genre,

        sameGenreStreak:
            consecutiveGenre.count,

        sameArtist:
            consecutiveArtist.artist,

        sameArtistStreak:
            consecutiveArtist.count,

        favoriteGenre:
            favoriteGenre?.genre ??
            null,

        favoriteGenreAverage:
            roundOne(
                favoriteGenre
                    ?.average ??
                    null,
            ),

        favoriteGenreCount:
            favoriteGenre?.count ??
            0,

        averageRating:
            roundOne(
                average(
                    allRatings,
                ),
            ),

        recentAverageRating:
            roundOne(
                recentAverage,
            ),

        previousAverageRating:
            roundOne(
                average(
                    previousRatings,
                ),
            ),

        lowRecentRatings:
            recentRatings.filter(
                (rating) =>
                    rating !== null,
            ).length >= 3 &&
            recentAverage !== null &&
            recentAverage < 6,

        highRecentRatings:
            recentRatings.filter(
                (rating) =>
                    rating !== null,
            ).length >= 3 &&
            recentAverage !== null &&
            recentAverage >= 8,

        albumsSinceSpanish,

        spanishStreak,

        uniqueGenreCount:
            uniqueGenres.size,

        uniqueCountryCount:
            uniqueCountries.size,

        forgottenGenre:
            getForgottenGenre(
                completed,
            ),

        totalTracks,

        totalMinutes:
            Math.round(
                totalDurationMs /
                    60000,
            ),

        wouldListenAgainCount,

        reviewCount,

        perfectRatingsCount,

        completedThisMonth,

        completedThisWeek,

        latestAlbumTitle:
            completed[0]?.album
                ?.title ?? null,

        latestArtistName:
            completed[0]?.album
                ?.artist_name ??
            null,
    };
}

function plural(
    value: number,
    singular: string,
    pluralWord: string,
) {
    return value === 1
        ? singular
        : pluralWord;
}

function navigateAction(
    path: string,
    state?: Record<
        string,
        unknown
    >,
): CompassAction {
    return {
        type: "navigate",
        path,
        ...(state
            ? {
                  state,
              }
            : {}),
    };
}

const rules: CompassRule[] = [
    {
        id: "first-album",
        priority: 120,

        condition: (stats) =>
            stats.completedCount === 0,

        build: () => ({
            id: "first-album",
            tone: "discovery",
            icon: "🌅",
            eyebrow:
                "TU HISTORIA EMPIEZA AQUÍ",
            title:
                "Tu primer gran descubrimiento sigue esperando",
            text:
                "No necesitas saber qué buscar. Déjate sorprender y empieza a construir tu propio mapa musical.",
            button: "Sorpréndeme",
            action: navigateAction(
                "/discover",
                {
                    autoGenerate: true,
                },
            ),
        }),
    },

    {
        id: "restart-streak",
        priority: 116,

        condition: (stats) =>
            stats.currentStreak ===
                0 &&
            stats.completedCount > 0,

        build: () => ({
            id: "restart-streak",
            tone: "quiet",
            icon: "🕯️",
            eyebrow:
                "HOY PUEDES VOLVER A EMPEZAR",
            title:
                "La llama se apagó, pero tu historia sigue intacta",
            text:
                "Una racha rota no borra ningún disco, ninguna emoción ni todo lo que ya has descubierto. Hoy solo hace falta volver.",
            button:
                "Encender una nueva racha",
            action: navigateAction(
                "/discover",
                {
                    autoGenerate: true,
                },
            ),
        }),
    },

    {
        id: "beat-streak-record",
        priority: 114,

        condition: (stats) =>
            stats.currentStreak > 0 &&
            stats.bestStreak >
                stats.currentStreak &&
            stats.bestStreak -
                stats.currentStreak <=
                2,

        build: (stats) => {
            const remaining =
                stats.bestStreak -
                stats.currentStreak;

            return {
                id: "beat-streak-record",
                tone: "fire",
                icon: "🔥",
                eyebrow:
                    "ESTÁS ROZANDO TU RÉCORD",
                title: `${remaining} ${plural(
                    remaining,
                    "día",
                    "días",
                )} para hacer historia`,
                text:
                    "Has llegado demasiado lejos como para dejar que se apague ahora. Tu mejor racha está justo delante.",
                button:
                    "Continuar la racha",
                action:
                    navigateAction(
                        "/discover",
                    ),
            };
        },
    },

    {
        id: "legendary-streak",
        priority: 112,

        condition: (stats) =>
            stats.currentStreak >= 30,

        build: (stats) => ({
            id: "legendary-streak",
            tone: "legendary",
            icon: "🌋",
            eyebrow:
                "RACHA LEGENDARIA",
            title: `${stats.currentStreak} días escuchando con intención`,
            text:
                "Esto ya no es un reto pasajero. La música se ha convertido en una parte consciente de tus días.",
            button: null,
            action: null,
        }),
    },

    {
        id: "paused-albums",
        priority: 108,

        condition: (stats) =>
            stats.pausedCount >= 3,

        build: (stats) => ({
            id: "paused-albums",
            tone: "memory",
            icon: "⏸️",
            eyebrow:
                "TIENES VIAJES A MEDIAS",
            title: `${stats.pausedCount} discos siguen en pausa`,
            text:
                "No todos los discos entran a la primera. Quizá alguno solo estaba esperando el momento adecuado.",
            button:
                "Retomar una escucha",
            action:
                navigateAction(
                    "/listening",
                ),
        }),
    },

    {
        id: "recent-abandons",
        priority: 106,

        condition: (stats) =>
            stats.recentAbandonedCount >=
            3,

        build: (stats) => ({
            id: "recent-abandons",
            tone: "reflection",
            icon: "🌧️",
            eyebrow:
                "NO ESTÁS ENCONTRANDO EL DISCO",
            title: `${stats.recentAbandonedCount} abandonos recientes`,
            text:
                "No pasa nada por dejar un álbum. Pero quizá hoy convenga ir hacia un terreno que sabes que suele emocionarte.",
            button:
                "Volver a mis gustos",
            action:
                navigateAction(
                    "/recommendations",
                ),
        }),
    },

    {
        id: "pending-overload",
        priority: 104,

        condition: (stats) =>
            stats.pendingCount >= 12,

        build: (stats) => ({
            id: "pending-overload",
            tone: "library",
            icon: "📚",
            eyebrow:
                "TU ESTANTERÍA TE ESTÁ LLAMANDO",
            title: `${stats.pendingCount} discos siguen esperando`,
            text:
                "Antes de añadir otra promesa a la lista, quizá alguno de esos discos merezca convertirse en el protagonista de hoy.",
            button:
                "Elegir un pendiente",
            action:
                navigateAction(
                    "/to-listen",
                ),
        }),
    },

    {
        id: "same-genre",
        priority: 102,

        condition: (stats) =>
            stats.sameGenreStreak >=
                5 &&
            Boolean(
                stats.sameGenre,
            ),

        build: (stats) => ({
            id: "same-genre",
            tone: "discovery",
            icon: "🧭",
            eyebrow:
                "TU BRÚJULA PIDE UN GIRO",
            title: `Últimamente todo apunta hacia ${stats.sameGenre}`,
            text: `Llevas ${stats.sameGenreStreak} discos seguidos moviéndote por un territorio parecido. Quizá hoy toque cambiar completamente de paisaje.`,
            button:
                "Explorar algo distinto",
            action:
                navigateAction(
                    "/discover",
                    {
                        openGenreSelector:
                            true,
                    },
                ),
        }),
    },

    {
        id: "same-artist",
        priority: 100,

        condition: (stats) =>
            stats.sameArtistStreak >=
                3 &&
            Boolean(
                stats.sameArtist,
            ),

        build: (stats) => ({
            id: "same-artist",
            tone: "artist",
            icon: "🎤",
            eyebrow:
                "ESE ARTISTA YA VIVE AQUÍ",
            title: `${stats.sameArtist} domina tus últimas escuchas`,
            text: `Has escuchado ${stats.sameArtistStreak} discos seguidos del mismo artista. Buena obsesión, pero quizá haya otra voz esperando encontrarte.`,
            button:
                "Descubrir otra voz",
            action:
                navigateAction(
                    "/discover",
                    {
                        autoGenerate:
                            true,
                    },
                ),
        }),
    },

    {
        id: "back-to-spanish",
        priority: 98,

        condition: (stats) =>
            stats.albumsSinceSpanish >=
            8,

        build: (stats) => ({
            id: "back-to-spanish",
            tone: "spanish",
            icon: "🇪🇸",
            eyebrow:
                "HACE TIEMPO QUE NO VUELVES",
            title: `${stats.albumsSinceSpanish} discos desde tu última escucha en español`,
            text:
                "Fuera hay un mundo enorme, pero a veces viene bien volver a una letra que entra sin pedir permiso.",
            button:
                "Descubrir en español",
            action:
                navigateAction(
                    "/discover",
                    {
                        discoverSpanish:
                            true,
                    },
                ),
        }),
    },

    {
        id: "travel-outside",
        priority: 96,

        condition: (stats) =>
            stats.spanishStreak >= 7,

        build: (stats) => ({
            id: "travel-outside",
            tone: "travel",
            icon: "🌍",
            eyebrow:
                "HOY TOCA VIAJAR",
            title: `${stats.spanishStreak} discos seguidos cerca de casa`,
            text:
                "Tu música lleva varios días en español. Quizá hoy sea buen momento para cruzar una frontera sonora.",
            button:
                "Salir de viaje",
            action:
                navigateAction(
                    "/discover",
                    {
                        autoGenerate:
                            true,
                    },
                ),
        }),
    },

    {
        id: "forgotten-genre",
        priority: 94,

        condition: (stats) =>
            Boolean(
                stats.forgottenGenre,
            ),

        build: (stats) => {
            const forgotten =
                stats.forgottenGenre!;

            const ratingText =
                forgotten.rating !==
                null
                    ? ` La última vez le diste un ${forgotten.rating}.`
                    : "";

            return {
                id: "forgotten-genre",
                tone: "memory",
                icon: "🎷",
                eyebrow:
                    "UN VIEJO SONIDO TE ESPERA",
                title: `Hace tiempo que no vuelves al ${forgotten.genre}`,
                text: `Han pasado ${forgotten.days} días desde tu última visita.${ratingText} Quizá hoy sea el momento de regresar.`,
                button: `Descubrir ${forgotten.genre}`,
                action:
                    navigateAction(
                        "/discover",
                        {
                            selectedGenre:
                                forgotten.genre,
                            openGenreSelector:
                                true,
                        },
                    ),
            };
        },
    },

    {
        id: "low-ratings",
        priority: 92,

        condition: (stats) =>
            stats.lowRecentRatings,

        build: () => ({
            id: "low-ratings",
            tone: "reflection",
            icon: "🤔",
            eyebrow:
                "ÚLTIMAMENTE ESTÁS SIENDO DURO",
            title:
                "Quizá el siguiente sea el disco adecuado",
            text:
                "Tus últimas valoraciones han sido más bajas de lo habitual. Puede que tu oído esté pidiendo un cambio completo de rumbo.",
            button:
                "Buscar algo diferente",
            action:
                navigateAction(
                    "/discover",
                    {
                        autoGenerate:
                            true,
                    },
                ),
        }),
    },

    {
        id: "rating-evolution",
        priority: 90,

        condition: (stats) =>
            stats.recentAverageRating !==
                null &&
            stats.previousAverageRating !==
                null &&
            stats.recentAverageRating -
                stats.previousAverageRating >=
                1,

        build: (stats) => ({
            id: "rating-evolution",
            tone: "data",
            icon: "📈",
            eyebrow:
                "TU OÍDO ESTÁ CAMBIANDO",
            title: `Tu media ha subido de ${stats.previousAverageRating} a ${stats.recentAverageRating}`,
            text:
                "Tus últimas elecciones están conectando más contigo. Puede que cada vez entiendas mejor qué clase de disco estás buscando.",
            button: null,
            action: null,
        }),
    },

    {
        id: "favorite-genre",
        priority: 88,

        condition: (stats) =>
            Boolean(
                stats.favoriteGenre,
            ) &&
            stats.favoriteGenreCount >=
                4 &&
            stats.favoriteGenreAverage !==
                null &&
            stats.favoriteGenreAverage >=
                7.5,

        build: (stats) => ({
            id: "favorite-genre",
            tone: "heart",
            icon: "❤️",
            eyebrow:
                "TU CORAZÓN MUSICAL HABLA",
            title: `${stats.favoriteGenre} parece ser uno de tus lugares favoritos`,
            text: `Has escuchado ${stats.favoriteGenreCount} discos de este territorio y tu nota media es ${stats.favoriteGenreAverage}. No parece una casualidad.`,
            button: `Explorar ${stats.favoriteGenre}`,
            action:
                navigateAction(
                    "/discover",
                    {
                        selectedGenre:
                            stats.favoriteGenre,
                        openGenreSelector:
                            true,
                    },
                ),
        }),
    },

    {
        id: "many-relisten",
        priority: 86,

        condition: (stats) =>
            stats.wouldListenAgainCount >=
            10,

        build: (stats) => ({
            id: "many-relisten",
            tone: "heart",
            icon: "🔁",
            eyebrow:
                "ESTÁS CREANDO TUS PROPIOS CLÁSICOS",
            title: `${stats.wouldListenAgainCount} discos merecen volver`,
            text:
                "Ya no son simples descubrimientos. Son álbumes que han ganado un lugar permanente en tu vida.",
            button:
                "Ver mi biblioteca",
            action:
                navigateAction(
                    "/library",
                ),
        }),
    },

    {
        id: "perfect-tens",
        priority: 84,

        condition: (stats) =>
            stats.perfectRatingsCount >=
            3,

        build: (stats) => ({
            id: "perfect-tens",
            tone: "legendary",
            icon: "💎",
            eyebrow:
                "TU PANTEÓN PERSONAL",
            title: `${stats.perfectRatingsCount} discos han alcanzado el 10`,
            text:
                "Muy pocos álbumes llegan hasta ahí. Los que lo consiguen ya forman parte de tu historia musical más íntima.",
            button:
                "Volver a mi biblioteca",
            action:
                navigateAction(
                    "/library",
                ),
        }),
    },

    {
        id: "genre-map",
        priority: 82,

        condition: (stats) =>
            stats.uniqueGenreCount >= 10,

        build: (stats) => ({
            id: "genre-map",
            tone: "map",
            icon: "🗺️",
            eyebrow:
                "TU MAPA SIGUE CRECIENDO",
            title: `${stats.uniqueGenreCount} géneros ya forman parte de tu historia`,
            text:
                "Cada estilo nuevo cambia un poco la manera en la que escuchas los demás. Todavía quedan muchos territorios por abrir.",
            button:
                "Ampliar el mapa",
            action:
                navigateAction(
                    "/discover",
                    {
                        openGenreSelector:
                            true,
                    },
                ),
        }),
    },

    {
        id: "world-map",
        priority: 80,

        condition: (stats) =>
            stats.uniqueCountryCount >=
            5,

        build: (stats) => ({
            id: "world-map",
            tone: "travel",
            icon: "✈️",
            eyebrow:
                "TU BIBLIOTECA YA VIAJA",
            title: `${stats.uniqueCountryCount} países suenan dentro de Audite`,
            text:
                "Tu colección empieza a parecerse a un mapa del mundo. Cada lugar trae una forma distinta de entender la música.",
            button:
                "Descubrir otro lugar",
            action:
                navigateAction(
                    "/discover",
                    {
                        autoGenerate:
                            true,
                    },
                ),
        }),
    },

    {
        id: "hundred-albums",
        priority: 78,

        condition: (stats) =>
            stats.completedCount >=
            100,

        build: (stats) => ({
            id: "hundred-albums",
            tone: "legendary",
            icon: "🏆",
            eyebrow:
                "MIRA TODO LO QUE HAS CONSTRUIDO",
            title: `${stats.completedCount} discos ya forman parte de ti`,
            text:
                "No es solo una cifra. Son artistas, letras, portadas y momentos que ahora tienen un lugar en tu historia.",
            button:
                "Ver mi biblioteca",
            action:
                navigateAction(
                    "/library",
                ),
        }),
    },

    {
        id: "month-active",
        priority: 76,

        condition: (stats) =>
            stats.completedThisMonth >=
            10,

        build: (stats) => ({
            id: "month-active",
            tone: "fire",
            icon: "⚡",
            eyebrow:
                "ESTÁS VIVIENDO UN GRAN MES",
            title: `${stats.completedThisMonth} discos terminados este mes`,
            text:
                "Tu historia musical está creciendo a una velocidad preciosa. No olvides dejar espacio para volver a tus favoritos.",
            button: null,
            action: null,
        }),
    },

    {
        id: "week-active",
        priority: 74,

        condition: (stats) =>
            stats.completedThisWeek >=
            5,

        build: (stats) => ({
            id: "week-active",
            tone: "fire",
            icon: "🎧",
            eyebrow:
                "UNA SEMANA LLENA DE MÚSICA",
            title: `${stats.completedThisWeek} discos en los últimos 7 días`,
            text:
                "Has reservado mucho tiempo para escuchar de verdad. Eso no es consumir música: es vivir dentro de ella.",
            button: null,
            action: null,
        }),
    },

    {
        id: "high-ratings",
        priority: 72,

        condition: (stats) =>
            stats.highRecentRatings,

        build: (stats) => ({
            id: "high-ratings",
            tone: "heart",
            icon: "✨",
            eyebrow:
                "ESTÁS ELIGIENDO MUY BIEN",
            title: `Tu media reciente es ${stats.recentAverageRating}`,
            text:
                "Tus últimas decisiones están funcionando. Quizá tu intuición musical esté más afinada de lo que crees.",
            button:
                "Seguir descubriendo",
            action:
                navigateAction(
                    "/discover",
                ),
        }),
    },

    {
        id: "many-tracks",
        priority: 68,

        condition: (stats) =>
            stats.totalTracks >= 500,

        build: (stats) => ({
            id: "many-tracks",
            tone: "data",
            icon: "🎵",
            eyebrow:
                "UN DATO SOBRE TU VIAJE",
            title: `Ya has atravesado ${stats.totalTracks} canciones`,
            text:
                "Una detrás de otra han ido construyendo tu identidad como oyente. Y la siguiente todavía puede sorprenderte.",
            button: null,
            action: null,
        }),
    },

    {
        id: "listening-hours",
        priority: 66,

        condition: (stats) =>
            stats.totalMinutes >=
            1200,

        build: (stats) => {
            const hours =
                Math.round(
                    stats.totalMinutes /
                        60,
                );

            return {
                id: "listening-hours",
                tone: "data",
                icon: "⏳",
                eyebrow:
                    "TODO ESTE TIEMPO HA SONADO",
                title: `Más de ${hours} horas de discos`,
                text:
                    "Son horas que podrías haber llenado de ruido, pero elegiste dedicarlas a escuchar con atención.",
                button: null,
                action: null,
            };
        },
    },

    {
        id: "healthy-streak",
        priority: 64,

        condition: (stats) =>
            stats.currentStreak >= 7,

        build: (stats) => ({
            id: "healthy-streak",
            tone: "fire",
            icon: "❤️‍🔥",
            eyebrow:
                "ESTO EMPIEZA A SER UN HÁBITO",
            title: `${stats.currentStreak} días escuchando con intención`,
            text:
                "No estás simplemente poniendo música. Estás reservando un momento diario para descubrirla de verdad.",
            button: null,
            action: null,
        }),
    },

    {
        id: "pending-small",
        priority: 40,

        condition: (stats) =>
            stats.pendingCount >= 4,

        build: (stats) => ({
            id: "pending-small",
            tone: "library",
            icon: "💿",
            eyebrow:
                "YA ELEGISTE EL CAMINO",
            title: `${stats.pendingCount} posibles próximas escuchas`,
            text:
                "No siempre hace falta descubrir algo nuevo. A veces el disco correcto ya está esperando en tu lista.",
            button:
                "Elegir uno",
            action:
                navigateAction(
                    "/to-listen",
                ),
        }),
    },

    {
        id: "random-discovery",
        priority: 10,

        condition: () => true,

        build: () => ({
            id: "random-discovery",
            tone: "discovery",
            icon: "🎲",
            eyebrow:
                "HOY TU BRÚJULA APUNTA A LO DESCONOCIDO",
            title:
                "Prueba a no elegir",
            text:
                "Olvida durante un momento los géneros, los años y los artistas. Algunos discos llegan mejor cuando nadie los estaba buscando.",
            button: "Sorpréndeme",
            action:
                navigateAction(
                    "/discover",
                    {
                        autoGenerate:
                            true,
                    },
                ),
        }),
    },
];

function hashString(value: string) {
    let hash = 2166136261;

    for (
        let index = 0;
        index < value.length;
        index += 1
    ) {
        hash ^=
            value.charCodeAt(
                index,
            );

        hash = Math.imul(
            hash,
            16777619,
        );
    }

    return hash >>> 0;
}

function getDailyKey() {
    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "Europe/Madrid",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        },
    ).format(new Date());
}

function selectCompass(
    userId: string,
    stats: CompassStats,
) {
    const eligible =
        rules
            .filter((rule) => {
                try {
                    return rule.condition(
                        stats,
                    );
                } catch (error) {
                    console.error(
                        `Compass rule failed: ${rule.id}`,
                        error,
                    );

                    return false;
                }
            })
            .sort(
                (a, b) =>
                    b.priority -
                    a.priority,
            );

    if (!eligible.length) {
        return null;
    }

    /*
     * No elegimos siempre la primera.
     *
     * Tomamos reglas cercanas a la prioridad
     * máxima y rotamos cada día de forma
     * estable para cada usuario.
     */
    const highestPriority =
        eligible[0].priority;

    const candidates =
        eligible.filter(
            (rule) =>
                rule.priority >=
                highestPriority - 14,
        );

    const dailySeed =
        `${userId}:${getDailyKey()}`;

    const selectedIndex =
        hashString(dailySeed) %
        candidates.length;

    return candidates[
        selectedIndex
    ].build(stats);
}

Deno.serve(
    async (request: Request) => {
        if (
            request.method ===
            "OPTIONS"
        ) {
            return new Response(
                "ok",
                {
                    headers:
                        corsHeaders,
                },
            );
        }

        if (
            request.method !==
            "POST"
        ) {
            return jsonResponse(
                {
                    error:
                        "Método no permitido.",
                },
                405,
            );
        }

        try {
            const supabaseUrl =
                Deno.env.get(
                    "SUPABASE_URL",
                );

            const supabaseAnonKey =
                Deno.env.get(
                    "SUPABASE_ANON_KEY",
                );

            const authorization =
                request.headers.get(
                    "Authorization",
                );

            if (
                !supabaseUrl ||
                !supabaseAnonKey
            ) {
                return jsonResponse(
                    {
                        error:
                            "Faltan las variables de Supabase.",
                    },
                    500,
                );
            }

            if (!authorization) {
                return jsonResponse(
                    {
                        error:
                            "No hay una sesión válida.",
                    },
                    401,
                );
            }

            const supabase =
                createClient(
                    supabaseUrl,
                    supabaseAnonKey,
                    {
                        global: {
                            headers: {
                                Authorization:
                                    authorization,
                            },
                        },

                        auth: {
                            persistSession:
                                false,
                            autoRefreshToken:
                                false,
                        },
                    },
                );

            const {
                data: userData,
                error: userError,
            } =
                await supabase.auth.getUser();

            if (
                userError ||
                !userData.user
            ) {
                console.error(
                    "Music compass auth error:",
                    userError,
                );

                return jsonResponse(
                    {
                        error:
                            "Tu sesión ha caducado.",
                    },
                    401,
                );
            }

            let requestBody: {
                currentStreak?: number;
                bestStreak?: number;
            } = {};

            try {
                requestBody =
                    await request.json();
            } catch {
                requestBody = {};
            }

            const currentStreak =
                Number.isFinite(
                    Number(
                        requestBody.currentStreak,
                    ),
                )
                    ? Math.max(
                          0,
                          Number(
                              requestBody.currentStreak,
                          ),
                      )
                    : 0;

            const bestStreak =
                Number.isFinite(
                    Number(
                        requestBody.bestStreak,
                    ),
                )
                    ? Math.max(
                          0,
                          Number(
                              requestBody.bestStreak,
                          ),
                      )
                    : 0;

            const userId =
                userData.user.id;

            /*
             * Consulta 1:
             * relación del usuario con sus discos.
             */
            const {
                data: userAlbums,
                error:
                    userAlbumsError,
            } = await supabase
                .from("user_albums")
                .select(`
                    id,
                    album_id,
                    status,
                    generated_at,
                    accepted_at,
                    started_at,
                    completed_at,
                    rejected_at,
                    created_at,
                    updated_at,
                    known_at,
                    source,
                    recommended_by,
                    abandoned_at,
                    paused_at
                `)
                .eq("user_id", userId)
                .order("updated_at", {
                    ascending: false,
                })
                .limit(500);

            if (userAlbumsError) {
                console.error(
                    "Music compass user_albums error:",
                    userAlbumsError,
                );

                return jsonResponse(
                    {
                        error:
                            "No hemos podido leer tu historial musical.",
                    },
                    500,
                );
            }

            const typedUserAlbums =
                (userAlbums ??
                    []) as UserAlbumRow[];

            const userAlbumIds =
                typedUserAlbums.map(
                    (row) => row.id,
                );

            const albumIds =
                [
                    ...new Set(
                        typedUserAlbums
                            .map(
                                (row) =>
                                    row.album_id,
                            )
                            .filter(Boolean),
                    ),
                ];

            /*
             * Evitamos ejecutar .in() con
             * arrays vacíos.
             */
            let albums:
                AlbumRow[] = [];

            if (albumIds.length > 0) {
                const {
                    data:
                        albumsData,
                    error:
                        albumsError,
                } = await supabase
                    .from("albums")
                    .select(`
                        id,
                        title,
                        artist_name,
                        release_year,
                        genres,
                        track_count,
                        total_tracks,
                        duration_ms,
                        language,
                        country,
                        spanish_region,
                        spanish_style,
                        discovery_source
                    `)
                    .in(
                        "id",
                        albumIds,
                    );

                if (albumsError) {
                    console.error(
                        "Music compass albums error:",
                        albumsError,
                    );

                    return jsonResponse(
                        {
                            error:
                                "No hemos podido analizar tus discos.",
                        },
                        500,
                    );
                }

                albums =
                    (albumsData ??
                        []) as AlbumRow[];
            }

            /*
             * Consulta 3:
             * valoraciones asociadas a cada
             * user_album.
             */
            let reviews:
                ReviewRow[] = [];

            if (
                userAlbumIds.length >
                0
            ) {
                const {
                    data:
                        reviewsData,
                    error:
                        reviewsError,
                } = await supabase
                    .from(
                        "album_reviews",
                    )
                    .select(`
                        id,
                        user_album_id,
                        album_id,
                        reaction,
                        rating,
                        review_text,
                        would_listen_again,
                        created_at,
                        updated_at
                    `)
                    .eq(
                        "user_id",
                        userId,
                    )
                    .in(
                        "user_album_id",
                        userAlbumIds,
                    );

                if (reviewsError) {
                    console.error(
                        "Music compass reviews error:",
                        reviewsError,
                    );

                    return jsonResponse(
                        {
                            error:
                                "No hemos podido analizar tus valoraciones.",
                        },
                        500,
                    );
                }

                reviews =
                    (reviewsData ??
                        []) as ReviewRow[];
            }

            const albumsById =
                new Map(
                    albums.map(
                        (album) => [
                            album.id,
                            album,
                        ],
                    ),
                );

            const reviewsByUserAlbumId =
                new Map<
                    string,
                    ReviewRow
                >();

            /*
             * Si hubiese más de una review,
             * conservamos la más recientemente
             * actualizada.
             */
            for (
                const review
                of reviews
            ) {
                const previous =
                    reviewsByUserAlbumId.get(
                        review.user_album_id,
                    );

                const previousDate =
                    parseDate(
                        previous?.updated_at ??
                            previous?.created_at,
                    )?.getTime() ?? 0;

                const currentDate =
                    parseDate(
                        review.updated_at ??
                            review.created_at,
                    )?.getTime() ?? 0;

                if (
                    !previous ||
                    currentDate >=
                        previousDate
                ) {
                    reviewsByUserAlbumId.set(
                        review.user_album_id,
                        review,
                    );
                }
            }

            const items:
                ListeningItem[] =
                typedUserAlbums.map(
                    (userAlbum) => ({
                        userAlbum,

                        album:
                            albumsById.get(
                                userAlbum.album_id,
                            ) ?? null,

                        review:
                            reviewsByUserAlbumId.get(
                                userAlbum.id,
                            ) ?? null,
                    }),
                );

            const stats =
                buildStats({
                    items,
                    currentStreak,
                    bestStreak,
                });

            const compass =
                selectCompass(
                    userId,
                    stats,
                );

            return jsonResponse({
                compass,

                /*
                 * Resulta útil mientras la
                 * funcionalidad está en pruebas.
                 * Puedes quitar stats cuando
                 * confirmes que todo funciona.
                 */
                stats,
            });
        } catch (error) {
            console.error(
                "Unexpected music compass error:",
                error,
            );

            return jsonResponse(
                {
                    error:
                        error instanceof
                        Error
                            ? error.message
                            : "Ha ocurrido un error inesperado.",
                },
                500,
            );
        }
    },
);