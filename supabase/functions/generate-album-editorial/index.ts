import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    createClient,
} from "jsr:@supabase/supabase-js@2";

const WIKIPEDIA_API_URL =
    "https://es.wikipedia.org/w/api.php";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS",
};

type AlbumRow = {
    id: string;
    title: string;
    artist_name: string;
    release_year: number | null;
    editorial_description: string | null;
    editorial_status: string | null;
};

type WikipediaSearchResult = {
    pageid: number;
    title: string;
    snippet?: string;
};

type WikipediaPage = {
    pageid?: number;
    title?: string;
    extract?: string;
    fullurl?: string;
    missing?: boolean;
};

function jsonResponse(
    body: unknown,
    status = 200,
) {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type":
                    "application/json",
            },
        },
    );
}

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\([^)]*\)/g, " ")
        .replace(/\[[^\]]*\]/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function stripHtml(value: string) {
    return value
        .replace(/<[^>]*>/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
}

function scoreSearchResult(
    result: WikipediaSearchResult,
    album: AlbumRow,
) {
    const resultTitle =
        normalizeText(result.title);

    const resultSnippet =
        normalizeText(
            stripHtml(result.snippet ?? ""),
        );

    const albumTitle =
        normalizeText(album.title);

    const artistName =
        normalizeText(album.artist_name);

    const titleMatches =
        resultTitle === albumTitle ||
        resultTitle.startsWith(
            `${albumTitle} `,
        ) ||
        resultTitle.includes(
            `${albumTitle} album`,
        );

    const artistMatches =
        resultTitle.includes(artistName) ||
        resultSnippet.includes(artistName);

    /*
     * Regla obligatoria:
     * si no aparece el artista, descartamos
     * completamente el resultado.
     */
    if (!artistMatches) {
        return -1000;
    }

    let score = 0;

    if (resultTitle === albumTitle) {
        score += 70;
    } else if (
        resultTitle.startsWith(albumTitle)
    ) {
        score += 50;
    } else if (
        resultTitle.includes(albumTitle)
    ) {
        score += 30;
    }

    if (titleMatches) {
        score += 20;
    }

    if (
        resultTitle.includes("album") ||
        resultTitle.includes("disco")
    ) {
        score += 20;
    }

    if (
        resultTitle.includes(artistName)
    ) {
        score += 35;
    }

    if (
        resultSnippet.includes(artistName)
    ) {
        score += 25;
    }

    if (
        album.release_year &&
        resultSnippet.includes(
            String(album.release_year),
        )
    ) {
        score += 15;
    }

    if (
        resultTitle.includes(
            "desambiguacion",
        ) ||
        resultTitle.startsWith("anexo") ||
        resultTitle.includes("discografia")
    ) {
        score -= 100;
    }

    return score;
}

async function fetchWikipediaJson(
    parameters: Record<string, string>,
) {
    const url =
        new URL(WIKIPEDIA_API_URL);

    Object.entries(parameters).forEach(
        ([key, value]) => {
            url.searchParams.set(key, value);
        },
    );

    url.searchParams.set(
        "origin",
        "*",
    );

    const controller =
        new AbortController();

    const timeoutId =
        setTimeout(
            () => controller.abort(),
            8000,
        );

    try {
        const response =
            await fetch(
                url.toString(),
                {
                    headers: {
                        Accept:
                            "application/json",

                        "Api-User-Agent":
                            "Audite/1.0 (album editorial information)",
                    },

                    signal:
                        controller.signal,
                },
            );

        if (!response.ok) {
            throw new Error(
                `Wikipedia respondió con ${response.status}.`,
            );
        }

        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

async function searchWikipediaAlbum(
    album: AlbumRow,
) {
    const searches = [
      `"${album.title}" "${album.artist_name}"`,
      `"${album.title}" álbum "${album.artist_name}"`,
      `"${album.title}" disco "${album.artist_name}"`,
    ];

    const resultsByPageId =
        new Map<
            number,
            WikipediaSearchResult
        >();

    for (const search of searches) {
        const data =
            await fetchWikipediaJson({
                action: "query",
                format: "json",
                list: "search",
                srsearch: search,
                srnamespace: "0",
                srlimit: "8",
                srprop: "snippet",
                utf8: "1",
            });

        const results =
            data?.query?.search ?? [];

        results.forEach(
            (
                result:
                    WikipediaSearchResult,
            ) => {
                if (
                    !resultsByPageId.has(
                        result.pageid,
                    )
                ) {
                    resultsByPageId.set(
                        result.pageid,
                        result,
                    );
                }
            },
        );
    }

    const rankedResults =
        Array.from(
            resultsByPageId.values(),
        )
            .map((result) => ({
                result,
                score:
                    scoreSearchResult(
                        result,
                        album,
                    ),
            }))
            .sort(
                (first, second) =>
                    second.score -
                    first.score,
            );

    const bestResult =
        rankedResults[0];

    /*
     * Evita guardar artículos claramente
     * no relacionados con el disco.
     */
    if (
        !bestResult ||
        bestResult.score < 90
    ) {
        return null;
    }

    return bestResult.result;
}

async function getWikipediaPage(
    pageId: number,
) {
    const data =
        await fetchWikipediaJson({
            action: "query",
            format: "json",
            pageids: String(pageId),

            prop:
                "extracts|info",

            exintro: "1",
            explaintext: "1",
            exsectionformat: "plain",

            inprop: "url",
            redirects: "1",
        });

    const pages =
        data?.query?.pages ?? {};

    return Object.values(
        pages,
    )[0] as WikipediaPage | undefined;
}

function cleanWikipediaExtract(
    extract: string,
) {
    return extract
        .replace(/\r/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\[\d+\]/g, "")
        .replace(/\s+([.,;:])/g, "$1")
        .trim();
}

function buildEditorialDescription(
    extract: string,
) {
    const cleaned =
        cleanWikipediaExtract(
            extract,
        );

    /*
     * La introducción puede contener varios
     * párrafos. Conservamos como máximo cuatro
     * frases y unos 950 caracteres.
     */
    const sentences =
        cleaned
            .replace(/\n+/g, " ")
            .match(
                /[^.!?]+[.!?]+|[^.!?]+$/g,
            )
            ?.map(
                (sentence) =>
                    sentence.trim(),
            )
            .filter(Boolean) ??
        [];

    let description = "";

    for (
        const sentence of sentences
    ) {
        const nextDescription =
            description
                ? `${description} ${sentence}`
                : sentence;

        if (
            nextDescription.length >
                950 &&
            description
        ) {
            break;
        }

        description =
            nextDescription;

        if (
            description.length >= 400 &&
            description.split(/[.!?]/)
                .filter(Boolean)
                .length >= 3
        ) {
            break;
        }
    }

    if (description.length > 950) {
        description =
            `${description
                .slice(0, 947)
                .trim()}…`;
    }

    return description.trim();
}

function validateWikipediaPage(
    page: WikipediaPage,
    album: AlbumRow,
) {
    const pageTitle =
        normalizeText(
            page.title ?? "",
        );

    const extract =
        normalizeText(
            page.extract ?? "",
        );

    const albumTitle =
        normalizeText(album.title);

    const artistName =
        normalizeText(album.artist_name);

    const titleMatches =
        pageTitle.includes(albumTitle) ||
        extract.includes(albumTitle);

    const artistMatches =
        pageTitle.includes(artistName) ||
        extract.includes(artistName);

    const yearMatches =
        !album.release_year ||
        extract.includes(
            String(album.release_year),
        );

    /*
     * Artista y título son obligatorios.
     * El año suma seguridad, pero no es obligatorio
     * porque algunos artículos no lo mencionan
     * en la introducción.
     */
    return {
        valid:
            titleMatches &&
            artistMatches,

        titleMatches,
        artistMatches,
        yearMatches,
    };
}

Deno.serve(
    async (request) => {
        if (
            request.method ===
            "OPTIONS"
        ) {
            return new Response(
                "ok",
                {
                    headers:
                        corsHeaders,
                },
            );
        }

        if (
            request.method !==
            "POST"
        ) {
            return jsonResponse(
                {
                    error:
                        "Método no permitido.",
                },
                405,
            );
        }

        let albumId = "";

        const supabaseUrl =
            Deno.env.get(
                "SUPABASE_URL",
            );

        const anonKey =
            Deno.env.get(
                "SUPABASE_ANON_KEY",
            );

        const serviceRoleKey =
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY",
            );

        if (
            !supabaseUrl ||
            !anonKey ||
            !serviceRoleKey
        ) {
            return jsonResponse(
                {
                    error:
                        "Falta la configuración interna de Supabase.",
                },
                500,
            );
        }

        const authorization =
            request.headers.get(
                "Authorization",
            );

        if (!authorization) {
            return jsonResponse(
                {
                    error:
                        "No existe una sesión válida.",
                },
                401,
            );
        }

        const userClient =
            createClient(
                supabaseUrl,
                anonKey,
                {
                    global: {
                        headers: {
                            Authorization:
                                authorization,
                        },
                    },
                },
            );

        const adminClient =
            createClient(
                supabaseUrl,
                serviceRoleKey,
            );

        try {
            const {
                data: { user },
                error: userError,
            } =
                await userClient.auth
                    .getUser();

            if (
                userError ||
                !user
            ) {
                return jsonResponse(
                    {
                        error:
                            "La sesión no es válida.",
                    },
                    401,
                );
            }

            const body =
                await request
                    .json()
                    .catch(
                        () => ({}),
                    );

            albumId =
                typeof body.albumId ===
                    "string"
                    ? body.albumId.trim()
                    : "";

            if (!albumId) {
                return jsonResponse(
                    {
                        error:
                            "No se ha recibido el álbum.",
                    },
                    400,
                );
            }

            const {
                data: album,
                error: albumError,
            } =
                await adminClient
                    .from("albums")
                    .select(`
                        id,
                        title,
                        artist_name,
                        release_year,
                        editorial_description,
                        editorial_status
                    `)
                    .eq(
                        "id",
                        albumId,
                    )
                    .single();

            if (
                albumError ||
                !album
            ) {
                return jsonResponse(
                    {
                        error:
                            "No hemos encontrado el álbum.",
                    },
                    404,
                );
            }

            /*
             * Si ya está listo, no repetimos
             * la consulta a Wikipedia.
             */
            if (
                album.editorial_status ===
                    "ready" &&
                album.editorial_description
            ) {
                return jsonResponse({
                    album,
                    reused: true,
                });
            }

            await adminClient
                .from("albums")
                .update({
                    editorial_status:
                        "generating",

                    editorial_error:
                        null,

                    updated_at:
                        new Date()
                            .toISOString(),
                })
                .eq(
                    "id",
                    albumId,
                );

            const searchResult =
                await searchWikipediaAlbum(
                    album as AlbumRow,
                );

            if (!searchResult) {
                throw new Error(
                    "No existe un artículo fiable en Wikipedia en español para este disco.",
                );
            }

            const wikipediaPage =
                await getWikipediaPage(
                    searchResult.pageid,
                );

            if (
                !wikipediaPage ||
                wikipediaPage.missing ||
                !wikipediaPage.extract ||
                !wikipediaPage.fullurl
            ) {
                throw new Error(
                    "Wikipedia no ha devuelto información suficiente.",
                );
            }

            const validation =
              validateWikipediaPage(
                wikipediaPage,
                album as AlbumRow,
              );

            if (!validation.valid) {
              throw new Error(
                "Wikipedia encontró un artículo con el mismo título, pero no corresponde al artista del disco.",
              );
            }

            const description =
                buildEditorialDescription(
                    wikipediaPage.extract,
                );

            if (
                description.length < 100
            ) {
                throw new Error(
                    "La información encontrada es demasiado breve.",
                );
            }

            const {
                data: updatedAlbum,
                error: updateError,
            } =
                await adminClient
                    .from("albums")
                    .update({
                        editorial_description:
                            description,

                        editorial_source_name:
                            "Wikipedia",

                        editorial_source_url:
                            wikipediaPage.fullurl,

                        editorial_source_language:
                            "es",

                        editorial_source_license:
                            "CC BY-SA",

                        editorial_status:
                            "ready",

                        editorial_generated_at:
                            new Date()
                                .toISOString(),

                        editorial_error:
                            null,

                        updated_at:
                            new Date()
                                .toISOString(),
                    })
                    .eq(
                        "id",
                        albumId,
                    )
                    .select()
                    .single();

            if (updateError) {
                throw updateError;
            }

            return jsonResponse({
                album:
                    updatedAlbum,

                reused:
                    false,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "No hemos podido preparar la historia del disco.";

            console.error(
                "generate-album-editorial:",
                error,
            );

            if (
                albumId &&
                supabaseUrl &&
                serviceRoleKey
            ) {
                const adminClient =
                    createClient(
                        supabaseUrl,
                        serviceRoleKey,
                    );

                await adminClient
                    .from("albums")
                    .update({
                        editorial_status:
                            "failed",

                        editorial_error:
                            message,

                        updated_at:
                            new Date()
                                .toISOString(),
                    })
                    .eq(
                        "id",
                        albumId,
                    );
            }

            /*
             * El fallo editorial no debería
             * provocar que el álbum desaparezca.
             */
            return jsonResponse(
                {
                    error: message,
                },
                422,
            );
        }
    },
);