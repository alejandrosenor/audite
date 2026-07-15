import {
    FunctionsFetchError,
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function evaluateAchievements() {
    const { data, error } =
        await supabase.functions.invoke(
            "evaluate-achievements",
            {
                body: {},
            },
        );

    if (error) {
        let message =
            "No hemos podido actualizar tus logros.";

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
                "No hemos podido conectar con el sistema de logros.";
        }

        throw new Error(message);
    }

    return data;
}

export async function getAchievementsState(
    userId,
) {
    if (!userId) {
        return {
            unlocked: [],
            progress: [],
            rewards: null,
            showcase: [],
        };
    }

    const [
        unlockedResult,
        progressResult,
        rewardsResult,
        showcaseResult,
    ] = await Promise.all([
        supabase
            .from("user_achievements")
            .select("*")
            .eq("user_id", userId)
            .order("unlocked_at", {
                ascending: false,
            }),

        supabase
            .from("achievement_progress")
            .select("*")
            .eq("user_id", userId),

        supabase
            .from("user_rewards")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle(),

        supabase
            .from("achievement_showcase")
            .select("*")
            .eq("user_id", userId)
            .order("position", {
                ascending: true,
            }),
    ]);

    const firstError = [
        unlockedResult.error,
        progressResult.error,
        rewardsResult.error,
        showcaseResult.error,
    ].find(Boolean);

    if (firstError) {
        throw firstError;
    }

    return {
        unlocked:
            unlockedResult.data ?? [],

        progress:
            progressResult.data ?? [],

        rewards:
            rewardsResult.data ?? {
                streak_shields: 0,
                triple_choice_tokens: 0,
                legendary_frames: [],
                auto_use_streak_shield: true,
            },

        showcase:
            showcaseResult.data ?? [],
    };
}

export async function updateAchievementShowcase({
    userId,
    achievementIds,
}) {
    if (!userId) {
        throw new Error(
            "No existe un usuario válido.",
        );
    }

    const uniqueIds = Array.from(
        new Set(achievementIds ?? []),
    ).slice(0, 3);

    const { error: deleteError } =
        await supabase
            .from("achievement_showcase")
            .delete()
            .eq("user_id", userId);

    if (deleteError) {
        throw deleteError;
    }

    if (!uniqueIds.length) {
        return [];
    }

    const rows = uniqueIds.map(
        (achievementId, index) => ({
            user_id: userId,
            achievement_id: achievementId,
            position: index + 1,
        }),
    );

    const { data, error: insertError } =
        await supabase
            .from("achievement_showcase")
            .insert(rows)
            .select();

    if (insertError) {
        throw insertError;
    }

    return data ?? [];
}