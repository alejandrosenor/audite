import { supabase } from "./supabase";
import {
    getAlbumTracks,
    searchSpotifyAlbums,
    syncAlbumTracks,
} from "./albums";

export { searchSpotifyAlbums };

function cleanGenres(genres) {
    if (!Array.isArray(genres)) {
        return [];
    }

    return Array.from(
        new Set(
            genres
                .filter(
                    (genre) =>
                        typeof genre === "string" &&
                        genre.trim(),
                )
                .map((genre) =>
                    genre.trim().toLowerCase(),
                ),
        ),
    );
}

function getReactionFromRating(rating) {
    if (
        rating === null ||
        rating === undefined ||
        rating === ""
    ) {
        /*
         * Mantenemos una reacción válida para no
         * depender de posibles constraints actuales.
         * En Archivo no mostraremos esta reacción.
         */
        return "okay";
    }

    const numericRating = Number(rating);

    if (numericRating >= 8) {
        return "loved";
    }

    if (numericRating >= 6) {
        return "liked";
    }

    if (numericRating >= 5) {
        return "okay";
    }

    if (numericRating >= 3) {
        return "weak";
    }

    return "disliked";
}

function buildDiscoveryDate({
    year,
    month,
    day,
    precision,
}) {
    if (!year) {
        return null;
    }

    if (precision === "year") {
        return `${year}-01-01`;
    }

    if (precision === "month" && month) {
        return `${year}-${String(month).padStart(
            2,
            "0",
        )}-01`;
    }

    if (
        precision === "day" &&
        month &&
        day
    ) {
        return `${year}-${String(month).padStart(
            2,
            "0",
        )}-${String(day).padStart(2, "0")}`;
    }

    return null;
}

export async function getArchiveTracks(album) {
    if (!album?.spotify_id) {
        return [];
    }

    /*
     * Si el álbum todavía no está guardado en la BD,
     * no tenemos un album_id para sincronizar.
     * La sincronización definitiva se hace al guardar.
     */
    if (!album.id) {
        return [];
    }

    let tracks = await getAlbumTracks(album.id);

    if (tracks.length > 0) {
        return tracks;
    }

    try {
        await syncAlbumTracks(album.id);
        tracks = await getAlbumTracks(album.id);
    } catch (error) {
        console.error(
            "No se pudieron sincronizar las canciones del Archivo:",
            error,
        );
    }

    return tracks;
}

