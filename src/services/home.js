import { supabase } from "./supabase";

export async function getHomeData(userId) {
    if (!userId) {
        throw new Error("No se ha recibido el usuario.");
    }

    const [
        generatedResult,
        listeningResult,
        pendingResult,
        completedResult,
        reviewsResult,
        favoritesResult,
    ] = await Promise.all([
        supabase
            .from("user_albums")
            .select(`
                *,
                album:albums (*)
            `)
            .eq("user_id", userId)
            .eq("status", "generated")
            .order("generated_at", { ascending: false })
            .limit(1)
            .maybeSingle(),

        supabase
            .from("user_albums")
            .select(`
                *,
                album:albums (*)
            `)
            .eq("user_id", userId)
            .eq("status", "listening")
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle(),

        supabase
            .from("user_albums")
            .select(`
                *,
                album:albums (*)
            `)
            .eq("user_id", userId)
            .in("status", ["to_listen", "paused"])
            .order("accepted_at", { ascending: false })
            .limit(1)
            .maybeSingle(),

        supabase
            .from("user_albums")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", userId)
            .eq("status", "completed"),

        supabase
            .from("album_reviews")
            .select("rating")
            .eq("user_id", userId)
            .not("rating", "is", null),

        supabase
            .from("favorite_tracks")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", userId),
    ]);

    const results = [
        generatedResult,
        listeningResult,
        pendingResult,
        completedResult,
        reviewsResult,
        favoritesResult,
    ];

    const firstError = results.find((result) => result.error)?.error;

    if (firstError) {
        throw firstError;
    }

    const ratings = reviewsResult.data ?? [];

    const averageRating =
        ratings.length > 0
            ? ratings.reduce(
                (total, review) =>
                    total + Number(review.rating),
                0,
            ) / ratings.length
            : null;

    /*
     * Orden de prioridad para la portada principal:
     * 1. Disco que estás escuchando.
     * 2. Disco que acabas de generar y debes decidir.
     * 3. Próximo disco pendiente.
     */
    let featuredUserAlbum = null;
    let featuredType = "empty";

    if (listeningResult.data) {
        featuredUserAlbum = listeningResult.data;
        featuredType = "listening";
    } else if (generatedResult.data) {
        featuredUserAlbum = generatedResult.data;
        featuredType = "generated";
    } else if (pendingResult.data) {
        featuredUserAlbum = pendingResult.data;
        featuredType = "pending";
    }

    return {
        featuredUserAlbum,
        featuredType,
        completedAlbums: completedResult.count ?? 0,
        averageRating,
        favoriteTracks: favoritesResult.count ?? 0,
    };
}