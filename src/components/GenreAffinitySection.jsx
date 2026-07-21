import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    evaluateGenreAffinity,
    getGenreAffinities,
} from "../services/genreAffinity";
import {
    formatGenreName,
    getGenreIcon,
    getGenreLevelProgress,
    getGenreRank,
} from "../utils/genreAffinity";
import "./GenreAffinitySection.css";

function GenreAffinitySection({
    userId,
}) {
    const [affinities, setAffinities] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [expanded, setExpanded] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const loadAffinities =
        useCallback(async () => {
            if (
                !userId ||
                loadingRequestRef.current
            ) {
                return;
            }

            loadingRequestRef.current = true;

            setLoading(true);
            setMessage("");

            try {
                await evaluateGenreAffinity();

                const rows =
                    await getGenreAffinities(
                        userId,
                    );

                setAffinities(rows);
            } catch (error) {
                console.error(error);

                setMessage(
                    "No hemos podido cargar tus afinidades musicales.",
                );
            } finally {
                loadingRequestRef.current = false;
                setLoading(false);
            }
        }, [userId]);

    useEffect(() => {
        loadAffinities();

        window.addEventListener(
            "audite:genre-affinity-changed",
            loadAffinities,
        );

        return () => {
            window.removeEventListener(
                "audite:genre-affinity-changed",
                loadAffinities,
            );
        };
    }, [loadAffinities]);

    const visibleAffinities =
        useMemo(
            () =>
                expanded
                    ? affinities
                    : affinities.slice(0, 5),
            [affinities, expanded],
        );

    const loadingRequestRef =
        useRef(false);

    if (loading) {
        return (
            <section className="genre-affinity-section">
                <p className="genre-affinity-section__eyebrow">
                    TU MAPA MUSICAL
                </p>

                <h2>
                    Calculando afinidades...
                </h2>
            </section>
        );
    }

    return (
        <section className="genre-affinity-section">
            <header className="genre-affinity-section__header">
                <div>
                    <p className="genre-affinity-section__eyebrow">
                        TU MAPA MUSICAL
                    </p>

                    <h2>
                        Afinidad por géneros
                    </h2>

                    <span>
                        Cada disco terminado aumenta
                        tu experiencia dentro de sus
                        estilos musicales.
                    </span>
                </div>

                <strong>
                    {affinities.length}
                    <small> géneros</small>
                </strong>
            </header>

            {message && (
                <p className="genre-affinity-section__message">
                    {message}
                </p>
            )}

            {affinities.length === 0 ? (
                <article className="genre-affinity-empty">
                    <span>🧭</span>

                    <div>
                        <h3>
                            Tu mapa está todavía vacío
                        </h3>

                        <p>
                            Termina tu primer disco y
                            empezaremos a dibujar tus
                            afinidades.
                        </p>
                    </div>
                </article>
            ) : (
                <>
                    <div className="genre-affinity-list">
                        {visibleAffinities.map(
                            (affinity, index) => {
                                const progress =
                                    getGenreLevelProgress(
                                        affinity.genre_xp,
                                    );

                                const rank =
                                    getGenreRank(
                                        progress.level,
                                    );

                                return (
                                    <article
                                        className="genre-affinity-card"
                                        key={affinity.id}
                                    >
                                        <div className="genre-affinity-card__position">
                                            {index + 1}
                                        </div>

                                        <div className="genre-affinity-card__icon">
                                            {getGenreIcon(
                                                affinity.genre,
                                            )}
                                        </div>

                                        <div className="genre-affinity-card__content">
                                            <header>
                                                <div>
                                                    <h3>
                                                        {formatGenreName(
                                                            affinity.genre,
                                                        )}
                                                    </h3>

                                                    <span>
                                                        Nivel{" "}
                                                        {
                                                            progress.level
                                                        }{" "}
                                                        · {rank}
                                                    </span>
                                                </div>

                                                <strong>
                                                    {
                                                        affinity.genre_xp
                                                    }
                                                    <small>
                                                        {" "}
                                                        XP
                                                    </small>
                                                </strong>
                                            </header>

                                            <div className="genre-affinity-card__progress-information">
                                                <span>
                                                    {
                                                        affinity.completed_albums
                                                    }{" "}
                                                    {affinity.completed_albums ===
                                                        1
                                                        ? "disco"
                                                        : "discos"}
                                                </span>

                                                <span>
                                                    {Math.round(
                                                        progress.percentage,
                                                    )}
                                                    %
                                                </span>
                                            </div>

                                            <div className="genre-affinity-card__track">
                                                <span
                                                    style={{
                                                        width: `${progress.percentage}%`,
                                                    }}
                                                />
                                            </div>

                                            <footer>
                                                <span>
                                                    Media:{" "}
                                                    {affinity.average_rating !==
                                                        null
                                                        ? Number(
                                                            affinity.average_rating,
                                                        )
                                                            .toFixed(
                                                                1,
                                                            )
                                                            .replace(
                                                                ".",
                                                                ",",
                                                            )
                                                        : "—"}
                                                </span>

                                                <span>
                                                    Mejor nota:{" "}
                                                    {affinity.highest_rating !==
                                                        null
                                                        ? Number(
                                                            affinity.highest_rating,
                                                        )
                                                            .toFixed(
                                                                1,
                                                            )
                                                            .replace(
                                                                ".",
                                                                ",",
                                                            )
                                                        : "—"}
                                                </span>

                                                <span>
                                                    Faltan{" "}
                                                    {
                                                        progress.xpRemaining
                                                    }{" "}
                                                    XP
                                                </span>
                                            </footer>
                                        </div>
                                    </article>
                                );
                            },
                        )}
                    </div>

                    {affinities.length > 5 && (
                        <button
                            type="button"
                            className="genre-affinity-section__toggle"
                            onClick={() =>
                                setExpanded(
                                    (current) =>
                                        !current,
                                )
                            }
                        >
                            {expanded
                                ? "Ver solo los principales"
                                : `Ver los ${affinities.length} géneros`}
                        </button>
                    )}
                </>
            )}
        </section>
    );
}

export default GenreAffinitySection;