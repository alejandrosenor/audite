import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    addArchiveAlbum,
    saveArchiveFavoriteTracks,
    searchSpotifyAlbums,
} from "../services/archive";

import {
    getAlbumTracks,
    syncAlbumTracks,
} from "../services/albums";

import { supabase } from "../services/supabase";

import "./ArchiveAlbumModal.css";

const currentYear = new Date().getFullYear();

const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

function ArchiveAlbumModal({
    isOpen,
    userId,
    archiveAlbum = null,
    onClose,
    onSaved,
}) {
    const inputRef = useRef(null);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedAlbum, setSelectedAlbum] =
        useState(null);

    const [genres, setGenres] = useState("");

    const [precision, setPrecision] =
        useState("year");

    const [year, setYear] = useState(
        String(currentYear),
    );

    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");

    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");

    const [
        wouldListenAgain,
        setWouldListenAgain,
    ] = useState(null);

    const [tracks, setTracks] = useState([]);

    const [
        favoriteTrackIds,
        setFavoriteTrackIds,
    ] = useState([]);

    const [searching, setSearching] =
        useState(false);

    const [loadingTracks, setLoadingTracks] =
        useState(false);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [step, setStep] =
        useState("form");

    const [
        savedArchive,
        setSavedArchive,
    ] = useState(null);

    const [
        loadingSavedTracks,
        setLoadingSavedTracks,
    ] = useState(false);

    const [
        savingFavoriteTracks,
        setSavingFavoriteTracks,
    ] = useState(false);

    const selectedFavoriteTracks = useMemo(
        () =>
            favoriteTrackIds
                .map((trackId) =>
                    tracks.find(
                        (track) =>
                            track.id === trackId,
                    ),
                )
                .filter(Boolean),
        [favoriteTrackIds, tracks],
    );

    function resetModal() {
        setQuery("");
        setResults([]);
        setSelectedAlbum(null);
        setGenres("");
        setPrecision("year");
        setYear(String(currentYear));
        setMonth("");
        setDay("");
        setRating("");
        setComment("");
        setWouldListenAgain(null);
        setTracks([]);
        setFavoriteTrackIds([]);
        setSearching(false);
        setLoadingTracks(false);
        setSaving(false);
        setMessage("");

        setStep("form");
        setSavedArchive(null);
        setLoadingSavedTracks(false);
        setSavingFavoriteTracks(false);
    }

    function handleClose() {
        if (
            saving ||
            savingFavoriteTracks
        ) {
            return;
        }

        resetModal();
        onClose();
    }

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                handleClose();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.clearTimeout(timer);

            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [isOpen, saving]);

    useEffect(() => {
        if (!isOpen || selectedAlbum) {
            return;
        }

        const normalizedQuery = query.trim();

        if (normalizedQuery.length < 2) {
            setResults([]);
            setSearching(false);
            return;
        }

        let cancelled = false;

        const timer = window.setTimeout(
            async () => {
                setSearching(true);
                setMessage("");

                try {
                    const albums =
                        await searchSpotifyAlbums(
                            normalizedQuery,
                        );

                    if (!cancelled) {
                        setResults(albums);
                    }
                } catch (error) {
                    console.error(error);

                    if (!cancelled) {
                        setMessage(
                            error.message ||
                            "No hemos podido buscar discos.",
                        );
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
            window.clearTimeout(timer);
        };
    }, [
        isOpen,
        query,
        selectedAlbum,
    ]);

    async function loadSelectedAlbumTracks(
        album,
    ) {
        if (!album?.spotify_id) {
            return;
        }

        setLoadingTracks(true);
        setTracks([]);

        try {
            const { data: storedAlbum } =
                await supabase
                    .from("albums")
                    .select("id")
                    .eq(
                        "spotify_id",
                        album.spotify_id,
                    )
                    .maybeSingle();

            /*
             * Si el disco no existe todavía en Audite,
             * no intentamos sincronizarlo antes de guardarlo.
             */
            if (!storedAlbum?.id) {
                return;
            }

            const albumTracks =
                await getAlbumTracks(
                    storedAlbum.id,
                );

            /*
             * Aquí solo leemos canciones ya existentes.
             * No llamamos a syncAlbumTracks porque todavía
             * puede no pertenecer al usuario.
             */
            setTracks(albumTracks);
        } catch (error) {
            console.error(
                "No se pudieron recuperar las pistas:",
                error,
            );
        } finally {
            setLoadingTracks(false);
        }
    }

    async function handleSelectAlbum(album) {
        setSelectedAlbum(album);

        setGenres(
            Array.isArray(album.genres)
                ? album.genres.join(", ")
                : "",
        );

        setMessage("");

        await loadSelectedAlbumTracks(album);
    }

    function toggleFavoriteTrack(trackId) {
        setFavoriteTrackIds((currentIds) => {
            if (currentIds.includes(trackId)) {
                return currentIds.filter(
                    (id) => id !== trackId,
                );
            }

            if (currentIds.length >= 3) {
                setMessage(
                    "Puedes elegir un máximo de tres canciones.",
                );

                return currentIds;
            }

            setMessage("");

            return [
                ...currentIds,
                trackId,
            ];
        });
    }

    function moveFavoriteTrack(
        trackId,
        direction,
    ) {
        setFavoriteTrackIds((currentIds) => {
            const currentIndex =
                currentIds.indexOf(trackId);

            const nextIndex =
                currentIndex + direction;

            if (
                currentIndex < 0 ||
                nextIndex < 0 ||
                nextIndex >= currentIds.length
            ) {
                return currentIds;
            }

            const nextIds = [...currentIds];

            [
                nextIds[currentIndex],
                nextIds[nextIndex],
            ] = [
                    nextIds[nextIndex],
                    nextIds[currentIndex],
                ];

            return nextIds;
        });
    }

    function validateForm() {
        if (!selectedAlbum) {
            return "Selecciona un disco.";
        }

        const numericYear = Number(year);

        if (
            precision !== "unknown" &&
            (!Number.isInteger(numericYear) ||
                numericYear < 1900 ||
                numericYear > currentYear)
        ) {
            return "Indica un año válido.";
        }

        if (
            precision === "month" &&
            !month
        ) {
            return "Selecciona el mes aproximado.";
        }

        if (
            precision === "day" &&
            (!month || !day)
        ) {
            return "Selecciona el mes y el día.";
        }

        if (rating !== "") {
            const numericRating = Number(rating);

            if (
                !Number.isFinite(numericRating) ||
                numericRating < 0 ||
                numericRating > 10
            ) {
                return "La nota debe estar entre 0 y 10.";
            }
        }

        return "";
    }

    function wait(milliseconds) {
        return new Promise((resolve) => {
            window.setTimeout(
                resolve,
                milliseconds,
            );
        });
    }

    async function loadTracksAfterSaving(
        albumId,
    ) {
        if (!albumId) {
            return [];
        }

        setLoadingSavedTracks(true);

        try {
            /*
             * La Edge Function puede tardar un poco
             * en terminar de insertar todas las pistas.
             */
            for (
                let attempt = 0;
                attempt < 5;
                attempt += 1
            ) {
                const albumTracks =
                    await getAlbumTracks(
                        albumId,
                    );

                if (albumTracks.length > 0) {
                    setTracks(albumTracks);
                    return albumTracks;
                }

                await wait(700);
            }

            setTracks([]);
            return [];
        } catch (error) {
            console.error(
                "No se pudieron cargar las canciones guardadas:",
                error,
            );

            setTracks([]);
            return [];
        } finally {
            setLoadingSavedTracks(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationMessage =
            validateForm();

        if (validationMessage) {
            setMessage(validationMessage);
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const createdArchive =
                await addArchiveAlbum({
                    userId,

                    album:
                        selectedAlbum,

                    genres:
                        genres
                            .split(",")
                            .map((genre) =>
                                genre.trim(),
                            )
                            .filter(Boolean),

                    discoveryYear:
                        precision === "unknown"
                            ? null
                            : Number(year),

                    discoveryMonth:
                        month
                            ? Number(month)
                            : null,

                    discoveryDay:
                        day
                            ? Number(day)
                            : null,

                    discoveryPrecision:
                        precision,

                    rating:
                        rating === ""
                            ? null
                            : Number(rating),

                    comment,

                    wouldListenAgain,

                    /*
                     * Ahora se seleccionan después.
                     */
                    favoriteTrackIds: [],
                });

            setSavedArchive(
                createdArchive,
            );

            setFavoriteTrackIds([]);

            /*
             * El recuerdo ya está guardado.
             * Avisamos a Biblioteca inmediatamente.
             */
            onSaved(
                createdArchive,
            );

            setStep("tracks");

            const albumId =
                createdArchive.album?.id ??
                createdArchive.album_id;

            const albumTracks =
                await loadTracksAfterSaving(
                    albumId,
                );

            if (albumTracks.length === 0) {
                setMessage(
                    "El recuerdo está guardado, pero no hemos podido recuperar todavía sus canciones.",
                );
            }
        } catch (error) {
            console.error(error);

            setMessage(
                error.message ||
                "No hemos podido guardar el recuerdo.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveFavoriteTracks() {
        if (!savedArchive) {
            return;
        }

        setSavingFavoriteTracks(true);
        setMessage("");

        try {
            const savedFavorites =
                await saveArchiveFavoriteTracks({
                    userId,

                    reviewId:
                        savedArchive.id,

                    albumId:
                        savedArchive.album?.id ??
                        savedArchive.album_id,

                    favoriteTrackIds,
                });

            const updatedArchive = {
                ...savedArchive,

                favorite_tracks:
                    savedFavorites,
            };

            /*
             * Volvemos a avisar a Library para
             * actualizar la tarjeta con el Top 3.
             */
            onSaved(
                updatedArchive,
            );

            window.dispatchEvent(
                new CustomEvent(
                    "audite:archive-changed",
                ),
            );

            resetModal();
            onClose();
        } catch (error) {
            console.error(error);

            setMessage(
                error.message ||
                "No hemos podido guardar tus canciones.",
            );
        } finally {
            setSavingFavoriteTracks(false);
        }
    }

    function handleSkipFavoriteTracks() {
        resetModal();
        onClose();
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="archive-modal-backdrop"
            onMouseDown={handleClose}
        >
            <section
                className="archive-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="archive-modal-title"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <header className="archive-modal__header">
                    <div>
                        <p>📼 ARCHIVO</p>

                        <h2 id="archive-modal-title">
                            Añade un recuerdo musical
                        </h2>

                        <span>
                            Guarda los discos que ya
                            formaban parte de ti antes
                            de Audite.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </header>

                {!selectedAlbum ? (
                    <div className="archive-modal__search-step">
                        <div className="archive-modal__search-step">
                            <label className="archive-search">
                                <span>⌕</span>

                                <input
                                    ref={inputRef}
                                    type="search"
                                    value={query}
                                    onChange={(event) =>
                                        setQuery(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Busca un disco o artista..."
                                />

                                {searching && (
                                    <i />
                                )}
                            </label>

                            {results.length === 0 &&
                                query.trim().length < 2 && (
                                    <div className="archive-intro">
                                        <span>📼</span>

                                        <h3>
                                            ¿Qué disco ya era
                                            parte de tu historia?
                                        </h3>

                                        <p>
                                            Puedes recuperar
                                            descubrimientos de este
                                            año o de cualquier etapa
                                            anterior.
                                        </p>
                                    </div>
                                )}

                            <div className="archive-results">
                                {results.map((album) => (
                                    <button
                                        type="button"
                                        key={album.spotify_id}
                                        onClick={() =>
                                            handleSelectAlbum(
                                                album,
                                            )
                                        }
                                    >
                                        {album.cover_url ? (
                                            <img
                                                src={
                                                    album.cover_url
                                                }
                                                alt=""
                                            />
                                        ) : (
                                            <span>💿</span>
                                        )}

                                        <div>
                                            <strong>
                                                {album.title}
                                            </strong>

                                            <p>
                                                {
                                                    album.artist_name
                                                }
                                            </p>

                                            <small>
                                                {[
                                                    album.release_year,
                                                    album.track_count
                                                        ? `${album.track_count} canciones`
                                                        : null,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </small>
                                        </div>

                                        <i>›</i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : step === "tracks" ? (
                    <section className="archive-success-step">
                        <header className="archive-success-step__header">
                            <span>✓</span>

                            <div>
                                <p>RECUERDO GUARDADO</p>

                                <h2>
                                    Ahora elige tus canciones
                                </h2>

                                <span>
                                    Puedes seleccionar hasta tres y
                                    ordenarlas de mejor a peor.
                                </span>
                            </div>
                        </header>

                        <article className="archive-selected">
                            {savedArchive?.album?.cover_url ? (
                                <img
                                    src={
                                        savedArchive.album.cover_url
                                    }
                                    alt=""
                                />
                            ) : (
                                <div>💿</div>
                            )}

                            <div>
                                <p>GUARDADO EN TU ARCHIVO</p>

                                <h3>
                                    {
                                        savedArchive?.album?.title
                                    }
                                </h3>

                                <span>
                                    {
                                        savedArchive?.album
                                            ?.artist_name
                                    }
                                </span>
                            </div>
                        </article>

                        <section className="archive-tracks">
                            <header>
                                <div>
                                    <p>TOP 3 OPCIONAL</p>

                                    <h3>
                                        Tus canciones elegidas
                                    </h3>
                                </div>

                                <span>
                                    {favoriteTrackIds.length}/3
                                </span>
                            </header>

                            {selectedFavoriteTracks.length >
                                0 && (
                                    <ol className="archive-ranking">
                                        {selectedFavoriteTracks.map(
                                            (track, index) => (
                                                <li key={track.id}>
                                                    <strong>
                                                        {index + 1}
                                                    </strong>

                                                    <span>
                                                        {track.title}
                                                    </span>

                                                    <div>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                index === 0
                                                            }
                                                            onClick={() =>
                                                                moveFavoriteTrack(
                                                                    track.id,
                                                                    -1,
                                                                )
                                                            }
                                                        >
                                                            ↑
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                index ===
                                                                selectedFavoriteTracks.length -
                                                                1
                                                            }
                                                            onClick={() =>
                                                                moveFavoriteTrack(
                                                                    track.id,
                                                                    1,
                                                                )
                                                            }
                                                        >
                                                            ↓
                                                        </button>
                                                    </div>
                                                </li>
                                            ),
                                        )}
                                    </ol>
                                )}

                            {loadingSavedTracks ? (
                                <div className="archive-tracks-loading">
                                    <i />

                                    <p>
                                        Recuperando las canciones...
                                    </p>
                                </div>
                            ) : tracks.length > 0 ? (
                                <div className="archive-track-list">
                                    {tracks.map((track) => {
                                        const selected =
                                            favoriteTrackIds.includes(
                                                track.id,
                                            );

                                        return (
                                            <button
                                                key={track.id}
                                                type="button"
                                                className={
                                                    selected
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    toggleFavoriteTrack(
                                                        track.id,
                                                    )
                                                }
                                            >
                                                <span>
                                                    {selected
                                                        ? favoriteTrackIds.indexOf(
                                                            track.id,
                                                        ) + 1
                                                        : track.track_number}
                                                </span>

                                                <strong>
                                                    {track.title}
                                                </strong>

                                                <i>
                                                    {selected
                                                        ? "★"
                                                        : "☆"}
                                                </i>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="archive-tracks__empty">
                                    El recuerdo está guardado, pero
                                    todavía no tenemos disponible el
                                    tracklist.
                                </p>
                            )}
                        </section>

                        {message && (
                            <p className="archive-form__message">
                                {message}
                            </p>
                        )}

                        <div className="archive-success-actions">
                            <button
                                type="button"
                                className="archive-success-actions__skip"
                                onClick={
                                    handleSkipFavoriteTracks
                                }
                                disabled={
                                    savingFavoriteTracks
                                }
                            >
                                Ahora no
                            </button>

                            <button
                                type="button"
                                className="archive-success-actions__save"
                                onClick={
                                    handleSaveFavoriteTracks
                                }
                                disabled={
                                    savingFavoriteTracks ||
                                    loadingSavedTracks
                                }
                            >
                                {savingFavoriteTracks
                                    ? "Guardando canciones..."
                                    : favoriteTrackIds.length > 0
                                        ? "Guardar Top 3"
                                        : "Terminar"}
                            </button>
                        </div>
                    </section>
                ) : (
                    <form
                        className="archive-form"
                        onSubmit={handleSubmit}
                    >
                        <button
                            type="button"
                            className="archive-form__back"
                            onClick={() => {
                                setSelectedAlbum(null);
                                setTracks([]);
                                setFavoriteTrackIds([]);
                            }}
                        >
                            ← Elegir otro disco
                        </button>

                        <article className="archive-selected">
                            {selectedAlbum.cover_url ? (
                                <img
                                    src={
                                        selectedAlbum.cover_url
                                    }
                                    alt=""
                                />
                            ) : (
                                <div>💿</div>
                            )}

                            <div>
                                <p>RECUERDO SELECCIONADO</p>

                                <h3>
                                    {selectedAlbum.title}
                                </h3>

                                <span>
                                    {
                                        selectedAlbum.artist_name
                                    }
                                </span>
                            </div>
                        </article>

                        <label className="archive-field">
                            <span>Géneros</span>

                            <input
                                type="text"
                                value={genres}
                                onChange={(event) =>
                                    setGenres(
                                        event.target.value,
                                    )
                                }
                                placeholder="rock, folk, soul..."
                            />
                        </label>

                        <section className="archive-date">
                            <header>
                                <p>CUÁNDO LO DESCUBRISTE</p>

                                <h3>
                                    No hace falta recordar el
                                    día exacto
                                </h3>
                            </header>

                            <div className="archive-precision">
                                {[
                                    ["day", "Día exacto"],
                                    ["month", "Mes aproximado"],
                                    ["year", "Solo el año"],
                                    ["unknown", "No lo recuerdo"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={
                                            precision === value
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setPrecision(value)
                                        }
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {precision !== "unknown" && (
                                <div className="archive-date__fields">
                                    <input
                                        type="number"
                                        value={year}
                                        min="1900"
                                        max={currentYear}
                                        onChange={(event) =>
                                            setYear(
                                                event.target.value,
                                            )
                                        }
                                        aria-label="Año"
                                    />

                                    {(precision === "month" ||
                                        precision === "day") && (
                                            <select
                                                value={month}
                                                onChange={(event) =>
                                                    setMonth(
                                                        event.target.value,
                                                    )
                                                }
                                                aria-label="Mes"
                                            >
                                                <option value="">
                                                    Mes
                                                </option>

                                                {months.map(
                                                    (
                                                        monthName,
                                                        index,
                                                    ) => (
                                                        <option
                                                            key={
                                                                monthName
                                                            }
                                                            value={
                                                                index +
                                                                1
                                                            }
                                                        >
                                                            {
                                                                monthName
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        )}

                                    {precision === "day" && (
                                        <input
                                            type="number"
                                            value={day}
                                            min="1"
                                            max="31"
                                            onChange={(event) =>
                                                setDay(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Día"
                                            aria-label="Día"
                                        />
                                    )}
                                </div>
                            )}
                        </section>

                        <label className="archive-field">
                            <span>
                                Valoración opcional
                            </span>

                            <input
                                type="number"
                                value={rating}
                                min="0"
                                max="10"
                                step="0.5"
                                onChange={(event) =>
                                    setRating(
                                        event.target.value,
                                    )
                                }
                                placeholder="Por ejemplo, 8.5"
                            />
                        </label>

                        <section className="archive-listen-again">
                            <p>
                                ¿Volverías a escucharlo?
                            </p>

                            <div>
                                <button
                                    type="button"
                                    className={
                                        wouldListenAgain === true
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setWouldListenAgain(
                                            true,
                                        )
                                    }
                                >
                                    Sí, volvería
                                </button>

                                <button
                                    type="button"
                                    className={
                                        wouldListenAgain === false
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setWouldListenAgain(
                                            false,
                                        )
                                    }
                                >
                                    Probablemente no
                                </button>

                                <button
                                    type="button"
                                    className={
                                        wouldListenAgain === null
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setWouldListenAgain(
                                            null,
                                        )
                                    }
                                >
                                    No lo sé
                                </button>
                            </div>
                        </section>

                        <label className="archive-field">
                            <span>
                                Qué quieres recordar
                            </span>

                            <textarea
                                value={comment}
                                onChange={(event) =>
                                    setComment(
                                        event.target.value,
                                    )
                                }
                                maxLength={2000}
                                placeholder="Dónde estabas, por qué te marcó, quién te lo enseñó..."
                            />

                            <small>
                                {comment.length}/2000
                            </small>
                        </label>

                        {message && (
                            <p className="archive-form__message">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="archive-form__submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Guardando recuerdo..."
                                : "Guardar en el Archivo"}
                        </button>
                    </form>
                )}

                {!selectedAlbum && message && (
                    <p className="archive-form__message">
                        {message}
                    </p>
                )}
            </section>
        </div>
    );
}

export default ArchiveAlbumModal;