import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
      return jsonResponse(
        {
          error:
            "Escribe al menos dos caracteres.",
        },
        400,
      );
    }

    const token = await getSpotifyToken();

    const searchUrl = new URL(
      `${SPOTIFY_API_URL}/search`,
    );

    searchUrl.searchParams.set(
      "q",
      query.trim(),
    );

    searchUrl.searchParams.set(
      "type",
      "artist",
    );

    searchUrl.searchParams.set(
      "limit",
      "10",
    );

    const response = await fetch(
      searchUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Spotify artist search error:",
        response.status,
        responseText,
      );

      throw new Error(
        `Spotify no ha podido buscar artistas (${response.status}).`,
      );
    }

    const data = JSON.parse(responseText);

    const artists = (
      data.artists?.items ?? []
    ).map((artist: any) => ({
      spotify_id: artist.id,
      name: artist.name,
      image_url:
        artist.images?.[0]?.url ?? null,
      spotify_url:
        artist.external_urls?.spotify ?? null,
      genres: artist.genres ?? [],
      followers:
        artist.followers?.total ?? 0,
    }));

    return jsonResponse({
      artists,
    });
  } catch (error) {
    console.error(
      "search-artists error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado.",
      },
      500,
    );
  }
});