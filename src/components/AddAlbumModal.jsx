import { useEffect, useRef, useState } from "react";
import {
    addManualAlbum,
    searchSpotifyAlbums,
} from "../services/albums";
import "./AddAlbumModal.css";

function AddAlbumModal({
    isOpen,
    userId,
    onClose,
    onAlbumAdded,
}) {
    const inputRef = useRef(null);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const [isRecommendation, setIsRecommendation] =
        useState(false);
    const [recommendedBy, setRecommendedBy] =
        useState("");
    const [personalNote, setPersonalNote] =
        useState("");

    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("");

    function resetModal() {
        setQuery("");
        setResults([]);
        setSelectedAlbum(null);
        setIsRecommendation(false);
        setRecommendedBy("");
        setPersonalNote("");
        setSearching(false);
        setSaving(false);
        setMessage("");
        setMessageType("");
    }

    function handleClose() {
        if (saving) {
            return;
        }

        resetModal();
        onClose();
    }

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const focusTimer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 120);

        function handleEscape(event) {
            if (event.key === "Escape") {
                handleClose();
            }
        }

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            window.clearTimeout(focusTimer);
            document.body.style.overflow = "";
            window.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, [isOpen, saving]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const normalizedQuery = query.trim();

        if (normalizedQuery.length < 2) {
            setResults([]);
            setSearching(false);
            setMessage("");
            return;
        }

        let cancelled = false;

        const searchTimer = window.setTimeout(
            async () => {
                setSearching(true);
                setMessage("");
                setMessageType("");

                try {
                    const albums =
                        await searchSpotifyAlbums(
                            normalizedQuery,
                        );

                    if (cancelled) {
                        return;
                    }

                    setResults(albums);

                    if (albums.length === 0) {
                        setMessage(
                            "No hemos encontrado ningún disco con esa búsqueda.",
                        );
                        setMessageType("info");
                    }
                } catch (error) {
                    console.error(error);

                    if (!cancelled) {
                        setResults([]);
                        setMessage(
                            error.message ||
                            "No hemos podido buscar discos.",
                        );
                        setMessageType("error");
                    }
                } finally {
                    if (!cancelled) {
                        setSearching(false);
                    }
                }
            },
            450,
        );

        return () => {
            cancelled = true;
            window.clearTimeout(searchTimer);
        };
    }, [query, isOpen]);

    function handleSelectAlbum(album) {
        setSelectedAlbum(album);
        setMessage("");
        setMessageType("");
    }

    async function handleAddAlbum() {
        if (!selectedAlbum || !userId || saving) {
            return;
        }

        if (
            isRecommendation &&
            !recommendedBy.trim()
        ) {
            setMessage(
                "Indica quién te ha recomendado el disco.",
            );
            setMessageType("error");
            return;
        }

        setSaving(true);
        setMessage("");
        setMessageType("");

        try {
            const addedAlbum = await addManualAlbum({
                userId,
                album: selectedAlbum,
                recommendedBy: isRecommendation
                    ? recommendedBy
                    : "",
                personalNote,
            });

            onAlbumAdded(addedAlbum);
            resetModal();
            onClose();
        } catch (error) {
            console.error(error);

            const isDuplicate =
                error.code === "23505" ||
                error.message
                    ?.toLowerCase()
                    .includes("duplicate");

            setMessage(
                isDuplicate
                    ? "Este disco ya forma parte de tu historia musical."
                    : error.message ||
                    "No hemos podido añadir el disco.",
            );
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="add-album-backdrop"
            role="presentation"
            onMouseDown={handleClose}
        >
            <section
                className="add-album-modal fade-up"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-album-title"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <header className="add-album-modal__header">
                    <div>
                        <p>AÑADIR A PENDIENTES</p>

                        <h2 id="add-album-title">
                            Busca un disco
                        </h2>

                        <span>
                            Añade una recomendación o cualquier
                            álbum que quieras escuchar.
                        </span>
                    </div>

                    <button
                        type="button"
                        className="add-album-modal__close"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </header>

                <label className="add-album-search">
                    <span>⌕</span>

                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setSelectedAlbum(null);
                        }}
                        placeholder="Busca por disco o artista..."
                        autoComplete="off"
                    />

                    {query && !searching && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setResults([]);
                                setSelectedAlbum(null);
                                inputRef.current?.focus();
                            }}
                            aria-label="Limpiar búsqueda"
                        >
                            ×
                        </button>
                    )}

                    {searching && (
                        <span className="add-album-search__loader" />
                    )}
                </label>

                <div className="add-album-modal__body">
                    {!selectedAlbum ? (
                        <>
                            {query.trim().length < 2 && (
                                <div className="add-album-intro">
                                    <div className="add-album-intro__icon">
                                        💿
                                    </div>

                                    <h3>
                                        ¿Qué disco tienes en mente?
                                    </h3>

                                    <p>
                                        Puedes buscar por título, artista
                                        o escribir ambos para afinar los
                                        resultados.
                                    </p>

                                    <div className="add-album-intro__examples">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuery("Born to Run")
                                            }
                                        >
                                            Born to Run
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuery("Amy Winehouse")
                                            }
                                        >
                                            Amy Winehouse
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuery("Kind of Blue")
                                            }
                                        >
                                            Kind of Blue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="add-album-results">
                                    <div className="add-album-results__header">
                                        <strong>
                                            Resultados
                                        </strong>

                                        <span>
                                            {results.length}
                                        </span>
                                    </div>

                                    <div className="add-album-results__list">
                                        {results.map((album) => (
                                            <button
                                                key={album.spotify_id}
                                                type="button"
                                                className="add-album-result"
                                                onClick={() =>
                                                    handleSelectAlbum(album)
                                                }
                                            >
                                                <div className="add-album-result__cover">
                                                    {album.cover_url ? (
                                                        <img
                                                            src={album.cover_url}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <span>💿</span>
                                                    )}
                                                </div>

                                                <div className="add-album-result__info">
                                                    <strong>
                                                        {album.title}
                                                    </strong>

                                                    <span>
                                                        {album.artist_name}
                                                    </span>

                                                    <small>
                                                        {[
                                                            album.release_year,
                                                            album.track_count
                                                                ? `${album.track_count} canciones`
                                                                : null,
                                                            album.album_type,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </small>
                                                </div>

                                                <span className="add-album-result__arrow">
                                                    ›
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="add-album-selection">
                            <button
                                type="button"
                                className="add-album-selection__back"
                                onClick={() =>
                                    setSelectedAlbum(null)
                                }
                            >
                                ← Volver a los resultados
                            </button>

                            <article className="selected-album">
                                <div className="selected-album__cover">
                                    {selectedAlbum.cover_url ? (
                                        <img
                                            src={
                                                selectedAlbum.cover_url
                                            }
                                            alt={`Portada de ${selectedAlbum.title}`}
                                        />
                                    ) : (
                                        <div>💿</div>
                                    )}
                                </div>

                                <div className="selected-album__content">
                                    <p>DISCO SELECCIONADO</p>

                                    <h3>
                                        {selectedAlbum.title}
                                    </h3>

                                    <h4>
                                        {selectedAlbum.artist_name}
                                    </h4>

                                    <div className="selected-album__metadata">
                                        {selectedAlbum.release_year && (
                                            <span>
                                                {
                                                    selectedAlbum.release_year
                                                }
                                            </span>
                                        )}

                                        {selectedAlbum.track_count && (
                                            <span>
                                                {
                                                    selectedAlbum.track_count
                                                }{" "}
                                                canciones
                                            </span>
                                        )}
                                    </div>

                                    {selectedAlbum.spotify_url && (
                                        <a
                                            href={
                                                selectedAlbum.spotify_url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            ▶ Comprobar en Spotify
                                        </a>
                                    )}
                                </div>
                            </article>

                            <div className="add-album-fields">
                                <label className="recommendation-toggle">
                                    <input
                                        type="checkbox"
                                        checked={isRecommendation}
                                        onChange={(event) => {
                                            setIsRecommendation(
                                                event.target.checked,
                                            );

                                            if (
                                                !event.target.checked
                                            ) {
                                                setRecommendedBy("");
                                            }
                                        }}
                                    />

                                    <span className="recommendation-toggle__control" />

                                    <span>
                                        <strong>
                                            Me lo ha recomendado alguien
                                        </strong>

                                        <small>
                                            Guarda quién te habló de este
                                            disco.
                                        </small>
                                    </span>
                                </label>

                                {isRecommendation && (
                                    <label className="add-album-field">
                                        <span>
                                            ¿Quién te lo recomendó?
                                        </span>

                                        <input
                                            type="text"
                                            value={recommendedBy}
                                            onChange={(event) =>
                                                setRecommendedBy(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Pilu, Ángel, mi padre..."
                                            maxLength={80}
                                        />
                                    </label>
                                )}

                                <label className="add-album-field">
                                    <span>
                                        Nota personal
                                        <small> Opcional</small>
                                    </span>

                                    <textarea
                                        value={personalNote}
                                        onChange={(event) =>
                                            setPersonalNote(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Por qué quieres escucharlo, cuándo te lo recomendaron..."
                                        maxLength={500}
                                    />

                                    <small className="add-album-field__counter">
                                        {personalNote.length}/500
                                    </small>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {message && (
                    <p
                        className={`add-album-message add-album-message--${messageType}`}
                    >
                        {message}
                    </p>
                )}

                {selectedAlbum && (
                    <footer className="add-album-modal__footer">
                        <button
                            type="button"
                            className="add-album-modal__cancel"
                            onClick={handleClose}
                            disabled={saving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="add-album-modal__submit"
                            onClick={handleAddAlbum}
                            disabled={saving}
                        >
                            {saving
                                ? "Añadiendo..."
                                : "Añadir a Pendientes"}
                        </button>
                    </footer>
                )}
            </section>
        </div>
    );
}

export default AddAlbumModal;