import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function discoverSpanishAlbum({
    region = "all",
    style = "all",
} = {}) {
    const { data, error } =
        await supabase.functions.invoke(
            "discover-spanish-album",
            {
                body: {
                    region,
                    style,
                },
            },
        );

    if (error) {
        let message =
            "No hemos podido encontrar un disco en español.";

        if (error instanceof FunctionsHttpError) {
            try {
                const responseBody =
                    await error.context.json();

                message =
                    responseBody?.error ??
                    message;
            } catch {
                message =
                    error.message ??
                    message;
            }
        } else if (
            error instanceof
            FunctionsRelayError
        ) {
            message =
                "Supabase no ha podido ejecutar el generador.";
        } else if (
            error instanceof
            FunctionsFetchError
        ) {
            message =
                "No hemos podido conectar con el generador.";
        }

        throw new Error(message);
    }

    if (!data?.userAlbum) {
        throw new Error(
            data?.error ||
            "No hemos encontrado ningún disco.",
        );
    }

    return {
        userAlbum: data.userAlbum,
        context: data.context ?? null,
    };
}