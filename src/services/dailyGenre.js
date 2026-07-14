import { supabase } from "./supabase";

export async function getDailyGenreResponse({
    userId,
    genreId,
    responseDate,
}) {
    if (!userId || !genreId || !responseDate) {
        return null;
    }

    const { data, error } = await supabase
        .from("daily_genre_responses")
        .select("*")
        .eq("user_id", userId)
        .eq("genre_id", genreId)
        .eq("response_date", responseDate)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function saveDailyGenreResponse({
    userId,
    genre,
    response,
}) {
    if (
        !userId ||
        !genre?.id ||
        !genre?.dateKey ||
        !response
    ) {
        throw new Error(
            "Faltan datos para guardar la respuesta.",
        );
    }

    const { data, error } = await supabase
        .from("daily_genre_responses")
        .upsert(
            {
                user_id: userId,
                genre_id: genre.id,
                genre_name: genre.name,
                response,
                response_date: genre.dateKey,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict:
                    "user_id,genre_id,response_date",
            },
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}