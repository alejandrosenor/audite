import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getUserAlbumsByStatus,
    updateUserAlbumStatus,
} from "../services/albums";
import { abandonAlbumWithoutReview } from "../services/reviews";
import "./Listening.css";

function Listening() {
    const { user, refreshProfile } = useAuth();

    const [userAlbum, setUserAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [showAbandonDialog, setShowAbandonDialog] = useState(false);

    const navigate = useNavigate();

    const loadListeningAlbum = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        setLoading(true);

        try {
            const albums = await getUserAlbumsByStatus({
                userId: user.id,
                statuses: ["listening"],
            });

            setUserAlbum(albums[0] ?? null);
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido recuperar tu escucha.",
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadListeningAlbum();
    }, [loadListeningAlbum]);

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