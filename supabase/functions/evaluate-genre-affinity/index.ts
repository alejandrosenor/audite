import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ReviewRow = {
  rating: number | string | null;
  reaction: string | null;
  created_at: string | null;
  updated_at: string | null;

  album: {
    genres: string[] | null;
  } | null;
};

type GenreAccumulator = {
  completedAlbums: number;
  ratingTotal: number;
  ratedAlbums: number;
  highestRating: number | null;
  lastListenedAt: string | null;
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

function normalizeGenre(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getGenreXP({
  completedAlbums,
  averageRating,
}: {
  completedAlbums: number;
  averageRating: number | null;
}) {
  /*
   * Base:
   * 100 XP por disco terminado.
   *
   * Bonus:
   * +20 si la media es 8 o superior.
   * +40 si la media es 9 o superior.
   */
  let xp = completedAlbums * 100;

  if (
    averageRating !== null &&
    averageRating >= 9
  ) {
    xp += completedAlbums * 40;
  } else if (
    averageRating !== null &&
    averageRating >= 8
  ) {
    xp += completedAlbums * 20;
  }

  return xp;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Método no permitido.",
      },
      405,
    );
  }

  try {
    const authorization =
      request.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(
        {
          error: "No existe una sesión válida.",
        },
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
        {
          error: "La sesión no es válida.",
        },
        401,
      );
    }

    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const {
      data: reviewRows,
      error: reviewsError,
    } = await adminClient
      .from("album_reviews")
      .select(`
        rating,
        reaction,
        created_at,
        updated_at,
        album:albums (
          genres
        )
      `)
      .eq("user_id", user.id)
      .neq("reaction", "abandoned");

    if (reviewsError) {
      throw reviewsError;
    }

    const reviews =
      (reviewRows ?? []) as ReviewRow[];

    const genresMap =
      new Map<string, GenreAccumulator>();

    for (const review of reviews) {
      const genres =
        review.album?.genres ?? [];

      if (!genres.length) {
        continue;
      }

      const numericRating =
        review.rating === null
          ? null
          : Number(review.rating);

      const validRating =
        numericRating !== null &&
        Number.isFinite(numericRating)
          ? numericRating
          : null;

      const listenedAt =
        review.updated_at ??
        review.created_at ??
        null;

      const uniqueGenres =
        Array.from(
          new Set(
            genres
              .filter(Boolean)
              .map(normalizeGenre),
          ),
        );

      for (const genre of uniqueGenres) {
        const current =
          genresMap.get(genre) ?? {
            completedAlbums: 0,
            ratingTotal: 0,
            ratedAlbums: 0,
            highestRating: null,
            lastListenedAt: null,
          };

        current.completedAlbums += 1;

        if (validRating !== null) {
          current.ratingTotal +=
            validRating;

          current.ratedAlbums += 1;

          current.highestRating =
            current.highestRating === null
              ? validRating
              : Math.max(
                  current.highestRating,
                  validRating,
                );
        }

        if (
          listenedAt &&
          (
            !current.lastListenedAt ||
            new Date(listenedAt).getTime() >
              new Date(
                current.lastListenedAt,
              ).getTime()
          )
        ) {
          current.lastListenedAt =
            listenedAt;
        }

        genresMap.set(
          genre,
          current,
        );
      }
    }

    const rows = Array.from(
      genresMap.entries(),
    ).map(([genre, values]) => {
      const averageRating =
        values.ratedAlbums > 0
          ? Number(
              (
                values.ratingTotal /
                values.ratedAlbums
              ).toFixed(2),
            )
          : null;

      return {
        user_id: user.id,
        genre,

        genre_xp: getGenreXP({
          completedAlbums:
            values.completedAlbums,
          averageRating,
        }),

        completed_albums:
          values.completedAlbums,

        average_rating:
          averageRating,

        highest_rating:
          values.highestRating,

        last_listened_at:
          values.lastListenedAt,

        updated_at:
          new Date().toISOString(),
      };
    });

    /*
     * Borramos el cálculo anterior para que,
     * si una valoración cambia o un disco se
     * elimina, las afinidades no queden obsoletas.
     */
    const { error: deleteError } =
      await adminClient
        .from("user_genre_affinity")
        .delete()
        .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    if (rows.length > 0) {
      const { error: insertError } =
        await adminClient
          .from("user_genre_affinity")
          .insert(rows);

      if (insertError) {
        throw insertError;
      }
    }

    return jsonResponse({
      affinities: rows,
    });
  } catch (error) {
    console.error(
      "evaluate-genre-affinity error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "No hemos podido calcular tus afinidades.",
      },
      500,
    );
  }
});