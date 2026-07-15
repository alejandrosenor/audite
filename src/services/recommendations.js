import {
    FunctionsFetchError,
    FunctionsHttpError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";
import {
    addManualAlbum,
} from "./albums";

export async function getAlbumRecommendations() {
    const { data, error } =
        await supabase.functions.invoke(
            "recommend-albums",
            {
                body: {},
            },
        );

    if (error) {
        let message =
            "No hemos podido preparar tus recomendaciones.";

        if (error instanceof FunctionsHttpError) {
            try {
                const body =
                    await error.context.json();

                message =
                    body?.error ?? message;
            } catch {
                message =
                    error.message ?? message;
            }
        }

        if (error instanceof FunctionsFetchError) {
            message =
                "No hemos podido conectar con el recomendador.";
        }

        throw new Error(message);
    }

    return {
        seed: data?.seed ?? null,
        recommendations:
            data?.recommendations ?? [],
        reason: data?.reason ?? "",
    };
}

export async function saveRecommendationFeedback({
    userId,
    album,
    action,
}) {
    if (
        !userId ||
        !album?.spotify_id ||
        !action
    ) {
        throw new Error(
            "Faltan datos para guardar tu decisión.",
        );
    }

    const { data, error } = await supabase
        .from(
            "album_recommendation_feedback",
        )
        .upsert(
            {
                user_id: userId,
                spotify_album_id:
                    album.spotify_id,
                seed_album_id:
                    album.seed_album_id ?? null,
                action,
                updated_at:
                    new Date().toISOString(),
            },
            {
                onConflict:
                    "user_id,spotify_album_id",
            },
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function acceptRecommendation({
    userId,
    album,
}) {
    const userAlbum =
        await addManualAlbum({
            userId,
            album,
            personalNote:
                "Recomendado por Audite según tu historial.",
        });

    await saveRecommendationFeedback({
        userId,
        album,
        action: "accepted",
    });

    return userAlbum;
}

export async function markRecommendationKnown({
    userId,
    album,
}) {
    const now = new Date().toISOString();

    const { data: storedAlbum, error: albumError } =
        await supabase
            .from("albums")
            .upsert(
                {
                    spotify_id:
                        album.spotify_id,

                    spotify_artist_id:
                        album.spotify_artist_id ??
                        null,

                    title: album.title,

                    artist_name:
                        album.artist_name,

                    release_year:
                        album.release_year,

                    cover_url:
                        album.cover_url,

                    spotify_image_url:
                        album.cover_url,

                    spotify_url:
                        album.spotify_url,

                    spotify_artist_url:
                        album.spotify_artist_url ??
                        null,

                    album_type:
                        album.album_type,

                    track_count:
                        album.track_count,

                    total_tracks:
                        album.total_tracks,

                    genres:
                        album.genres ?? [],

                    updated_at: now,
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

    const { error: userAlbumError } =
        await supabase
            .from("user_albums")
            .upsert(
                {
                    user_id: userId,
                    album_id: storedAlbum.id,
                    status: "known",
                    source: "recommendation",
                    known_at: now,
                    updated_at: now,
                },
                {
                    onConflict:
                        "user_id,album_id",
                },
            );

    if (userAlbumError) {
        throw userAlbumError;
    }

    await saveRecommendationFeedback({
        userId,
        album,
        action: "known",
    });
}

export async function dismissRecommendation({
    userId,
    album,
}) {
    await saveRecommendationFeedback({
        userId,
        album,
        action: "dismissed",
    });
}