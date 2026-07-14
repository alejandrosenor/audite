import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const MUSICBRAINZ_BASE_URL = "https://musicbrainz.org/ws/2";
const COVER_ART_BASE_URL = "https://coverartarchive.org";

const allowedOrigins = [
  "http://localhost:5173",
  "https://audite.vercel.app",
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[1];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getRandomOffset(maximum: number) {
  return Math.floor(Math.random() * Math.max(maximum, 1));
}

const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifyTrack = {
  id: string;
  name: string;
  track_number: number;
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls?: {
    spotify?: string;
  };
};

type SpotifyAlbum = {
  id: string;
  name: string;
  album_type: string;
  total_tracks: number;
  release_date: string;
  popularity?: number;
  external_urls?: {
    spotify?: string;
  };
  images?: Array<{
    url: string;
    width: number | null;
    height: number | null;
  }>;
  artists?: Array<{
    name: string;
    external_urls?: {
      spotify?: string;
    };
  }>;
  tracks?: {
    items: SpotifyTrack[];
    next: string | null;
  };
};

async function getSpotifyAccessToken() {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Faltan las credenciales de Spotify.");
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Spotify token error:", errorBody);

    throw new Error(
      `Spotify no ha podido autenticar la aplicación (${response.status}).`,
    );
  }

  const data = await response.json() as SpotifyTokenResponse;

  return data.access_token;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function calculateAlbumMatchScore(
  spotifyAlbum: SpotifyAlbum,
  expectedTitle: string,
  expectedArtist: string,
) {
  const normalizedExpectedTitle = normalizeText(expectedTitle);
  const normalizedExpectedArtist = normalizeText(expectedArtist);

  const normalizedSpotifyTitle = normalizeText(spotifyAlbum.name);
  const normalizedSpotifyArtist = normalizeText(
    spotifyAlbum.artists?.[0]?.name ?? "",
  );

  let score = 0;

  if (normalizedSpotifyTitle === normalizedExpectedTitle) {
    score += 60;
  } else if (
    normalizedSpotifyTitle.includes(normalizedExpectedTitle) ||
    normalizedExpectedTitle.includes(normalizedSpotifyTitle)
  ) {
    score += 35;
  }

  if (normalizedSpotifyArtist === normalizedExpectedArtist) {
    score += 40;
  } else if (
    normalizedSpotifyArtist.includes(normalizedExpectedArtist) ||
    normalizedExpectedArtist.includes(normalizedSpotifyArtist)
  ) {
    score += 20;
  }

  if (spotifyAlbum.album_type === "album") {
    score += 5;
  }

  return score;
}

async function findSpotifyAlbum(
  token: string,
  title: string,
  artist: string,
) {
  const searchUrl = new URL(`${SPOTIFY_API_URL}/search`);

  searchUrl.searchParams.set(
    "q",
    `album:${title} artist:${artist}`,
  );
  searchUrl.searchParams.set("type", "album");
  searchUrl.searchParams.set("limit", "10");
  searchUrl.searchParams.set("market", "ES");

  const response = await fetch(searchUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error("Spotify search error:", await response.text());
    return null;
  }

  const data = await response.json();
  const candidates = data.albums?.items ?? [];

  if (!candidates.length) {
    return null;
  }

  const rankedCandidates = candidates
    .map((album: SpotifyAlbum) => ({
      album,
      score: calculateAlbumMatchScore(album, title, artist),
    }))
    .sort(
      (
        first: { score: number },
        second: { score: number },
      ) => second.score - first.score,
    );

  if (rankedCandidates[0].score < 60) {
    return null;
  }

  return rankedCandidates[0].album as SpotifyAlbum;
}

async function getSpotifyAlbum(
  token: string,
  spotifyAlbumId: string,
) {
  const response = await fetch(
    `${SPOTIFY_API_URL}/albums/${spotifyAlbumId}?market=ES`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    console.error("Spotify album error:", await response.text());
    return null;
  }

  return await response.json() as SpotifyAlbum;
}

async function getAllSpotifyTracks(
  token: string,
  album: SpotifyAlbum,
) {
  const tracks = [...(album.tracks?.items ?? [])];
  let nextUrl = album.tracks?.next ?? null;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "Spotify pagination error:",
        await response.text(),
      );
      break;
    }

    const page = await response.json();

    tracks.push(...(page.items ?? []));
    nextUrl = page.next;
  }

  return tracks;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Método no permitido." },
      405,
      corsHeaders,
    );
  }

  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(
        { error: "No hay una sesión válida." },
        401,
        corsHeaders,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Falta la configuración interna de Supabase.");
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
        { error: "La sesión no es válida." },
        401,
        corsHeaders,
      );
    }

    const requestBody = await request.json().catch(() => ({}));
    const genre =
      typeof requestBody.genre === "string"
        ? requestBody.genre.trim()
        : "";

    const randomYear = 1960 + Math.floor(Math.random() * 66);

    const queryParts = [
      'primarytype:"Album"',
      `firstreleasedate:[${randomYear}-01-01 TO ${randomYear}-12-31]`,
      "-secondarytype:Compilation",
      "-secondarytype:Live",
      "-secondarytype:Remix",
    ];

    if (genre) {
      queryParts.push(`tag:"${genre.replaceAll('"', "")}"`);
    }

    const limit = 25;
    const offset = getRandomOffset(200);

    const musicBrainzUrl = new URL(
      `${MUSICBRAINZ_BASE_URL}/release-group`,
    );

    musicBrainzUrl.searchParams.set(
      "query",
      queryParts.join(" AND "),
    );
    musicBrainzUrl.searchParams.set("fmt", "json");
    musicBrainzUrl.searchParams.set("limit", String(limit));
    musicBrainzUrl.searchParams.set("offset", String(offset));

    const musicBrainzResponse = await fetch(
      musicBrainzUrl.toString(),
      {
        headers: {
          "User-Agent":
            "Audite/0.1 (music-discovery-app; asenorsnz@gmail.com)",
          Accept: "application/json",
        },
      },
    );

    if (!musicBrainzResponse.ok) {
      throw new Error(
        `MusicBrainz respondió con ${musicBrainzResponse.status}.`,
      );
    }

    const musicBrainzData = await musicBrainzResponse.json();

    const candidates = (
      musicBrainzData["release-groups"] ?? []
    ).filter(
      (item: Record<string, unknown>) =>
        item.id &&
        item.title &&
        Array.isArray(item["artist-credit"]) &&
        item["artist-credit"].length > 0,
    );

    if (!candidates.length) {
      return jsonResponse(
        {
          error:
            "No hemos encontrado ningún disco con esos filtros. Prueba otra vez.",
        },
        404,
        corsHeaders,
      );
    }

    const shuffledCandidates = candidates
      .map((candidate: unknown) => ({
        candidate,
        random: Math.random(),
      }))
      .sort((a: { random: number }, b: { random: number }) =>
        a.random - b.random
      )
      .map(
        (item: { candidate: Record<string, unknown> }) =>
          item.candidate,
      );

    let selectedAlbum = null;
    let coverUrl = null;

    for (const candidate of shuffledCandidates.slice(0, 8)) {
      const musicBrainzId = String(candidate.id);

      const { data: existingAlbum } = await supabase
        .from("albums")
        .select("*")
        .eq("musicbrainz_id", musicBrainzId)
        .maybeSingle();

      if (existingAlbum) {
        const { data: existingUserAlbum } = await supabase
          .from("user_albums")
          .select("id")
          .eq("user_id", user.id)
          .eq("album_id", existingAlbum.id)
          .maybeSingle();

        if (!existingUserAlbum) {
          selectedAlbum = existingAlbum;
          break;
        }

        continue;
      }

      const coverResponse = await fetch(
        `${COVER_ART_BASE_URL}/release-group/${musicBrainzId}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (coverResponse.ok) {
        const coverData = await coverResponse.json();
        const frontImage = coverData.images?.find(
          (image: { front?: boolean }) => image.front,
        );

        coverUrl =
          frontImage?.thumbnails?.large ??
          frontImage?.thumbnails?.["500"] ??
          frontImage?.image ??
          null;
      } else {
        coverUrl = null;
      }

      if (!coverUrl) {
        continue;
      }

      const artistCredit = candidate["artist-credit"] as Array<{
        name?: string;
        artist?: { name?: string };
      }>;

      const artistName = artistCredit
        .map((credit) => credit.name ?? credit.artist?.name)
        .filter(Boolean)
        .join("");

      const releaseDate =
        typeof candidate["first-release-date"] === "string"
          ? candidate["first-release-date"]
          : "";

      const releaseYear = releaseDate
        ? Number.parseInt(releaseDate.slice(0, 4), 10)
        : null;

      const genres = Array.isArray(candidate.tags)
        ? candidate.tags
            .sort(
              (
                a: { count?: number },
                b: { count?: number },
              ) => (b.count ?? 0) - (a.count ?? 0),
            )
            .slice(0, 5)
            .map((tag: { name: string }) => tag.name)
        : [];

      const { data: insertedAlbum, error: insertError } =
        await supabase
          .from("albums")
          .insert({
            musicbrainz_id: musicBrainzId,
            title: String(candidate.title),
            artist_name: artistName || "Artista desconocido",
            release_year:
              Number.isNaN(releaseYear) ? null : releaseYear,
            cover_url: coverUrl,
            genres,
            album_type: "album",
          })
          .select()
          .single();

      if (insertError) {
        throw insertError;
      }

      selectedAlbum = insertedAlbum;
      break;
    }

    if (!selectedAlbum) {
      return jsonResponse(
        {
          error:
            "Los resultados encontrados no tenían una portada válida o ya los conocías. Prueba otra vez.",
        },
        404,
        corsHeaders,
      );
    }

    try {
  const spotifyToken = await getSpotifyAccessToken();

  const spotifySearchResult = await findSpotifyAlbum(
    spotifyToken,
    selectedAlbum.title,
    selectedAlbum.artist_name,
  );

  if (spotifySearchResult) {
    const spotifyAlbum = await getSpotifyAlbum(
      spotifyToken,
      spotifySearchResult.id,
    );

    if (spotifyAlbum) {
      const spotifyTracks = await getAllSpotifyTracks(
        spotifyToken,
        spotifyAlbum,
      );

      const spotifyImageUrl =
        spotifyAlbum.images?.[0]?.url ?? null;

      const spotifyUrl =
        spotifyAlbum.external_urls?.spotify ?? null;

      const spotifyArtistUrl =
        spotifyAlbum.artists?.[0]?.external_urls?.spotify ?? null;

      const durationMs = spotifyTracks.reduce(
        (total: number, track: SpotifyTrack) =>
          total + (track.duration_ms ?? 0),
        0,
      );

      const { data: updatedAlbum, error: updateAlbumError } =
        await supabase
          .from("albums")
          .update({
            spotify_id: spotifyAlbum.id,
            spotify_url: spotifyUrl,
            spotify_image_url: spotifyImageUrl,
            spotify_artist_url: spotifyArtistUrl,
            spotify_release_date: spotifyAlbum.release_date,
            spotify_popularity: spotifyAlbum.popularity ?? null,
            total_tracks: spotifyAlbum.total_tracks,
            track_count: spotifyAlbum.total_tracks,
            duration_ms: durationMs,
            cover_url:
              spotifyImageUrl ??
              selectedAlbum.cover_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedAlbum.id)
          .select()
          .single();

      if (updateAlbumError) {
        console.error(
          "No se pudo actualizar el álbum:",
          updateAlbumError,
        );
      } else {
        selectedAlbum = updatedAlbum;
      }

      if (spotifyTracks.length) {
        const tracksToInsert = spotifyTracks.map(
          (track: SpotifyTrack) => ({
            album_id: selectedAlbum.id,
            spotify_id: track.id,
            title: track.name,
            track_number: track.track_number,
            disc_number: track.disc_number,
            duration_ms: track.duration_ms,
            spotify_url:
              track.external_urls?.spotify ?? null,
            explicit: track.explicit ?? false,
          }),
        );

        const { error: tracksError } = await supabase
          .from("album_tracks")
          .upsert(
            tracksToInsert,
            {
              onConflict:
                "album_id,disc_number,track_number",
            },
          );

        if (tracksError) {
          console.error(
            "No se pudieron guardar las canciones:",
            tracksError,
          );
        }
      }
    }
  }
} catch (spotifyError) {
  /*
   * Spotify enriquece el resultado, pero no debe impedir
   * que el usuario reciba el álbum de MusicBrainz.
   */
  console.error(
    "No se pudo enriquecer el álbum con Spotify:",
    spotifyError,
  );
}

    const { data: generatedUserAlbum, error: userAlbumError } =
      await supabase
        .from("user_albums")
        .insert({
          user_id: user.id,
          album_id: selectedAlbum.id,
          status: "generated",
        })
        .select(`
          *,
          album:albums (*)
        `)
        .single();

    if (userAlbumError) {
      throw userAlbumError;
    }

    return jsonResponse(
      {
        userAlbum: generatedUserAlbum,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado.",
      },
      500,
      corsHeaders,
    );
  }
});