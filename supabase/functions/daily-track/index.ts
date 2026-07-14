import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SPOTIFY_TOKEN_URL =
  "https://accounts.spotify.com/api/token";

const SPOTIFY_API_URL =
  "https://api.spotify.com/v1";

const genres = [
  "rock",
  "pop",
  "jazz",
  "soul",
  "blues",
  "folk",
  "country",
  "metal",
  "punk",
  "reggae",
  "funk",
  "disco",
  "electronic",
  "ambient",
  "indie",
  "alternative",
  "classical",
  "flamenco",
  "bossa nova",
  "synth-pop",
  "shoegaze",
  "new wave",
  "hard rock",
  "folk rock",
  "blues rock",
  "neo soul",
  "trip hop",
  "post-punk",
  "progressive rock",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      "Spotify token error:",
      response.status,
      responseText,
    );

    throw new Error(
      "Spotify no ha podido autenticar la aplicación.",
    );
  }

  const data = JSON.parse(responseText);

  return data.access_token as string;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
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

    if (!supabaseUrl || !supabaseAnonKey) {
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

    const today = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/Madrid",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).format(new Date());

    const {
      data: existingTrack,
      error: existingError,
    } = await supabase
      .from("daily_tracks")
      .select("*")
      .eq("user_id", user.id)
      .eq("daily_date", today)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingTrack) {
      return jsonResponse({
        track: existingTrack,
        generated: false,
      });
    }

    const {
      data: previousTracks,
      error: previousError,
    } = await supabase
      .from("daily_tracks")
      .select("spotify_track_id")
      .eq("user_id", user.id)
      .order("daily_date", {
        ascending: false,
      })
      .limit(200);

    if (previousError) {
      throw previousError;
    }

    const previousIds = new Set(
      (previousTracks ?? []).map(
        (track) => track.spotify_track_id,
      ),
    );

    const accessToken =
      await getSpotifyToken();

    let selectedTrack = null;
    let selectedGenre = "";

    for (
      let attempt = 0;
      attempt < 8 && !selectedTrack;
      attempt += 1
    ) {
      selectedGenre = randomItem(genres);

      const randomLetter = randomItem(
        "abcdefghijklmnopqrstuvwxyz".split(""),
      );

      const searchUrl = new URL(
        `${SPOTIFY_API_URL}/search`,
      );

      searchUrl.searchParams.set(
        "q",
        `genre:"${selectedGenre}" ${randomLetter}`,
      );

      searchUrl.searchParams.set(
        "type",
        "track",
      );

      searchUrl.searchParams.set(
        "market",
        "ES",
      );

      searchUrl.searchParams.set(
        "limit",
        "10",
      );

      const spotifyResponse = await fetch(
        searchUrl.toString(),
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );

      const responseText =
        await spotifyResponse.text();

      if (!spotifyResponse.ok) {
        console.error(
          "Spotify daily track search error:",
          spotifyResponse.status,
          responseText,
        );

        continue;
      }

      const spotifyData =
        JSON.parse(responseText);

      const candidates = (
        spotifyData.tracks?.items ?? []
      ).filter(
        (track: any) =>
          track?.id &&
          track?.name &&
          track?.external_urls?.spotify &&
          !previousIds.has(track.id),
      );

      if (candidates.length > 0) {
        selectedTrack =
          randomItem(candidates);
      }
    }

    if (!selectedTrack) {
      return jsonResponse(
        {
          error:
            "No hemos podido encontrar una canción para hoy.",
        },
        404,
      );
    }

    const releaseYear =
      selectedTrack.album?.release_date
        ? Number(
            selectedTrack.album.release_date.slice(
              0,
              4,
            ),
          )
        : null;

    const trackToStore = {
      user_id: user.id,
      spotify_track_id: selectedTrack.id,

      title: selectedTrack.name,

      artist_name:
        selectedTrack.artists
          ?.map(
            (artist: any) => artist.name,
          )
          .join(", ") ??
        "Artista desconocido",

      album_title:
        selectedTrack.album?.name ?? null,

      album_cover_url:
        selectedTrack.album?.images?.[0]?.url ??
        null,

      release_year: releaseYear,

      genre: selectedGenre,

      spotify_url:
        selectedTrack.external_urls.spotify,

      preview_url:
        selectedTrack.preview_url ?? null,

      duration_ms:
        selectedTrack.duration_ms ?? null,

      daily_date: today,
    };

    const {
      data: storedTrack,
      error: insertError,
    } = await supabase
      .from("daily_tracks")
      .insert(trackToStore)
      .select()
      .single();

    if (insertError) {
      /*
       * Puede ocurrir si dos peticiones simultáneas
       * intentan crear la canción del mismo día.
       */
      if (insertError.code === "23505") {
        const {
          data: concurrentTrack,
          error: concurrentError,
        } = await supabase
          .from("daily_tracks")
          .select("*")
          .eq("user_id", user.id)
          .eq("daily_date", today)
          .single();

        if (concurrentError) {
          throw concurrentError;
        }

        return jsonResponse({
          track: concurrentTrack,
          generated: false,
        });
      }

      throw insertError;
    }

    return jsonResponse({
      track: storedTrack,
      generated: true,
    });
  } catch (error) {
    console.error(
      "daily-track error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error inesperado.",
      },
      500,
    );
  }
});