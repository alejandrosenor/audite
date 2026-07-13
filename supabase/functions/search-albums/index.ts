import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SPOTIFY_TOKEN_URL =
  "https://accounts.spotify.com/api/token";

const SPOTIFY_API_URL =
  "https://api.spotify.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function getSpotifyToken() {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get(
    "SPOTIFY_CLIENT_SECRET",
  );

  if (!clientId || !clientSecret) {
    throw new Error(
      "No están configuradas las credenciales de Spotify en Supabase.",
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
      "Error autenticando en Spotify:",
      response.status,
      responseText,
    );

    throw new Error(
      `Spotify ha rechazado las credenciales (${response.status}).`,
    );
  }

  const data = JSON.parse(responseText);

  if (!data.access_token) {
    throw new Error(
      "Spotify no ha devuelto ningún access token.",
    );
  }

  return data.access_token;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { query } = await request.json();

    if (
      typeof query !== "string" ||
      query.trim().length < 2
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Escribe al menos dos caracteres.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const token = await getSpotifyToken();

    const searchUrl = new URL(
      `${SPOTIFY_API_URL}/search`,
    );

    searchUrl.searchParams.set("q", query.trim());
    searchUrl.searchParams.set("type", "album");
    searchUrl.searchParams.set("market", "ES");
    searchUrl.searchParams.set("limit", "10");

    const response = await fetch(
      searchUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const spotifyError = await response.text();

      console.error(
        "Spotify search error:",
        response.status,
        spotifyError,
      );

      throw new Error(
        `Spotify no ha podido realizar la búsqueda (${response.status}).`,
      );
    }

    const data = await response.json();

    const albums = (data.albums?.items ?? []).map(
      (album: any) => ({
        spotify_id: album.id,
        title: album.name,
        artist_name:
          album.artists?.map(
            (artist: any) => artist.name,
          ).join(", ") ?? "Artista desconocido",
        release_year: album.release_date
          ? Number(album.release_date.slice(0, 4))
          : null,
        cover_url: album.images?.[0]?.url ?? null,
        spotify_url:
          album.external_urls?.spotify ?? null,
        spotify_artist_url:
          album.artists?.[0]?.external_urls
            ?.spotify ?? null,
        album_type: album.album_type,
        track_count: album.total_tracks,
        total_tracks: album.total_tracks,
        spotify_release_date:
          album.release_date ?? null,
      }),
    );

    return new Response(
      JSON.stringify({ albums }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("search-albums error:", error);

    const errorMessage =
    error instanceof Error
      ? error.message
      : "Error inesperado.";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});