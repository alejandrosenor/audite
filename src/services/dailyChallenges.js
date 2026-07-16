import {
    FunctionsFetchError,
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

async function invoke(name, body = {}) {
    const { data, error } =
        await supabase.functions.invoke(
            name,
            { body },
        );

    if (error) {
        let message =
            "No hemos podido conectar con los retos diarios.";

        if (
            error instanceof
            FunctionsHttpError
        ) {
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
            FunctionsFetchError
        ) {
            message =
                "No hemos podido conectar con el sistema de retos.";
        }

        throw new Error(message);
    }

    return data;
}

export function getDailyChallenges() {
    return invoke(
        "get-daily-challenges",
    );
}

export async function updateDailyChallenges({
    eventType,
    eventId,
    metadata = {},
}) {
    const result = await invoke(
        "update-daily-challenges",
        {
            eventType,
            eventId,
            metadata,
        },
    );

    if (
        result?.completed?.length ||
        result?.bonusCompleted
    ) {
        window.dispatchEvent(
            new CustomEvent(
                "audite:daily-challenges-changed",
            ),
        );

        window.dispatchEvent(
            new CustomEvent(
                "audite:profile-changed",
            ),
        );
    }

    return result;
}
