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

type AlbumSeed = {
  id: string;
  spotify_id: string | null;
  spotify_artist_id: string | null;
  title: string;
  artist_name: string;
  cover_url: string | null;
  genres: string[] | null;
  rating: number;
};

type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
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
  return [...items].sort(
    () => Math.random() - 0.5,
  );
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

  if (!data.access_token) {
    throw new Error(
      "Spotify no ha devuelto un access token.",
    );
  }

  return data.access_token as string;
}

async function fetchSpotifyJson(
  url: string,
  token: string,
  maxAttempts = 3,
) {
  let finalStatus = 500;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseText =
      await response.text();

    if (response.ok) {
      return JSON.parse(responseText);
    }

    finalStatus = response.status;

    console.error(
      `Spotify request attempt ${attempt}:`,
      response.status,
      responseText,
    );

    const temporaryError = [
      429,
      502,
      503,
      504,
    ].includes(response.status);

    if (
      !temporaryError ||
      attempt === maxAttempts
    ) {
      break;
    }

    const retryAfter = Number(
      response.headers.get("Retry-After"),
    );

    const waitTime =
      Number.isFinite(retryAfter) &&
      retryAfter > 0
        ? retryAfter * 1000
        : attempt * 600;

    await new Promise((resolve) =>
      setTimeout(resolve, waitTime),
    );
  }

  throw new Error(
    `Spotify no ha respondido correctamente (${finalStatus}).`,
  );
}

async function searchArtistsByGenre(
  genre: string,
  token: string,
) {
  const randomLetters =
    shuffle(
      "abcdefghijklmnopqrstuvwxyz".split(""),
    ).slice(0, 3);

  const artists: SpotifyArtist[] = [];

  for (const letter of randomLetters) {
    const url = new URL(
      `${SPOTIFY_API_URL}/search`,
    );

    url.searchParams.set(
      "q",
      `genre:"${genre}" ${letter}`,
    );

    url.searchParams.set(
      "type",
      "artist",
    );

    url.searchParams.set(
      "limit",
      "10",
    );

    const data =
      await fetchSpotifyJson(
        url.toString(),
        token,
      );

    artists.push(
      ...(data.artists?.items ?? []),
    );
  }

  return Array.from(
    new Map(
      artists.map((artist) => [
        artist.id,
        artist,
      ]),
    ).values(),
  );
}

