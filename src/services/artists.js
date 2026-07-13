import {
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function searchSpotifyArtists(query) {
    const { data, error } =
        await supabase.functions.invoke(
            "search-artists",
            {
                body: {
                    query,
                },
            },
        );

    if (error) {
        let message =
            "No hemos podido buscar artistas.";

        if (error instanceof FunctionsHttpError) {
            try {
                const errorBody =
                    await error.context.json();

                message =
                    errorBody?.error ?? message;
            } catch {
                message =
                    error.message ?? message;
            }
        } else {
            message =
                error.message ?? message;
        }

        throw new Error(message);
    }

    return data?.artists ?? [];
}

export async function updateProfileAvatar({
    userId,
    avatarType,
    emoji = null,
    artist = null,
    avatarUrl = null,
}) {
    const updateData = {
        avatar_type: avatarType,
        updated_at: new Date().toISOString(),
    };

    if (avatarType === "emoji") {
        updateData.avatar = emoji;
        updateData.avatar_url = null;
        updateData.avatar_spotify_artist_id = null;
        updateData.avatar_spotify_artist_url = null;
        updateData.avatar_artist_name = null;
    }

    if (avatarType === "spotify_artist") {
        updateData.avatar_url = artist.image_url;
        updateData.avatar_spotify_artist_id =
            artist.spotify_id;
        updateData.avatar_spotify_artist_url =
            artist.spotify_url;
        updateData.avatar_artist_name =
            artist.name;
    }

    if (avatarType === "upload") {
        updateData.avatar_url = avatarUrl;
        updateData.avatar_spotify_artist_id = null;
        updateData.avatar_spotify_artist_url = null;
        updateData.avatar_artist_name = null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}