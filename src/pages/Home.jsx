import { useCallback, useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomeData } from "../services/home";
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

                <div className="streak-card">
                    <span className="streak-card__icon">
                        🔥
                    </span>

                    <div>
                        <strong>
                            {currentStreak}{" "}
                            {currentStreak === 1
                                ? "día"
                                : "días"}
                        </strong>

                        <span>Racha actual</span>
                    </div>
                </div>
            </header>

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

            <div className="home__stats fade-up">
                <article className="stat-card">
                    <span className="stat-card__icon">
                        💿
                    </span>

                    <strong>
                        {homeData.completedAlbums}
                    </strong>

                    <p>Discos escuchados</p>
                </article>

                <article className="stat-card">
                    <span className="stat-card__icon">
                        ★
                    </span>

                    <strong>
                        {homeData.averageRating === null
                            ? "—"
                            : homeData.averageRating
                                .toFixed(1)
                                .replace(".", ",")}
                    </strong>

                    <p>Nota media</p>
                </article>

                <article className="stat-card">
                    <span className="stat-card__icon">
                        ♪
                    </span>

                    <strong>
                        {homeData.favoriteTracks}
                    </strong>

                    <p>Canciones top</p>
                </article>

                <article className="stat-card">
                    <span className="stat-card__icon">
                        ♛
                    </span>

                    <strong>{bestStreak}</strong>

                    <p>Mejor racha</p>
                </article>
            </div>
        </section>
    );
}

export default Home;