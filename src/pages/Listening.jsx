import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserAlbumsByStatus } from "../services/albums";
import { useNavigate } from "react-router-dom";
import "./Listening.css";

function Listening() {
    const { user } = useAuth();

    const [userAlbum, setUserAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

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
                </div>
            </article>
        </section>
    );
}

export default Listening;