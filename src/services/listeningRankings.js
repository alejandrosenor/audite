import { supabase } from "./supabase";

export async function getListeningTrackRanking({
    userId,
    userAlbumId,
}) {
    if (!userId || !userAlbumId) {
        return [];
    }

    const { data, error } = await supabase
        .from("listening_track_rankings")
        .select(`
            id,
            user_id,
            user_album_id,
            album_track_id,
            position,
            created_at,
            updated_at
        `)
        .eq("user_id", userId)
        .eq("user_album_id", userAlbumId)
        .order("position", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function saveListeningTrackRanking({
    userId,
    userAlbumId,
    tracks,
}) {
    if (!userId) {
        throw new Error(
            "No se ha recibido el usuario.",
        );
    }

    if (!userAlbumId) {
        throw new Error(
            "No se ha recibido la escucha.",
        );
    }

    if (!Array.isArray(tracks) || tracks.length === 0) {
        return [];
    }

    const now = new Date().toISOString();

    const rankingRows = tracks.map(
        (track, index) => ({
            user_id: userId,
            user_album_id: userAlbumId,
            album_track_id: track.id,
            position: index + 1,
            updated_at: now,
        }),
    );

    const { data, error } = await supabase
        .from("listening_track_rankings")
        .upsert(rankingRows, {
            onConflict:
                "user_id,user_album_id,album_track_id",
        })
        .select(`
            id,
            album_track_id,
            position
        `);

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function deleteListeningTrackRanking({
    userId,
    userAlbumId,
}) {
    if (!userId || !userAlbumId) {
        return;
    }

    const { error } = await supabase
        .from("listening_track_rankings")
        .delete()
        .eq("user_id", userId)
        .eq("user_album_id", userAlbumId);

    if (error) {
        throw error;
    }
}