export async function addArchiveAlbum({
    userId,
    album,
    genres = [],
    discoveryYear,
    discoveryMonth,
    discoveryDay,
    discoveryPrecision,
    rating,
    comment,
    wouldListenAgain,
    favoriteTrackIds = [],
}) {
    if (!userId || !album?.spotify_id) {
        throw new Error(
            "Faltan datos para guardar el recuerdo.",
        );
    }

    const now = new Date().toISOString();

    const incomingGenres = cleanGenres(
        genres.length > 0
            ? genres
            : album.genres,
    );

    const {
        data: existingAlbum,
        error: existingAlbumError,
    } = await supabase
        .from("albums")
        .select("id, genres")
        .eq("spotify_id", album.spotify_id)
        .maybeSingle();

    if (existingAlbumError) {
        throw existingAlbumError;
    }

    const storedGenres =
        incomingGenres.length > 0
            ? incomingGenres
            : cleanGenres(existingAlbum?.genres);

    const {
        data: storedAlbum,
        error: albumError,
    } = await supabase
        .from("albums")
        .upsert(
            {
                spotify_id: album.spotify_id,

                spotify_artist_id:
                    album.spotify_artist_id ?? null,

                title: album.title,

                artist_name: album.artist_name,

                release_year:
                    album.release_year ?? null,

                cover_url:
                    album.cover_url ?? null,

                spotify_image_url:
                    album.cover_url ?? null,

                spotify_url:
                    album.spotify_url ?? null,

                spotify_artist_url:
                    album.spotify_artist_url ?? null,

                spotify_release_date:
                    album.spotify_release_date ?? null,

                album_type:
                    album.album_type ?? null,

                track_count:
                    album.track_count ?? null,

                total_tracks:
                    album.total_tracks ??
                    album.track_count ??
                    null,

                genres: storedGenres,

                updated_at: now,
            },
            {
                onConflict: "spotify_id",
            },
        )
        .select()
        .single();

    let usableFavoriteTrackIds = [
        ...favoriteTrackIds,
    ];

    if (
        storedAlbum.spotify_id &&
        usableFavoriteTrackIds.length === 0
    ) {
        try {
            const currentTracks =
                await getAlbumTracks(
                    storedAlbum.id,
                );

            if (currentTracks.length === 0) {
                await syncAlbumTracks(
                    storedAlbum.id,
                );
            }
        } catch (error) {
            console.error(
                "No se pudo preparar el tracklist del Archivo:",
                error,
            );
        }
    }

    if (albumError) {
        throw albumError;
    }

    /*
     * Evitamos transformar accidentalmente un disco
     * que ya pertenece al flujo normal de Audite.
     */
    const {
        data: existingUserAlbum,
        error: existingUserAlbumError,
    } = await supabase
        .from("user_albums")
        .select(`
            id,
            status,
            source,
            pre_audite
        `)
        .eq("user_id", userId)
        .eq("album_id", storedAlbum.id)
        .maybeSingle();

    if (existingUserAlbumError) {
        throw existingUserAlbumError;
    }

    if (
        existingUserAlbum &&
        !existingUserAlbum.pre_audite
    ) {
        throw new Error(
            "Este disco ya forma parte de tu historia normal de Audite.",
        );
    }

    const discoveryDate = buildDiscoveryDate({
        year: discoveryYear,
        month: discoveryMonth,
        day: discoveryDay,
        precision: discoveryPrecision,
    });

    const {
        data: userAlbum,
        error: userAlbumError,
    } = await supabase
        .from("user_albums")
        .upsert(
            {
                user_id: userId,
                album_id: storedAlbum.id,

                status: "completed",
                source: "pre_audite",
                pre_audite: true,

                /*
                 * Importante: no se utiliza completed_at.
                 */
                completed_at: null,

                discovery_year:
                    discoveryYear
                        ? Number(discoveryYear)
                        : null,

                discovery_date: discoveryDate,

                discovery_date_precision:
                    discoveryPrecision || "unknown",

                created_at:
                    existingUserAlbum
                        ? undefined
                        : now,

                updated_at: now,
            },
            {
                onConflict: "user_id,album_id",
            },
        )
        .select(`
            *,
            album:albums (*)
        `)
        .single();

    if (userAlbumError) {
        throw userAlbumError;
    }

    const normalizedRating =
        rating === "" ||
            rating === null ||
            rating === undefined
            ? null
            : Number(rating);

    const reviewPayload = {
        user_id: userId,
        user_album_id: userAlbum.id,
        album_id: storedAlbum.id,

        reaction:
            getReactionFromRating(
                normalizedRating,
            ),

        rating:
            Number.isFinite(normalizedRating)
                ? normalizedRating
                : null,

        review_text:
            comment.trim() || null,

        would_listen_again:
            wouldListenAgain,

        updated_at: now,
    };

    const {
        data: existingReview,
        error: existingReviewError,
    } = await supabase
        .from("album_reviews")
        .select("id")
        .eq("user_id", userId)
        .eq("user_album_id", userAlbum.id)
        .maybeSingle();

    if (existingReviewError) {
        throw existingReviewError;
    }

    let review;

    if (existingReview) {
        const {
            data,
            error,
        } = await supabase
            .from("album_reviews")
            .update(reviewPayload)
            .eq("id", existingReview.id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        review = data;

        const { error: clearTracksError } =
            await supabase
                .from("favorite_tracks")
                .delete()
                .eq("user_id", userId)
                .eq("review_id", review.id);

        if (clearTracksError) {
            throw clearTracksError;
        }
    } else {
        const {
            data,
            error,
        } = await supabase
            .from("album_reviews")
            .insert(reviewPayload)
            .select()
            .single();

        if (error) {
            throw error;
        }

        review = data;
    }

    if (favoriteTrackIds.length > 0) {
        const topTracks =
            favoriteTrackIds
                .slice(0, 3)
                .map((trackId, index) => ({
                    user_id: userId,
                    review_id: review.id,
                    album_id: storedAlbum.id,
                    track_id: trackId,
                    position: index + 1,
                }));

        const { error: favoriteError } =
            await supabase
                .from("favorite_tracks")
                .insert(topTracks);

        if (favoriteError) {
            throw favoriteError;
        }
    }

    return {
        ...review,
        album: storedAlbum,
        user_album: userAlbum,
    };
}

export async function getArchiveAlbums(userId) {
    if (!userId) {
        return [];
    }

    const { data, error } = await supabase
        .from("album_reviews")
        .select(`
            *,
            album:albums (*),

            user_album:user_albums!inner (
                *
            ),

            favorite_tracks (
                *,
                track:album_tracks (*)
            )
        `)
        .eq("user_id", userId)
        .eq("user_album.pre_audite", true)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function deleteArchiveAlbum({
    userId,
    reviewId,
    userAlbumId,
}) {
    if (!userId || !reviewId || !userAlbumId) {
        throw new Error(
            "Faltan datos para eliminar el recuerdo.",
        );
    }

    const { error: favoriteError } =
        await supabase
            .from("favorite_tracks")
            .delete()
            .eq("user_id", userId)
            .eq("review_id", reviewId);

    if (favoriteError) {
        throw favoriteError;
    }

    const { error: reviewError } =
        await supabase
            .from("album_reviews")
            .delete()
            .eq("id", reviewId)
            .eq("user_id", userId);

    if (reviewError) {
        throw reviewError;
    }

    const { error: userAlbumError } =
        await supabase
            .from("user_albums")
            .delete()
            .eq("id", userAlbumId)
            .eq("user_id", userId)
            .eq("pre_audite", true);

    if (userAlbumError) {
        throw userAlbumError;
    }
}