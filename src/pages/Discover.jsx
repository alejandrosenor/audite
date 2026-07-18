import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    discoverAlbum,
    getAlbumTracks,
    getCurrentGeneratedAlbum,
    updateUserAlbumStatus,
} from "../services/albums";
import GenreSelectorModal from "../components/GenreSelectorModal";
import SpanishDiscoveryModal from "../components/SpanishDiscoveryModal";
import {
    discoverSpanishAlbum,
} from "../services/spanishDiscovery";
import {
    updateDailyChallenges,
} from "../services/dailyChallenges";
import WorldMusicDiscovery from "../components/WorldMusicDiscovery";
import "./Discover.css";

function formatDuration(durationMs) {
    if (!durationMs) {
        return "—";
    }

    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
}

function Discover() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [userAlbum, setUserAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");
    const [genreModalOpen, setGenreModalOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState("");
    const [
        spanishModalOpen,
        setSpanishModalOpen,
    ] = useState(false);
    const [
        generatingSpanish,
        setGeneratingSpanish,
    ] = useState(false);
    const [
        worldMusicOpen,
        setWorldMusicOpen,
    ] = useState(false);

    async function loadTracks(albumId) {
        if (!albumId) {
            setTracks([]);
            return;
        }

        try {
            const albumTracks = await getAlbumTracks(albumId);
            setTracks(albumTracks);
        } catch (error) {
            console.error("No se pudieron cargar las canciones:", error);
            setTracks([]);
        }
    }

    async function handleGenerateSpanishAlbum({
        region,
        style,
    }) {
        if (
            !user?.id ||
            generating ||
            generatingSpanish
        ) {
            return;
        }

        setGeneratingSpanish(true);
        setMessage("");
        setTracks([]);

        try {
            const result =
                await discoverSpanishAlbum({
                    region,
                    style,
                });

            const generatedUserAlbum =
                result.userAlbum;

            setUserAlbum(
                generatedUserAlbum,
            );

            try {
                await updateDailyChallenges({
                    eventType:
                        "discovery_generated",

                    eventId:
                        `spanish-generated:${generatedUserAlbum.id}`,

                    metadata: {
                        language: "es",

                        country:
                            generatedUserAlbum
                                .album
                                ?.country ??
                            result.context
                                ?.country ??
                            null,

                        genres:
                            generatedUserAlbum
                                .album
                                ?.genres ??
                            [],

                        source: "spanish",
                    },
                });
            } catch (challengeError) {
                console.error(
                    "No se pudo actualizar el reto de música en español:",
                    challengeError,
                );
            }

            if (
                generatedUserAlbum?.album?.id
            ) {
                await loadTracks(
                    generatedUserAlbum.album.id,
                );
            }

            setSpanishModalOpen(false);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error(error);

            setMessage(
                error.message ||
                "No hemos podido descubrir un disco en español.",
            );
        } finally {
            setGeneratingSpanish(false);
        }
    }

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadCurrentAlbum() {
            try {
                const currentAlbum = await getCurrentGeneratedAlbum(user.id);

                if (cancelled) {
                    return;
                }

                setUserAlbum(currentAlbum);

                if (currentAlbum?.album?.id) {
                    const albumTracks = await getAlbumTracks(
                        currentAlbum.album.id,
                    );

                    if (!cancelled) {
                        setTracks(albumTracks);
                    }
                } else {
                    setTracks([]);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMessage(
                        "No hemos podido recuperar tu disco actual.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadCurrentAlbum();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!location.state?.openGenreSelector) {
            return;
        }

        setGenreModalOpen(true);

        navigate("/discover", {
            replace: true,
            state: {},
        });
    }, [
        location.state?.openGenreSelector,
        navigate,
    ]);

    useEffect(() => {
        if (
            location.state?.selectedGenre ||
            !location.state?.autoGenerate ||
            loading ||
            generating ||
            userAlbum
        ) {
            return;
        }

        navigate("/discover", {
            replace: true,
            state: {},
        });

        handleGenerateAlbum("");
    }, [
        location.state?.autoGenerate,
        location.state?.selectedGenre,
        loading,
        generating,
        userAlbum,
        navigate,
    ]);

    async function handleGenerateAlbum(
        genre = selectedGenre,
    ) {
        if (!user?.id || generating) {
            return;
        }

        setGenerating(true);
        setMessage("");
        setTracks([]);

        try {
            const generatedAlbum =
                await discoverAlbum({
                    genre,
                });

            setUserAlbum(generatedAlbum);

            try {
                await updateDailyChallenges({
                    eventType:
                        genre
                            ? "genre_discovery_generated"
                            : "discovery_generated",

                    eventId:
                        genre
                            ? `genre-generated:${generatedAlbum.id}`
                            : `discovery-generated:${generatedAlbum.id}`,

                    metadata: {
                        selectedGenre:
                            genre || null,

                        spotifyId:
                            generatedAlbum
                                .album
                                ?.spotify_id ??
                            null,

                        genres:
                            generatedAlbum
                                .album
                                ?.genres ??
                            [],

                        source:
                            genre
                                ? "genre_discovery"
                                : "discovery",
                    },
                });
            } catch (challengeError) {
                console.error(
                    "No se pudo actualizar el reto de descubrimiento:",
                    challengeError,
                );
            }

            await loadTracks(
                generatedAlbum.album.id,
            );

            setGenreModalOpen(false);
        } catch (error) {
            console.error(error);

            setMessage(
                error.message ||
                "No hemos podido generar un disco.",
            );
        } finally {
            setGenerating(false);
        }
    }

    async function handleDecision(status) {
        if (!userAlbum || !user?.id || updating) {
            return;
        }

        setUpdating(true);
        setMessage("");

        try {
            await updateUserAlbumStatus({
                userAlbumId: userAlbum.id,
                userId: user.id,
                status,
            });

            try {
                if (status === "to_listen") {
                    await updateDailyChallenges({
                        eventType:
                            "recommendation_accepted",

                        eventId:
                            `discover-accepted:${userAlbum.id}`,

                        metadata: {
                            spotifyId:
                                userAlbum.album
                                    ?.spotify_id ??
                                null,

                            artistName:
                                userAlbum.album
                                    ?.artist_name ??
                                null,

                            genres:
                                userAlbum.album
                                    ?.genres ??
                                [],

                            source:
                                userAlbum.album
                                    ?.discovery_source ??
                                "discovery",
                        },
                    });
                }

                if (status === "known") {
                    await updateDailyChallenges({
                        eventType:
                            "recommendation_known",

                        eventId:
                            `discover-known:${userAlbum.id}`,

                        metadata: {
                            spotifyId:
                                userAlbum.album
                                    ?.spotify_id ??
                                null,

                            artistName:
                                userAlbum.album
                                    ?.artist_name ??
                                null,
                        },
                    });
                }
            } catch (challengeError) {
                console.error(
                    "No se pudo actualizar el reto de decisión:",
                    challengeError,
                );
            }

            setUserAlbum(null);
            setTracks([]);

            if (status === "to_listen") {
                setMessage(
                    "Disco añadido a tu lista para escuchar.",
                );
            } else if (status === "known") {
                setMessage(
                    "Marcado como un disco que ya conocías.",
                );
            } else if (status === "rejected") {
                setMessage("Disco enviado a rechazados.");
            }
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido guardar tu decisión.",
            );
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <section className="discover-page">
                <p className="discover-page__eyebrow">
                    DESCUBRIR
                </p>

                <h1>Buscando tu disco...</h1>
            </section>
        );
    }

    return (
        <section className="discover-page">
            <header className="discover-page__header">
                <p className="discover-page__eyebrow">
                    DESCUBRIR
                </p>

                <h1>Tu próxima escucha empieza aquí.</h1>

                <p>
                    Déjate sorprender. Puede que estés a un clic
                    de encontrar uno de tus nuevos discos favoritos.
                </p>
            </header>

            {!userAlbum ? (
                <article className="discover-empty">
                    <div className="discover-empty__record">
                        <span>A</span>
                    </div>

                    <h2>¿Preparado para descubrir algo nuevo?</h2>

                    <p>
                        Generaremos un álbum que todavía no haya
                        aparecido en tu historia musical.
                    </p>

                    <button
                        type="button"
                        className="discover-empty__album-button"
                        onClick={() => handleGenerateAlbum("")}
                        disabled={generating}
                    >
                        <span>✦</span>

                        {generating
                            ? "Buscando disco..."
                            : "Sorpréndeme"}
                    </button>
                    <button
                        type="button"
                        className="discover-empty__genre-button"
                        onClick={() => setGenreModalOpen(true)}
                        disabled={generating}
                    >
                        <span>⌘</span>
                        Elegir género
                    </button>

                    <button
                        type="button"
                        className="discover-spanish-button"
                        onClick={() =>
                            setSpanishModalOpen(true)
                        }
                        disabled={
                            generating ||
                            generatingSpanish
                        }
                    >
                        <span className="discover-spanish-button__icon">
                            Ñ
                        </span>

                        <span>
                            <strong>
                                Música en español
                            </strong>

                            <small>
                                España, Latinoamérica y todos
                                sus estilos.
                            </small>
                        </span>

                        <i>→</i>
                    </button>
                </article>
            ) : (
                <article className="discovered-album fade-up">
                    <div className="discovered-album__cover-wrapper">
                        {userAlbum.album.cover_url ? (
                            <img
                                className="discovered-album__cover"
                                src={userAlbum.album.cover_url}
                                alt={`Portada de ${userAlbum.album.title}`}
                            />
                        ) : (
                            <div className="discovered-album__cover discovered-album__placeholder">
                                💿
                            </div>
                        )}
                    </div>

                    <div className="discovered-album__information">
                        <p className="discovered-album__label">
                            TU DISCO DESCUBIERTO
                        </p>

                        <h2>{userAlbum.album.title}</h2>
                        <h3>{userAlbum.album.artist_name}</h3>

                        <div className="discovered-album__metadata">
                            {userAlbum.album.release_year && (
                                <span>
                                    {userAlbum.album.release_year}
                                </span>
                            )}

                            {userAlbum.album.track_count && (
                                <span>
                                    {userAlbum.album.track_count} canciones
                                </span>
                            )}

                            {userAlbum.album.genres
                                ?.slice(0, 3)
                                .map((genre) => (
                                    <span key={genre}>{genre}</span>
                                ))}
                        </div>

                        {userAlbum.album.spotify_url && (
                            <a
                                className="discovered-album__spotify"
                                href={userAlbum.album.spotify_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span>▶</span>
                                Abrir en Spotify
                            </a>
                        )}

                        {tracks.length > 0 && (
                            <section className="album-tracklist">
                                <div className="album-tracklist__header">
                                    <h3>Canciones</h3>
                                    <span>{tracks.length}</span>
                                </div>

                                <ol>
                                    {tracks.map((track) => (
                                        <li key={track.id}>
                                            <span className="album-tracklist__number">
                                                {track.track_number}
                                            </span>

                                            <div>
                                                <strong>{track.title}</strong>

                                                <small>
                                                    {formatDuration(
                                                        track.duration_ms,
                                                    )}
                                                </small>
                                            </div>

                                            {track.spotify_url && (
                                                <a
                                                    href={track.spotify_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Abrir ${track.title} en Spotify`}
                                                >
                                                    ▶
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}

                        <div className="discovered-album__actions">
                            <button
                                type="button"
                                className="album-action album-action--accept"
                                onClick={() =>
                                    handleDecision("to_listen")
                                }
                                disabled={updating}
                            >
                                Quiero escucharlo
                            </button>

                            <button
                                type="button"
                                className="album-action album-action--known"
                                onClick={() =>
                                    handleDecision("known")
                                }
                                disabled={updating}
                            >
                                Ya lo conozco
                            </button>

                            <button
                                type="button"
                                className="album-action album-action--reject"
                                onClick={() =>
                                    handleDecision("rejected")
                                }
                                disabled={updating}
                            >
                                Prefiero otro
                            </button>
                        </div>
                    </div>
                </article>
            )}

            {message && (
                <p className="discover-page__message">
                    {message}
                </p>
            )}

            <GenreSelectorModal
                isOpen={genreModalOpen}
                selectedGenre={selectedGenre}
                onClose={() => setGenreModalOpen(false)}
                onSelect={(genre) => {
                    setSelectedGenre(genre);
                    handleGenerateAlbum(genre);
                }}
            />

            <SpanishDiscoveryModal
                open={spanishModalOpen}
                generating={generatingSpanish}
                onClose={() => {
                    if (!generatingSpanish) {
                        setSpanishModalOpen(false);
                    }
                }}
                onGenerate={
                    handleGenerateSpanishAlbum
                }
            />

            <button
                type="button"
                className="discover-world-card"
                onClick={() =>
                    setWorldMusicOpen(true)
                }
            >
                <span>🌍</span>

                <div>
                    <p>NUEVO VIAJE</p>

                    <h3>
                        Músicas del Mundo
                    </h3>

                    <small>
                        Elige un país y descubre
                        un disco nacido allí.
                    </small>
                </div>

                <b>→</b>
            </button>

            {worldMusicOpen && (
                <div className="world-music-overlay">
                    <WorldMusicDiscovery
                        onClose={() =>
                            setWorldMusicOpen(false)
                        }
                        onGenerated={(result) => {
                            setWorldMusicOpen(false);

                            setUserAlbum(
                                result.userAlbum,
                            );

                            setMessage(
                                result.context
                                    ?.message ?? "",
                            );
                        }}
                    />
                </div>
            )}
        </section>
    );
}

export default Discover;