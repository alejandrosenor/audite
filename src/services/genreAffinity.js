import {
    FunctionsFetchError,
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function evaluateGenreAffinity() {
    const { data, error } =
        await supabase.functions.invoke(
            "evaluate-genre-affinity",
            {
                body: {},
            },
        );

    if (error) {
        let message =
            "No hemos podido actualizar tus géneros.";

        if (
            error instanceof
            FunctionsHttpError
        ) {
            try {
                const body =
                    await error.context.json();

                message =
                    body?.error ??
                    message;
            } catch {
                message =
                    error.message ??
                    message;
            }
        }

        if (
            error instanceof
            FunctionsFetchError
        ) {
            message =
                "No hemos podido conectar con el sistema de afinidad.";
        }

        throw new Error(message);
    }

    return data?.affinities ?? [];
}

export async function getGenreAffinities(
    userId,
) {
    if (!userId) {
        return [];
    }

    const { data, error } =
        await supabase
            .from(
                "user_genre_affinity",
            )
            .select("*")
            .eq("user_id", userId)
            .order("genre_xp", {
                ascending: false,
            });

    if (error) {
        throw error;
    }

    return data ?? [];
}