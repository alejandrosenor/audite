import { supabase } from "./supabase";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

const REDIRECT_URI =
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

const SCOPES = [
    "playlist-modify-private",
    "user-read-private",
];

console.log("SPOTIFY REDIRECT URI:", REDIRECT_URI);

function generateRandomString(length) {
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let text = "";

    for (let index = 0; index < length; index += 1) {
        text += possible.charAt(
            Math.floor(Math.random() * possible.length),
        );
    }

    return text;
}

async function sha256(plain) {
    const encoder = new TextEncoder();

    const data = encoder.encode(plain);

    return crypto.subtle.digest(
        "SHA-256",
        data,
    );
}

function base64encode(buffer) {
    return btoa(
        String.fromCharCode(
            ...new Uint8Array(buffer),
        ),
    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function connectSpotify() {
    const verifier =
        generateRandomString(128);

    const state =
        generateRandomString(32);

    sessionStorage.setItem(
        "spotify_code_verifier",
        verifier,
    );

    sessionStorage.setItem(
        "spotify_auth_state",
        state,
    );

    const challenge =
        base64encode(
            await sha256(verifier),
        );

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(" "),
        code_challenge_method: "S256",
        code_challenge: challenge,
        state,
        show_dialog: "true",
    });

    window.location.assign(
        `https://accounts.spotify.com/authorize?${params.toString()}`,
    );
}

export async function completeSpotifyLogin(code) {

    const codeVerifier =
        sessionStorage.getItem(
            "spotify_code_verifier",
        );

    if (!codeVerifier) {
        throw new Error(
            "No se encontró el PKCE verifier.",
        );
    }

    const {
        data,
        error,
    } = await supabase.functions.invoke(
        "spotify-auth",
        {
            body: {
                code,
                codeVerifier,
            },
        },
    );

    if (error) {
        throw error;
    }

    sessionStorage.removeItem(
        "spotify_code_verifier",
    );

    sessionStorage.removeItem(
        "spotify_auth_state",
    );

    return data;
}

export async function getSpotifyConnection() {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        return null;
    }

    const {
        data: connection,
        error: connectionError,
    } = await supabase
        .from("spotify_connections")
        .select(`
            spotify_user_id,
            spotify_display_name,
            playlist_id,
            playlist_url,
            connected_at,
            updated_at,
            expires_at
        `)
        .eq("user_id", user.id)
        .maybeSingle();

    if (connectionError) {
        throw connectionError;
    }

    if (!connection) {
        return null;
    }

    const [
        trackCountResult,
        lastTrackResult,
    ] = await Promise.all([
        supabase
            .from("spotify_playlist_tracks")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("user_id", user.id),

        supabase
            .from("spotify_playlist_tracks")
            .select("created_at")
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false,
            })
            .limit(1)
            .maybeSingle(),
    ]);

    if (trackCountResult.error) {
        throw trackCountResult.error;
    }

    if (lastTrackResult.error) {
        throw lastTrackResult.error;
    }

    return {
        ...connection,

        playlist_name:
            "Audite — Mis canciones",

        synced_tracks:
            trackCountResult.count ?? 0,

        last_sync_at:
            lastTrackResult.data?.created_at ??
            connection.updated_at ??
            connection.connected_at,
    };
}

export async function getSpotifyPlaylistTrackIds() {
    const { data, error } =
        await supabase.functions.invoke(
            "spotify-playlist",
            {
                body: {
                    action: "list",
                },
            },
        );

    if (error) {
        throw error;
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data?.trackIds ?? [];
}

export async function addTrackToSpotifyPlaylist(
    albumTrackId,
) {
    const { data, error } =
        await supabase.functions.invoke(
            "spotify-playlist",
            {
                body: {
                    action: "add",
                    albumTrackId,
                },
            },
        );

    if (error) {
        throw error;
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data;
}

export async function removeTrackFromSpotifyPlaylist(
    albumTrackId,
) {
    const { data, error } =
        await supabase.functions.invoke(
            "spotify-playlist",
            {
                body: {
                    action: "remove",
                    albumTrackId,
                },
            },
        );

    if (error) {
        throw error;
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data;
}