import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

type AchievementDefinition = {
  id: string;
  metric: string;
  target: number;
  rarity:
    | "common"
    | "rare"
    | "epic"
    | "legendary";
  reward?: {
    streakShields?: number;
    tripleChoiceTokens?: number;
    frame?: string;
    label?: string;
  };
};

function defineAchievement(
  id: string,
  metric: string,
  target: number,
  rarity: AchievementDefinition["rarity"],
  reward?: AchievementDefinition["reward"],
): AchievementDefinition {
  return {
    id,
    metric,
    target,
    rarity,
    reward,
  };
}

const achievementDefinitions: AchievementDefinition[] = [
  /*
   * Discos
   */
  defineAchievement(
    "first-album",
    "completedAlbums",
    1,
    "common",
  ),
  defineAchievement(
    "five-albums",
    "completedAlbums",
    5,
    "common",
  ),
  defineAchievement(
    "ten-albums",
    "completedAlbums",
    10,
    "common",
  ),
  defineAchievement(
    "twenty-five-albums",
    "completedAlbums",
    25,
    "rare",
  ),
  defineAchievement(
    "fifty-albums",
    "completedAlbums",
    50,
    "rare",
  ),
  defineAchievement(
    "hundred-albums",
    "completedAlbums",
    100,
    "epic",
  ),
  defineAchievement(
    "two-hundred-fifty-albums",
    "completedAlbums",
    250,
    "epic",
  ),
  defineAchievement(
    "three-hundred-sixty-five-albums",
    "completedAlbums",
    365,
    "legendary",
    {
      streakShields: 2,
      label: "2 comodines de racha",
    },
  ),
  defineAchievement(
    "five-hundred-albums",
    "completedAlbums",
    500,
    "legendary",
    {
      streakShields: 2,
      tripleChoiceTokens: 1,
      label:
        "2 comodines de racha y 1 selección triple",
    },
  ),
  defineAchievement(
    "thousand-albums",
    "completedAlbums",
    1000,
    "legendary",
    {
      streakShields: 3,
      tripleChoiceTokens: 2,
      frame: "thousand-albums",
      label:
        "3 comodines, 2 selecciones triples y marco legendario",
    },
  ),

  /*
   * Rachas
   */
  defineAchievement(
    "three-day-streak",
    "bestStreak",
    3,
    "common",
  ),
  defineAchievement(
    "seven-day-streak",
    "bestStreak",
    7,
    "common",
  ),
  defineAchievement(
    "fourteen-day-streak",
    "bestStreak",
    14,
    "rare",
  ),
  defineAchievement(
    "thirty-day-streak",
    "bestStreak",
    30,
    "rare",
  ),
  defineAchievement(
    "sixty-day-streak",
    "bestStreak",
    60,
    "epic",
  ),
  defineAchievement(
    "hundred-day-streak",
    "bestStreak",
    100,
    "epic",
    {
      streakShields: 1,
      label: "1 comodín de racha",
    },
  ),
  defineAchievement(
    "half-year-streak",
    "bestStreak",
    180,
    "legendary",
    {
      streakShields: 2,
      label: "2 comodines de racha",
    },
  ),
  defineAchievement(
    "year-streak",
    "bestStreak",
    365,
    "legendary",
    {
      streakShields: 3,
      frame: "year-streak",
      label:
        "3 comodines de racha y marco legendario",
    },
  ),

  /*
   * Crítica
   */
  defineAchievement(
    "first-review",
    "ratedAlbums",
    1,
    "common",
  ),
  defineAchievement(
    "ten-ratings",
    "ratedAlbums",
    10,
    "common",
  ),
  defineAchievement(
    "fifty-ratings",
    "ratedAlbums",
    50,
    "rare",
  ),
  defineAchievement(
    "hundred-ratings",
    "ratedAlbums",
    100,
    "epic",
  ),
  defineAchievement(
    "first-written-review",
    "writtenReviews",
    1,
    "common",
  ),
  defineAchievement(
    "ten-reviews",
    "writtenReviews",
    10,
    "rare",
  ),
  defineAchievement(
    "fifty-reviews",
    "writtenReviews",
    50,
    "epic",
  ),
  defineAchievement(
    "hundred-reviews",
    "writtenReviews",
    100,
    "legendary",
  ),
  defineAchievement(
    "five-long-reviews",
    "longReviews",
    5,
    "rare",
  ),
  defineAchievement(
    "twenty-long-reviews",
    "longReviews",
    20,
    "epic",
  ),
  defineAchievement(
    "first-ten",
    "exactTenAlbums",
    1,
    "rare",
  ),
  defineAchievement(
    "ten-nine-plus",
    "ninePlusAlbums",
    10,
    "epic",
  ),
  defineAchievement(
    "ten-low-ratings",
    "lowRatedAlbums",
    10,
    "rare",
  ),
  defineAchievement(
    "rating-spectrum",
    "uniqueRatingValues",
    15,
    "epic",
  ),

  /*
   * Favoritas
   */
  defineAchievement(
    "first-favorites",
    "favoriteTracks",
    1,
    "common",
  ),
  defineAchievement(
    "fifty-favorites",
    "favoriteTracks",
    50,
    "common",
  ),
  defineAchievement(
    "hundred-favorites",
    "favoriteTracks",
    100,
    "rare",
  ),
  defineAchievement(
    "two-hundred-favorites",
    "favoriteTracks",
    200,
    "epic",
  ),
  defineAchievement(
    "five-hundred-favorites",
    "favoriteTracks",
    500,
    "legendary",
  ),
  defineAchievement(
    "five-favorite-albums",
    "albumsWithFiveFavorites",
    10,
    "rare",
  ),
  defineAchievement(
    "perfect-favorite-albums",
    "perfectFavoriteAlbums",
    5,
    "legendary",
  ),

  /*
   * Exploración
   */
  defineAchievement(
    "three-genres",
    "uniqueGenres",
    3,
    "common",
  ),
  defineAchievement(
    "ten-genres",
    "uniqueGenres",
    10,
    "rare",
  ),
  defineAchievement(
    "thirty-genres",
    "uniqueGenres",
    30,
    "epic",
  ),
  defineAchievement(
    "fifty-genres",
    "uniqueGenres",
    50,
    "epic",
  ),
  defineAchievement(
    "seventy-five-genres",
    "uniqueGenres",
    75,
    "legendary",
    {
      streakShields: 1,
      tripleChoiceTokens: 1,
      label:
        "1 comodín de racha y 1 selección triple",
    },
  ),
  defineAchievement(
    "five-decades",
    "uniqueDecades",
    5,
    "rare",
  ),
  defineAchievement(
    "eight-decades",
    "uniqueDecades",
    8,
    "epic",
  ),
  defineAchievement(
    "ten-decades",
    "uniqueDecades",
    10,
    "legendary",
  ),
  defineAchievement(
    "twenty-artists",
    "uniqueArtists",
    20,
    "common",
  ),
  defineAchievement(
    "fifty-artists",
    "uniqueArtists",
    50,
    "rare",
  ),
  defineAchievement(
    "five-same-artist",
    "maxAlbumsSameArtist",
    5,
    "epic",
  ),
  defineAchievement(
    "fifty-year-span",
    "historicalSpanYears",
    50,
    "rare",
  ),
  defineAchievement(
    "hundred-year-span",
    "historicalSpanYears",
    100,
    "legendary",
  ),

  /*
   * Épocas y formatos
   */
  defineAchievement(
    "first-pre1970",
    "pre1970Albums",
    1,
    "common",
  ),
  defineAchievement(
    "twenty-old-albums",
    "pre1970Albums",
    20,
    "epic",
  ),
  defineAchievement(
    "ten-pre1960",
    "pre1960Albums",
    10,
    "epic",
  ),
  defineAchievement(
    "five-pre1950",
    "pre1950Albums",
    5,
    "legendary",
  ),
  defineAchievement(
    "ten-short-albums",
    "shortAlbums",
    10,
    "rare",
  ),
  defineAchievement(
    "ten-recent-albums",
    "recentAlbums",
    10,
    "epic",
  ),
  defineAchievement(
    "ten-long-albums",
    "longAlbums",
    10,
    "rare",
  ),
  defineAchievement(
    "five-current-year-albums",
    "currentYearAlbums",
    5,
    "epic",
  ),

  /*
   * Descubrimiento
   */
  defineAchievement(
    "first-discovery",
    "discoveryEvents",
    1,
    "common",
  ),
  defineAchievement(
    "twenty-five-discoveries",
    "discoveryEvents",
    25,
    "common",
  ),
  defineAchievement(
    "twenty-five-manual-albums",
    "completedManualAlbums",
    25,
    "rare",
  ),
  defineAchievement(
    "twenty-five-completed-discoveries",
    "completedDiscoveryAlbums",
    25,
    "epic",
  ),
  defineAchievement(
    "ten-genre-discoveries",
    "genreDiscoveryEvents",
    10,
    "common",
  ),
  defineAchievement(
    "fifty-genre-discoveries",
    "genreDiscoveryEvents",
    50,
    "rare",
  ),
  defineAchievement(
    "twenty-five-time-machine",
    "timeMachineEvents",
    25,
    "rare",
  ),
  defineAchievement(
    "hundred-time-machine",
    "timeMachineEvents",
    100,
    "legendary",
  ),
  defineAchievement(
    "ten-mood-discoveries",
    "moodDiscoveryCount",
    10,
    "rare",
  ),
  defineAchievement(
    "ten-recommendations-accepted",
    "recommendationsAccepted",
    10,
    "common",
  ),
  defineAchievement(
    "ten-completed-recommendations",
    "completedRecommendationAlbums",
    10,
    "epic",
  ),

  /*
   * Decisiones
   */
  defineAchievement(
    "first-abandoned",
    "abandonedAlbums",
    1,
    "common",
  ),
  defineAchievement(
    "ten-abandoned",
    "abandonedAlbums",
    10,
    "rare",
  ),
  defineAchievement(
    "fifty-rejected",
    "rejectedAlbums",
    50,
    "rare",
  ),
  defineAchievement(
    "first-resumed",
    "resumedAlbums",
    1,
    "rare",
  ),
  defineAchievement(
    "ten-resumed",
    "resumedAlbums",
    10,
    "epic",
  ),
  defineAchievement(
    "twenty-five-listen-again",
    "wouldListenAgainAlbums",
    25,
    "rare",
  ),

  /*
   * Progresión
   */
  defineAchievement(
    "xp-1000",
    "totalXP",
    1000,
    "common",
  ),
  defineAchievement(
    "xp-10000",
    "totalXP",
    10000,
    "rare",
  ),
  defineAchievement(
    "xp-50000",
    "totalXP",
    50000,
    "legendary",
    {
      streakShields: 1,
      tripleChoiceTokens: 1,
      label:
        "1 comodín de racha y 1 selección triple",
    },
  ),
  defineAchievement(
    "level-25",
    "musicalLevel",
    25,
    "epic",
  ),

  /*
   * Juego diario
   */
  defineAchievement(
    "first-quote",
    "quoteAnswers",
    1,
    "common",
  ),
  defineAchievement(
    "ten-quotes",
    "quoteAnswers",
    10,
    "common",
  ),
  defineAchievement(
    "ten-correct-quotes",
    "quoteCorrect",
    10,
    "rare",
  ),
  defineAchievement(
    "fifty-correct-quotes",
    "quoteCorrect",
    50,
    "legendary",
    {
      tripleChoiceTokens: 1,
      label: "1 selección triple",
    },
  ),
];

