import { supabase } from "./supabase";

export async function getUserAlbumForReview({
    userAlbumId,
    userId,
}) {
    const { data, error } = await supabase
        .from("user_albums")
        .select(`
      *,
      album:albums (*)
    `)
        .eq("id", userAlbumId)
        .eq("user_id", userId)
        .eq("status", "listening")
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function completeAlbumReview({
    userId,
    userAlbum,
    reaction,
    rating,
    reviewText,
    wouldListenAgain,
    favoriteTrackIds,
}) {
    const normalizedRating =
        rating === null || rating === ""
            ? null
            : Number(rating);

    const { data: review, error: reviewError } = await supabase
        .from("album_reviews")
        .insert({
            user_id: userId,
            user_album_id: userAlbum.id,
            album_id: userAlbum.album.id,
            reaction,
            rating: normalizedRating,
            review_text: reviewText.trim() || null,
            would_listen_again: wouldListenAgain,
        })
        .select()
        .single();

    if (reviewError) {
        throw reviewError;
    }

    if (favoriteTrackIds.length > 0) {
        const favoriteTracks = favoriteTrackIds.map(
            (trackId, index) => ({
                user_id: userId,
                review_id: review.id,
                album_id: userAlbum.album.id,
                track_id: trackId,
                position: index + 1,
            }),
        );

        const { error: tracksError } = await supabase
            .from("favorite_tracks")
            .insert(favoriteTracks);

        if (tracksError) {
            throw tracksError;
        }
    }

    const finalStatus =
        reaction === "abandoned"
            ? "abandoned"
            : "completed";

    const now = new Date().toISOString();

    const { error: statusError } = await supabase
        .from("user_albums")
        .update({
            status: finalStatus,
            completed_at:
                finalStatus === "completed" ? now : null,
            abandoned_at:
                finalStatus === "abandoned" ? now : null,
            updated_at: now,
        })
        .eq("id", userAlbum.id)
        .eq("user_id", userId);

    if (statusError) {
        throw statusError;
    }

    return review;
}

export async function getCompletedAlbums(userId) {
    const { data, error } = await supabase
        .from("album_reviews")
        .select(`
      *,
      album:albums (*),
      user_album:user_albums (*),
      favorite_tracks (
        *,
        track:album_tracks (*)
      )
    `)
        .eq("user_id", userId)
        .order("completed_at", {
            referencedTable: "user_album",
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function getFavoriteTracks(userId) {
    if (!userId) {
        return [];
    }

    const { data, error } = await supabase
        .from("favorite_tracks")
        .select(`
      *,
      track:album_tracks (*),
      album:albums (*),
      review:album_reviews (
        id,
        rating,
        reaction,
        created_at
      )
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function abandonAlbumWithoutReview({
    userId,
    userAlbum,
}) {
    if (!userId || !userAlbum?.id || !userAlbum?.album?.id) {
        throw new Error(
            "Faltan datos para abandonar la escucha.",
        );
    }

    const now = new Date().toISOString();

    const { error: reviewError } = await supabase
        .from("album_reviews")
        .insert({
            user_id: userId,
            user_album_id: userAlbum.id,
            album_id: userAlbum.album.id,
            reaction: "abandoned",
            rating: null,
            review_text: null,
            would_listen_again: null,
        });

    if (reviewError) {
        throw reviewError;
    }

    const { error: statusError } = await supabase
        .from("user_albums")
        .update({
            status: "abandoned",
            abandoned_at: now,
            completed_at: null,
            updated_at: now,
        })
        .eq("id", userAlbum.id)
        .eq("user_id", userId);

    if (statusError) {
        throw statusError;
    }
}

export async function deleteAbandonedReview({
    userId,
    reviewId,
    userAlbumId,
}) {
    if (!userId || !reviewId || !userAlbumId) {
        throw new Error("Faltan datos para eliminar el disco.");
    }

    const { error: reviewError } = await supabase
        .from("album_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", userId)
        .eq("reaction", "abandoned");

    if (reviewError) {
        throw reviewError;
    }

    const { error: userAlbumError } = await supabase
        .from("user_albums")
        .delete()
        .eq("id", userAlbumId)
        .eq("user_id", userId)
        .eq("status", "abandoned");

    if (userAlbumError) {
        throw userAlbumError;
    }
}

export async function deleteAbandonedReviews({
    userId,
    reviews,
}) {
    if (!userId || !Array.isArray(reviews) || reviews.length === 0) {
        return;
    }

    const abandonedReviews = reviews.filter(
        (review) =>
            review.reaction === "abandoned" &&
            review.user_album?.id,
    );

    if (!abandonedReviews.length) {
        return;
    }

    const reviewIds = abandonedReviews.map(
        (review) => review.id,
    );

    const userAlbumIds = abandonedReviews.map(
        (review) => review.user_album.id,
    );

    const { error: reviewsError } = await supabase
        .from("album_reviews")
        .delete()
        .eq("user_id", userId)
        .eq("reaction", "abandoned")
        .in("id", reviewIds);

    if (reviewsError) {
        throw reviewsError;
    }

    const { error: userAlbumsError } = await supabase
        .from("user_albums")
        .delete()
        .eq("user_id", userId)
        .eq("status", "abandoned")
        .in("id", userAlbumIds);

    if (userAlbumsError) {
        throw userAlbumsError;
    }
}

export async function getRankedAlbums(userId) {
    if (!userId) {
        return [];
    }

    const { data, error } = await supabase
        .from("album_reviews")
        .select(`
            id,
            rating,
            reaction,
            review_text,
            would_listen_again,
            created_at,
            album:albums (
                id,
                title,
                artist_name,
                release_year,
                cover_url,
                spotify_url,
                genres,
                track_count,
                duration_ms
            ),
            user_album:user_albums (
                id,
                completed_at
            )
        `)
        .eq("user_id", userId)
        .neq("reaction", "abandoned")
        .not("rating", "is", null)
        .order("rating", {
            ascending: false,
        })
        .order("created_at", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    const reviews = (data ?? []).map(
        (review) => ({
            ...review,
            rating: Number(review.rating),
        }),
    );

    reviews.sort((first, second) => {
        const ratingDifference =
            second.rating - first.rating;

        if (ratingDifference !== 0) {
            return ratingDifference;
        }

        const firstDate =
            first.user_album?.completed_at ??
            first.created_at ??
            "";

        const secondDate =
            second.user_album?.completed_at ??
            second.created_at ??
            "";

        const dateDifference =
            new Date(secondDate).getTime() -
            new Date(firstDate).getTime();

        if (dateDifference !== 0) {
            return dateDifference;
        }

        return (
            first.album?.title ?? ""
        ).localeCompare(
            second.album?.title ?? "",
            "es",
            {
                sensitivity: "base",
            },
        );
    });

    let previousRating = null;
    let densePosition = 0;

    return reviews.map((review) => {
        if (
            previousRating === null ||
            review.rating !== previousRating
        ) {
            densePosition += 1;
            previousRating = review.rating;
        }

        return {
            ...review,
            position: densePosition,
        };
    });
}

export async function getLibraryAlbumDetail({
    userId,
    reviewId,
}) {
    if (!userId || !reviewId) {
        throw new Error(
            "Faltan datos para abrir el disco.",
        );
    }

    const { data, error } = await supabase
        .from("album_reviews")
        .select(`
            id,
            user_id,
            user_album_id,
            album_id,
            reaction,
            rating,
            review_text,
            would_listen_again,
            created_at,
            updated_at,

            album:albums (
                id,
                spotify_id,
                title,
                artist_name,
                release_year,
                cover_url,
                spotify_url,
                genres,
                track_count,
                total_tracks,
                duration_ms,
                album_type,
                spotify_release_date
            ),

            user_album:user_albums (
                id,
                status,
                source,
                recommended_by,
                personal_note,
                generated_at,
                accepted_at,
                started_at,
                completed_at,
                abandoned_at,
                created_at
            ),

            favorite_tracks (
                id,
                position,
                track:album_tracks (
                    id,
                    spotify_id,
                    title,
                    track_number,
                    disc_number,
                    duration_ms,
                    spotify_url
                )
            )
        `)
        .eq("id", reviewId)
        .eq("user_id", userId)
        .single();

    if (error) {
        throw error;
    }

    const { data: tracks, error: tracksError } =
        await supabase
            .from("album_tracks")
            .select(`
        id,
        spotify_id,
        title,
        track_number,
        disc_number,
        duration_ms,
        spotify_url
      `)
            .eq("album_id", data.album_id)
            .order("disc_number", {
                ascending: true,
            })
            .order("track_number", {
                ascending: true,
            });

    if (tracksError) {
        throw tracksError;
    }

    return {
        ...data,
        favorite_tracks: [
            ...(data.favorite_tracks ?? []),
        ].sort(
            (first, second) =>
                Number(first.position ?? 999) -
                Number(second.position ?? 999),
        ),
        tracks: tracks ?? [],
    };
}

export async function getExistingAlbumReview({
    userId,
    userAlbumId,
}) {
    if (!userId || !userAlbumId) {
        throw new Error(
            "Faltan datos para cargar la valoración.",
        );
    }

    const { data, error } = await supabase
        .from("album_reviews")
        .select(`
            id,
            user_id,
            user_album_id,
            album_id,
            reaction,
            rating,
            review_text,
            would_listen_again,
            created_at,
            updated_at,

            favorite_tracks (
                id,
                position,
                track_id,
                track:album_tracks (
                    id,
                    title,
                    track_number,
                    disc_number,
                    duration_ms,
                    spotify_url
                )
            )
        `)
        .eq("user_id", userId)
        .eq("user_album_id", userAlbumId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    return {
        ...data,
        favorite_tracks: [
            ...(data.favorite_tracks ?? []),
        ].sort(
            (first, second) =>
                Number(first.position ?? 999) -
                Number(second.position ?? 999),
        ),
    };
}

export async function updateAlbumReview({
    userId,
    reviewId,
    reaction,
    rating,
    reviewText,
    wouldListenAgain,
    favoriteTrackIds,
}) {
    if (!userId || !reviewId) {
        throw new Error(
            "Faltan datos para actualizar la valoración.",
        );
    }

    if (reaction === "abandoned") {
        throw new Error(
            "Los discos no terminados no se editan desde esta valoración.",
        );
    }

    const normalizedRating =
        rating === "" ||
            rating === null ||
            rating === undefined
            ? null
            : Number(rating);

    const { data: updatedReview, error: reviewError } =
        await supabase
            .from("album_reviews")
            .update({
                reaction,
                rating: normalizedRating,
                review_text:
                    reviewText?.trim() || null,
                would_listen_again:
                    wouldListenAgain,
                updated_at: new Date().toISOString(),
            })
            .eq("id", reviewId)
            .eq("user_id", userId)
            .select()
            .single();

    if (reviewError) {
        throw reviewError;
    }

    /*
     * Sustituimos las canciones top anteriores.
     * Es más seguro y sencillo que intentar calcular
     * altas, bajas y cambios de posición.
     */
    const { error: deleteFavoritesError } =
        await supabase
            .from("favorite_tracks")
            .delete()
            .eq("review_id", reviewId)
            .eq("user_id", userId);

    if (deleteFavoritesError) {
        throw deleteFavoritesError;
    }

    const uniqueTrackIds = Array.from(
        new Set(favoriteTrackIds ?? []),
    );

    if (uniqueTrackIds.length > 0) {
        const favoriteRows = uniqueTrackIds.map(
            (trackId, index) => ({
                user_id: userId,
                review_id: reviewId,
                track_id: trackId,
                position: index + 1,
            }),
        );

        const { error: favoritesError } =
            await supabase
                .from("favorite_tracks")
                .insert(favoriteRows);

        if (favoritesError) {
            throw favoritesError;
        }
    }

    return updatedReview;
}