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

type SpotifyTracksPage = {
  items: SpotifyTrack[];
  next: string | null;
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

async function getSpotifyAccessToken() {
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

  const credentials = btoa(
    `${clientId}:${clientSecret}`,
  );

  const response = await fetch(
    SPOTIFY_TOKEN_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
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

async function getAllAlbumTracks(
  accessToken: string,
  spotifyAlbumId: string,
) {
  const tracks: SpotifyTrack[] = [];

  let nextUrl: string | null =
    `${SPOTIFY_API_URL}/albums/${spotifyAlbumId}/tracks` +
    "?market=ES&limit=50";

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Spotify tracks error:",
        response.status,
        responseText,
      );

      throw new Error(
        `Spotify no ha podido recuperar las canciones (${response.status}).`,
      );
    }

    const page = JSON.parse(
      responseText,
    ) as SpotifyTracksPage;

    tracks.push(...(page.items ?? []));
    nextUrl = page.next;
  }

  return tracks;
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

    const body = await request
      .json()
      .catch(() => ({}));

    const albumId =
      typeof body.albumId === "string"
        ? body.albumId
        : "";

    if (!albumId) {
      return jsonResponse(
        {
          error:
            "No se ha recibido el identificador del álbum.",
        },
        400,
      );
    }

    /*
     * Comprobamos que el álbum pertenece a la historia
     * musical del usuario que llama a la función.
     */
    const {
      data: userAlbum,
      error: userAlbumError,
    } = await supabase
      .from("user_albums")
      .select(`
        id,
        album:albums (
          id,
          spotify_id
        )
      `)
      .eq("user_id", user.id)
      .eq("album_id", albumId)
      .limit(1)
      .maybeSingle();

    if (userAlbumError) {
      throw userAlbumError;
    }

    if (!userAlbum) {
      return jsonResponse(
        {
          error:
            "Este álbum no pertenece al usuario.",
        },
        403,
      );
    }

    const album = Array.isArray(userAlbum.album)
      ? userAlbum.album[0]
      : userAlbum.album;

    if (!album?.spotify_id) {
      return jsonResponse(
        {
          error:
            "El álbum no tiene identificador de Spotify.",
        },
        400,
      );
    }

    /*
     * Evitamos consultar Spotify si las pistas
     * ya están importadas.
     */
    const {
      count: existingTracksCount,
      error: countError,
    } = await supabase
      .from("album_tracks")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("album_id", albumId);

    if (countError) {
      throw countError;
    }

    if ((existingTracksCount ?? 0) > 0) {
      return jsonResponse({
        imported: false,
        alreadyImported: true,
        trackCount: existingTracksCount,
      });
    }

    const accessToken =
      await getSpotifyAccessToken();

    const spotifyTracks =
      await getAllAlbumTracks(
        accessToken,
        album.spotify_id,
      );

    if (!spotifyTracks.length) {
      return jsonResponse(
        {
          error:
            "Spotify no ha devuelto canciones para este álbum.",
        },
        404,
      );
    }

    const tracksToStore = spotifyTracks.map(
      (track) => ({
        album_id: albumId,
        spotify_id: track.id,
        title: track.name,
        track_number: track.track_number,
        disc_number: track.disc_number ?? 1,
        duration_ms: track.duration_ms,
        spotify_url:
          track.external_urls?.spotify ?? null,
        explicit: track.explicit ?? false,
      }),
    );

    const { error: tracksError } =
      await supabase
        .from("album_tracks")
        .upsert(tracksToStore, {
          onConflict:
            "album_id,disc_number,track_number",
        });

    if (tracksError) {
      throw tracksError;
    }

    const totalDurationMs =
      spotifyTracks.reduce(
        (total, track) =>
          total + (track.duration_ms ?? 0),
        0,
      );

    const { error: albumUpdateError } =
      await supabase
        .from("albums")
        .update({
          track_count: spotifyTracks.length,
          total_tracks: spotifyTracks.length,
          duration_ms: totalDurationMs,
          updated_at: new Date().toISOString(),
        })
        .eq("id", albumId);

    if (albumUpdateError) {
      throw albumUpdateError;
    }

    return jsonResponse({
      imported: true,
      alreadyImported: false,
      trackCount: spotifyTracks.length,
    });
  } catch (error) {
    console.error(
      "sync-album-tracks error:",
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