async function searchArtistByName(
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
    "limit",
    "5",
  );

  const data =
    await fetchSpotifyJson(
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

  const data =
    await fetchSpotifyJson(
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
          error: "No existe una sesión válida.",
        },
        401,
      );
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      throw new Error(
        "Falta la configuración interna de Supabase.",
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
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
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        {
          error: "La sesión no es válida.",
        },
        401,
      );
    }

    /*
     * Tomamos solo opiniones claramente positivas.
     * Así un 5 o un disco flojo no condicionan
     * nuestras recomendaciones.
     */
    const {
      data: positiveReviews,
      error: reviewsError,
    } = await supabase
      .from("album_reviews")
      .select(`
        rating,
        reaction,
        album:albums (
          id,
          spotify_id,
          spotify_artist_id,
          title,
          artist_name,
          cover_url,
          genres
        )
      `)
      .eq("user_id", user.id)
      .in("reaction", [
        "loved",
        "liked",
      ])
      .gte("rating", 7)
      .order("rating", {
        ascending: false,
      })
      .limit(25);

    if (reviewsError) {
      throw reviewsError;
    }

    const seeds: AlbumSeed[] = (
      positiveReviews ?? []
    )
      .map((review: any) => ({
        ...review.album,
        rating: Number(review.rating),
      }))
      .filter(
        (album: AlbumSeed) =>
          album?.id &&
          album?.artist_name,
      );

    if (!seeds.length) {
      return jsonResponse({
        recommendations: [],
        reason:
          "Necesitamos que termines y valores positivamente algún disco antes de recomendarte otros.",
      });
    }

    const seed = randomItem(
      seeds.slice(0, 10),
    );

    const {
      data: userAlbums,
      error: userAlbumsError,
    } = await supabase
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

    const {
      data: feedbackRows,
      error: feedbackError,
    } = await supabase
      .from(
        "album_recommendation_feedback",
      )
      .select("spotify_album_id")
      .eq("user_id", user.id);

    if (feedbackError) {
      throw feedbackError;
    }

    const excludedSpotifyIds = new Set([
      ...(userAlbums ?? [])
        .map(
          (item: any) =>
            item.album?.spotify_id,
        )
        .filter(Boolean),

      ...(feedbackRows ?? []).map(
        (item) => item.spotify_album_id,
      ),
    ]);

    const token =
      await getSpotifyToken();

    const seedGenres =
      seed.genres?.filter(Boolean) ?? [];

    let candidateArtists:
      SpotifyArtist[] = [];

    /*
     * Primera opción:
     * artistas que Spotify relaciona con el género
     * de un disco que te gustó.
     */
    for (
      const genre of shuffle(seedGenres).slice(
        0,
        2,
      )
    ) {
      try {
        const artists =
          await searchArtistsByGenre(
            genre,
            token,
          );

        candidateArtists.push(
          ...artists,
        );
      } catch (error) {
        console.error(
          `No se pudieron buscar artistas de ${genre}:`,
          error,
        );
      }
    }

    /*
     * Si no tenemos género, usamos el artista
     * del disco semilla y buscamos su catálogo.
     */
    if (!candidateArtists.length) {
      let seedArtistId =
        seed.spotify_artist_id;

      if (!seedArtistId) {
        const matchedArtist =
          await searchArtistByName(
            seed.artist_name,
            token,
          );

        seedArtistId =
          matchedArtist?.id ?? null;
      }

      if (seedArtistId) {
        candidateArtists = [
          {
            id: seedArtistId,
            name: seed.artist_name,
            genres: seedGenres,
          },
        ];
      }
    }

    const uniqueArtists = Array.from(
      new Map(
        candidateArtists.map((artist) => [
          artist.id,
          artist,
        ]),
      ).values(),
    );

    const recommendations: any[] = [];

    for (
      const artist of shuffle(
        uniqueArtists,
      ).slice(0, 12)
    ) {
      if (recommendations.length >= 6) {
        break;
      }

      try {
        const albums =
          await getArtistAlbums(
            artist.id,
            token,
          );

        const availableAlbums =
          shuffle(albums).filter(
            (album) =>
              album.id &&
              album.album_type === "album" &&
              !excludedSpotifyIds.has(
                album.id,
              ),
          );

        const album =
          availableAlbums[0];

        if (!album) {
          continue;
        }

        excludedSpotifyIds.add(album.id);

        recommendations.push({
          spotify_id: album.id,
          title: album.name,

          artist_name:
            album.artists
              ?.map(
                (item) => item.name,
              )
              .join(", ") ??
            artist.name,

          spotify_artist_id:
            album.artists?.[0]?.id ??
            artist.id,

          spotify_artist_url:
            album.artists?.[0]
              ?.external_urls?.spotify ??
            null,

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

          spotify_url:
            album.external_urls
              ?.spotify ?? null,

          album_type:
            album.album_type,

          track_count:
            album.total_tracks ?? null,

          total_tracks:
            album.total_tracks ?? null,

          genres:
            artist.genres?.length
              ? artist.genres
              : seedGenres,

          seed_album_id: seed.id,
        });
      } catch (error) {
        console.error(
          `No se pudo obtener el catálogo de ${artist.name}:`,
          error,
        );
      }
    }

    return jsonResponse({
      seed: {
        id: seed.id,
        title: seed.title,
        artist_name:
          seed.artist_name,
        cover_url: seed.cover_url,
        rating: seed.rating,
        genres: seedGenres,
      },

      recommendations:
        recommendations.slice(0, 3),
    });
  } catch (error) {
    console.error(
      "recommend-albums error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "No hemos podido preparar tus recomendaciones.",
      },
      500,
    );
  }
});