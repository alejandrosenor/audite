import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS",
};

function jsonResponse(
    body: Record<string, unknown>,
    status = 200,
) {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        },
    );
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }

    if (request.method !== "POST") {
        return jsonResponse(
            { error: "Método no permitido." },
            405,
        );
    }

    try {
        const supabaseUrl =
            Deno.env.get("SUPABASE_URL");

        const supabaseAnonKey =
            Deno.env.get("SUPABASE_ANON_KEY");

        const serviceRoleKey =
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY",
            );

        const spotifyClientId =
            Deno.env.get("SPOTIFY_CLIENT_ID");

        if (
            !supabaseUrl ||
            !supabaseAnonKey ||
            !serviceRoleKey ||
            !spotifyClientId
        ) {
            throw new Error(
                "Faltan variables de entorno.",
            );
        }

        const authorization =
            request.headers.get("Authorization");

        if (!authorization) {
            return jsonResponse(
                { error: "Falta autorización." },
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

        const adminClient = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            },
        );

        const body = await request.json();

        const action =
            typeof body.action === "string"
                ? body.action
                : "";

        /*
         * Esta acción solo devuelve qué canciones
         * están sincronizadas.
         */
        if (action === "list") {
            const { data, error } =
                await adminClient
                    .from(
                        "spotify_playlist_tracks",
                    )
                    .select("album_track_id")
                    .eq("user_id", user.id);

            if (error) {
                throw error;
            }

            return jsonResponse({
                success: true,
                trackIds:
                    data?.map(
                        (row) =>
                            row.album_track_id,
                    ) ?? [],
            });
        }

        if (
            action !== "add" &&
            action !== "remove"
        ) {
            return jsonResponse(
                { error: "Acción no válida." },
                400,
            );
        }

        const albumTrackId =
            typeof body.albumTrackId === "string"
                ? body.albumTrackId
                : "";

        if (!albumTrackId) {
            return jsonResponse(
                {
                    error:
                        "Falta el identificador de la canción.",
                },
                400,
            );
        }

        const {
            data: connection,
            error: connectionError,
        } = await adminClient
            .from("spotify_connections")
            .select(`
                access_token,
                refresh_token,
                expires_at,
                playlist_id
            `)
            .eq("user_id", user.id)
            .maybeSingle();

        if (connectionError) {
            throw connectionError;
        }

        if (
            !connection ||
            !connection.playlist_id
        ) {
            return jsonResponse(
                {
                    error:
                        "Conecta Spotify antes de sincronizar canciones.",
                },
                409,
            );
        }

        const {
            data: track,
            error: trackError,
        } = await adminClient
            .from("album_tracks")
            .select(`
                id,
                spotify_id,
                spotify_uri
            `)
            .eq("id", albumTrackId)
            .maybeSingle();

        if (trackError) {
            throw trackError;
        }

        if (
            !track ||
            !track.spotify_id ||
            !track.spotify_uri
        ) {
            return jsonResponse(
                {
                    error:
                        "Esta canción no tiene datos válidos de Spotify.",
                },
                422,
            );
        }

        let accessToken =
            connection.access_token;

        const expiresAt =
            connection.expires_at
                ? new Date(
                    connection.expires_at,
                ).getTime()
                : 0;

        const shouldRefresh =
            !accessToken ||
            expiresAt <= Date.now() + 60_000;

        /*
         * Los access tokens de Spotify caducan.
         * Renovamos el token antes de usarlo.
         */
        if (shouldRefresh) {
            if (!connection.refresh_token) {
                return jsonResponse(
                    {
                        error:
                            "La conexión con Spotify ha caducado. Vuelve a conectarla.",
                    },
                    401,
                );
            }

            const refreshBody =
                new URLSearchParams({
                    grant_type:
                        "refresh_token",
                    refresh_token:
                        connection.refresh_token,
                    client_id:
                        spotifyClientId,
                });

            const refreshResponse =
                await fetch(
                    "https://accounts.spotify.com/api/token",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",
                        },
                        body: refreshBody,
                    },
                );

            const refreshData =
                await refreshResponse.json();

            if (!refreshResponse.ok) {
                console.error(
                    "Spotify refresh error:",
                    refreshData,
                );

                return jsonResponse(
                    {
                        error:
                            "No hemos podido renovar la conexión con Spotify.",
                    },
                    401,
                );
            }

            accessToken =
                refreshData.access_token;

            const nextExpiresAt =
                new Date(
                    Date.now() +
                    Number(
                        refreshData.expires_in ??
                        3600,
                    ) *
                    1000,
                ).toISOString();

            const connectionUpdate: Record<
                string,
                unknown
            > = {
                access_token: accessToken,
                expires_at: nextExpiresAt,
                updated_at:
                    new Date().toISOString(),
            };

            if (refreshData.refresh_token) {
                connectionUpdate.refresh_token =
                    refreshData.refresh_token;
            }

            const { error: updateError } =
                await adminClient
                    .from(
                        "spotify_connections",
                    )
                    .update(connectionUpdate)
                    .eq("user_id", user.id);

            if (updateError) {
                throw updateError;
            }
        }

        const playlistEndpoint =
            `https://api.spotify.com/v1/playlists/${connection.playlist_id}/items`;

        if (action === "add") {
            const {
                data: existingTrack,
            } = await adminClient
                .from(
                    "spotify_playlist_tracks",
                )
                .select("id")
                .eq("user_id", user.id)
                .eq(
                    "album_track_id",
                    albumTrackId,
                )
                .maybeSingle();

            if (existingTrack) {
                return jsonResponse({
                    success: true,
                    added: true,
                    alreadyAdded: true,
                });
            }

            const spotifyResponse =
                await fetch(
                    playlistEndpoint,
                    {
                        method: "POST",
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`,
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            uris: [
                                track.spotify_uri,
                            ],
                        }),
                    },
                );

            const spotifyData =
                await spotifyResponse.json();

            if (!spotifyResponse.ok) {
                console.error(
                    "Spotify add error:",
                    spotifyData,
                );

                return jsonResponse(
                    {
                        error:
                            spotifyData?.error
                                ?.message ??
                            "Spotify no ha permitido añadir la canción.",
                    },
                    spotifyResponse.status,
                );
            }

            const { error: insertError } =
                await adminClient
                    .from(
                        "spotify_playlist_tracks",
                    )
                    .insert({
                        user_id: user.id,
                        album_track_id:
                            albumTrackId,
                        spotify_track_id:
                            track.spotify_id,
                        spotify_uri:
                            track.spotify_uri,
                    });

            if (insertError) {
                throw insertError;
            }

            return jsonResponse({
                success: true,
                added: true,
            });
        }

        const spotifyResponse =
            await fetch(
                playlistEndpoint,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        items: [
                            {
                                uri:
                                    track.spotify_uri,
                            },
                        ],
                    }),
                },
            );

        const spotifyData =
            await spotifyResponse.json();

        if (!spotifyResponse.ok) {
            console.error(
                "Spotify remove error:",
                spotifyData,
            );

            return jsonResponse(
                {
                    error:
                        spotifyData?.error
                            ?.message ??
                        "Spotify no ha permitido quitar la canción.",
                },
                spotifyResponse.status,
            );
        }

        const { error: deleteError } =
            await adminClient
                .from(
                    "spotify_playlist_tracks",
                )
                .delete()
                .eq("user_id", user.id)
                .eq(
                    "album_track_id",
                    albumTrackId,
                );

        if (deleteError) {
            throw deleteError;
        }

        return jsonResponse({
            success: true,
            added: false,
        });
    } catch (error) {
        console.error(
            "spotify-playlist:",
            error,
        );

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