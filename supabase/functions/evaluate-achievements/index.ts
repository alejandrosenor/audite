import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AchievementDefinition = {
  id: string;
  metric: string;
  target: number;
  reward?: {
    streakShields?: number;
    tripleChoiceTokens?: number;
    frame?: string;
  };
};

const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "first-album",
    metric: "completedAlbums",
    target: 1,
  },
  {
    id: "first-review",
    metric: "ratedAlbums",
    target: 1,
  },
  {
    id: "first-favorites",
    metric: "favoriteTracks",
    target: 1,
  },
  {
    id: "first-abandoned",
    metric: "abandonedAlbums",
    target: 1,
  },
  {
    id: "three-day-streak",
    metric: "bestStreak",
    target: 3,
  },
  {
    id: "three-genres",
    metric: "uniqueGenres",
    target: 3,
  },
  {
    id: "seven-day-streak",
    metric: "bestStreak",
    target: 7,
  },
  {
    id: "twenty-five-albums",
    metric: "completedAlbums",
    target: 25,
  },
  {
    id: "five-decades",
    metric: "uniqueDecades",
    target: 5,
  },
  {
    id: "ten-genres",
    metric: "uniqueGenres",
    target: 10,
  },
  {
    id: "ten-reviews",
    metric: "writtenReviews",
    target: 10,
  },
  {
    id: "fifty-favorites",
    metric: "favoriteTracks",
    target: 50,
  },
  {
    id: "thirty-day-streak",
    metric: "bestStreak",
    target: 30,
  },
  {
    id: "hundred-albums",
    metric: "completedAlbums",
    target: 100,
  },
  {
    id: "thirty-genres",
    metric: "uniqueGenres",
    target: 30,
  },
  {
    id: "twenty-old-albums",
    metric: "pre1970Albums",
    target: 20,
  },
  {
    id: "twenty-high-genres",
    metric: "highRatedGenres",
    target: 20,
  },
  {
    id: "hundred-day-streak",
    metric: "bestStreak",
    target: 100,
    reward: {
      streakShields: 1,
    },
  },
  {
    id: "three-hundred-sixty-five-albums",
    metric: "completedAlbums",
    target: 365,
    reward: {
      streakShields: 2,
    },
  },
  {
    id: "seventy-five-genres",
    metric: "uniqueGenres",
    target: 75,
    reward: {
      streakShields: 1,
      tripleChoiceTokens: 1,
    },
  },
  {
    id: "thousand-albums",
    metric: "completedAlbums",
    target: 1000,
    reward: {
      streakShields: 3,
      frame: "thousand-albums",
    },
  },
];

