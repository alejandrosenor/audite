import { supabase } from "./supabase";

export async function getMusicCompass({
    profile,
} = {}) {
    const { data, error } =
        await supabase.functions.invoke(
            "music-compass",
            {
                body: {
                    currentStreak:
                        profile?.current_streak ?? 0,

                    bestStreak:
                        profile?.best_streak ?? 0,
                },
            },
        );

    if (error) {
        console.error(
            "Music compass invocation error:",
            error,
        );

        throw new Error(
            error.message ||
            "No hemos podido preparar tu brújula musical.",
        );
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data?.compass ?? null;
}