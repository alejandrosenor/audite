import { supabase } from "./supabase";

function getDecade(year) {
    if (!year) {
        return null;
    }

    return `${Math.floor(year / 10) * 10}s`;
}

function getMostFrequent(values) {
    const validValues = values.filter(Boolean);

    if (!validValues.length) {
        return null;
    }

    const counts = validValues.reduce((result, value) => {
        result[value] = (result[value] ?? 0) + 1;
        return result;
    }, {});

    return Object.entries(counts).sort(
        (first, second) => second[1] - first[1],
    )[0]?.[0] ?? null;
}

export async function getProfileStats(userId) {
    if (!userId) {
        throw new Error("No se ha recibido el usuario.");
    }

    const [
        reviewsResult,
        favoritesResult,
        recentAlbumsResult,
        pendingResult,
        knownResult,
        rejectedResult,
    ] = await Promise.all([
        supabase
            .from("album_reviews")
            .select(`
                id,
                rating,
                reaction,
                created_at,
                album:albums (
                id,
                title,
                artist_name,
                release_year,
                genres,
                cover_url,
                duration_ms,
                spotify_url
                ),
                favorite_tracks (
                id
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),

        supabase
            .from("favorite_tracks")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", userId),

        supabase
            .from("user_albums")
            .select(`
                id,
                status,
                generated_at,
                accepted_at,
                started_at,
                completed_at,
                abandoned_at,
                rejected_at,
                known_at,
                created_at,
                album:albums (
                id,
                title,
                artist_name,
                cover_url
                )
            `)
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .limit(12),

        supabase
            .from("user_albums")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", userId)
            .eq("status", "to_listen"),

        supabase
            .from("user_albums")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", userId)
            .eq("status", "known"),

        supabase
            .from("user_albums")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", userId)
            .eq("status", "rejected"),
    ]);

    const results = [
        reviewsResult,
        favoritesResult,
        recentAlbumsResult,
        pendingResult,
        knownResult,
        rejectedResult,
    ];

    const resultWithError = results.find(
        (result) => result.error,
    );

    if (resultWithError?.error) {
        throw resultWithError.error;
    }

    const reviews = reviewsResult.data ?? [];
    const completedReviews = reviews.filter(
        (review) => review.reaction !== "abandoned",
    );

    const ratedReviews = completedReviews.filter(
        (review) => review.rating !== null,
    );

    const averageRating =
        ratedReviews.length > 0
            ? ratedReviews.reduce(
                (total, review) =>
                    total + Number(review.rating),
                0,
            ) / ratedReviews.length
            : null;

    const totalMinutes = completedReviews.reduce(
        (total, review) =>
            total +
            Number(review.album?.duration_ms ?? 0) / 60000,
        0,
    );

    const genres = completedReviews.flatMap(
        (review) => review.album?.genres ?? [],
    );

    const decades = completedReviews
        .map((review) =>
            getDecade(review.album?.release_year),
        )
        .filter(Boolean);

    const artists = completedReviews
        .map((review) => review.album?.artist_name)
        .filter(Boolean);

    const bestReview = [...ratedReviews].sort(
        (first, second) =>
            Number(second.rating) - Number(first.rating),
    )[0] ?? null;

    const totalCompleted = completedReviews.length;

    /*
     * Un nivel cada 5 discos. El nivel mínimo es 1.
     */
    const level = Math.floor(totalCompleted / 5) + 1;
    const currentLevelStart = (level - 1) * 5;
    const nextLevelTarget = level * 5;

    const levelProgress =
        ((totalCompleted - currentLevelStart) /
            (nextLevelTarget - currentLevelStart)) *
        100;

    return {
        totalCompleted,
        averageRating,
        favoriteTracks: favoritesResult.count ?? 0,
        totalMinutes: Math.round(totalMinutes),
        favoriteGenre: getMostFrequent(genres),
        favoriteDecade: getMostFrequent(decades),
        topArtist: getMostFrequent(artists),
        bestReview,
        recentActivity: recentAlbumsResult.data ?? [],
        pendingAlbums: pendingResult.count ?? 0,
        knownAlbums: knownResult.count ?? 0,
        rejectedAlbums: rejectedResult.count ?? 0,
        level,
        levelProgress: Math.min(
            Math.max(levelProgress, 0),
            100,
        ),
        nextLevelTarget,
    };
}