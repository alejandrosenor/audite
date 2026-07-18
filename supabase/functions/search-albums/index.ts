import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SPOTIFY_TOKEN_URL =
  "https://accounts.spotify.com/api/token";

const SPOTIFY_API_URL =
  "https://api.spotify.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
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

async function getSpotifyToken() {
  const clientId =
    Deno.env.get(
      "SPOTIFY_CLIENT_ID",
    );

  const clientSecret =
    Deno.env.get(
      "SPOTIFY_CLIENT_SECRET",
    );

  if (
    !clientId ||
    !clientSecret
  ) {
    throw new Error(
      "No están configuradas las credenciales de Spotify en Supabase.",
    );
  }

  const credentials =
    btoa(
      `${clientId}:${clientSecret}`,
    );

  const response =
    await fetch(
      SPOTIFY_TOKEN_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Basic ${credentials}`,

          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body:
          new URLSearchParams({
            grant_type:
              "client_credentials",
          }).toString(),
      },
    );

  const responseText =
    await response.text();

  if (!response.ok) {
    console.error(
      "Error autenticando en Spotify:",
      response.status,
      responseText,
    );

    throw new Error(
      `Spotify ha rechazado las credenciales (${response.status}).`,
    );
  }

  const data =
    JSON.parse(
      responseText,
    );

  if (!data.access_token) {
    throw new Error(
      "Spotify no ha devuelto ningún access token.",
    );
  }

  return data.access_token;
}

async function spotifyFetch(
  url: string,
  token: string,
) {
  const response =
    await fetch(
      url,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  const responseText =
    await response.text();

  if (
    response.status ===
    429
  ) {
    const retryAfter =
      Number(
        response.headers.get(
          "Retry-After",
        ) ?? "60",
      );

    throw new Error(
      `SPOTIFY_RATE_LIMIT:${retryAfter}`,
    );
  }

  if (!response.ok) {
    console.error(
      "Spotify API error:",
      response.status,
      responseText,
    );

    throw new Error(
      `Spotify ha devuelto un error (${response.status}).`,
    );
  }

  return JSON.parse(
    responseText,
  );
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
      const {
        query,
      } =
        await request.json();

      if (
        typeof query !==
          "string" ||
        query.trim().length <
          2
      ) {
        return jsonResponse(
          {
            error:
              "Escribe al menos dos caracteres.",
          },
          400,
        );
      }

      const token =
        await getSpotifyToken();

      const searchUrl =
        new URL(
          `${SPOTIFY_API_URL}/search`,
        );

      searchUrl.searchParams.set(
        "q",
        query.trim(),
      );

      searchUrl.searchParams.set(
        "type",
        "album",
      );

      searchUrl.searchParams.set(
        "market",
        "ES",
      );

      searchUrl.searchParams.set(
        "limit",
        "5",
      );

      const data =
        await spotifyFetch(
          searchUrl.toString(),
          token,
        );

      const albumItems =
        data.albums?.items ??
        [];

      /*
       * Recogemos todos los artistas principales
       * sin repetir IDs.
       */
      const artistIds =
        Array.from(
          new Set(
            albumItems
              .map(
                (album: any) =>
                  album.artists?.[0]
                    ?.id,
              )
              .filter(
                Boolean,
              ),
          ),
        ).slice(0,5);

      const artistsById =
        new Map<string, any>();

      for (
        const artistId
        of artistIds
      ) {
        try {
          const artistData =
            await spotifyFetch(
              `${SPOTIFY_API_URL}/artists/${artistId}`,
              token,
            );

          artistsById.set(
            artistId,
            artistData,
          );
        } catch (artistError) {
          console.error(
            `No se pudo cargar el artista ${artistId}:`,
            artistError,
          );

          /*
          * No hacemos fallar toda la búsqueda.
          * El álbum seguirá apareciendo,
          * aunque temporalmente no tenga género.
          */
        }
      }

      const albums =
        albumItems.map(
          (album: any) => {
            const primaryArtist =
              album.artists?.[0] ??
              null;

            const fullArtist =
              primaryArtist?.id
                ? artistsById.get(
                    primaryArtist.id,
                  )
                : null;

            return {
              spotify_id:
                album.id,

              spotify_artist_id:
                primaryArtist?.id ??
                null,

              title:
                album.name,

              artist_name:
                album.artists
                  ?.map(
                    (
                      artist: any,
                    ) =>
                      artist.name,
                  )
                  .join(", ") ??
                "Artista desconocido",

              release_year:
                album.release_date
                  ? Number(
                      album.release_date.slice(
                        0,
                        4,
                      ),
                    )
                  : null,

              cover_url:
                album.images?.[0]
                  ?.url ??
                null,

              spotify_url:
                album.external_urls
                  ?.spotify ??
                null,

              spotify_artist_url:
                primaryArtist
                  ?.external_urls
                  ?.spotify ??
                fullArtist
                  ?.external_urls
                  ?.spotify ??
                null,

              album_type:
                album.album_type,

              track_count:
                album.total_tracks,

              total_tracks:
                album.total_tracks,

              spotify_release_date:
                album.release_date ??
                null,

              /*
               * Aquí está el arreglo principal.
               * Los géneros proceden del artista,
               * no del objeto álbum.
               */
              genres:
                Array.isArray(
                  fullArtist
                    ?.genres,
                )
                  ? fullArtist
                      .genres
                  : [],
            };
          },
        );

      return jsonResponse({
        albums,
      });
    } catch (error) {
      console.error(
        "search-albums error:",
        error,
      );

      const rawMessage =
        error instanceof Error
          ? error.message
          : "";

      if (
        rawMessage.startsWith(
          "SPOTIFY_RATE_LIMIT:",
        )
      ) {
        const retryAfter =
          Number(
            rawMessage.split(
              ":",
            )[1],
          ) || 60;

        return jsonResponse(
          {
            error:
              "Spotify está limitando temporalmente las búsquedas. Espera un poco y vuelve a intentarlo.",

            code:
              "spotify_rate_limit",

            retryAfter,
          },
          429,
        );
      }

      return jsonResponse(
        {
          error:
            rawMessage ||
            "Error inesperado.",
        },
        500,
      );
    }
  },
);