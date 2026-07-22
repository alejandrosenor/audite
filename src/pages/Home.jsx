import { useCallback, useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomeData } from "../services/home";
import DailyTrackCard from "../components/DailyTrackCard";
import { getDailyTrack } from "../services/dailyTrack";
import MusicEphemerisCard from "../components/MusicEphemerisCard";
import { getDailyMusicEphemeris } from "../services/musicEphemeris";
import GenreOfTheDayCard from "../components/GenreOfTheDayCard";
import { getGenreOfTheDay } from "../data/genreOfTheDay";
import AlbumRecommendations from "../components/AlbumRecommendations";
import DailyChallengesCard from "../components/DailyChallengesCard";
import DailyMusicQuote from "../components/DailyMusicQuote";
import "./Home.css";

function Home() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [homeData, setHomeData] = useState({
        featuredUserAlbum: null,
        featuredType: "empty",
        completedAlbums: 0,
        averageRating: null,
        favoriteTracks: 0,
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [dailyTrack, setDailyTrack] =
        useState(null);
    const [dailyTrackLoading, setDailyTrackLoading] =
        useState(true);
    const [dailyTrackMessage, setDailyTrackMessage] =
        useState("");
    const [
        musicEphemeris,
        setMusicEphemeris,
    ] = useState(null);
    const [
        musicEphemerisLoading,
        setMusicEphemerisLoading,
    ] = useState(true);
    const [
        musicEphemerisMessage,
        setMusicEphemerisMessage,
    ] = useState("");

    const username =
        profile?.username ?? "Usuario";

    const currentStreak =
        profile?.current_streak ?? 0;

    const bestStreak =
        profile?.best_streak ?? 0;

    const formattedDate =
        new Intl.DateTimeFormat("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }).format(new Date());

    const loadHome = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        setLoading(true);

        try {
            const data = await getHomeData(user.id);
            setHomeData(data);
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido actualizar tu inicio.",
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const genreOfTheDay = getGenreOfTheDay();

    useEffect(() => {
        loadHome();
    }, [loadHome, location.key]);

    useEffect(() => {
        function handleMusicChanged() {
            loadHome();
        }

        window.addEventListener(
            "audite:music-changed",
            handleMusicChanged,
        );

        window.addEventListener(
            "audite:listening-changed",
            handleMusicChanged,
        );

        return () => {
            window.removeEventListener(
                "audite:music-changed",
                handleMusicChanged,
            );

            window.removeEventListener(
                "audite:listening-changed",
                handleMusicChanged,
            );
        };
    }, [loadHome]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadDailyTrack() {
            setDailyTrackLoading(true);
            setDailyTrackMessage("");

            try {
                const track =
                    await getDailyTrack();

                if (!cancelled) {
                    setDailyTrack(track);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setDailyTrackMessage(
                        error.message ||
                        "No hemos podido preparar la canción del día.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setDailyTrackLoading(false);
                }
            }
        }

        loadDailyTrack();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadMusicEphemeris() {
            setMusicEphemerisLoading(true);
            setMusicEphemerisMessage("");

            try {
                const ephemeris =
                    await getDailyMusicEphemeris();

                if (!cancelled) {
                    setMusicEphemeris(ephemeris);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMusicEphemerisMessage(
                        error.message ||
                        "No hemos podido cargar la efeméride musical.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setMusicEphemerisLoading(false);
                }
            }
        }

        loadMusicEphemeris();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    function handlePrimaryAction() {
        const { featuredType, featuredUserAlbum } =
            homeData;

        if (featuredType === "listening") {
            navigate("/listening");
            return;
        }

        if (featuredType === "generated") {
            navigate("/discover");
            return;
        }

        if (featuredType === "pending") {
            navigate("/to-listen");
            return;
        }

        navigate("/discover", {
            state: {
                autoGenerate: true,
            },
        });
    }

    function getFeaturedContent() {
        const { featuredType, featuredUserAlbum } =
            homeData;

        if (!featuredUserAlbum) {
            return {
                eyebrow: "TU DISCO DEL DÍA",
                title:
                    "Hoy todavía no has descubierto ningún disco",
                description:
                    "Déjate sorprender por un álbum aleatorio o elige un género para afinar la búsqueda.",
                primaryLabel: "Sorpréndeme",
                secondaryLabel: "Elegir género",
            };
        }

        if (featuredType === "listening") {
            return {
                eyebrow: "ESCUCHANDO AHORA",
                title: featuredUserAlbum.album.title,
                description: featuredUserAlbum.album.artist_name,
                primaryLabel: "Continuar escucha",
                secondaryLabel: "Ver en Spotify",
            };
        }

        if (featuredType === "generated") {
            return {
                eyebrow: "ESPERANDO TU DECISIÓN",
                title: featuredUserAlbum.album.title,
                description: featuredUserAlbum.album.artist_name,
                primaryLabel: "Ver disco descubierto",
                secondaryLabel: "Abrir en Spotify",
            };
        }

        return {
            eyebrow: "PRÓXIMO EN TU LISTA",
            title: featuredUserAlbum.album.title,
            description: featuredUserAlbum.album.artist_name,
            primaryLabel: "Ver pendientes",
            secondaryLabel: "Abrir en Spotify",
        };
    }

    const featuredContent = getFeaturedContent();
    const featuredAlbum =
        homeData.featuredUserAlbum?.album ?? null;

    function handleSecondaryAction() {
        if (!featuredAlbum) {
            navigate("/discover", {
                state: {
                    openGenreSelector: true,
                },
            });
            return;
        }

        if (featuredAlbum.spotify_url) {
            window.open(
                featuredAlbum.spotify_url,
                "_blank",
                "noopener,noreferrer",
            );
        }
    }

    const currentHour = new Date().getHours();

    let greeting = "Buenos días";

    if (currentHour >= 14 && currentHour < 21) {
        greeting = "Buenas tardes";
    } else if (currentHour >= 21 || currentHour < 6) {
        greeting = "Buenas noches";
    }

    return (
        <section className="home">
            <header className="home__header fade-up">
                <div>
                    <p className="home__eyebrow">
                        {formattedDate}
                    </p>

                    <h1>
                        {greeting}, {username}.
                    </h1>

                    <p className="home__subtitle">
                        Tu próxima obsesión musical puede estar
                        a un disco de distancia.
                    </p>
                </div>

                <section className="home-streak-card">
                    <div className="home-streak-card__glow" />

                    <div className="home-streak-card__icon">
                        🔥
                    </div>

                    <div className="home-streak-card__content">
                        <span>RACHA ACTUAL</span>

                        <strong>
                            {profile?.current_streak ?? 0}
                            <small>
                                {currentStreak === 1
                                    ? " día"
                                    : " días"}
                            </small>
                        </strong>

                        <p>
                            Cada día cuenta. No dejes que
                            se apague.
                        </p>
                    </div>

                    <div className="home-streak-card__badge">
                        EN LLAMAS
                    </div>
                </section>
            </header>

            <section className="home-tutorial-card">
                <div className="home-tutorial-card__icon">
                    ?
                </div>

                <div>
                    <p>NUEVO EN AUDITE</p>

                    <h2>¿Cómo funciona todo esto?</h2>

                    <span>
                        Conoce cada pantalla, función y detalle
                        de la aplicación.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/tutorial")}
                >
                    Ver guía completa
                    <span>→</span>
                </button>
            </section>

            {message && (
                <p className="home__message">
                    {message}
                </p>
            )}

            <article className="daily-album fade-up">
                <div className="daily-album__glow" />

                <div className="daily-album__cover">
                    {featuredAlbum?.cover_url ? (
                        <img
                            className="daily-album__cover-image"
                            src={featuredAlbum.cover_url}
                            alt={`Portada de ${featuredAlbum.title}`}
                        />
                    ) : (
                        <div className="daily-album__cover-placeholder">
                            <span>33</span>
                            <small>RPM</small>
                        </div>
                    )}
                </div>

                <div className="daily-album__content">
                    <p className="daily-album__label">
                        {featuredContent.eyebrow}
                    </p>

                    <h2>
                        {loading
                            ? "Actualizando tu historia musical..."
                            : featuredContent.title}
                    </h2>

                    {!loading && (
                        <p>
                            {featuredContent.description}
                        </p>
                    )}

                    {featuredAlbum && (
                        <div className="daily-album__metadata">
                            {featuredAlbum.release_year && (
                                <span>
                                    {featuredAlbum.release_year}
                                </span>
                            )}

                            {featuredAlbum.track_count && (
                                <span>
                                    {featuredAlbum.track_count} canciones
                                </span>
                            )}

                            {featuredAlbum.genres
                                ?.slice(0, 2)
                                .map((genre) => (
                                    <span key={genre}>
                                        {genre}
                                    </span>
                                ))}
                        </div>
                    )}

                    <div className="daily-album__actions">
                        <button
                            type="button"
                            className="button button--primary"
                            onClick={handlePrimaryAction}
                            disabled={loading}
                        >
                            <span>✦</span>
                            {featuredContent.primaryLabel}
                        </button>

                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={handleSecondaryAction}
                            disabled={
                                loading ||
                                (featuredAlbum &&
                                    !featuredAlbum.spotify_url)
                            }
                        >
                            {featuredContent.secondaryLabel}
                        </button>
                    </div>
                </div>
            </article>

            <DailyChallengesCard />

            <section className="home-section">
                <header className="home-section__header">
                    <div>
                        <p>PON A PRUEBA TU MEMORIA MUSICAL</p>

                        <h2>¿Quién dijo esto?</h2>
                    </div>

                    <span>
                        Una nueva cita cada 24 horas
                    </span>
                </header>

                <DailyMusicQuote />
            </section>

            <section className="home-section">
                <header className="home-section__header">
                    <div>
                        <p>AUDITE EMPIEZA A CONOCERTE</p>
                        <h2>Recomendado para ti</h2>
                    </div>

                    <span>
                        Basado en tus mejores valoraciones
                    </span>
                </header>

                <AlbumRecommendations
                    userId={user?.id}
                />
            </section>

            <section className="home-section">
                <header className="home-section__header">
                    <div>
                        <p>UNA PARADA RÁPIDA</p>
                        <h2>La canción del día</h2>
                    </div>

                    <span>Una nueva cada 24 horas</span>
                </header>

                <DailyTrackCard
                    track={dailyTrack}
                    loading={dailyTrackLoading}
                    message={dailyTrackMessage}
                />
            </section>

            <section className="home-section">
                <header className="home-section__header">
                    <div>
                        <p>AMPLÍA TU MAPA MUSICAL</p>
                        <h2>Género del día</h2>
                    </div>

                    <span>
                        Un estilo distinto cada 24 horas
                    </span>
                </header>

                <GenreOfTheDayCard
                    genre={genreOfTheDay}
                    userId={user?.id}
                />
            </section>

            <section className="home-section">
                <header className="home-section__header">
                    <div>
                        <p>LA HISTORIA TAMBIÉN SUENA</p>
                        <h2>Efeméride musical</h2>
                    </div>

                    <span>Un recuerdo distinto cada día</span>
                </header>

                <MusicEphemerisCard
                    ephemeris={musicEphemeris}
                    loading={musicEphemerisLoading}
                    message={musicEphemerisMessage}
                />
            </section>
        </section>
    );
}

export default Home;