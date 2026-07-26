import { useEffect, useMemo, useState } from "react";
import LibraryTabs from "../components/LibraryTabs";
import { useAuth } from "../context/AuthContext";
import { getRankedAlbums } from "../services/reviews";
import "./Ranking.css";

const reactionLabels = {
    loved: "Me ha encantado",
    liked: "Me ha gustado",
    okay: "Sin más",
    weak: "Flojo",
    disliked: "No me ha gustado",
};

const podiumData = [
    {
        position: 1,
        medal: "🥇",
        label: "Oro",
    },
    {
        position: 2,
        medal: "🥈",
        label: "Plata",
    },
    {
        position: 3,
        medal: "🥉",
        label: "Bronce",
    },
];

function formatRating(rating) {
    return Number(rating)
        .toFixed(1)
        .replace(".", ",");
}

function getMovement(review) {
    const previousPosition =
        Number(review.previous_position);

    const currentPosition =
        Number(review.position);

    if (
        !Number.isInteger(previousPosition) ||
        !Number.isInteger(currentPosition)
    ) {
        return 0;
    }

    /*
     * Anterior 8, actual 3:
     * 8 - 3 = +5 → ha subido cinco puestos.
     */
    return previousPosition - currentPosition;
}

function RankingMovement({
    review,
    compact = false,
}) {
    const movement = getMovement(review);

    if (movement === 0) {
        return null;
    }

    const movedUp = movement > 0;
    const amount = Math.abs(movement);

    return (
        <span
            className={[
                "ranking-movement",
                movedUp
                    ? "ranking-movement--up"
                    : "ranking-movement--down",
                compact
                    ? "ranking-movement--compact"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
            title={
                movedUp
                    ? `Ha subido ${amount} puestos`
                    : `Ha bajado ${amount} puestos`
            }
        >
            <b>{movedUp ? "↑" : "↓"}</b>

            <strong>
                {movedUp ? "+" : "−"}
                {amount}
            </strong>

            {!compact && (
                <small>
                    {amount === 1
                        ? "puesto"
                        : "puestos"}
                </small>
            )}
        </span>
    );
}

function Ranking() {
    const { user } = useAuth();

    const [rankedAlbums, setRankedAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadRanking() {
            try {
                const albums = await getRankedAlbums(
                    user.id,
                );

                if (!cancelled) {
                    setRankedAlbums(albums);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMessage(
                        "No hemos podido cargar tu ranking.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadRanking();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const podiumAlbums = useMemo(() => {
        return podiumData.flatMap(
            (podiumItem) =>
                rankedAlbums
                    .filter(
                        (review) =>
                            review.position ===
                            podiumItem.position,
                    )
                    .map((review) => ({
                        ...podiumItem,
                        review,
                    })),
        );
    }, [rankedAlbums]);

    const remainingAlbums = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        return rankedAlbums.filter((review) => {
            if (review.position <= 3) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const title =
                review.album?.title?.toLowerCase() ?? "";

            const artist =
                review.album?.artist_name?.toLowerCase() ??
                "";

            return (
                title.includes(normalizedSearch) ||
                artist.includes(normalizedSearch)
            );
        });
    }, [rankedAlbums, search]);

    const rankingStats = useMemo(() => {
        if (!rankedAlbums.length) {
            return {
                highestRating: null,
                averageRating: null,
            };
        }

        const total = rankedAlbums.reduce(
            (sum, review) => sum + review.rating,
            0,
        );

        return {
            highestRating: rankedAlbums[0].rating,
            averageRating:
                total / rankedAlbums.length,
        };
    }, [rankedAlbums]);

    const recentMovements = useMemo(() => {
        return rankedAlbums
            .filter(
                (review) =>
                    getMovement(review) !== 0 &&
                    review.position_updated_at,
            )
            .sort((first, second) => {
                const movementDifference =
                    Math.abs(getMovement(second)) -
                    Math.abs(getMovement(first));

                if (movementDifference !== 0) {
                    return movementDifference;
                }

                return (
                    new Date(
                        second.position_updated_at,
                    ).getTime() -
                    new Date(
                        first.position_updated_at,
                    ).getTime()
                );
            })
            .slice(0, 6);
    }, [rankedAlbums]);

    if (loading) {
        return (
            <section className="ranking-page">
                <p className="ranking-page__eyebrow">
                    TU CLASIFICACIÓN
                </p>

                <h1>Cargando ranking...</h1>
            </section>
        );
    }

    return (
        <section className="ranking-page">
            <header className="ranking-page__header">
                <div>
                    <p className="ranking-page__eyebrow">
                        TU CLASIFICACIÓN
                    </p>

                    <h1>Ranking</h1>

                    <p>
                        Todos tus discos terminados, ordenados de
                        mayor a menor puntuación.
                    </p>
                </div>

                <div className="ranking-page__counter">
                    <strong>{rankedAlbums.length}</strong>

                    <span>
                        {rankedAlbums.length === 1
                            ? "disco clasificado"
                            : "discos clasificados"}
                    </span>
                </div>
            </header>

            <LibraryTabs />

            {message && (
                <p className="ranking-page__message">
                    {message}
                </p>
            )}

            {rankedAlbums.length === 0 ? (
                <article className="ranking-empty">
                    <span>🏆</span>

                    <h2>Tu ranking está esperando</h2>

                    <p>
                        Termina y puntúa tu primer disco para
                        comenzar la clasificación.
                    </p>
                </article>
            ) : (
                <>
                    <section className="ranking-summary">
                        <article>
                            <span>🏆</span>

                            <div>
                                <strong>
                                    {formatRating(
                                        rankingStats.highestRating,
                                    )}
                                </strong>

                                <p>Nota más alta</p>
                            </div>
                        </article>

                        <article>
                            <span>★</span>

                            <div>
                                <strong>
                                    {formatRating(
                                        rankingStats.averageRating,
                                    )}
                                </strong>

                                <p>Nota media</p>
                            </div>
                        </article>

                        <article>
                            <span>💿</span>

                            <div>
                                <strong>
                                    {rankedAlbums.length}
                                </strong>

                                <p>Discos puntuados</p>
                            </div>
                        </article>
                    </section>

                    <section className="ranking-podium">
                        {podiumAlbums.map((item) => {
                            const { review } = item;
                            const album = review.album;

                            return (
                                <article
                                    className={[
                                        "podium-card",
                                        `podium-card--${item.position}`,
                                    ].join(" ")}
                                    key={review.id}
                                >
                                    <div className="podium-card__medal">
                                        <span>{item.medal}</span>
                                        <small>{item.label}</small>
                                    </div>

                                    <div className="podium-card__cover">
                                        {album?.cover_url ? (
                                            <img
                                                src={album.cover_url}
                                                alt={`Portada de ${album.title}`}
                                            />
                                        ) : (
                                            <div>💿</div>
                                        )}

                                        <strong>
                                            {formatRating(review.rating)}
                                        </strong>
                                    </div>

                                    <div className="podium-card__content">
                                        <span>
                                            {reactionLabels[
                                                review.reaction
                                            ] ?? "Valorado"}
                                        </span>

                                        <h2>{album?.title}</h2>
                                        <p>{album?.artist_name}</p>

                                        <RankingMovement
                                            review={review}
                                            compact
                                        />

                                        {album?.spotify_url && (
                                            <a
                                                href={album.spotify_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                ▶ Abrir en Spotify
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    {recentMovements.length > 0 && (
                        <section className="ranking-movements-section">
                            <header>
                                <div>
                                    <p>ÚLTIMO MOVIMIENTO</p>
                                    <h2>El ranking se mueve</h2>
                                </div>

                                <span>↕</span>
                            </header>

                            <div className="ranking-movements-list">
                                {recentMovements.map((review) => {
                                    const album = review.album;
                                    const movement =
                                        getMovement(review);

                                    return (
                                        <article
                                            className="ranking-movement-card"
                                            key={review.id}
                                        >
                                            <div className="ranking-movement-card__cover">
                                                {album?.cover_url ? (
                                                    <img
                                                        src={album.cover_url}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <span>💿</span>
                                                )}
                                            </div>

                                            <div className="ranking-movement-card__content">
                                                <span>
                                                    Ahora en el puesto
                                                    {" "}
                                                    #{review.position}
                                                </span>

                                                <h3>{album?.title}</h3>

                                                <p>
                                                    {album?.artist_name}
                                                </p>
                                            </div>

                                            <div className="ranking-movement-card__result">
                                                <RankingMovement
                                                    review={review}
                                                />

                                                <small>
                                                    #{review.previous_position}
                                                    {" → "}
                                                    #{review.position}
                                                </small>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {rankedAlbums.length > 3 && (
                        <section className="ranking-list-section">
                            <header>
                                <div>
                                    <p>DEL CUARTO PUESTO EN ADELANTE</p>
                                    <h2>Clasificación completa</h2>
                                </div>

                                <label className="ranking-search">
                                    <span>⌕</span>

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Buscar disco o artista"
                                    />
                                </label>
                            </header>

                            {remainingAlbums.length === 0 ? (
                                <p className="ranking-list__empty">
                                    No hay resultados para esa búsqueda.
                                </p>
                            ) : (
                                <div className="ranking-list">
                                    {remainingAlbums.map((review) => {
                                        const album = review.album;

                                        return (
                                            <article
                                                className="ranking-row"
                                                key={review.id}
                                            >
                                                <strong className="ranking-row__position">
                                                    {review.position}
                                                </strong>

                                                <div className="ranking-row__cover">
                                                    {album?.cover_url ? (
                                                        <img
                                                            src={album.cover_url}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <span>💿</span>
                                                    )}
                                                </div>

                                                <div className="ranking-row__information">
                                                    <span>
                                                        {reactionLabels[
                                                            review.reaction
                                                        ] ?? "Valorado"}
                                                    </span>

                                                    <h3>{album?.title}</h3>
                                                    <p>{album?.artist_name}</p>
                                                </div>

                                                <div className="ranking-row__score">
                                                    <RankingMovement
                                                        review={review}
                                                        compact
                                                    />

                                                    <strong className="ranking-row__rating">
                                                        {formatRating(review.rating)}
                                                    </strong>
                                                </div>

                                                {album?.spotify_url && (
                                                    <a
                                                        href={album.spotify_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        aria-label={`Abrir ${album.title} en Spotify`}
                                                    >
                                                        ▶
                                                    </a>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}
                </>
            )}
        </section>
    );
}

export default Ranking;