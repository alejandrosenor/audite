import {
    useEffect,
    useRef,
    useState,
} from "react";
import {
    generateAlbumEditorial,
    getAlbumEditorial,
} from "../services/albumEditorial";
import "./AlbumEditorialCard.css";

const POLLING_INTERVAL = 2500;
const MAX_POLLING_ATTEMPTS = 12;

function mergeEditorialAlbum(
    originalAlbum,
    editorialAlbum,
) {
    return {
        ...originalAlbum,
        ...editorialAlbum,
    };
}

function AlbumEditorialCard({
    album,
}) {
    const [
        editorialAlbum,
        setEditorialAlbum,
    ] = useState(album);

    const [
        retrying,
        setRetrying,
    ] = useState(false);

    const [
        localError,
        setLocalError,
    ] = useState("");

    const generationStartedRef = useRef(false);

    useEffect(() => {
        setEditorialAlbum(album);
        setLocalError("");
        generationStartedRef.current = false;
    }, [album?.id]);

    useEffect(() => {
        if (
            !album?.id ||
            editorialAlbum?.editorial_status !== "pending" ||
            generationStartedRef.current
        ) {
            return;
        }

        generationStartedRef.current = true;

        setEditorialAlbum((currentAlbum) => ({
            ...currentAlbum,
            editorial_status: "generating",
            editorial_error: null,
        }));

        generateAlbumEditorial(album.id)
            .then((generatedAlbum) => {
                setEditorialAlbum(
                    (currentAlbum) => ({
                        ...currentAlbum,
                        ...generatedAlbum,
                    }),
                );
            })
            .catch((error) => {
                const message =
                    error instanceof Error
                        ? error.message
                        : "No hemos podido preparar la historia.";

                setLocalError(message);

                setEditorialAlbum(
                    (currentAlbum) => ({
                        ...currentAlbum,
                        editorial_status: "failed",
                        editorial_error: message,
                    }),
                );
            });
    }, [
        album?.id,
        editorialAlbum?.editorial_status,
    ]);

    useEffect(() => {
        if (
            !album?.id ||
            editorialAlbum?.editorial_status !== "generating"
        ) {
            return;
        }

        let cancelled = false;
        let attempts = 0;
        let timerId = null;

        async function refreshEditorial() {
            attempts += 1;

            try {
                const currentEditorial =
                    await getAlbumEditorial(
                        album.id,
                    );

                if (
                    cancelled ||
                    !currentEditorial
                ) {
                    return;
                }

                setEditorialAlbum(
                    (currentAlbum) =>
                        mergeEditorialAlbum(
                            currentAlbum,
                            currentEditorial,
                        ),
                );

                if (
                    [
                        "ready",
                        "failed",
                    ].includes(
                        currentEditorial
                            .editorial_status,
                    )
                ) {
                    return;
                }

                if (
                    attempts <
                    MAX_POLLING_ATTEMPTS
                ) {
                    timerId =
                        window.setTimeout(
                            refreshEditorial,
                            POLLING_INTERVAL,
                        );
                }
            } catch (error) {
                console.error(
                    "No se pudo actualizar la historia del disco:",
                    error,
                );

                if (
                    attempts <
                    MAX_POLLING_ATTEMPTS
                ) {
                    timerId =
                        window.setTimeout(
                            refreshEditorial,
                            POLLING_INTERVAL,
                        );
                }
            }
        }

        timerId =
            window.setTimeout(
                refreshEditorial,
                900,
            );

        return () => {
            cancelled = true;

            if (timerId) {
                window.clearTimeout(
                    timerId,
                );
            }
        };
    }, [
        album?.id,
        editorialAlbum
            ?.editorial_status,
    ]);

    async function handleRetry() {
        if (
            !album?.id ||
            retrying
        ) {
            return;
        }

        setRetrying(true);
        setLocalError("");

        setEditorialAlbum(
            (currentAlbum) => ({
                ...currentAlbum,
                editorial_status:
                    "generating",
                editorial_error:
                    null,
            }),
        );

        try {
            const generatedAlbum =
                await generateAlbumEditorial(
                    album.id,
                );

            setEditorialAlbum(
                (currentAlbum) =>
                    mergeEditorialAlbum(
                        currentAlbum,
                        generatedAlbum,
                    ),
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "No hemos podido preparar la historia.";

            setLocalError(message);

            setEditorialAlbum(
                (currentAlbum) => ({
                    ...currentAlbum,
                    editorial_status:
                        "failed",
                    editorial_error:
                        message,
                }),
            );
        } finally {
            setRetrying(false);
        }
    }

    if (!editorialAlbum) {
        return null;
    }

    const status =
        editorialAlbum
            .editorial_status ??
        "pending";

    if (
        status === "pending" ||
        status === "generating"
    ) {
        return (
            <section className="album-editorial album-editorial--loading">
                <p>DETÉN LA AGUJA</p>

                <h2>
                    Preparando la historia del disco…
                </h2>

                <span className="album-editorial__loading-message">
                    Estamos consultando información sobre este álbum.
                </span>

                <div className="album-editorial__skeleton">
                    <span />
                    <span />
                    <span />
                </div>
            </section>
        );
    }

    if (
        status === "failed"
    ) {
        return (
            <section className="album-editorial album-editorial--failed">
                <header>
                    <div>
                        <p>DETÉN LA AGUJA</p>

                        <h2>
                            No encontramos su historia
                        </h2>
                    </div>

                    <span>?</span>
                </header>

                <p className="album-editorial__failed-message">
                    Wikipedia no tiene información suficiente o no hemos podido identificar correctamente este disco.
                </p>

                {(localError ||
                    editorialAlbum
                        .editorial_error) && (
                        <small>
                            {localError ||
                                editorialAlbum
                                    .editorial_error}
                        </small>
                    )}

                <button
                    type="button"
                    className="album-editorial__retry"
                    onClick={handleRetry}
                    disabled={retrying}
                >
                    {retrying
                        ? "Buscando de nuevo…"
                        : "Volver a intentarlo"}
                </button>
            </section>
        );
    }

    if (
        status !== "ready" ||
        !editorialAlbum
            .editorial_description
    ) {
        return null;
    }

    return (
        <section className="album-editorial">
            <header>
                <div>
                    <p>DETÉN LA AGUJA</p>

                    <h2>
                        La historia detrás del disco
                    </h2>
                </div>

                <span>♪</span>
            </header>

            <div className="album-editorial__description">
                {
                    editorialAlbum
                        .editorial_description
                }
            </div>

            <footer>
                <span>
                    Fuente:{" "}
                    {
                        editorialAlbum
                            .editorial_source_name
                    }

                    {editorialAlbum
                        .editorial_source_license && (
                            <>
                                {" · "}
                                {
                                    editorialAlbum
                                        .editorial_source_license
                                }
                            </>
                        )}
                </span>

                {editorialAlbum
                    .editorial_source_url && (
                        <a
                            href={
                                editorialAlbum
                                    .editorial_source_url
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            Leer el artículo original →
                        </a>
                    )}
            </footer>
        </section>
    );
}

export default AlbumEditorialCard;