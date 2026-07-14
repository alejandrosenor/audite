import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getUserAlbumsByStatus,
    removePendingAlbum,
    syncAlbumTracks,
    updateUserAlbumStatus,
} from "../services/albums";
import AddAlbumModal from "../components/AddAlbumModal";
import "./ToListen.css";

function ToListen() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startingId, setStartingId] = useState(null);
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [albumToDelete, setAlbumToDelete] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const loadAlbums = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const pendingAlbums = await getUserAlbumsByStatus({
                userId: user.id,
                statuses: ["to_listen", "paused"],
            });

            setAlbums(pendingAlbums);
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido cargar tus discos pendientes.",
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadAlbums();
    }, [loadAlbums]);

    async function handleStartListening(userAlbum) {
        if (startingId) {
            return;
        }

        setStartingId(userAlbum.id);
        setMessage("");

        try {
            await updateUserAlbumStatus({
                userAlbumId: userAlbum.id,
                userId: user.id,
                status: "listening",
            });

            try {
                await syncAlbumTracks(
                    userAlbum.album.id,
                );
            } catch (syncError) {
                /*
                 * No impedimos comenzar la escucha.
                 * Volveremos a intentarlo en la valoración.
                 */
                console.error(
                    "No se pudieron sincronizar las canciones:",
                    syncError,
                );
            }

            window.dispatchEvent(
                new CustomEvent("audite:listening-changed"),
            );

            navigate("/listening");
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido comenzar esta escucha.",
            );
            setStartingId(null);
        }
    }

    if (loading) {
        return (
            <section className="to-listen-page">
                <p className="to-listen-page__eyebrow">
                    TU LISTA
                </p>

                <h1>Cargando pendientes...</h1>
            </section>
        );
    }

    async function handleDeleteAlbum() {
        if (!albumToDelete || deletingId) {
            return;
        }

        setDeletingId(albumToDelete.id);
        setMessage("");

        try {
            await removePendingAlbum({
                userAlbumId: albumToDelete.id,
                userId: user.id,
            });

            setAlbums((currentAlbums) =>
                currentAlbums.filter(
                    (item) => item.id !== albumToDelete.id,
                ),
            );

            setAlbumToDelete(null);
            setMessage("Disco eliminado de tus pendientes.");
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido eliminar el disco de pendientes.",
            );
        } finally {
            setDeletingId(null);
        }
    }

    function handleManualAlbumAdded(userAlbum) {
        setAlbums((currentAlbums) => {
            const alreadyExists = currentAlbums.some(
                (item) => item.id === userAlbum.id,
            );

            if (alreadyExists) {
                return currentAlbums.map((item) =>
                    item.id === userAlbum.id
                        ? userAlbum
                        : item,
                );
            }

            return [userAlbum, ...currentAlbums];
        });

        setMessage(
            `${userAlbum.album.title} se ha añadido a tus pendientes.`,
        );
    }

    return (
        <section className="to-listen-page">
            <header className="to-listen-page__header">
                <div>
                    <p className="to-listen-page__eyebrow">
                        TU LISTA
                    </p>

                    <h1>Por escuchar</h1>

                    <p>
                        Todos los discos que aceptaste y todavía
                        están esperando su momento.
                    </p>
                </div>

                <div className="to-listen-page__header-actions">
                    <div className="to-listen-page__counter">
                        <strong>{albums.length}</strong>

                        <span>
                            {albums.length === 1
                                ? "disco pendiente"
                                : "discos pendientes"}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="to-listen-page__add"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <span>＋</span>
                        Añadir disco manualmente
                    </button>
                </div>
            </header>

            {message && (
                <p className="to-listen-page__message">
                    {message}
                </p>
            )}

            {albums.length === 0 ? (
                <article className="to-listen-empty">
                    <div className="to-listen-empty__icon">
                        💿
                    </div>

                    <h2>No tienes discos pendientes</h2>

                    <p>
                        Descubre un álbum nuevo y pulsa
                        “Quiero escucharlo” para guardarlo aquí.
                    </p>

                    <Link to="/discover">
                        <span>✦</span>
                        Descubrir un disco
                    </Link>
                </article>
            ) : (
                <div className="to-listen-grid">
                    {albums.map((userAlbum) => {
                        const album = userAlbum.album;

                        return (
                            <article
                                className="pending-album-card fade-up"
                                key={userAlbum.id}
                            >
                                <div className="pending-album-card__cover">
                                    {album.cover_url ? (
                                        <img
                                            src={album.cover_url}
                                            alt={`Portada de ${album.title}`}
                                        />
                                    ) : (
                                        <div className="pending-album-card__placeholder">
                                            💿
                                        </div>
                                    )}

                                    <span className="pending-album-card__status">
                                        {userAlbum.status === "paused"
                                            ? "Escucha pausada"
                                            : "Pendiente"}
                                    </span>

                                    <button
                                        type="button"
                                        className="pending-album-card__remove"
                                        onClick={() => setAlbumToDelete(userAlbum)}
                                        aria-label={`Eliminar ${album.title} de pendientes`}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="pending-album-card__content">
                                    <p className="pending-album-card__eyebrow">
                                        PRÓXIMA ESCUCHA
                                    </p>

                                    <h2>{album.title}</h2>
                                    <h3>{album.artist_name}</h3>

                                    <div className="pending-album-card__metadata">
                                        {album.release_year && (
                                            <span>{album.release_year}</span>
                                        )}

                                        {album.track_count && (
                                            <span>
                                                {album.track_count} canciones
                                            </span>
                                        )}

                                        {album.genres
                                            ?.slice(0, 2)
                                            .map((genre) => (
                                                <span key={genre}>
                                                    {genre}
                                                </span>
                                            ))}
                                    </div>

                                    <div className="pending-album-card__actions">
                                        {album.spotify_url && (
                                            <a
                                                href={album.spotify_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="pending-album-card__spotify"
                                            >
                                                <span>▶</span>
                                                Abrir en Spotify
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleStartListening(userAlbum)
                                            }
                                            disabled={startingId !== null}
                                        >
                                            {startingId === userAlbum.id
                                                ? "Empezando..."
                                                : userAlbum.status === "paused"
                                                    ? "Continuar escuchando"
                                                    : "Lo estoy escuchando"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {albumToDelete && (
                <div
                    className="pending-dialog-backdrop"
                    role="presentation"
                    onClick={() => setAlbumToDelete(null)}
                >
                    <article
                        className="pending-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-album-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <span className="pending-dialog__icon">🗑️</span>

                        <h2 id="delete-album-title">
                            ¿Eliminar de pendientes?
                        </h2>

                        <p>
                            <strong>{albumToDelete.album.title}</strong> dejará
                            de aparecer en tu lista. Podrás añadirlo de nuevo
                            más adelante.
                        </p>

                        <div className="pending-dialog__actions">
                            <button
                                type="button"
                                onClick={() => setAlbumToDelete(null)}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="pending-dialog__delete"
                                onClick={handleDeleteAlbum}
                                disabled={deletingId !== null}
                            >
                                {deletingId
                                    ? "Eliminando..."
                                    : "Sí, eliminar"}
                            </button>
                        </div>
                    </article>
                </div>
            )}

            <AddAlbumModal
                isOpen={addModalOpen}
                userId={user.id}
                onClose={() => setAddModalOpen(false)}
                onAlbumAdded={handleManualAlbumAdded}
            />
        </section>
    );
}

export default ToListen;