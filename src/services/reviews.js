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