function jsonResponse(
  body: unknown,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function uniqueValues(values: unknown[]) {
  return new Set(
    values
      .filter(Boolean)
      .map((value) =>
        String(value).trim().toLowerCase(),
      )
      .filter(Boolean),
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Método no permitido." },
      405,
    );
  }

  try {
    const authorization =
      request.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(
        { error: "No existe una sesión válida." },
        401,
      );
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const anonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      );

    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Falta la configuración interna de Supabase.",
      );
    }

    const userClient = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        { error: "La sesión no es válida." },
        401,
      );
    }

    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const [
      reviewsResult,
      favoritesResult,
      profileResult,
    ] = await Promise.all([
      adminClient
        .from("album_reviews")
        .select(`
          id,
          rating,
          reaction,
          review_text,
          album:albums (
            release_year,
            genres
          )
        `)
        .eq("user_id", user.id),

      adminClient
        .from("favorite_tracks")
        .select("id")
        .eq("user_id", user.id),

      adminClient
        .from("profiles")
        .select(`
          current_streak,
          best_streak
        `)
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (reviewsResult.error) {
      throw reviewsResult.error;
    }

    if (favoritesResult.error) {
      throw favoritesResult.error;
    }

    if (profileResult.error) {
      throw profileResult.error;
    }

    const reviews =
      reviewsResult.data ?? [];

    const completedReviews =
      reviews.filter(
        (review) =>
          review.reaction !== "abandoned" &&
          review.rating !== null,
      );

    const abandonedReviews =
      reviews.filter(
        (review) =>
          review.reaction === "abandoned",
      );

    const genres = completedReviews.flatMap(
      (review: any) =>
        review.album?.genres ?? [],
    );

    const decades = completedReviews
      .map((review: any) => {
        const year = Number(
          review.album?.release_year,
        );

        if (!Number.isFinite(year)) {
          return null;
        }

        return Math.floor(year / 10) * 10;
      })
      .filter(Boolean);

    const highRatedGenres =
      completedReviews
        .filter(
          (review: any) =>
            Number(review.rating) >= 8,
        )
        .flatMap(
          (review: any) =>
            review.album?.genres ?? [],
        );

    const metrics: Record<
      string,
      number
    > = {
      completedAlbums:
        completedReviews.length,

      ratedAlbums:
        completedReviews.filter(
          (review) =>
            review.rating !== null,
        ).length,

      favoriteTracks:
        favoritesResult.data?.length ?? 0,

      abandonedAlbums:
        abandonedReviews.length,

      writtenReviews:
        reviews.filter(
          (review) =>
            review.review_text?.trim(),
        ).length,

      bestStreak: Number(
        profileResult.data?.best_streak ??
          profileResult.data?.current_streak ??
          0,
      ),

      uniqueGenres:
        uniqueValues(genres).size,

      uniqueDecades:
        uniqueValues(decades).size,

      pre1970Albums:
        completedReviews.filter(
          (review: any) =>
            Number(
              review.album?.release_year,
            ) < 1970,
        ).length,

      highRatedGenres:
        uniqueValues(highRatedGenres).size,
    };

    const {
      data: alreadyUnlocked,
      error: unlockedError,
    } = await adminClient
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user.id);

    if (unlockedError) {
      throw unlockedError;
    }

    const unlockedIds = new Set(
      (alreadyUnlocked ?? []).map(
        (item) => item.achievement_id,
      ),
    );

    const progressRows =
      achievementDefinitions.map(
        (achievement) => ({
          user_id: user.id,
          achievement_id:
            achievement.id,

          current_value:
            metrics[achievement.metric] ??
            0,

          target_value:
            achievement.target,

          updated_at:
            new Date().toISOString(),
        }),
      );

    const { error: progressError } =
      await adminClient
        .from("achievement_progress")
        .upsert(progressRows, {
          onConflict:
            "user_id,achievement_id",
        });

    if (progressError) {
      throw progressError;
    }

    const newlyUnlocked =
      achievementDefinitions.filter(
        (achievement) => {
          const current =
            metrics[
              achievement.metric
            ] ?? 0;

          return (
            current >= achievement.target &&
            !unlockedIds.has(
              achievement.id,
            )
          );
        },
      );

    if (newlyUnlocked.length > 0) {
      const unlockRows =
        newlyUnlocked.map(
          (achievement) => ({
            user_id: user.id,

            achievement_id:
              achievement.id,

            progress_value:
              metrics[
                achievement.metric
              ] ?? achievement.target,

            progress_target:
              achievement.target,
          }),
        );

      const { error: insertError } =
        await adminClient
          .from("user_achievements")
          .insert(unlockRows);

      if (insertError) {
        throw insertError;
      }
    }

    const legendaryUnlocks =
      newlyUnlocked.filter(
        (achievement) =>
          achievement.reward,
      );

    if (legendaryUnlocks.length > 0) {
      const {
        data: currentRewards,
        error: rewardReadError,
      } = await adminClient
        .from("user_rewards")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (rewardReadError) {
        throw rewardReadError;
      }

      const streakShields =
        legendaryUnlocks.reduce(
          (total, achievement) =>
            total +
            Number(
              achievement.reward
                ?.streakShields ?? 0,
            ),
          0,
        );

      const tripleChoiceTokens =
        legendaryUnlocks.reduce(
          (total, achievement) =>
            total +
            Number(
              achievement.reward
                ?.tripleChoiceTokens ?? 0,
            ),
          0,
        );

      const newFrames =
        legendaryUnlocks
          .map(
            (achievement) =>
              achievement.reward?.frame,
          )
          .filter(Boolean) as string[];

      await adminClient
        .from("user_rewards")
        .upsert(
          {
            user_id: user.id,

            streak_shields:
              Number(
                currentRewards
                  ?.streak_shields ?? 0,
              ) + streakShields,

            triple_choice_tokens:
              Number(
                currentRewards
                  ?.triple_choice_tokens ??
                  0,
              ) + tripleChoiceTokens,

            legendary_frames:
              Array.from(
                new Set([
                  ...(
                    currentRewards
                      ?.legendary_frames ??
                    []
                  ),
                  ...newFrames,
                ]),
              ),

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );
    }

    return jsonResponse({
      metrics,
      newlyUnlocked:
        newlyUnlocked.map(
          (achievement) =>
            achievement.id,
        ),
    });
  } catch (error) {
    console.error(
      "evaluate-achievements error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "No hemos podido evaluar los logros.",
      },
      500,
    );
  }
});