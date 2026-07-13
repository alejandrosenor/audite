import { supabase } from "./supabase";
import {
    FunctionsHttpError,
} from "@supabase/supabase-js";

export async function getRandomAlbum(userId) {
    if (!userId) {
        throw new Error("No se ha recibido el usuario.");
    }

    const { data: albums, error: albumsError } = await supabase
        .from("albums")
        .select("*");

    if (albumsError) {
        throw albumsError;
    }

    if (!albums?.length) {
        throw new Error("Todavía no hay discos disponibles.");
    }

    const { data: userAlbums, error: userAlbumsError } = await supabase
        .from("user_albums")
        .select("album_id")
        .eq("user_id", userId);

    if (userAlbumsError) {
        throw userAlbumsError;
    }

    const usedAlbumIds = new Set(
        (userAlbums ?? []).map((item) => item.album_id),
    );

    const availableAlbums = albums.filter(
        (album) => !usedAlbumIds.has(album.id),
    );

    if (!availableAlbums.length) {
        throw new Error("Ya has descubierto todos los discos disponibles.");
    }

    const randomIndex = Math.floor(Math.random() * availableAlbums.length);

    return availableAlbums[randomIndex];
}

export async function saveGeneratedAlbum({ userId, albumId }) {
    const { data, error } = await supabase
        .from("user_albums")
        .insert({
            user_id: userId,
            album_id: albumId,
            status: "generated",
        })
        .select(`
      *,
      album:albums (*)
    `)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function updateUserAlbumStatus({
    userAlbumId,
    userId,
    status,
}) {
    const now = new Date().toISOString();

    const timestampFields = {
        to_listen: {
            accepted_at: now,
        },
        listening: {
            started_at: now,
        },
        completed: {
            completed_at: now,
        },
        rejected: {
            rejected_at: now,
        },
        known: {
            known_at: now,
        },
    };

    const { data, error } = await supabase
        .from("user_albums")
        .update({
            status,
            updated_at: new Date().toISOString(),
            ...(timestampFields[status] ?? {}),
        })
        .eq("id", userAlbumId)
        .eq("user_id", userId)
        .select(`
      *,
      album:albums (*)
    `)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getCurrentGeneratedAlbum(userId) {
    const { data, error } = await supabase
        .from("user_albums")
        .select(`
      *,
      album:albums (*)
    `)
        .eq("user_id", userId)
        .eq("status", "generated")
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function discoverAlbum({ genre = "" } = {}) {
    const { data, error } = await supabase.functions.invoke(
        "discover-album",
        {
            body: {
                genre,
            },
        },
    );

    if (error) {
        let message = "No hemos podido generar un disco.";

        try {
            const errorBody = await error.context?.json();
            message = errorBody?.error ?? message;
        } catch {
            message = error.message ?? message;
        }

        throw new Error(message);
    }

    if (!data?.userAlbum) {
        throw new Error("La función no ha devuelto ningún disco.");
    }

    return data.userAlbum;
}

export async function getAlbumTracks(albumId) {
    if (!albumId) {
        return [];
    }

    const { data, error } = await supabase
        .from("album_tracks")
        .select("*")
        .eq("album_id", albumId)
        .order("disc_number", { ascending: true })
        .order("track_number", { ascending: true });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function getUserAlbumsByStatus({
    userId,
    statuses,
}) {
    if (!userId) {
        throw new Error("No se ha recibido el usuario.");
    }

    const statusList = Array.isArray(statuses)
        ? statuses
        : [statuses];

    const { data, error } = await supabase
        .from("user_albums")
        .select(`
      *,
      album:albums (*)
    `)
        .eq("user_id", userId)
        .in("status", statusList)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function getCurrentListeningAlbum(userId) {
    if (!userId) {
        return null;
    }

    const { data, error } = await supabase
        .from("user_albums")
        .select(`
      *,
      album:albums (*)
    `)
        .eq("user_id", userId)
        .eq("status", "listening")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function removePendingAlbum({
    userAlbumId,
    userId,
}) {
    if (!userAlbumId || !userId) {
        throw new Error("Faltan datos para eliminar el disco.");
    }

    const { error } = await supabase
        .from("user_albums")
        .delete()
        .eq("id", userAlbumId)
        .eq("user_id", userId)
        .eq("status", "to_listen");

    if (error) {
        throw error;
    }
}

export async function searchSpotifyAlbums(query) {
    const { data, error } =
        await supabase.functions.invoke(
            "search-albums",
            {
                body: { query },
            },
        );

    if (error) {
        let message =
            "No hemos podido buscar discos.";

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

    return data?.albums ?? [];
}

export async function addManualAlbum({
    userId,
    album,
    recommendedBy = "",
    personalNote = "",
}) {
    const { data: storedAlbum, error: albumError } =
        await supabase
            .from("albums")
            .upsert(
                {
                    spotify_id: album.spotify_id,
                    title: album.title,
                    artist_name: album.artist_name,
                    release_year: album.release_year,
                    cover_url: album.cover_url,
                    spotify_image_url: album.cover_url,
                    spotify_url: album.spotify_url,
                    spotify_artist_url:
                        album.spotify_artist_url,
                    spotify_release_date:
                        album.spotify_release_date,
                    album_type: album.album_type,
                    track_count: album.track_count,
                    total_tracks: album.total_tracks,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "spotify_id",
                },
            )
            .select()
            .single();

    if (albumError) {
        throw albumError;
    }

    const recommendation =
        recommendedBy.trim();

    const { data: userAlbum, error: userAlbumError } =
        await supabase
            .from("user_albums")
            .upsert(
                {
                    user_id: userId,
                    album_id: storedAlbum.id,
                    status: "to_listen",
                    source: recommendation
                        ? "recommendation"
                        : "manual",
                    recommended_by:
                        recommendation || null,
                    personal_note:
                        personalNote.trim() || null,
                    accepted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id,album_id",
                },
            )
            .select(`
        *,
        album:albums (*)
      `)
            .single();

    if (userAlbumError) {
        throw userAlbumError;
    }

    /*
     * Importamos las canciones inmediatamente.
     * Si Spotify falla, el disco sigue añadido a
     * Pendientes y volveremos a intentarlo al valorar.
     */
    try {
        await syncAlbumTracks(storedAlbum.id);
    } catch (syncError) {
        console.error(
            "El disco se añadió, pero no se pudieron importar sus canciones:",
            syncError,
        );
    }

    return userAlbum;
}

export async function syncAlbumTracks(albumId) {
    if (!albumId) {
        throw new Error(
            "No se ha recibido el álbum.",
        );
    }

    const { data, error } =
        await supabase.functions.invoke(
            "sync-album-tracks",
            {
                body: {
                    albumId,
                },
            },
        );

    if (error) {
        let message =
            "No hemos podido importar las canciones.";

        try {
            const errorBody =
                await error.context?.json();

            message =
                errorBody?.error ??
                error.message ??
                message;
        } catch {
            message =
                error.message ?? message;
        }

        throw new Error(message);
    }

    return data;
}