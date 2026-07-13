import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCompletedAlbums } from "../services/reviews";
import "./Library.css";

const reactionLabels = {
    loved: "Me ha encantado",
    liked: "Me ha gustado",
    okay: "Sin más",
    weak: "Flojo",
    disliked: "No me ha gustado",
    abandoned: "No terminado",
};

function Library() {
    const { user } = useAuth();
    const location = useLocation();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [message, setMessage] = useState(
        location.state?.message ?? "",
    );

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        async function loadLibrary() {
            try {
                const completedAlbums =
                    await getCompletedAlbums(user.id);

                setReviews(completedAlbums);
            } catch (error) {
                console.error(error);
                setMessage(
                    "No hemos podido cargar tu Biblioteca.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadLibrary();
    }, [user?.id]);

    const filteredReviews =
        filter === "all"
            ? reviews
            : reviews.filter(
                (review) => review.reaction === filter,
            );

    if (loading) {
        return (
            <section className="library-page">
                <p className="library-page__eyebrow">
                    TU HISTORIA MUSICAL
                </p>

                <h1>Cargando Biblioteca...</h1>
            </section>
        );
    }

    return (
        <section className="library-page">
            <header className="library-page__header">
                <p className="library-page__eyebrow">
                    TU HISTORIA MUSICAL
                </p>

                <h1>Biblioteca</h1>

                <p>
                    Todos los discos que han pasado por tus oídos.
                </p>
            </header>

            <nav className="library-tabs" aria-label="Secciones de la biblioteca">
                <NavLink
                    to="/library"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? "library-tabs__item library-tabs__item--active"
                            : "library-tabs__item"
                    }
                >
                    <span>💿</span>
                    Discos
                </NavLink>

                <NavLink
                    to="/songs"
                    className={({ isActive }) =>
                        isActive
                            ? "library-tabs__item library-tabs__item--active"
                            : "library-tabs__item"
                    }
                >
                    <span>♪</span>
                    Canciones top
                </NavLink>
            </nav>

            {message && (
                <p className="library-page__message">
                    {message}
                </p>
            )}

            <div className="library-filters">
                <button
                    type="button"
                    className={filter === "all" ? "active" : ""}
                    onClick={() => setFilter("all")}
                >
                    Todos
                </button>

                {Object.entries(reactionLabels).map(
                    ([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={
                                filter === value ? "active" : ""
                            }
                            onClick={() => setFilter(value)}
                        >
                            {label}
                        </button>
                    ),
                )}
            </div>

            {filteredReviews.length === 0 ? (
                <article className="library-empty">
                    <span>📚</span>

                    <h2>
                        {reviews.length === 0
                            ? "Tu Biblioteca todavía está vacía"
                            : "No hay discos en esta categoría"}
                    </h2>

                    <p>
                        Los discos aparecerán aquí cuando termines
                        de escucharlos y los valores.
                    </p>
                </article>
            ) : (
                <div className="library-grid">
                    {filteredReviews.map((review) => (
                        <article
                            className="library-album"
                            key={review.id}
                        >
                            <div className="library-album__cover">
                                {review.album.cover_url ? (
                                    <img
                                        src={review.album.cover_url}
                                        alt={`Portada de ${review.album.title}`}
                                    />
                                ) : (
                                    <div>💿</div>
                                )}

                                {review.rating !== null && (
                                    <strong>{review.rating}</strong>
                                )}
                            </div>

                            <div className="library-album__content">
                                <span>
                                    {reactionLabels[review.reaction]}
                                </span>

                                <h2>{review.album.title}</h2>
                                <h3>{review.album.artist_name}</h3>

                                {review.favorite_tracks?.length > 0 && (
                                    <p>
                                        ★ {review.favorite_tracks.length}
                                        {review.favorite_tracks.length === 1
                                            ? " canción top"
                                            : " canciones top"}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Library;