import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createClient,
} from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

type ReviewRow = {
  id: string;
  album_id: string;
  rating: number | string | null;
  reaction: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AlbumRow = {
  id: string;
  genres: string[] | null;
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
  return new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        ...corsHeaders,

        "Content-Type":
          "application/json",
      },
    },
  );
}

function normalizeGenre(
  value: string,
) {
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
  let xp =
    completedAlbums * 100;

  if (
    averageRating !== null &&
    averageRating >= 9
  ) {
    xp +=
      completedAlbums * 40;
  } else if (
    averageRating !== null &&
    averageRating >= 8
  ) {
    xp +=
      completedAlbums * 20;
  }

  return xp;
}

Deno.serve(
  async (request) => {
    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        },
      );
    }

    if (
      request.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          error:
            "Método no permitido.",
        },
        405,
      );
    }

    try {
      const authorization =
        request.headers.get(
          "Authorization",
        );

      if (!authorization) {
        return jsonResponse(
          {
            error:
              "No existe una sesión válida.",
          },
          401,
        );
      }

      const supabaseUrl =
        Deno.env.get(
          "SUPABASE_URL",
        );

      const anonKey =
        Deno.env.get(
          "SUPABASE_ANON_KEY",
        );

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

      const userClient =
        createClient(
          supabaseUrl,
          anonKey,
          {
            global: {
              headers: {
                Authorization:
                  authorization,
              },
            },
          },
        );

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await userClient.auth
          .getUser();

      if (
        userError ||
        !user
      ) {
        console.error(
          "getUser error:",
          userError,
        );

        return jsonResponse(
          {
            error:
              "La sesión no es válida.",
          },
          401,
        );
      }

      const adminClient =
        createClient(
          supabaseUrl,
          serviceRoleKey,
        );

      /*
       * Primero leemos las valoraciones.
       * Evitamos la relación embebida
       * album:albums(...), que era el
       * punto más frágil de la función.
       */
      const {
        data: reviewRows,
        error: reviewsError,
      } =
        await adminClient
          .from(
            "album_reviews",
          )
          .select(`
            id,
            album_id,
            rating,
            reaction,
            created_at,
            updated_at
          `)
          .eq(
            "user_id",
            user.id,
          )
          .neq(
            "reaction",
            "abandoned",
          )
          .not(
            "album_id",
            "is",
            null,
          );

      if (reviewsError) {
        console.error(
          "Reviews query error:",
          reviewsError,
        );

        throw new Error(
          `No se pudieron leer las valoraciones: ${reviewsError.message}`,
        );
      }

      const reviews =
        (reviewRows ??
          []) as ReviewRow[];

      /*
       * Si no existen valoraciones,
       * limpiamos afinidades anteriores.
       */
      if (
        reviews.length === 0
      ) {
        const {
          error:
            clearError,
        } =
          await adminClient
            .from(
              "user_genre_affinity",
            )
            .delete()
            .eq(
              "user_id",
              user.id,
            );

        if (clearError) {
          throw new Error(
            `No se pudieron limpiar las afinidades: ${clearError.message}`,
          );
        }

        return jsonResponse({
          affinities: [],
        });
      }

      const albumIds =
        Array.from(
          new Set(
            reviews
              .map(
                (
                  review,
                ) =>
                  review.album_id,
              )
              .filter(
                Boolean,
              ),
          ),
        );

      const {
        data: albumRows,
        error: albumsError,
      } =
        await adminClient
          .from("albums")
          .select(`
            id,
            genres
          `)
          .in(
            "id",
            albumIds,
          );

      if (albumsError) {
        console.error(
          "Albums query error:",
          albumsError,
        );

        throw new Error(
          `No se pudieron leer los géneros de los discos: ${albumsError.message}`,
        );
      }

      const albums =
        (albumRows ??
          []) as AlbumRow[];

      const albumById =
        new Map<
          string,
          AlbumRow
        >(
          albums.map(
            (album) => [
              album.id,
              album,
            ],
          ),
        );

      const genresMap =
        new Map<
          string,
          GenreAccumulator
        >();

      for (
        const review
        of reviews
      ) {
        const album =
          albumById.get(
            review.album_id,
          );

        const genres =
          Array.isArray(
            album?.genres,
          )
            ? album.genres
            : [];

        if (
          genres.length ===
          0
        ) {
          continue;
        }

        const numericRating =
          review.rating ===
            null ||
          review.rating ===
            undefined
            ? null
            : Number(
                review.rating,
              );

        const validRating =
          numericRating !==
            null &&
          Number.isFinite(
            numericRating,
          )
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
                .filter(
                  (
                    genre,
                  ): genre is string =>
                    typeof genre ===
                      "string" &&
                    genre.trim()
                      .length >
                      0,
                )
                .map(
                  normalizeGenre,
                ),
            ),
          );

        for (
          const genre
          of uniqueGenres
        ) {
          const current =
            genresMap.get(
              genre,
            ) ?? {
              completedAlbums:
                0,

              ratingTotal:
                0,

              ratedAlbums:
                0,

              highestRating:
                null,

              lastListenedAt:
                null,
            };

          current.completedAlbums +=
            1;

          if (
            validRating !==
            null
          ) {
            current.ratingTotal +=
              validRating;

            current.ratedAlbums +=
              1;

            current.highestRating =
              current.highestRating ===
              null
                ? validRating
                : Math.max(
                    current.highestRating,
                    validRating,
                  );
          }

          if (
            listenedAt
          ) {
            const nextTime =
              new Date(
                listenedAt,
              ).getTime();

            const currentTime =
              current.lastListenedAt
                ? new Date(
                    current.lastListenedAt,
                  ).getTime()
                : 0;

            if (
              Number.isFinite(
                nextTime,
              ) &&
              nextTime >
                currentTime
            ) {
              current.lastListenedAt =
                listenedAt;
            }
          }

          genresMap.set(
            genre,
            current,
          );
        }
      }

      const now =
        new Date()
          .toISOString();

      const rows =
        Array.from(
          genresMap.entries(),
        ).map(
          ([
            genre,
            values,
          ]) => {
            const averageRating =
              values.ratedAlbums >
              0
                ? Number(
                    (
                      values.ratingTotal /
                      values.ratedAlbums
                    ).toFixed(
                      2,
                    ),
                  )
                : null;

            return {
              user_id:
                user.id,

              genre,

              genre_xp:
                getGenreXP({
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
                now,
            };
          },
        );

      /*
       * Sustituimos el cálculo anterior.
       */
      const {
        error: deleteError,
      } =
        await adminClient
          .from(
            "user_genre_affinity",
          )
          .delete()
          .eq(
            "user_id",
            user.id,
          );

      if (deleteError) {
        console.error(
          "Delete affinities error:",
          deleteError,
        );

        throw new Error(
          `No se pudieron limpiar las afinidades anteriores: ${deleteError.message}`,
        );
      }

      if (
        rows.length > 0
      ) {
        const {
          error: insertError,
        } =
          await adminClient
            .from(
              "user_genre_affinity",
            )
            .insert(
              rows,
            );

        if (
          insertError
        ) {
          console.error(
            "Insert affinities error:",
            insertError,
          );

          throw new Error(
            `No se pudieron guardar las afinidades: ${insertError.message}`,
          );
        }
      }

      return jsonResponse({
        affinities:
          rows,

        processedReviews:
          reviews.length,

        processedAlbums:
          albums.length,

        processedGenres:
          rows.length,
      });
    } catch (error) {
      console.error(
        "evaluate-genre-affinity error:",
        error,
      );

      const message =
        error instanceof
        Error
          ? error.message
          : "No hemos podido calcular tus afinidades.";

      return jsonResponse(
        {
          error:
            message,
        },
        500,
      );
    }
  },
);