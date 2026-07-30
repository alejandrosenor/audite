import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getUserAlbumsByStatus,
    updateUserAlbumStatus,
} from "../services/albums";
import { abandonAlbumWithoutReview } from "../services/reviews";
import { getAlbumTracks } from "../services/albums";
import {
    getListeningTrackRanking,
    saveListeningTrackRanking,
} from "../services/listeningRankings";
import "./Listening.css";

function Listening() {
    const { user, refreshProfile } = useAuth();

    const [userAlbum, setUserAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [showAbandonDialog, setShowAbandonDialog] = useState(false);
    const [tracks, setTracks] = useState([]);
    const [tracksLoading, setTracksLoading] =
        useState(false);
    const [rankingStatus, setRankingStatus] =
        useState("idle");
    const rankingSaveTimerRef = useRef(null);
    const hasLoadedRankingRef = useRef(false);
    const rankingDirtyRef = useRef(false);

    const navigate = useNavigate();

    const loadTracks = useCallback(
        async (currentUserAlbum) => {
            if (
                !currentUserAlbum?.id ||
                !currentUserAlbum?.album?.id ||
                !user?.id
            ) {
                setTracks([]);
                hasLoadedRankingRef.current = false;
                return;
            }

            setTracksLoading(true);
            setRankingStatus("idle");
            hasLoadedRankingRef.current = false;

            try {
                const [
                    albumTracks,
                    savedRanking,
                ] = await Promise.all([
                    getAlbumTracks(
                        currentUserAlbum.album.id,
                    ),

                    getListeningTrackRanking({
                        userId: user.id,
                        userAlbumId:
                            currentUserAlbum.id,
                    }),
                ]);

                const rankingMap = new Map(
                    savedRanking.map((row) => [
                        row.album_track_id,
                        Number(row.position),
                    ]),
                );

                const orderedTracks =
                    [...albumTracks].sort(
                        (firstTrack, secondTrack) => {
                            const firstPosition =
                                rankingMap.get(
                                    firstTrack.id,
                                );

                            const secondPosition =
                                rankingMap.get(
                                    secondTrack.id,
                                );

                            if (
                                firstPosition !== undefined &&
                                secondPosition !== undefined
                            ) {
                                return (
                                    firstPosition -
                                    secondPosition
                                );
                            }

                            if (
                                firstPosition !== undefined
                            ) {
                                return -1;
                            }

                            if (
                                secondPosition !== undefined
                            ) {
                                return 1;
                            }

                            if (
                                firstTrack.disc_number !==
                                secondTrack.disc_number
                            ) {
                                return (
                                    firstTrack.disc_number -
                                    secondTrack.disc_number
                                );
                            }

                            return (
                                firstTrack.track_number -
                                secondTrack.track_number
                            );
                        },
                    );

                setTracks(orderedTracks);
            } catch (error) {
                console.error(
                    "No se pudieron cargar las canciones:",
                    error,
                );

                setMessage(
                    "No hemos podido cargar las canciones del disco.",
                );
            } finally {
                hasLoadedRankingRef.current = true;
                setTracksLoading(false);
            }
        },
        [user?.id],
    );

    const loadListeningAlbum = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        setLoading(true);

        try {
            const albums =
                await getUserAlbumsByStatus({
                    userId: user.id,
                    statuses: ["listening"],
                });

            const listeningAlbum =
                albums[0] ?? null;

            setUserAlbum(listeningAlbum);

            await loadTracks(listeningAlbum);
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido recuperar tu escucha.",
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id, loadTracks]);

    const persistRanking = useCallback(
        async (orderedTracks) => {
            if (
                !user?.id ||
                !userAlbum?.id ||
                !orderedTracks.length
            ) {
                return;
            }

            setRankingStatus("saving");

            try {
                await saveListeningTrackRanking({
                    userId: user.id,
                    userAlbumId: userAlbum.id,
                    tracks: orderedTracks,
                });

                setRankingStatus("saved");
            } catch (error) {
                console.error(
                    "No se pudo guardar el ranking:",
                    error,
                );

                setRankingStatus("error");
            }
        },
        [user?.id, userAlbum?.id],
    );

    useEffect(() => {
        loadListeningAlbum();
    }, [loadListeningAlbum]);

    useEffect(() => {
        if (
            !rankingDirtyRef.current ||
            !hasLoadedRankingRef.current ||
            tracksLoading ||
            !userAlbum?.id ||
            tracks.length === 0
        ) {
            return undefined;
        }

        if (rankingSaveTimerRef.current) {
            clearTimeout(
                rankingSaveTimerRef.current,
            );
        }

        rankingSaveTimerRef.current =
            setTimeout(async () => {
                await persistRanking(tracks);
                rankingDirtyRef.current = false;
            }, 650);

        return () => {
            if (rankingSaveTimerRef.current) {
                clearTimeout(
                    rankingSaveTimerRef.current,
                );
            }
        };
    }, [
        tracks,
        tracksLoading,
        userAlbum?.id,
        persistRanking,
    ]);

    function moveTrack(fromIndex, toIndex) {
        if (
            fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= tracks.length ||
            toIndex >= tracks.length
        ) {
            return;
        }

        setTracks((currentTracks) => {
            const nextTracks = [
                ...currentTracks,
            ];

            const [movedTrack] =
                nextTracks.splice(
                    fromIndex,
                    1,
                );

            nextTracks.splice(
                toIndex,
                0,
                movedTrack,
            );

            return nextTracks;
        });

        rankingDirtyRef.current = true;
        setRankingStatus("idle");
    }

    function moveTrackUp(index) {
        moveTrack(index, index - 1);
    }

    function moveTrackDown(index) {
        moveTrack(index, index + 1);
    }

    function moveTrackToTop(index) {
        moveTrack(index, 0);
    }

    if (loading) {
        return (
            <section className="listening-page">
                <p className="listening-page__eyebrow">
                    ESCUCHANDO
                </p>

                <h1>Cargando tu escucha...</h1>
            </section>
        );
    }

    if (!userAlbum) {
        return (
            <section className="listening-page">
                <header>
                    <p className="listening-page__eyebrow">
                        ESCUCHANDO
                    </p>

                    <h1>Ningún disco en reproducción.</h1>
                </header>

                <article className="listening-empty">
                    <span>🎧</span>

                    <p>
                        Elige un disco pendiente y marca que has
                        comenzado a escucharlo.
                    </p>

                    <Link to="/to-listen">
                        Ver discos pendientes
                    </Link>
                </article>
            </section>
        );
    }

    const album = userAlbum.album;

    async function handlePauseListening() {
        if (!userAlbum || actionLoading) {
            return;
        }

        setActionLoading("pause");
        setMessage("");

        try {
            await updateUserAlbumStatus({
                userAlbumId: userAlbum.id,
                userId: user.id,
                status: "paused",
            });

            window.dispatchEvent(
                new CustomEvent("audite:listening-changed"),
            );

            window.dispatchEvent(
                new CustomEvent("audite:music-changed"),
            );

            navigate("/to-listen", {
                replace: true,
                state: {
                    message:
                        "Escucha pausada. Podrás continuarla cuando quieras.",
                },
            });
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido pausar la escucha.",
            );
        } finally {
            setActionLoading("");
        }
    }

    async function handleAbandonListening() {
        if (!userAlbum || actionLoading) {
            return;
        }

        setActionLoading("abandon");
        setMessage("");

        try {
            await abandonAlbumWithoutReview({
                userId: user.id,
                userAlbum,
            });

            await refreshProfile();

            window.dispatchEvent(
                new CustomEvent("audite:listening-changed"),
            );

            window.dispatchEvent(
                new CustomEvent("audite:music-changed"),
            );

            navigate("/library", {
                replace: true,
                state: {
                    message:
                        "El disco se ha guardado en No terminados.",
                },
            });
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido dejar esta escucha.",
            );
        } finally {
            setActionLoading("");
            setShowAbandonDialog(false);
        }
    }

    return (
        <section className="listening-page">
            <header>
                <p className="listening-page__eyebrow">
                    ESCUCHANDO AHORA
                </p>

                <h1>Disfruta del viaje.</h1>
            </header>

            {message && (
                <p className="listening-page__message">
                    {message}
                </p>
            )}

            <article className="listening-album">
                <div className="listening-album__cover">
                    {album.cover_url ? (
                        <img
                            src={album.cover_url}
                            alt={`Portada de ${album.title}`}
                        />
                    ) : (
                        <div>💿</div>
                    )}

                    <span className="listening-album__pulse">
                        <i />
                    </span>
                </div>

                <div className="listening-album__content">
                    <p>EN REPRODUCCIÓN</p>

                    <h2>{album.title}</h2>
                    <h3>{album.artist_name}</h3>

                    <div className="listening-album__metadata">
                        {album.release_year && (
                            <span>{album.release_year}</span>
                        )}

                        {album.track_count && (
                            <span>
                                {album.track_count} canciones
                            </span>
                        )}

                        {album.genres
                            ?.slice(0, 3)
                            .map((genre) => (
                                <span key={genre}>{genre}</span>
                            ))}
                    </div>

                    {album.spotify_url && (
                        <a
                            href={album.spotify_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <span>▶</span>
                            Continuar en Spotify
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/review/${userAlbum.id}`)
                        }
                    >
                        Terminar y valorar
                        <small>Guardar en tu Biblioteca</small>
                    </button>

                    <div className="listening-album__secondary-actions">
                        <button
                            type="button"
                            onClick={handlePauseListening}
                            disabled={Boolean(actionLoading)}
                        >
                            {actionLoading === "pause"
                                ? "Pausando..."
                                : "Pausar escucha"}
                        </button>

                        <button
                            type="button"
                            className="listening-album__abandon"
                            onClick={() => setShowAbandonDialog(true)}
                            disabled={Boolean(actionLoading)}
                        >
                            Dejar este disco
                        </button>
                    </div>
                </div>
            </article>

            <section className="listening-ranking">

                <header>
                    <h2>
                        🎧 Tus sensaciones
                    </h2>

                    <p>
                        Ordena las canciones según
                        más te estén gustando.
                    </p>

                    <div
                        className={`listening-ranking__save-status listening-ranking__save-status--${rankingStatus}`}
                        aria-live="polite"
                    >
                        {rankingStatus === "saving" && (
                            <>
                                <span />
                                Guardando orden...
                            </>
                        )}

                        {rankingStatus === "saved" && (
                            <>✓ Orden guardado</>
                        )}

                        {rankingStatus === "error" && (
                            <>
                                No se ha podido guardar.
                                Mueve una canción para volver a intentarlo.
                            </>
                        )}

                        {rankingStatus === "idle" &&
                            tracks.length > 0 && (
                                <>
                                    Los cambios se guardan
                                    automáticamente.
                                </>
                            )}
                    </div>
                </header>

                {tracksLoading ? (
                    <p className="listening-ranking__empty">
                        Cargando canciones...
                    </p>
                ) : tracks.length === 0 ? (
                    <p className="listening-ranking__empty">
                        Todavía no tenemos el listado de canciones
                        de este disco.
                    </p>
                ) : (
                    <ul className="listening-ranking__list">
                        {tracks.map((track, index) => {
                            const isFirst = index === 0;
                            const isLast =
                                index === tracks.length - 1;

                            let positionLabel =
                                index + 1;

                            if (index === 0) {
                                positionLabel = "🥇";
                            } else if (index === 1) {
                                positionLabel = "🥈";
                            } else if (index === 2) {
                                positionLabel = "🥉";
                            }

                            return (
                                <li
                                    key={track.id}
                                    className="listening-ranking__track"
                                >
                                    <span
                                        className="listening-ranking__position"
                                        aria-label={`Posición ${index + 1}`}
                                    >
                                        {positionLabel}
                                    </span>

                                    <div className="listening-ranking__track-info">
                                        <strong>
                                            {track.title}
                                        </strong>

                                        {tracks.length > 1 && (
                                            <small>
                                                Pista original{" "}
                                                {track.track_number}
                                                {track.disc_number > 1
                                                    ? ` · Disco ${track.disc_number}`
                                                    : ""}
                                            </small>
                                        )}
                                    </div>

                                    <div className="listening-ranking__actions">
                                        {!isFirst && (
                                            <button
                                                type="button"
                                                className="listening-ranking__favorite-button"
                                                onClick={() =>
                                                    moveTrackToTop(index)
                                                }
                                                aria-label={`Colocar ${track.title} en primera posición`}
                                                title="Me encanta: enviar al número 1"
                                            >
                                                ♥
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                moveTrackUp(index)
                                            }
                                            disabled={isFirst}
                                            aria-label={`Subir ${track.title}`}
                                            title="Subir"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                moveTrackDown(index)
                                            }
                                            disabled={isLast}
                                            aria-label={`Bajar ${track.title}`}
                                            title="Bajar"
                                        >
                                            ↓
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {showAbandonDialog && (
                <div
                    className="listening-dialog-backdrop"
                    onClick={() => setShowAbandonDialog(false)}
                >
                    <article
                        className="listening-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="abandon-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <span>⏹️</span>

                        <h2 id="abandon-title">
                            ¿Dejar este disco?
                        </h2>

                        <p>
                            <strong>{userAlbum.album.title}</strong> se
                            guardará en “No terminados”, pero no tendrás
                            que valorarlo y no contará para tu racha.
                        </p>

                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowAbandonDialog(false)
                                }
                            >
                                Seguir escuchando
                            </button>

                            <button
                                type="button"
                                className="listening-dialog__confirm"
                                onClick={handleAbandonListening}
                                disabled={actionLoading === "abandon"}
                            >
                                {actionLoading === "abandon"
                                    ? "Guardando..."
                                    : "Sí, dejarlo"}
                            </button>
                        </div>
                    </article>
                </div>
            )}
        </section>
    );
}

export default Listening;