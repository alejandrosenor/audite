import {
    FunctionsFetchError,
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function awardXP({
    rewardType,
    sourceId,
    metadata = {},
}) {
    if (!rewardType || !sourceId) {
        throw new Error(
            "Faltan datos para conceder experiencia.",
        );
    }

    const { data, error } =
        await supabase.functions.invoke(
            "award-xp",
            {
                body: {
                    rewardType,
                    sourceId,
                    metadata,
                },
            },
        );

    if (error) {
        let message =
            "No hemos podido conceder la experiencia.";

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
                "No hemos podido conectar con el sistema de experiencia.";
        }

        throw new Error(message);
    }

    if (data?.awarded) {
        window.dispatchEvent(
            new CustomEvent(
                "audite:xp-earned",
                {
                    detail: data,
                },
            ),
        );

        window.dispatchEvent(
            new CustomEvent(
                "audite:profile-changed",
            ),
        );
    }

    return data;
}

export async function getXPHistory(
    userId,
    limit = 20,
) {
    if (!userId) {
        return [];
    }

    const { data, error } = await supabase
        .from("xp_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
            ascending: false,
        })
        .limit(limit);

    if (error) {
        throw error;
    }

    return data ?? [];
}