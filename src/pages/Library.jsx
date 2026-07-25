import { useEffect, useState, useMemo } from "react";
import {
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlbumDetailModal from "../components/AlbumDetailModal";
import {
    deleteAbandonedReview,
    deleteAbandonedReviews,
    getCompletedAlbums,
    getLibraryAlbumDetail,
} from "../services/reviews";
import LibraryTabs from "../components/LibraryTabs";
import {
    publishReview,
} from "../services/socialFeed";
import ArchiveAlbumModal from "../components/ArchiveAlbumModal";
import {
    deleteArchiveAlbum,
    getArchiveAlbums,
} from "../services/archive";
import "./Library.css";

const reactionLabels = {
    loved: "Me ha encantado",
    liked: "Me ha gustado",
    okay: "Sin más",
    weak: "Flojo",
    disliked: "No me ha gustado",
    abandoned: "No terminado",
};

function formatArchiveDiscoveryDate(
    userAlbum,
) {
    if (
        !userAlbum ||
        userAlbum.discovery_date_precision ===
        "unknown"
    ) {
        return "Fecha no recordada";
    }

    const year =
        userAlbum.discovery_year;

    if (
        userAlbum.discovery_date_precision ===
        "year"
    ) {
        return year
            ? `Descubierto en ${year}`
            : "Año no recordado";
    }

    if (!userAlbum.discovery_date) {
        return year
            ? `Descubierto en ${year}`
            : "Fecha aproximada";
    }

    const date = new Date(
        `${userAlbum.discovery_date}T12:00:00`,
    );

    if (
        userAlbum.discovery_date_precision ===
        "month"
    ) {
        return new Intl.DateTimeFormat(
            "es-ES",
            {
                month: "long",
                year: "numeric",
            },
        ).format(date);
    }

    return new Intl.DateTimeFormat(
        "es-ES",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    ).format(date);
}

function Library() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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
    const [selectedAlbumDetail, setSelectedAlbumDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const LIBRARY_SORT_OPTIONS = [
        "recent",
        "oldest",
        "rating-desc",
        "rating-asc",
        "title-asc",
        "title-desc",
        "artist-asc",
        "year-desc",
        "year-asc",
        "favorites-desc",
    ];
    const [sortBy, setSortBy] = useState(() => {
        const storedSort =
            localStorage.getItem(
                "audite:library-sort",
            );

        return LIBRARY_SORT_OPTIONS.includes(
            storedSort,
        )
            ? storedSort
            : "recent";
    });

    const [
        archiveReviews,
        setArchiveReviews,
    ] = useState([]);

    const [
        archiveModalOpen,
        setArchiveModalOpen,
    ] = useState(false);

    const [
        archiveToDelete,
        setArchiveToDelete,
    ] = useState(null);

    const [
        deletingArchive,
        setDeletingArchive,
    ] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        async function loadLibrary() {
            try {
                const [
                    completedAlbums,
                    archivedAlbums,
                ] = await Promise.all([
                    getCompletedAlbums(user.id),
                    getArchiveAlbums(user.id),
                ]);

                setReviews(completedAlbums);
                setArchiveReviews(archivedAlbums);
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

    useEffect(() => {
        localStorage.setItem(
            "audite:library-sort",
            sortBy,
        );
    }, [sortBy]);

    const normalReviews = reviews.filter(
        (review) =>
            review.user_album?.pre_audite !== true,
    );

    const filteredReviews =
        filter === "archive"
            ? archiveReviews
            : filter === "all"
                ? normalReviews.filter(
                    (review) =>
                        review.reaction !== "abandoned",
                )
                : normalReviews.filter(
                    (review) =>
                        review.reaction === filter,
                );

    const abandonedReviews = normalReviews.filter(
        (review) => review.reaction === "abandoned",
    );

    const selectedReviews = abandonedReviews.filter(
        (review) => selectedReviewIds.includes(review.id),
    );

    const sortedReviews = useMemo(() => {
        const reviewsToSort = [
            ...filteredReviews,
        ];

        function getRating(review) {
            const value = Number(review.rating);

            return Number.isFinite(value)
                ? value
                : -1;
        }

        function getReviewDate(review) {
            const dateValue =
                review.reviewed_at ??
                review.completed_at ??
                review.updated_at ??
                review.created_at;

            const timestamp = dateValue
                ? new Date(dateValue).getTime()
                : 0;

            return Number.isFinite(timestamp)
                ? timestamp
                : 0;
        }

        function getTitle(review) {
            return (
                review.album?.title ??
                review.title ??
                ""
            ).trim();
        }

        function getArtist(review) {
            return (
                review.album?.artist_name ??
                review.artist_name ??
                ""
            ).trim();
        }

        function getReleaseYear(review) {
            const year = Number(
                review.album?.release_year ??
                review.release_year,
            );

            return Number.isFinite(year)
                ? year
                : 0;
        }

        function getFavoriteCount(review) {
            if (
                Array.isArray(
                    review.favorite_tracks,
                )
            ) {
                return review.favorite_tracks.length;
            }

            return Number(
                review.favorite_tracks_count ??
                review.favorite_count ??
                0,
            );
        }

        switch (sortBy) {
            case "oldest":
                return reviewsToSort.sort(
                    (first, second) =>
                        getReviewDate(first) -
                        getReviewDate(second),
                );

            case "rating-desc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getRating(second) -
                        getRating(first),
                );

            case "rating-asc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getRating(first) -
                        getRating(second),
                );

            case "title-asc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getTitle(first).localeCompare(
                            getTitle(second),
                            "es",
                            {
                                sensitivity: "base",
                            },
                        ),
                );

            case "title-desc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getTitle(second).localeCompare(
                            getTitle(first),
                            "es",
                            {
                                sensitivity: "base",
                            },
                        ),
                );

            case "artist-asc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getArtist(first).localeCompare(
                            getArtist(second),
                            "es",
                            {
                                sensitivity: "base",
                            },
                        ),
                );

            case "year-desc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getReleaseYear(second) -
                        getReleaseYear(first),
                );

            case "year-asc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getReleaseYear(first) -
                        getReleaseYear(second),
                );

            case "favorites-desc":
                return reviewsToSort.sort(
                    (first, second) =>
                        getFavoriteCount(second) -
                        getFavoriteCount(first),
                );

            case "recent":
            default:
                return reviewsToSort.sort(
                    (first, second) =>
                        getReviewDate(second) -
                        getReviewDate(first),
                );
        }
    }, [filteredReviews, sortBy]);

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

    async function handleOpenAlbum(review) {
        if (!user?.id || detailLoading) {
            return;
        }

        setDetailLoading(true);
        setMessage("");

        try {
            const detail =
                await getLibraryAlbumDetail({
                    userId: user.id,
                    reviewId: review.id,
                });

            setSelectedAlbumDetail(detail);
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido abrir la ficha del disco.",
            );
        } finally {
            setDetailLoading(false);
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

            <LibraryTabs />

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

                <button
                    type="button"
                    className={
                        filter === "archive"
                            ? "active library-filter--archive"
                            : "library-filter--archive"
                    }
                    onClick={() =>
                        handleFilterChange("archive")
                    }
                >
                    📼 Archivo
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

            {filter === "archive" && (
                <section className="library-archive-hero">
                    <div>
                        <p>ANTES DE AUDITE</p>

                        <h2>Tu Archivo musical</h2>

                        <span>
                            Los discos que ya formaban parte
                            de tu vida antes de comenzar este
                            viaje.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setArchiveModalOpen(true)
                        }
                    >
                        <span>＋</span>
                        Añadir recuerdo
                    </button>
                </section>
            )}

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

            <div className="library-sort">
                <div>
                    <span>↕</span>

                    <div>
                        <small>ORDENAR POR</small>
                        <strong>
                            {
                                {
                                    recent:
                                        "Más recientes",
                                    oldest:
                                        "Más antiguos",
                                    "rating-desc":
                                        "Mejor nota",
                                    "rating-asc":
                                        "Peor nota",
                                    "title-asc":
                                        "Título A–Z",
                                    "title-desc":
                                        "Título Z–A",
                                    "artist-asc":
                                        "Artista A–Z",
                                    "year-desc":
                                        "Lanzamientos recientes",
                                    "year-asc":
                                        "Lanzamientos antiguos",
                                    "favorites-desc":
                                        "Más canciones top",
                                }[sortBy]
                            }
                        </strong>
                    </div>
                </div>

                <select
                    value={sortBy}
                    onChange={(event) =>
                        setSortBy(event.target.value)
                    }
                    aria-label="Ordenar discos"
                >
                    <option value="recent">
                        Más recientes
                    </option>

                    <option value="oldest">
                        Más antiguos
                    </option>

                    <option value="rating-desc">
                        Mejor nota
                    </option>

                    <option value="rating-asc">
                        Peor nota
                    </option>

                    <option value="title-asc">
                        Título A–Z
                    </option>

                    <option value="title-desc">
                        Título Z–A
                    </option>

                    <option value="artist-asc">
                        Artista A–Z
                    </option>

                    <option value="year-desc">
                        Año: más nuevo primero
                    </option>

                    <option value="year-asc">
                        Año: más antiguo primero
                    </option>

                    <option value="favorites-desc">
                        Más canciones top
                    </option>
                </select>
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
                    {sortedReviews.map((review) => (
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
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                if (!selectionMode) {
                                    handleOpenAlbum(review);
                                }
                            }}
                            onKeyDown={(event) => {
                                if (
                                    !selectionMode &&
                                    (event.key === "Enter" ||
                                        event.key === " ")
                                ) {
                                    event.preventDefault();
                                    handleOpenAlbum(review);
                                }
                            }}
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
                                        onClick={(event) => {
                                            event.stopPropagation();

                                            setSelectedReviewIds((currentIds) =>
                                                currentIds.includes(review.id)
                                                    ? currentIds.filter(
                                                        (id) => id !== review.id,
                                                    )
                                                    : [...currentIds, review.id],
                                            );
                                        }}
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
                                    {filter === "archive"
                                        ? "📼 ARCHIVO"
                                        : reactionLabels[
                                        review.reaction
                                        ]}
                                </span>

                                <h2>{review.album.title}</h2>
                                <h3>{review.album.artist_name}</h3>

                                {filter === "archive" && (
                                    <p className="library-album__archive-date">
                                        {formatArchiveDiscoveryDate(
                                            review.user_album,
                                        )}
                                    </p>
                                )}

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
                                        onClick={(event) => {
                                            event.stopPropagation();

                                            setReviewToDelete(review);
                                            setDeleteMode("single");
                                        }}
                                    >
                                        Eliminar de Biblioteca
                                    </button>
                                )}

                                {filter === "archive" && (
                                    <button
                                        type="button"
                                        className="library-album__archive-delete"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setArchiveToDelete(review);
                                        }}
                                    >
                                        Eliminar del Archivo
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

            {archiveToDelete && (
                <div
                    className="library-delete-dialog-backdrop"
                    onClick={() => {
                        if (!deletingArchive) {
                            setArchiveToDelete(null);
                        }
                    }}
                >
                    <article
                        className="library-delete-dialog"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <span>📼</span>

                        <h2>
                            ¿Eliminar este recuerdo?
                        </h2>

                        <p>
                            <strong>
                                {
                                    archiveToDelete.album
                                        ?.title
                                }
                            </strong>{" "}
                            desaparecerá del Archivo.
                        </p>

                        <div>
                            <button
                                type="button"
                                disabled={deletingArchive}
                                onClick={() =>
                                    setArchiveToDelete(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="library-delete-dialog__confirm"
                                disabled={deletingArchive}
                                onClick={async () => {
                                    setDeletingArchive(true);

                                    try {
                                        await deleteArchiveAlbum({
                                            userId: user.id,
                                            reviewId:
                                                archiveToDelete.id,
                                            userAlbumId:
                                                archiveToDelete
                                                    .user_album.id,
                                        });

                                        setArchiveReviews(
                                            (
                                                currentReviews,
                                            ) =>
                                                currentReviews.filter(
                                                    (review) =>
                                                        review.id !==
                                                        archiveToDelete.id,
                                                ),
                                        );

                                        setArchiveToDelete(
                                            null,
                                        );

                                        setMessage(
                                            "Recuerdo eliminado del Archivo.",
                                        );
                                    } catch (error) {
                                        console.error(
                                            error,
                                        );

                                        setMessage(
                                            "No hemos podido eliminar el recuerdo.",
                                        );
                                    } finally {
                                        setDeletingArchive(
                                            false,
                                        );
                                    }
                                }}
                            >
                                {deletingArchive
                                    ? "Eliminando..."
                                    : "Sí, eliminar"}
                            </button>
                        </div>
                    </article>
                </div>
            )}

            <AlbumDetailModal
                detail={selectedAlbumDetail}
                loading={detailLoading}
                onClose={() => {
                    setSelectedAlbumDetail(null);
                }}
                onDelete={(detail) => {
                    setSelectedAlbumDetail(null);

                    setReviewToDelete({
                        ...detail,
                        user_album: detail.user_album,
                    });

                    setDeleteMode("single");
                }}
                onEdit={(detail) => {
                    navigate(
                        `/review/${detail.user_album.id}?mode=edit`,
                        {
                            state: {
                                mode: "edit",
                            },
                        },
                    );
                }}
                onShare={async (detail) => {
                    try {
                        await publishReview({
                            userId:
                                user.id,

                            reviewId:
                                detail.id,

                            visibility:
                                "friends",
                        });

                        window.dispatchEvent(
                            new CustomEvent(
                                "audite:social-feed-changed",
                            ),
                        );
                    } catch (error) {
                        console.error(
                            "No se pudo compartir:",
                            error,
                        );
                    }
                }}
            />

            <ArchiveAlbumModal
                isOpen={archiveModalOpen}
                userId={user?.id}
                onClose={() =>
                    setArchiveModalOpen(false)
                }
                onSaved={(savedArchive) => {
                    setArchiveReviews(
                        (currentReviews) => [
                            savedArchive,
                            ...currentReviews.filter(
                                (review) =>
                                    review.id !==
                                    savedArchive.id,
                            ),
                        ],
                    );

                    setMessage(
                        `${savedArchive.album.title} se ha guardado en tu Archivo.`,
                    );

                    window.dispatchEvent(
                        new CustomEvent(
                            "audite:archive-changed",
                        ),
                    );
                }}
            />
        </section>
    );
}

export default Library;