const achievementIds =
  achievementDefinitions.map(
    (definition) => definition.id,
  );

const duplicateAchievementIds =
  achievementIds.filter(
    (id, index) =>
      achievementIds.indexOf(id) !==
      index,
  );

if (
  achievementDefinitions.length !==
  85
) {
  console.error(
    `Expected 85 achievements, received ${achievementDefinitions.length}`,
  );
}

if (
  duplicateAchievementIds.length > 0
) {
  console.error(
    `Duplicate achievement IDs: ${[
      ...new Set(
        duplicateAchievementIds,
      ),
    ].join(", ")}`,
  );
}

const achievementXP = {
  common: 50,
  rare: 150,
  epic: 300,
  legendary: 1000,
};

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

function getXPRequiredForLevel(
  level: number,
) {
  if (level <= 1) {
    return 0;
  }

  const previousLevel = level - 1;

  return (
    500 * previousLevel +
    50 *
      previousLevel *
      (previousLevel - 1)
  );
}

function getLevelFromXP(totalXP: number) {
  let level = 1;

  while (
    totalXP >=
    getXPRequiredForLevel(level + 1)
  ) {
    level += 1;
  }

  return level;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
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
      userAlbumsResult,
      eventsResult,
    ] = await Promise.all([
      adminClient
        .from("album_reviews")
        .select(`
          id,
          album_id,
          rating,
          reaction,
          review_text,
          would_listen_again,
          created_at,
          album:albums (
            id,
            artist_name,
            release_year,
            genres,
            track_count,
            duration_ms,
            country,
            language
          )
        `)
        .eq("user_id", user.id),

      adminClient
        .from("favorite_tracks")
        .select(`
          id,
          album_id,
          created_at
        `)
        .eq("user_id", user.id),

      adminClient
        .from("profiles")
        .select(`
          current_streak,
          best_streak,
          total_xp,
          musical_level
        `)
        .eq("id", user.id)
        .maybeSingle(),

      adminClient
        .from("user_albums")
        .select(`
          id,
          status,
          source,
          pre_audite,
          paused_at,
          abandoned_at,
          completed_at,
          discovery_year,
          album:albums (
            id,
            artist_name,
            release_year,
            genres,
            track_count,
            duration_ms,
            country,
            language
          )
        `)
        .eq("user_id", user.id),

      adminClient
        .from("daily_challenge_events")
        .select(`
          id,
          event_type,
          event_id,
          metadata,
          created_at
        `)
        .eq("user_id", user.id),
    ]);

    const queryError = [
      reviewsResult.error,
      favoritesResult.error,
      profileResult.error,
      userAlbumsResult.error,
      eventsResult.error,
    ].find(Boolean);

    if (queryError) {
      throw queryError;
    }

    const reviews =
      reviewsResult.data ?? [];

    const favoriteTracks =
      favoritesResult.data ?? [];

    const userAlbums =
      userAlbumsResult.data ?? [];

    const events =
      eventsResult.data ?? [];

    const profile =
      profileResult.data ?? null;

    /*
    * Archivo 2026 no cuenta para las estadísticas
    * generales, pero sí tendrá sus propios logros.
    */
    const archiveAlbums =
      userAlbums.filter(
        (userAlbum: any) =>
          userAlbum.pre_audite === true,
      );

    const regularUserAlbums =
      userAlbums.filter(
        (userAlbum: any) =>
          userAlbum.pre_audite !== true,
      );

    const completedUserAlbums =
      regularUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.status === "completed",
      );

    const completedManualAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.source === "manual",
      );

    const completedDiscoveryAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.source === "discovery",
      );

    const completedRecommendationAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.source === "recommendation",
      );

    const completedTimeMachineAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.source === "time_machine",
      );

    const completedMoodAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.source === "mood_discovery",
      );

    const abandonedUserAlbums =
      regularUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.status === "abandoned",
      );

    const rejectedUserAlbums =
      regularUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.status === "rejected",
      );

    const pausedUserAlbums =
      regularUserAlbums.filter(
        (userAlbum: any) =>
          Boolean(userAlbum.paused_at),
      );

    const completedAlbumIds =
      new Set(
        completedUserAlbums
          .map(
            (userAlbum: any) =>
              userAlbum.album?.id,
          )
          .filter(Boolean),
      );

    /*
    * Solo consideramos para estadísticas de crítica
    * las reseñas de discos realmente terminados.
     *
    * El fallback permite conservar datos antiguos si
    * falta la relación con user_albums.
    */
    const completedReviews =
      reviews.filter(
        (review: any) =>
          review.reaction !== "abandoned" &&
          review.rating !== null &&
          (
            completedAlbumIds.size === 0 ||
            completedAlbumIds.has(
              review.album_id,
            )
          ),
      );

    const writtenReviews =
      reviews.filter(
        (review: any) =>
          Boolean(
            review.review_text?.trim(),
          ),
      );

    const longReviews =
      writtenReviews.filter(
        (review: any) =>
          review.review_text
            ?.trim()
            .length >= 300,
      );

    const completedGenres =
      completedUserAlbums.flatMap(
        (userAlbum: any) =>
          userAlbum.album?.genres ?? [],
      );

    const completedDecades =
      completedUserAlbums
        .map((userAlbum: any) => {
          const releaseYear =
            Number(
              userAlbum.album?.release_year,
            );

          if (
            !Number.isFinite(releaseYear)
          ) {
            return null;
          }

          return (
            Math.floor(
              releaseYear / 10,
            ) * 10
          );
        })
        .filter(Boolean);

    const validReleaseYears =
      completedUserAlbums
        .map((userAlbum: any) =>
          Number(
            userAlbum.album?.release_year,
          ),
        )
        .filter(
          (year) =>
            Number.isFinite(year) &&
            year > 0,
        );

    const oldestReleaseYear =
      validReleaseYears.length
        ? Math.min(...validReleaseYears)
        : null;

    const newestReleaseYear =
      validReleaseYears.length
        ? Math.max(...validReleaseYears)
        : null;

    const historicalSpanYears =
      oldestReleaseYear !== null &&
      newestReleaseYear !== null
        ? newestReleaseYear -
          oldestReleaseYear
        : 0;

    const completedArtists =
      completedUserAlbums
        .map(
          (userAlbum: any) =>
            userAlbum.album
              ?.artist_name,
        )
        .filter(Boolean);

    const artistAlbumCounts =
      completedArtists.reduce(
        (
          counts: Record<string, number>,
          artist,
        ) => {
          const normalizedArtist =
            String(artist)
              .trim()
              .toLowerCase();

          if (!normalizedArtist) {
            return counts;
          }

          counts[normalizedArtist] =
            (counts[normalizedArtist] ?? 0) + 1;

          return counts;
        },
        {},
      );

    const maxAlbumsSameArtist =
      Math.max(
        0,
        ...Object.values(
          artistAlbumCounts,
        ),
      );

    const completedCountries =
      completedUserAlbums
        .map(
          (userAlbum: any) =>
            userAlbum.album?.country,
        )
        .filter(Boolean);

    const completedLanguages =
      completedUserAlbums
        .map(
          (userAlbum: any) =>
            userAlbum.album?.language,
        )
        .filter(Boolean);

    const highRatedReviews =
      completedReviews.filter(
        (review: any) =>
          Number(review.rating) >= 8,
      );

    const perfectReviews =
      completedReviews.filter(
        (review: any) =>
          Number(review.rating) >= 10,
      );

    const lowRatedReviews =
      completedReviews.filter(
        (review: any) =>
          Number(review.rating) < 5,
      );

    const ninePlusReviews =
      completedReviews.filter(
        (review: any) =>
          Number(review.rating) >= 9,
      );

    const exactTenReviews =
      completedReviews.filter(
        (review: any) =>
          Number(review.rating) === 10,
      );

    const exactRatingValues =
      completedReviews
        .map((review: any) =>
          Number(review.rating),
        )
        .filter(Number.isFinite);

    const uniqueRatingValues =
      uniqueValues(
        exactRatingValues,
      ).size;

    const highRatedGenres =
      highRatedReviews.flatMap(
        (review: any) =>
          review.album?.genres ?? [],
      );

    const wouldListenAgainReviews =
      completedReviews.filter(
        (review: any) =>
          review.would_listen_again ===
          true,
      );

    const pre1970Albums =
      completedUserAlbums.filter(
        (userAlbum: any) => {
          const year = Number(
            userAlbum.album?.release_year,
          );

          return (
            Number.isFinite(year) &&
            year < 1970
          );
        },
      );

    const pre1960Albums =
      completedUserAlbums.filter(
        (userAlbum: any) => {
          const year = Number(
            userAlbum.album?.release_year,
          );

          return (
            Number.isFinite(year) &&
            year < 1960
          );
        },
      );

    const pre1950Albums =
      completedUserAlbums.filter(
        (userAlbum: any) => {
          const year = Number(
            userAlbum.album?.release_year,
          );

          return (
            Number.isFinite(year) &&
            year < 1950
          );
        },
      );

    const currentYear =
      new Date().getUTCFullYear();

    const currentYearAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) =>
          Number(
            userAlbum.album?.release_year,
          ) === currentYear,
      );

    const recentAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) => {
          const year = Number(
            userAlbum.album?.release_year,
          );

          return (
            Number.isFinite(year) &&
            year >= currentYear - 2
          );
        },
      );

    const shortAlbums =
     completedUserAlbums.filter(
        (userAlbum: any) => {
          const trackCount = Number(
            userAlbum.album?.track_count,
          );

          return (
            Number.isFinite(trackCount) &&
            trackCount > 0 &&
            trackCount <= 10
          );
        },
      );

    const longAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) => {
          const durationMs = Number(
            userAlbum.album?.duration_ms,
          );

          return (
            Number.isFinite(durationMs) &&
            durationMs >= 60 * 60 * 1000
          );
        },
      );

    const largeAlbums =
      completedUserAlbums.filter(
        (userAlbum: any) => {
          const trackCount = Number(
            userAlbum.album?.track_count,
          );

          return (
            Number.isFinite(trackCount) &&
            trackCount >= 20
          );
        },
      );

    function eventMetadata(
      event: any,
    ): Record<string, any> {
      if (
        event?.metadata &&
        typeof event.metadata === "object"
      ) {
        return event.metadata;
      }

      return {};
    }

    function countEvents(
      eventType: string,
    ) {
      return events.filter(
        (event: any) =>
          event.event_type === eventType,
      ).length;
    }

    function countEventsBySource(
      source: string,
    ) {
      return events.filter(
        (event: any) =>
          eventMetadata(event).source ===
          source,
      ).length;
    }

    const discoveryEvents =
      events.filter(
        (event: any) =>
          event.event_type ===
            "discovery_generated" ||
          event.event_type ===
            "genre_discovery_generated",
      );

    const genreDiscoveryEvents =
      events.filter(
        (event: any) =>
          event.event_type ===
          "genre_discovery_generated",
      );

    const timeMachineEvents =
      discoveryEvents.filter(
        (event: any) =>
          eventMetadata(event).source ===
          "time_machine",
      );

    const moodDiscoveryEvents =
      discoveryEvents.filter(
        (event: any) =>
          eventMetadata(event).source ===
          "mood_discovery",
      );

    const storedMoodDiscoveries =
      regularUserAlbums.filter(
        (userAlbum: any) =>
          userAlbum.source ===
          "mood_discovery",
      );

    const recommendationAcceptedEvents =
      events.filter(
        (event: any) =>
          event.event_type ===
          "recommendation_accepted",
      );

    const recommendationKnownEvents =
      events.filter(
        (event: any) =>
          event.event_type ===
          "recommendation_known",
      );

    const quoteEvents =
      events.filter(
        (event: any) =>
          event.event_type ===
          "daily_music_quote_completed",
      );

    const correctQuoteEvents =
      quoteEvents.filter(
        (event: any) =>
          eventMetadata(event).correct ===
          true,
      );

    const completedEvents =
     events.filter(
        (event: any) =>
         event.event_type ===
          "album_completed",
      );

    const resumedAlbums =
      completedEvents.filter(
        (event: any) =>
          eventMetadata(event).resumed ===
          true,
      );

    const albumsWithFiveFavorites =
      completedEvents.filter(
        (event: any) =>
         Number(
            eventMetadata(event)
              .favoriteCount ?? 0,
          ) >= 5,
      );

    const perfectFavoriteAlbums =
      completedEvents.filter(
        (event: any) => {
          const metadata =
            eventMetadata(event);

          const favoriteCount =
            Number(
              metadata.favoriteCount ?? 0,
            );

          const trackCount =
            Number(
              metadata.trackCount ?? 0,
            );

          return (
            trackCount > 0 &&
            favoriteCount >= trackCount
          );
        },
      );

    const metrics: Record<
      string,
      number
    > = {
      /*
      * Discos y estados
      */
      completedAlbums:
        completedUserAlbums.length,

      abandonedAlbums:
        abandonedUserAlbums.length,

      rejectedAlbums:
        rejectedUserAlbums.length,

     pausedAlbums:
        pausedUserAlbums.length,

      archiveAlbums:
        archiveAlbums.length,

      resumedAlbums:
        resumedAlbums.length,

      completedManualAlbums:
        completedManualAlbums.length,

      completedDiscoveryAlbums:
        completedDiscoveryAlbums.length,

      completedRecommendationAlbums:
        completedRecommendationAlbums.length,

      completedTimeMachineAlbums:
        completedTimeMachineAlbums.length,

      completedMoodAlbums:
        completedMoodAlbums.length,

      /*
      * Valoraciones y reseñas
      */
      ratedAlbums:
        completedReviews.length,

      writtenReviews:
        writtenReviews.length,

      longReviews:
        longReviews.length,

      highRatedAlbums:
        highRatedReviews.length,

      perfectAlbums:
       perfectReviews.length,

      lowRatedAlbums:
        lowRatedReviews.length,

      wouldListenAgainAlbums:
        wouldListenAgainReviews.length,

      ninePlusAlbums:
        ninePlusReviews.length,

      exactTenAlbums:
        exactTenReviews.length,

      uniqueRatingValues,

      /*
      * Favoritas
      */
      favoriteTracks:
        favoriteTracks.length,

      albumsWithFiveFavorites:
        albumsWithFiveFavorites.length,

      perfectFavoriteAlbums:
        perfectFavoriteAlbums.length,

      /*
      * Exploración musical
      */
      uniqueGenres:
        uniqueValues(
          completedGenres,
        ).size,

      highRatedGenres:
        uniqueValues(
          highRatedGenres,
        ).size,

      uniqueDecades:
        uniqueValues(
          completedDecades,
        ).size,

      uniqueArtists:
        uniqueValues(
          completedArtists,
        ).size,

      uniqueCountries:
        uniqueValues(
          completedCountries,
        ).size,

      uniqueLanguages:
        uniqueValues(
          completedLanguages,
        ).size,

      pre1970Albums:
        pre1970Albums.length,

      pre1960Albums:
        pre1960Albums.length,

      pre1950Albums:
        pre1950Albums.length,

      shortAlbums:
        shortAlbums.length,

      longAlbums:
        longAlbums.length,

      largeAlbums:
        largeAlbums.length,

      maxAlbumsSameArtist,

      historicalSpanYears,

      currentYearAlbums:
        currentYearAlbums.length,

      recentAlbums:
        recentAlbums.length,

      /*
      * Rachas, XP y nivel
      */
      bestStreak:
        Number(
          profile?.best_streak ??
          profile?.current_streak ??
          0,
        ),

      totalXP:
        Number(
          profile?.total_xp ?? 0,
        ),

      musicalLevel:
        Number(
          profile?.musical_level ?? 1,
        ),

      /*
      * Descubrimiento
      */
      discoveryEvents:
        discoveryEvents.length,

      genreDiscoveryEvents:
        genreDiscoveryEvents.length,

      timeMachineEvents:
        timeMachineEvents.length,

      moodDiscoveryCount:
        Math.max(
          moodDiscoveryEvents.length,
          storedMoodDiscoveries.length,
        ),

      recommendationsAccepted:
        recommendationAcceptedEvents.length,

      recommendationsKnown:
        recommendationKnownEvents.length,

      /*
      * Juego diario
      */
      quoteAnswers:
        quoteEvents.length,

      quoteCorrect:
        correctQuoteEvents.length,
    };

    console.log(
      "Achievement metrics:",
      metrics,
    );

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
            metrics[achievement.metric] ?? 0;

          return (
            current >= achievement.target &&
            !unlockedIds.has(
              achievement.id,
            )
          );
        },
      );

    let actuallyUnlocked: AchievementDefinition[] = [];

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

      const {
        data: insertedUnlocks,
        error: insertError,
      } = await adminClient
        .from("user_achievements")
        .upsert(unlockRows, {
          onConflict:
            "user_id,achievement_id",
          ignoreDuplicates: true,
        })
        .select("achievement_id");

      if (insertError) {
        throw insertError;
      }

      const insertedIds = new Set(
        (insertedUnlocks ?? []).map(
          (row) => row.achievement_id,
        ),
      );

      actuallyUnlocked =
        newlyUnlocked.filter(
          (achievement) =>
            insertedIds.has(
              achievement.id,
            ),
        );
    }

    const legendaryUnlocks =
      actuallyUnlocked.filter(
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

      const { error: rewardUpdateError } =
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

      if (rewardUpdateError) {
        throw rewardUpdateError;
      }
    }

    for (const achievement of actuallyUnlocked) {
      const amount =
        achievementXP[
          achievement.rarity
        ];

      const sourceId =
        achievement.id;

      const {
        data: existingXP,
        error: existingXPError,
      } = await adminClient
        .from("xp_history")
        .select("id")
        .eq("user_id", user.id)
        .eq("source_type", "achievement")
        .eq("source_id", sourceId)
        .maybeSingle();

      if (existingXPError) {
        throw existingXPError;
      }

      if (existingXP) {
        continue;
      }

      const {
        data: currentProfile,
        error: profileXPError,
      } = await adminClient
        .from("profiles")
        .select(`
          total_xp,
          musical_level
        `)
        .eq("id", user.id)
        .single();

      if (profileXPError) {
        throw profileXPError;
      }

      const previousXP = Number(
        currentProfile.total_xp ?? 0,
      );

      const nextXP =
        previousXP + amount;

      const nextLevel =
        getLevelFromXP(nextXP);

      const {
        error: achievementXPError,
      } = await adminClient
        .from("xp_history")
        .insert({
          user_id: user.id,
          amount,
          reason:
            "Logro desbloqueado",
          source_type: "achievement",
          source_id: sourceId,
          metadata: {
            achievementId:
              achievement.id,
            rarity:
              achievement.rarity,
          },
        });

      if (achievementXPError) {
        if (
          achievementXPError.code ===
          "23505"
        ) {
          continue;
        }

        throw achievementXPError;
      }

      const {
        error: updateXPError,
      } = await adminClient
        .from("profiles")
        .update({
          total_xp: nextXP,
          musical_level: nextLevel,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateXPError) {
        throw updateXPError;
      }
    }

    return jsonResponse({
      metrics,
      newlyUnlocked:
        actuallyUnlocked.map(
          (achievement) =>
            achievement.id,
        ),
    });
  } catch (error) {
    console.error(
      "evaluate-achievements error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object"
          ? JSON.stringify(error)
          : String(error);

    return jsonResponse(
      {
        error: message,
      },
      500,
    );
  }
});