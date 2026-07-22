import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";
import { supabase } from "./supabase";

function getFunctionErrorMessage(error) {
    if (error instanceof FunctionsFetchError) {
        return "No hemos podido conectar con el generador editorial.";
    }

    if (error instanceof FunctionsRelayError) {
        return "Supabase no ha podido ejecutar el generador editorial.";
    }

    return (
        error?.message ||
        "No hemos podido preparar la historia del disco."
    );
}

export async function generateAlbumEditorial(
    albumId,
) {
    if (!albumId) {
        throw new Error(
            "No se ha recibido el disco para generar su historia.",
        );
    }

    const { data, error } =
        await supabase.functions.invoke(
            "generate-album-editorial",
            {
                body: {
                    albumId,
                },
            },
        );

    if (error) {
        let message =
            getFunctionErrorMessage(error);

        if (
            error instanceof
            FunctionsHttpError
        ) {
            try {
                const responseBody =
                    await error.context.json();

                message =
                    responseBody?.error ??
                    message;
            } catch {
                // Conservamos el mensaje general.
            }
        }

        throw new Error(message);
    }

    if (!data?.album) {
        throw new Error(
            data?.error ||
            "El generador no ha devuelto información del disco.",
        );
    }

    return data.album;
}

export async function getAlbumEditorial(
    albumId,
) {
    if (!albumId) {
        return null;
    }

    const { data, error } =
        await supabase
            .from("albums")
            .select(`
                id,
                editorial_description,
                editorial_source_name,
                editorial_source_url,
                editorial_source_language,
                editorial_source_license,
                editorial_status,
                editorial_generated_at,
                editorial_error
            `)
            .eq("id", albumId)
            .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

/*
 * Genera las historias de varios discos antiguos.
 * Podemos ejecutarlo desde un botón de administrador
 * o desde la consola durante el desarrollo.
 */
export async function generateMissingAlbumEditorials({
    limit = 10,
    includeFailed = true,
} = {}) {
    const statuses = includeFailed
        ? ["pending", "failed"]
        : ["pending"];

    const { data: albums, error } =
        await supabase
            .from("albums")
            .select(`
                id,
                title,
                artist_name,
                editorial_status
            `)
            .in(
                "editorial_status",
                statuses,
            )
            .order(
                "created_at",
                {
                    ascending: true,
                },
            )
            .limit(limit);

    if (error) {
        throw error;
    }

    const results = [];

    /*
     * Lo hacemos secuencialmente para no golpear
     * Wikipedia y Supabase con muchas peticiones
     * simultáneas.
     */
    for (const album of albums ?? []) {
        try {
            const generatedAlbum =
                await generateAlbumEditorial(
                    album.id,
                );

            results.push({
                albumId: album.id,
                title: album.title,
                success: true,
                album: generatedAlbum,
            });
        } catch (generationError) {
            results.push({
                albumId: album.id,
                title: album.title,
                success: false,
                error:
                    generationError instanceof Error
                        ? generationError.message
                        : String(
                            generationError,
                        ),
            });
        }
    }

    return results;
}