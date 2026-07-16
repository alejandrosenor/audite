import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SPOTIFY_TOKEN_URL =
  "https://accounts.spotify.com/api/token";

const SPOTIFY_API_URL =
  "https://api.spotify.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Region =
  | "all"
  | "spain"
  | "latin-america";

type Style =
  | "all"
  | "rock"
  | "pop"
  | "indie"
  | "singer-songwriter"
  | "folk"
  | "flamenco"
  | "tropical"
  | "urban";

type ArtistSeed = {
  name: string;
  region: Exclude<Region, "all">;
  styles: Exclude<Style, "all">[];
  country: string;
};

type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
  external_urls?: {
    spotify?: string;
  };
};

type SpotifyAlbum = {
  id: string;
  name: string;
  album_type: string;
  release_date?: string;
  total_tracks?: number;
  images?: Array<{
    url: string;
  }>;
  external_urls?: {
    spotify?: string;
  };
  artists?: Array<{
    id: string;
    name: string;
    external_urls?: {
      spotify?: string;
    };
  }>;
};

/*
 * Catálogo controlado.
 *
 * Puedes ampliarlo cuando quieras. La ventaja
 * es que evita que Spotify nos devuelva álbumes
 * ingleses solo porque están disponibles en España.
 */
const spanishSpeakingArtists: ArtistSeed[] = [
  // España — rock
  {
    name: "Héroes del Silencio",
    region: "spain",
    styles: ["rock"],
    country: "España",
  },
  {
    name: "Extremoduro",
    region: "spain",
    styles: ["rock"],
    country: "España",
  },
  {
    name: "Los Rodríguez",
    region: "spain",
    styles: ["rock"],
    country: "España",
  },
  {
    name: "M Clan",
    region: "spain",
    styles: ["rock"],
    country: "España",
  },
  {
    name: "Leiva",
    region: "spain",
    styles: ["rock", "pop", "singer-songwriter"],
    country: "España",
  },

  // España — pop
  {
    name: "La Oreja de Van Gogh",
    region: "spain",
    styles: ["pop"],
    country: "España",
  },
  {
    name: "Amaral",
    region: "spain",
    styles: ["pop", "rock"],
    country: "España",
  },
  {
    name: "Alejandro Sanz",
    region: "spain",
    styles: ["pop", "singer-songwriter"],
    country: "España",
  },
  {
    name: "Vanesa Martín",
    region: "spain",
    styles: ["pop", "singer-songwriter"],
    country: "España",
  },
  {
    name: "Amaia",
    region: "spain",
    styles: ["pop", "indie"],
    country: "España",
  },

  // España — indie
  {
    name: "Vetusta Morla",
    region: "spain",
    styles: ["indie", "rock"],
    country: "España",
  },
  {
    name: "Love of Lesbian",
    region: "spain",
    styles: ["indie", "rock"],
    country: "España",
  },
  {
    name: "Viva Suecia",
    region: "spain",
    styles: ["indie", "rock"],
    country: "España",
  },
  {
    name: "La M.O.D.A.",
    region: "spain",
    styles: ["indie", "folk", "rock"],
    country: "España",
  },
  {
    name: "Rufus T. Firefly",
    region: "spain",
    styles: ["indie", "rock"],
    country: "España",
  },

  // España — canción y raíces
  {
    name: "Joan Manuel Serrat",
    region: "spain",
    styles: ["singer-songwriter", "folk"],
    country: "España",
  },
  {
    name: "Joaquín Sabina",
    region: "spain",
    styles: ["singer-songwriter", "rock"],
    country: "España",
  },
  {
    name: "Silvio Rodríguez",
    region: "latin-america",
    styles: ["singer-songwriter", "folk"],
    country: "Cuba",
  },
  {
    name: "Paco de Lucía",
    region: "spain",
    styles: ["flamenco", "folk"],
    country: "España",
  },
  {
    name: "Camarón de la Isla",
    region: "spain",
    styles: ["flamenco"],
    country: "España",
  },
  {
    name: "Rosalía",
    region: "spain",
    styles: ["flamenco", "pop", "urban"],
    country: "España",
  },

  // Argentina
  {
    name: "Charly García",
    region: "latin-america",
    styles: ["rock", "pop"],
    country: "Argentina",
  },
  {
    name: "Luis Alberto Spinetta",
    region: "latin-america",
    styles: ["rock", "singer-songwriter"],
    country: "Argentina",
  },
  {
    name: "Soda Stereo",
    region: "latin-america",
    styles: ["rock", "pop"],
    country: "Argentina",
  },
  {
    name: "Fito Páez",
    region: "latin-america",
    styles: ["rock", "pop", "singer-songwriter"],
    country: "Argentina",
  },
  {
    name: "Andrés Calamaro",
    region: "latin-america",
    styles: ["rock", "singer-songwriter"],
    country: "Argentina",
  },
  {
    name: "Gustavo Cerati",
    region: "latin-america",
    styles: ["rock", "pop", "indie"],
    country: "Argentina",
  },
  {
    name: "Conociendo Rusia",
    region: "latin-america",
    styles: ["indie", "rock", "pop"],
    country: "Argentina",
  },

  // México
  {
    name: "Café Tacvba",
    region: "latin-america",
    styles: ["rock", "indie", "folk"],
    country: "México",
  },
  {
    name: "Caifanes",
    region: "latin-america",
    styles: ["rock"],
    country: "México",
  },
  {
    name: "Natalia Lafourcade",
    region: "latin-america",
    styles: ["pop", "folk", "singer-songwriter"],
    country: "México",
  },
  {
    name: "Julieta Venegas",
    region: "latin-america",
    styles: ["pop", "indie", "singer-songwriter"],
    country: "México",
  },
  {
    name: "Zoé",
    region: "latin-america",
    styles: ["rock", "indie"],
    country: "México",
  },

  // Chile
  {
    name: "Los Bunkers",
    region: "latin-america",
    styles: ["rock", "pop"],
    country: "Chile",
  },
  {
    name: "Mon Laferte",
    region: "latin-america",
    styles: ["pop", "rock", "singer-songwriter"],
    country: "Chile",
  },
  {
    name: "Violeta Parra",
    region: "latin-america",
    styles: ["folk", "singer-songwriter"],
    country: "Chile",
  },

  // Colombia
  {
    name: "Aterciopelados",
    region: "latin-america",
    styles: ["rock", "indie"],
    country: "Colombia",
  },
  {
    name: "Carlos Vives",
    region: "latin-america",
    styles: ["pop", "folk", "tropical"],
    country: "Colombia",
  },
  {
    name: "Juanes",
    region: "latin-america",
    styles: ["pop", "rock"],
    country: "Colombia",
  },

  // Uruguay
  {
    name: "Jorge Drexler",
    region: "latin-america",
    styles: ["singer-songwriter", "folk", "pop"],
    country: "Uruguay",
  },
  {
    name: "El Cuarteto de Nos",
    region: "latin-america",
    styles: ["rock", "pop"],
    country: "Uruguay",
  },

  // Tropical y Caribe
  {
    name: "Rubén Blades",
    region: "latin-america",
    styles: ["tropical", "singer-songwriter"],
    country: "Panamá",
  },
  {
    name: "Héctor Lavoe",
    region: "latin-america",
    styles: ["tropical"],
    country: "Puerto Rico",
  },
  {
    name: "Willie Colón",
    region: "latin-america",
    styles: ["tropical"],
    country: "Puerto Rico",
  },
  {
    name: "Buena Vista Social Club",
    region: "latin-america",
    styles: ["tropical", "folk"],
    country: "Cuba",
  },

  // Urbano
  {
    name: "C. Tangana",
    region: "spain",
    styles: ["urban", "pop", "flamenco"],
    country: "España",
  },
  {
    name: "Nathy Peluso",
    region: "latin-america",
    styles: ["urban", "pop"],
    country: "Argentina",
  },
  {
    name: "Trueno",
    region: "latin-america",
    styles: ["urban"],
    country: "Argentina",
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

function randomItem<T>(items: T[]) {
  return items[
    Math.floor(Math.random() * items.length)
  ];
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [
      shuffled[index],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

async function getSpotifyToken() {
  const clientId = Deno.env.get(
    "SPOTIFY_CLIENT_ID",
  );

  const clientSecret = Deno.env.get(
    "SPOTIFY_CLIENT_SECRET",
  );

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan las credenciales de Spotify.",
    );
  }

  const response = await fetch(
    SPOTIFY_TOKEN_URL,
    {
      method: "POST",
      headers: {
        Authorization:
          `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
    },
  );

  const responseText =
    await response.text();

  if (!response.ok) {
    console.error(
      "Spotify token error:",
      response.status,
      responseText,
    );

    throw new Error(
      `Spotify no ha podido autenticar la aplicación (${response.status}).`,
    );
  }

  const data = JSON.parse(responseText);

  return data.access_token as string;
}

async function fetchSpotifyJson(
  url: string,
  token: string,
  maxAttempts = 2,
) {
  let lastStatus = 500;
  let lastMessage =
    "Spotify no ha respondido correctamente.";

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    const controller =
      new AbortController();

    const timeoutId = setTimeout(
      () => controller.abort(),
      8000,
    );

    try {
      const response = await fetch(url, {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      const responseText =
        await response.text();

      if (response.ok) {
        return JSON.parse(responseText);
      }

      lastStatus = response.status;
      lastMessage = responseText;

      console.error(
        "Spotify request error:",
        {
          status: response.status,
          attempt,
          retryAfter:
            response.headers.get(
              "Retry-After",
            ),
          response: responseText,
        },
      );

      if (response.status === 429) {
        const retryAfterHeader =
          response.headers.get(
            "Retry-After",
          );

        const retryAfterSeconds =
          Math.max(
            1,
            Number(
              retryAfterHeader ?? 2,
            ),
          );

        /*
         * No esperamos eternamente dentro de
         * la Edge Function. Como máximo 5 s.
         */
        const waitMilliseconds =
          Math.min(
            retryAfterSeconds,
            5,
          ) * 1000;

        if (attempt < maxAttempts) {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                waitMilliseconds,
              ),
          );

          continue;
        }

        throw new Error(
          `SPOTIFY_RATE_LIMIT:${retryAfterSeconds}`,
        );
      }

      const temporaryError = [
        500,
        502,
        503,
        504,
      ].includes(response.status);

      if (
        temporaryError &&
        attempt < maxAttempts
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              attempt * 600,
            ),
        );

        continue;
      }

      throw new Error(
        `Spotify ha devuelto un error (${response.status}).`,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith(
          "SPOTIFY_RATE_LIMIT:",
        )
      ) {
        throw error;
      }

      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        lastMessage =
          "Spotify ha tardado demasiado en responder.";
      } else {
        lastMessage =
          error instanceof Error
            ? error.message
            : String(error);
      }

      if (attempt === maxAttempts) {
        throw new Error(lastMessage);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    `Spotify no ha respondido correctamente (${lastStatus}): ${lastMessage}`,
  );
}

async function searchExactArtist(
  artistName: string,
  token: string,
) {
  const url = new URL(
    `${SPOTIFY_API_URL}/search`,
  );

  url.searchParams.set(
    "q",
    `artist:"${artistName}"`,
  );

  url.searchParams.set(
    "type",
    "artist",
  );

  url.searchParams.set(
    "market",
    "ES",
  );

  url.searchParams.set(
    "limit",
    "5",
  );

  const data = await fetchSpotifyJson(
    url.toString(),
    token,
  );

  const artists: SpotifyArtist[] =
    data.artists?.items ?? [];

  return (
    artists.find(
      (artist) =>
        normalize(artist.name) ===
        normalize(artistName),
    ) ??
    artists[0] ??
    null
  );
}

async function getArtistAlbums(
  artistId: string,
  token: string,
) {
  const url = new URL(
    `${SPOTIFY_API_URL}/artists/${artistId}/albums`,
  );

  url.searchParams.set(
    "include_groups",
    "album",
  );

  url.searchParams.set(
    "market",
    "ES",
  );

  url.searchParams.set(
    "limit",
    "10",
  );

  const data = await fetchSpotifyJson(
    url.toString(),
    token,
  );

  return (
    data.items ?? []
  ) as SpotifyAlbum[];
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
          error:
            "No existe una sesión válida.",
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
            Authorization:
              authorization,
          },
        },
      },
    );

    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
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

    const requestBody =
      await request.json();

    const region: Region = [
      "all",
      "spain",
      "latin-america",
    ].includes(requestBody?.region)
      ? requestBody.region
      : "all";

    const style: Style = [
      "all",
      "rock",
      "pop",
      "indie",
      "singer-songwriter",
      "folk",
      "flamenco",
      "tropical",
      "urban",
    ].includes(requestBody?.style)
      ? requestBody.style
      : "all";

    const {
      data: userAlbums,
      error: userAlbumsError,
    } = await adminClient
      .from("user_albums")
      .select(`
        album:albums (
          spotify_id
        )
      `)
      .eq("user_id", user.id);

    if (userAlbumsError) {
      throw userAlbumsError;
    }

    const excludedSpotifyIds = new Set(
      (userAlbums ?? [])
        .map(
          (item: any) =>
            item.album?.spotify_id,
        )
        .filter(Boolean),
    );

    const matchingSeeds =
      spanishSpeakingArtists.filter(
        (artist) => {
          const regionMatches =
            region === "all" ||
            artist.region === region;

          const styleMatches =
            style === "all" ||
            artist.styles.includes(
              style as Exclude<
                Style,
                "all"
              >,
            );

          return (
            regionMatches &&
            styleMatches
          );
        },
      );

    if (!matchingSeeds.length) {
      return jsonResponse(
        {
          error:
            "No tenemos artistas configurados para esos filtros.",
        },
        400,
      );
    }

    const token =
      await getSpotifyToken();

    /*
     * Probamos varios artistas para evitar que
     * uno sin álbum disponible deje la petición vacía.
     */
    const candidateSeeds =
      shuffle(matchingSeeds).slice(0, 3);

    let lastCandidateError = "";

    for (const seed of candidateSeeds) {
      try {
        const spotifyArtist =
          await searchExactArtist(
            seed.name,
            token,
          );

        if (!spotifyArtist) {
          continue;
        }

        const artistAlbums =
          await getArtistAlbums(
            spotifyArtist.id,
            token,
          );

        const validAlbums =
          artistAlbums.filter(
            (album) =>
              album.id &&
              album.album_type === "album" &&
              album.images?.[0]?.url &&
              album.total_tracks >= 5 &&
              !excludedSpotifyIds.has(
                album.id,
              ),
          );

        if (!validAlbums.length) {
          continue;
        }

        const album =
          randomItem(validAlbums);

        const artistNames =
          album.artists
            ?.map(
              (artist) => artist.name,
            )
            .join(", ") ??
          spotifyArtist.name;

        const now = new Date().toISOString();

        const albumPayload = {
          spotify_id: album.id,

          spotify_artist_id:
            album.artists?.[0]?.id ??
            spotifyArtist.id,

          title: album.name,

          artist_name:
            artistNames,

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
            album.images?.[0]?.url ??
            null,

          spotify_image_url:
            album.images?.[0]?.url ??
            null,

          spotify_url:
            album.external_urls
              ?.spotify ?? null,

          spotify_artist_url:
            album.artists?.[0]
              ?.external_urls
              ?.spotify ??
            spotifyArtist
              .external_urls
              ?.spotify ??
            null,

          album_type:
            album.album_type,

          track_count:
            album.total_tracks ?? null,

          total_tracks:
            album.total_tracks ?? null,

          genres:
            spotifyArtist.genres?.length
              ? spotifyArtist.genres
              : seed.styles,

          language: "es",
          country: seed.country,

          spanish_region:
            seed.region,

          spanish_style:
            style === "all"
              ? seed.styles[0]
              : style,

          discovery_source:
            "spanish",

          updated_at: now,
        };

        const {
          data: storedAlbum,
          error: storedAlbumError,
        } = await adminClient
          .from("albums")
          .upsert(
            albumPayload,
            {
              onConflict: "spotify_id",
            },
          )
          .select()
          .single();

        if (storedAlbumError) {
          throw storedAlbumError;
        }

        /*
        * Lo guardamos como el disco generado actual.
        * Es la misma estructura que después necesita
        * Discover.jsx para aceptar, conocer o rechazar.
        */
        const {
          data: storedUserAlbum,
          error: storedUserAlbumError,
        } = await adminClient
          .from("user_albums")
          .upsert(
            {
              user_id: user.id,
              album_id: storedAlbum.id,
              status: "generated",
              updated_at: now,
            },
            {
              onConflict:
                "user_id,album_id",
            },
          )
          .select(`
            *,
            album:albums (*)
          `)
          .single();

        if (storedUserAlbumError) {
          throw storedUserAlbumError;
        }

        return jsonResponse({
          userAlbum: storedUserAlbum,

          context: {
            region,
            style,
            country: seed.country,
            artistSeed: seed.name,
          },
          });
      } catch (artistError) {
        const errorMessage =
          artistError instanceof Error
            ? artistError.message
            : JSON.stringify(
                artistError,
              );

        if (
          errorMessage.startsWith(
            "SPOTIFY_RATE_LIMIT:",
          )
        ) {
          const retryAfterSeconds =
            Number(
              errorMessage.split(":")[1],
            ) || 30;

          console.error(
            "SPANISH_DISCOVERY_RATE_LIMIT",
            {
              artist: seed.name,
              retryAfterSeconds,
            },
          );

          return jsonResponse(
            {
              error:
                `Spotify está limitando temporalmente las búsquedas. Espera ${retryAfterSeconds} segundos y vuelve a intentarlo.`,

              code: "spotify_rate_limit",

              retryAfter:
                retryAfterSeconds,
            },
            429,
          );
        }

        lastCandidateError =
          errorMessage;

        console.error(
          "SPANISH_DISCOVERY_CANDIDATE_ERROR",
          {
            artist: seed.name,
            region: seed.region,
            styles: seed.styles,
            error:
              lastCandidateError,
          },
        );
      }
    }

    return jsonResponse(
      {
        error:
          lastCandidateError
            ? `No se pudo guardar el disco: ${lastCandidateError}`
            : "No hemos encontrado un disco nuevo con esos filtros. Prueba otra combinación.",
      },
      lastCandidateError ? 500 : 404,
    );
  } catch (error) {
    console.error(
      "discover-spanish-album error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "No hemos podido descubrir un disco en español.",
      },
      500,
    );
  }
});