import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
    body: Record<string, unknown>,
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
        const supabaseUrl =
            Deno.env.get("SUPABASE_URL");

        const supabaseAnonKey =
            Deno.env.get("SUPABASE_ANON_KEY");

        const supabaseServiceRoleKey =
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        const spotifyClientId =
            Deno.env.get("SPOTIFY_CLIENT_ID");

        const spotifyRedirectUri =
            Deno.env.get("SPOTIFY_REDIRECT_URI");

        if (
            !supabaseUrl ||
            !supabaseAnonKey ||
            !supabaseServiceRoleKey ||
            !spotifyClientId ||
            !spotifyRedirectUri
        ) {
            throw new Error(
                "Faltan variables de entorno en spotify-auth.",
            );
        }

        /*
         * Cliente ligado al usuario que está realizando
         * la petición. Se utiliza para comprobar su JWT.
         */
        const authorization =
            request.headers.get("Authorization");

        if (!authorization) {
            return jsonResponse(
                {
                    error: "No se ha recibido autorización.",
                },
                401,
            );
        }

        const userClient = createClient(
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
        } = await userClient.auth.getUser();

        if (userError || !user) {
            return jsonResponse(
                {
                    error:
                        "La sesión de Audite no es válida.",
                },
                401,
            );
        }

        const body = await request.json();

        const code =
            typeof body.code === "string"
                ? body.code
                : "";

        const codeVerifier =
            typeof body.codeVerifier === "string"
                ? body.codeVerifier
                : "";

        if (!code || !codeVerifier) {
            return jsonResponse(
                {
                    error:
                        "Faltan el código de Spotify o el verificador PKCE.",
                },
                400,
            );
        }

        /*
         * Intercambiamos el authorization code
         * por los tokens de Spotify.
         */
        const tokenBody = new URLSearchParams({
            client_id: spotifyClientId,
            grant_type: "authorization_code",
            code,
            redirect_uri: spotifyRedirectUri,
            code_verifier: codeVerifier,
        });

        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },
                body: tokenBody,
            },
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error(
                "Spotify token error:",
                tokenData,
            );

            return jsonResponse(
                {
                    error:
                        tokenData.error_description ??
                        tokenData.error ??
                        "Spotify no ha permitido completar la conexión.",
                },
                400,
            );
        }

        const accessToken =
            tokenData.access_token;

        const refreshToken =
            tokenData.refresh_token;

        const expiresIn =
            Number(tokenData.expires_in ?? 3600);

        if (!accessToken || !refreshToken) {
            throw new Error(
                "Spotify no devolvió los tokens esperados.",
            );
        }

        /*
         * Obtenemos el usuario de Spotify conectado.
         */
        const profileResponse = await fetch(
            "https://api.spotify.com/v1/me",
            {
                headers: {
                    Authorization:
                        `Bearer ${accessToken}`,
                },
            },
        );

        const spotifyProfile =
            await profileResponse.json();

        if (!profileResponse.ok) {
            console.error(
                "Spotify profile error:",
                spotifyProfile,
            );

            throw new Error(
                "No hemos podido obtener tu perfil de Spotify.",
            );
        }

        const expiresAt = new Date(
            Date.now() + expiresIn * 1000,
        ).toISOString();

        /*
        * Comprobamos si el usuario ya tenía una playlist
        * vinculada anteriormente.
        */
        const adminClient = createClient(
            supabaseUrl,
            supabaseServiceRoleKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            },
        );

        const {
            data: existingConnection,
            error: existingConnectionError,
        } = await adminClient
            .from("spotify_connections")
            .select("playlist_id, playlist_url")
            .eq("user_id", user.id)
            .maybeSingle();

        if (existingConnectionError) {
            console.error(
                "Existing Spotify connection error:",
                existingConnectionError,
            );

            throw new Error(
                "No hemos podido comprobar la conexión existente.",
            );
        }

        let playlistId =
            existingConnection?.playlist_id ?? null;

        let playlistUrl =
            existingConnection?.playlist_url ?? null;

        /*
        * Solo creamos una playlist cuando el usuario
        * todavía no tiene ninguna asociada en Audite.
        */
        if (!playlistId) {
            const playlistResponse = await fetch(
                "https://api.spotify.com/v1/me/playlists",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: "Audite — Mis canciones",
                        description:
                            "Canciones guardadas desde Audite.",
                        public: false,
                    }),
                },
            );

            const playlistData =
                await playlistResponse.json();

            if (!playlistResponse.ok) {
                console.error(
                    "Spotify playlist creation error:",
                    playlistData,
                );

                throw new Error(
                    playlistData?.error?.message ??
                    "No hemos podido crear la playlist de Audite.",
                );
            }

            playlistId = playlistData.id;

            playlistUrl =
                playlistData.external_urls?.spotify ??
                null;
        }

        const { error: saveError } =
          await adminClient
              .from("spotify_connections")
              .upsert(
                  {
                      user_id: user.id,

                      spotify_user_id:
                          spotifyProfile.id,

                      spotify_display_name:
                          spotifyProfile.display_name ??
                          spotifyProfile.id,

                      access_token: accessToken,
                      refresh_token: refreshToken,
                      expires_at: expiresAt,

                      playlist_id: playlistId,
                      playlist_url: playlistUrl,

                      connected_at:
                          new Date().toISOString(),

                      updated_at:
                          new Date().toISOString(),
                  },
                  {
                      onConflict: "user_id",
                  },
              );

        if (saveError) {
            console.error(saveError);

            throw new Error(
                "No hemos podido guardar la conexión con Spotify.",
            );
        }

        return jsonResponse({
          success: true,

          spotifyUser: {
              id: spotifyProfile.id,

              displayName:
                  spotifyProfile.display_name ??
                  spotifyProfile.id,
          },

          playlist: {
              id: playlistId,
              url: playlistUrl,
              name: "Audite — Mis canciones",
          },
        });
    } catch (error) {
        console.error("spotify-auth:", error);

        return jsonResponse(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Se produjo un error inesperado.",
            },
            500,
        );
    }
});