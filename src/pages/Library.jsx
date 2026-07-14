import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    deleteAbandonedReview,
    deleteAbandonedReviews,
    getCompletedAlbums,
} from "../services/reviews";
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
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedReviewIds, setSelectedReviewIds] = useState([]);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [deleteMode, setDeleteMode] = useState(null);
    const [deleting, setDeleting] = useState(false);

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
            ? reviews.filter(
                (review) =>
                    review.reaction !== "abandoned",
            )
            : reviews.filter(
                (review) =>
                    review.reaction === filter,
            );

    const abandonedReviews = reviews.filter(
        (review) => review.reaction === "abandoned",
    );

    const selectedReviews = abandonedReviews.filter(
        (review) => selectedReviewIds.includes(review.id),
    );

    function handleFilterChange(nextFilter) {
        setFilter(nextFilter);
        setSelectionMode(false);
        setSelectedReviewIds([]);
    }

    async function handleConfirmDelete() {
        if (!user?.id || deleting || !deleteMode) {
            return;
        }

        setDeleting(true);
        setMessage("");

        try {
            if (deleteMode === "single" && reviewToDelete) {
                await deleteAbandonedReview({
                    userId: user.id,
                    reviewId: reviewToDelete.id,
                    userAlbumId: reviewToDelete.user_album.id,
                });

                setReviews((currentReviews) =>
                    currentReviews.filter(
                        (review) => review.id !== reviewToDelete.id,
                    ),
                );

                setMessage("Disco eliminado de la Biblioteca.");
            }

            if (deleteMode === "selected") {
                await deleteAbandonedReviews({
                    userId: user.id,
                    reviews: selectedReviews,
                });

                const selectedIds = new Set(selectedReviewIds);

                setReviews((currentReviews) =>
                    currentReviews.filter(
                        (review) => !selectedIds.has(review.id),
                    ),
                );

                setSelectedReviewIds([]);
                setSelectionMode(false);
                setMessage(
                    "Los discos seleccionados se han eliminado.",
                );
            }

            if (deleteMode === "all") {
                await deleteAbandonedReviews({
                    userId: user.id,
                    reviews: abandonedReviews,
                });

                setReviews((currentReviews) =>
                    currentReviews.filter(
                        (review) => review.reaction !== "abandoned",
                    ),
                );

                setSelectedReviewIds([]);
                setSelectionMode(false);
                setMessage(
                    "Todos los discos no terminados se han eliminado.",
                );
            }

            window.dispatchEvent(
                new CustomEvent("audite:music-changed"),
            );
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido eliminar los discos.",
            );
        } finally {
            setDeleting(false);
            setDeleteMode(null);
            setReviewToDelete(null);
        }
    }

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
                    onClick={() => handleFilterChange("all")}
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
                            onClick={() => handleFilterChange(value)}
                        >
                            {label}
                        </button>
                    ),
                )}
            </div>

            {filter === "abandoned" && abandonedReviews.length > 0 && (
                <div className="library-delete-toolbar">
                    <div>
                        <strong>{abandonedReviews.length}</strong>
                        <span>
                            {abandonedReviews.length === 1
                                ? "disco no terminado"
                                : "discos no terminados"}
                        </span>
                    </div>

                    <div className="library-delete-toolbar__actions">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectionMode((current) => !current);
                                setSelectedReviewIds([]);
                            }}
                        >
                            {selectionMode ? "Cancelar selección" : "Seleccionar"}
                        </button>

                        {selectionMode && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            selectedReviewIds.length ===
                                            abandonedReviews.length
                                        ) {
                                            setSelectedReviewIds([]);
                                        } else {
                                            setSelectedReviewIds(
                                                abandonedReviews.map(
                                                    (review) => review.id,
                                                ),
                                            );
                                        }
                                    }}
                                >
                                    {selectedReviewIds.length ===
                                        abandonedReviews.length
                                        ? "Deseleccionar todos"
                                        : "Seleccionar todos"}
                                </button>

                                <button
                                    type="button"
                                    className="library-delete-toolbar__danger"
                                    disabled={selectedReviewIds.length === 0}
                                    onClick={() => setDeleteMode("selected")}
                                >
                                    Eliminar seleccionados
                                </button>
                            </>
                        )}

                        {!selectionMode && (
                            <button
                                type="button"
                                className="library-delete-toolbar__danger"
                                onClick={() => setDeleteMode("all")}
                            >
                                Eliminar todos
                            </button>
                        )}
                    </div>
                </div>
            )}

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
                            className={[
                                "library-album",
                                selectionMode &&
                                    selectedReviewIds.includes(review.id)
                                    ? "library-album--selected"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
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

                                {filter === "abandoned" && selectionMode && (
                                    <button
                                        type="button"
                                        className="library-album__selector"
                                        onClick={() =>
                                            setSelectedReviewIds((currentIds) =>
                                                currentIds.includes(review.id)
                                                    ? currentIds.filter(
                                                        (id) => id !== review.id,
                                                    )
                                                    : [...currentIds, review.id],
                                            )
                                        }
                                        aria-label={`Seleccionar ${review.album.title}`}
                                    >
                                        {selectedReviewIds.includes(review.id)
                                            ? "✓"
                                            : ""}
                                    </button>
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

                                {filter === "abandoned" && !selectionMode && (
                                    <button
                                        type="button"
                                        className="library-album__delete"
                                        onClick={() => {
                                            setReviewToDelete(review);
                                            setDeleteMode("single");
                                        }}
                                    >
                                        Eliminar de Biblioteca
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {deleteMode && (
                <div
                    className="library-delete-dialog-backdrop"
                    onClick={() => {
                        if (!deleting) {
                            setDeleteMode(null);
                            setReviewToDelete(null);
                        }
                    }}
                >
                    <article
                        className="library-delete-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="library-delete-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <span>🗑️</span>

                        <h2 id="library-delete-title">
                            {deleteMode === "single"
                                ? "¿Eliminar este disco?"
                                : deleteMode === "selected"
                                    ? `¿Eliminar ${selectedReviews.length} discos?`
                                    : "¿Eliminar todos los no terminados?"}
                        </h2>

                        <p>
                            {deleteMode === "single" ? (
                                <>
                                    <strong>
                                        {reviewToDelete?.album?.title}
                                    </strong>{" "}
                                    desaparecerá de tu Biblioteca.
                                </>
                            ) : (
                                "Esta acción eliminará esos discos de tu historial personal. No se puede deshacer."
                            )}
                        </p>

                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteMode(null);
                                    setReviewToDelete(null);
                                }}
                                disabled={deleting}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="library-delete-dialog__confirm"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                        </div>
                    </article>
                </div>
            )}
        </section>
    );
}

export default Library;