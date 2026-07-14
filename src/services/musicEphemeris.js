import {
    FunctionsFetchError,
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function getDailyMusicEphemeris() {
    const { data, error } =
        await supabase.functions.invoke(
            "daily-music-ephemeris",
            {
                body: {},
            },
        );

    if (error) {
        let message =
            "No hemos podido cargar la efeméride musical.";

        if (error instanceof FunctionsHttpError) {
            try {
                const errorBody =
                    await error.context.json();

                message =
                    errorBody?.error ?? message;
            } catch {
                message =
                    error.message ?? message;
            }
        }

        if (error instanceof FunctionsFetchError) {
            message =
                "No hemos podido conectar con la efeméride musical.";
        }

        throw new Error(message);
    }

    return data?.ephemeris ?? null;
}