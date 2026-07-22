import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";

import {
    supabase,
} from "./supabase";

async function invokeQuoteFunction(
    body,
) {
    const {
        data,
        error,
    } =
        await supabase
            .functions
            .invoke(
                "daily-music-quote",
                {
                    body,
                },
            );

    if (error) {
        let message =
            "No hemos podido cargar la frase del día.";

        if (
            error instanceof
            FunctionsHttpError
        ) {
            try {
                const responseBody =
                    await error
                        .context
                        .json();

                message =
                    responseBody
                        ?.error ??
                    message;
            } catch {
                message =
                    error.message ??
                    message;
            }
        } else if (
            error instanceof
            FunctionsFetchError
        ) {
            message =
                "No hemos podido conectar con la frase del día.";
        } else if (
            error instanceof
            FunctionsRelayError
        ) {
            message =
                "Supabase no ha podido ejecutar la frase del día.";
        }

        throw new Error(message);
    }

    return data;
}

export async function getDailyMusicQuote() {
    return invokeQuoteFunction({
        action: "get",
    });
}

export async function answerDailyMusicQuote(
    selectedPerson,
) {
    if (!selectedPerson) {
        throw new Error(
            "Selecciona una respuesta.",
        );
    }

    return invokeQuoteFunction({
        action: "answer",
        selectedPerson,
    });
}