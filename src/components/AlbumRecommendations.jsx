import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Link } from "react-router-dom";
import {
    acceptRecommendation,
    dismissRecommendation,
    getAlbumRecommendations,
    markRecommendationKnown,
} from "../services/recommendations";
import "./AlbumRecommendations.css";

function AlbumRecommendations({ userId }) {
    const carouselRef = useRef(null);

    const [seed, setSeed] = useState(null);
    const [recommendations, setRecommendations] =
        useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState("");
    const [message, setMessage] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    async function loadRecommendations() {
        if (!userId) {
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const result =
                await getAlbumRecommendations();

            setSeed(result.seed);
            setRecommendations(
                result.recommendations ?? [],
            );
            setActiveIndex(0);

            if (!result.recommendations?.length) {
                setMessage(
                    result.reason ||
                    "Todavía no tenemos suficientes pistas sobre tus gustos.",
                );
            }
        } catch (error) {
            console.error(error);

            setMessage(
                error.message ||
                "No hemos podido preparar tus recomendaciones.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRecommendations();
    }, [userId]);

    const activeAlbum =
        recommendations[activeIndex] ?? null;

    const progressText = useMemo(() => {
        if (!recommendations.length) {
            return "";
        }

        return `${activeIndex + 1} de ${recommendations.length}`;
    }, [activeIndex, recommendations.length]);

    function scrollToIndex(nextIndex) {
        if (!recommendations.length) {
            return;
        }

        const safeIndex = Math.max(
            0,
            Math.min(
                nextIndex,
                recommendations.length - 1,
            ),
        );

        const carousel = carouselRef.current;

        if (!carousel) {
            setActiveIndex(safeIndex);
            return;
        }

        const card =
            carousel.children[safeIndex];

        card?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });

        setActiveIndex(safeIndex);
    }

    function handlePrevious() {
        scrollToIndex(activeIndex - 1);
    }

    function handleNext() {
        scrollToIndex(activeIndex + 1);
    }

    function handleCarouselScroll() {
        const carousel = carouselRef.current;

        if (!carousel) {
            return;
        }

        const cards = Array.from(
            carousel.children,
        );

        if (!cards.length) {
            return;
        }

        const carouselCenter =
            carousel.scrollLeft +
            carousel.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
            const cardCenter =
                card.offsetLeft +
                card.clientWidth / 2;

            const distance = Math.abs(
                carouselCenter - cardCenter,
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        setActiveIndex(closestIndex);
    }

    function removeAlbum(spotifyId) {
        setRecommendations(
            (currentRecommendations) => {
                const nextRecommendations =
                    currentRecommendations.filter(
                        (album) =>
                            album.spotify_id !== spotifyId,
                    );

                setActiveIndex((currentIndex) =>
                    Math.min(
                        currentIndex,
                        Math.max(
                            nextRecommendations.length - 1,
                            0,
                        ),
                    ),
                );

                return nextRecommendations;
            },
        );
    }

    async function handleAccept(album) {
        if (actionId) {
            return;
        }

        setActionId(
            `accept-${album.spotify_id}`,
        );
        setMessage("");

        try {
            await acceptRecommendation({
                userId,
                album,
            });

            removeAlbum(album.spotify_id);

            setMessage(
                `${album.title} se ha añadido a Pendientes.`,
            );

            window.dispatchEvent(
                new CustomEvent(
                    "audite:music-changed",
                ),
            );

            window.dispatchEvent(
                new CustomEvent(
                    "audite:listening-changed",
                ),
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido añadir el disco.",
            );
        } finally {
            setActionId("");
        }
    }

    async function handleKnown(album) {
        if (actionId) {
            return;
        }

        setActionId(
            `known-${album.spotify_id}`,
        );
        setMessage("");

        try {
            await markRecommendationKnown({
                userId,
                album,
            });

            removeAlbum(album.spotify_id);

            setMessage(
                `${album.title} se ha marcado como conocido.`,
            );

            window.dispatchEvent(
                new CustomEvent(
                    "audite:music-changed",
                ),
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido guardar tu decisión.",
            );
        } finally {
            setActionId("");
        }
    }

    async function handleDismiss(album) {
        if (actionId) {
            return;
        }

        setActionId(
            `dismiss-${album.spotify_id}`,
        );
        setMessage("");

        try {
            await dismissRecommendation({
                userId,
                album,
            });

            removeAlbum(album.spotify_id);
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido descartar el disco.",
            );
        } finally {
            setActionId("");
        }
    }

    if (loading) {
        return (
            <section className="recommendations-carousel recommendations-carousel--loading">
                <div className="recommendations-carousel__loading-cover" />

                <div className="recommendations-carousel__loading-content">
                    <span />
                    <strong />
                    <p />
                    <button type="button" disabled />
                </div>
            </section>
        );
    }

    if (!recommendations.length) {
        return (
            <article className="recommendations-empty">
                <span>🧭</span>

                <div>
                    <p>AUDITE ESTÁ APRENDIENDO</p>

                    <h3>
                        Todavía estamos conociendo tus gustos
                    </h3>

                    <span>
                        {message ||
                            "Termina y valora algunos discos para recibir recomendaciones más personales."}
                    </span>

                    <Link to="/discover">
                        Seguir descubriendo
                    </Link>
                </div>
            </article>
        );
    }

    return (
        <section className="recommendations-carousel">
            {seed && (
                <header className="recommendations-carousel__reason">
                    <div className="recommendations-carousel__seed-cover">
                        {seed.cover_url ? (
                            <img
                                src={seed.cover_url}
                                alt={`Portada de ${seed.title}`}
                            />
                        ) : (
                            <span>💿</span>
                        )}
                    </div>

                    <div>
                        <p>PORQUE TE GUSTÓ</p>

                        <strong>{seed.title}</strong>

                        <span>
                            {seed.artist_name} ·{" "}
                            {Number(seed.rating)
                                .toFixed(1)
                                .replace(".", ",")}
                        </span>
                    </div>

                    <div className="recommendations-carousel__counter">
                        {progressText}
                    </div>
                </header>
            )}

            {message && (
                <p className="recommendations-carousel__message">
                    {message}
                </p>
            )}

            <div className="recommendations-carousel__viewport">
                <button
                    type="button"
                    className="recommendations-carousel__arrow recommendations-carousel__arrow--previous"
                    onClick={handlePrevious}
                    disabled={activeIndex === 0}
                    aria-label="Recomendación anterior"
                >
                    ‹
                </button>

                <div
                    ref={carouselRef}
                    className="recommendations-carousel__track"
                    onScroll={handleCarouselScroll}
                >
                    {recommendations.map(
                        (album, index) => (
                            <article
                                className={[
                                    "recommendation-slide",
                                    index === activeIndex
                                        ? "recommendation-slide--active"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                key={album.spotify_id}
                            >
                                <div
                                    className="recommendation-slide__background"
                                    style={
                                        album.cover_url
                                            ? {
                                                "--recommendation-cover":
                                                    `url("${album.cover_url}")`,
                                            }
                                            : {}
                                    }
                                />

                                <div className="recommendation-slide__cover">
                                    {album.cover_url ? (
                                        <img
                                            src={album.cover_url}
                                            alt={`Portada de ${album.title}`}
                                        />
                                    ) : (
                                        <div>💿</div>
                                    )}

                                    <span>
                                        {index + 1}
                                    </span>
                                </div>

                                <div className="recommendation-slide__content">
                                    <p>RECOMENDADO PARA TI</p>

                                    <h3>{album.title}</h3>

                                    <h4>
                                        {album.artist_name}
                                    </h4>

                                    <div className="recommendation-slide__metadata">
                                        {album.release_year && (
                                            <span>
                                                {album.release_year}
                                            </span>
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

                                    <div className="recommendation-slide__actions">
                                        <button
                                            type="button"
                                            className="recommendation-slide__accept"
                                            onClick={() =>
                                                handleAccept(album)
                                            }
                                            disabled={Boolean(actionId)}
                                        >
                                            {actionId ===
                                                `accept-${album.spotify_id}`
                                                ? "Añadiendo..."
                                                : "＋ A Pendientes"}
                                        </button>

                                        {album.spotify_url && (
                                            <a
                                                href={album.spotify_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                ▶ Spotify
                                            </a>
                                        )}
                                    </div>

                                    <div className="recommendation-slide__secondary-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleKnown(album)
                                            }
                                            disabled={Boolean(actionId)}
                                        >
                                            {actionId ===
                                                `known-${album.spotify_id}`
                                                ? "Guardando..."
                                                : "Ya lo conozco"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDismiss(album)
                                            }
                                            disabled={Boolean(actionId)}
                                        >
                                            {actionId ===
                                                `dismiss-${album.spotify_id}`
                                                ? "Descartando..."
                                                : "No me interesa"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ),
                    )}
                </div>

                <button
                    type="button"
                    className="recommendations-carousel__arrow recommendations-carousel__arrow--next"
                    onClick={handleNext}
                    disabled={
                        activeIndex ===
                        recommendations.length - 1
                    }
                    aria-label="Siguiente recomendación"
                >
                    ›
                </button>
            </div>

            <footer className="recommendations-carousel__footer">
                <div className="recommendations-carousel__dots">
                    {recommendations.map(
                        (album, index) => (
                            <button
                                key={album.spotify_id}
                                type="button"
                                className={
                                    index === activeIndex
                                        ? "recommendations-carousel__dot recommendations-carousel__dot--active"
                                        : "recommendations-carousel__dot"
                                }
                                onClick={() =>
                                    scrollToIndex(index)
                                }
                                aria-label={`Ver recomendación ${index + 1}`}
                            />
                        ),
                    )}
                </div>

                <button
                    type="button"
                    className="recommendations-carousel__refresh"
                    onClick={loadRecommendations}
                    disabled={Boolean(actionId)}
                >
                    ↻ Buscar otras
                </button>
            </footer>
        </section>
    );
}

export default AlbumRecommendations;