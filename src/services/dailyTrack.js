import {
    FunctionsFetchError,
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function getDailyTrack() {
    const { data, error } =
        await supabase.functions.invoke(
            "daily-track",
            {
                body: {},
            },
        );

    if (error) {
        let message =
            "No hemos podido cargar la canción del día.";

        if (error instanceof FunctionsHttpError) {
            try {
                const body =
                    await error.context.json();

                message =
                    body?.error ?? message;
            } catch {
                message =
                    error.message ?? message;
            }
        }

        if (error instanceof FunctionsFetchError) {
            message =
                "No hemos podido conectar con la canción del día.";
        }

        throw new Error(message);
    }

    return data?.track ?? null;
}