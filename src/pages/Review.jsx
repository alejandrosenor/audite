import { useEffect, useMemo, useState } from "react";
import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getAlbumTracks,
    syncAlbumTracks,
} from "../services/albums";
import {
    completeAlbumReview,
    getUserAlbumForReview,
} from "../services/reviews";
import { awardXP } from "../services/xp";
import {
    evaluateGenreAffinity,
} from "../services/genreAffinity";
import "./Review.css";

const reactions = [
    {
        id: "loved",
        emoji: "🤯",
        label: "Me ha encantado",
        description: "De esos que dejan huella.",
        min: 8,
        max: 10,
    },
    {
        id: "liked",
        emoji: "😍",
        label: "Me ha gustado",
        description: "Una escucha muy disfrutable.",
        min: 6,
        max: 8,
    },
    {
        id: "okay",
        emoji: "🙂",
        label: "Sin más",
        description: "Correcto, pero no me ha marcado.",
        min: 5,
        max: 5,
    },
    {
        id: "weak",
        emoji: "😕",
        label: "Flojo",
        description: "Esperaba bastante más.",
        min: 3,
        max: 4,
    },
    {
        id: "disliked",
        emoji: "🙅",
        label: "No me ha gustado",
        description: "No ha conectado conmigo.",
        min: 1,
        max: 2,
    },
    {
        id: "abandoned",
        emoji: "⏹️",
        label: "No lo he terminado",
        description: "La escucha se quedó por el camino.",
        min: null,
        max: null,
    },
];

function Review() {
    const { user, refreshProfile } = useAuth();
    const { userAlbumId } = useParams();
    const navigate = useNavigate();

    const [userAlbum, setUserAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);

    const [reaction, setReaction] = useState("");
    const [rating, setRating] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [wouldListenAgain, setWouldListenAgain] =
        useState(null);
    const [favoriteTrackIds, setFavoriteTrackIds] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const selectedReaction = useMemo(
        () => reactions.find((item) => item.id === reaction),
        [reaction],
    );

    useEffect(() => {
        if (!user?.id || !userAlbumId) {
            return;
        }

        let cancelled = false;

        async function loadReviewData() {
            try {
                const currentUserAlbum =
                    await getUserAlbumForReview({
                        userAlbumId,
                        userId: user.id,
                    });

                if (!currentUserAlbum) {
                    if (!cancelled) {
                        setUserAlbum(null);
                    }

                    return;
                }

                let albumTracks = await getAlbumTracks(
                    currentUserAlbum.album.id,
                );

                if (
                    albumTracks.length === 0 &&
                    currentUserAlbum.album.spotify_id
                ) {
                    try {
                        await syncAlbumTracks(
                            currentUserAlbum.album.id,
                        );

                        albumTracks = await getAlbumTracks(
                            currentUserAlbum.album.id,
                        );
                    } catch (syncError) {
                        console.error(
                            "No se pudieron recuperar las canciones:",
                            syncError,
                        );
                    }
                }

                if (!cancelled) {
                    setUserAlbum(currentUserAlbum);
                    setTracks(albumTracks);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMessage(
                        "No hemos podido preparar la valoración.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadReviewData();

        return () => {
            cancelled = true;
        };
    }, [user?.id, userAlbumId]);

    function handleReactionChange(reactionId) {
        const nextReaction = reactions.find(
            (item) => item.id === reactionId,
        );

        setReaction(reactionId);

        if (nextReaction.min === nextReaction.max) {
            setRating(String(nextReaction.min));
        } else {
            setRating("");
        }
    }

    function toggleFavoriteTrack(trackId) {
        setFavoriteTrackIds((currentIds) => {
            if (currentIds.includes(trackId)) {
                return currentIds.filter(
                    (currentId) => currentId !== trackId,
                );
            }

            return [...currentIds, trackId];
        });
    }

    function validateForm() {
        if (!selectedReaction) {
            return "Selecciona primero cómo te ha parecido.";
        }

        if (selectedReaction.id !== "abandoned") {
            const numericRating = Number(rating);

            if (!rating || Number.isNaN(numericRating)) {
                return "Selecciona una puntuación.";
            }

            if (
                numericRating < selectedReaction.min ||
                numericRating > selectedReaction.max
            ) {
                return `La puntuación debe estar entre ${selectedReaction.min} y ${selectedReaction.max}.`;
            }
        }

        if (wouldListenAgain === null) {
            return "Indica si volverías a escucharlo.";
        }

        return "";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationMessage = validateForm();

        if (validationMessage) {
            setMessage(validationMessage);
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            await completeAlbumReview({
                userId: user.id,
                userAlbum,
                reaction,
                rating:
                    reaction === "abandoned" &&
                        rating === ""
                        ? null
                        : rating,
                reviewText,
                wouldListenAgain,
                favoriteTrackIds,
            });

            /*
             * Los discos abandonados no cuentan como
             * terminados ni conceden XP de valoración.
             */
            if (reaction !== "abandoned") {
                const xpRewards = [
                    {
                        rewardType: "album_completed",
                        sourceId: userAlbum.id,
                        metadata: {
                            albumId:
                                userAlbum.album?.id ??
                                userAlbum.album_id,

                            albumTitle:
                                userAlbum.album?.title ??
                                null,
                        },
                    },
                    {
                        rewardType: "album_reviewed",
                        sourceId: userAlbum.id,
                        metadata: {
                            albumId:
                                userAlbum.album?.id ??
                                userAlbum.album_id,

                            rating: Number(rating),
                        },
                    },
                ];

                if (favoriteTrackIds.length > 0) {
                    xpRewards.push({
                        rewardType: "favorite_tracks",
                        sourceId: userAlbum.id,
                        metadata: {
                            albumId:
                                userAlbum.album?.id ??
                                userAlbum.album_id,

                            favoriteCount:
                                favoriteTrackIds.length,
                        },
                    });
                }

                /*
                 * Las concedemos una detrás de otra para
                 * evitar tres peticiones simultáneas que
                 * intenten actualizar el mismo total de XP.
                 */
                for (const reward of xpRewards) {
                    try {
                        await awardXP(reward);
                    } catch (xpError) {
                        /*
                         * La valoración ya está guardada.
                         * Un fallo en XP no debe impedir
                         * terminar el proceso.
                         */
                        console.error(
                            `No se pudo conceder ${reward.rewardType}:`,
                            xpError,
                        );
                    }
                }
            }

            if (reaction !== "abandoned") {
                try {
                    await evaluateGenreAffinity();

                    window.dispatchEvent(
                        new CustomEvent(
                            "audite:genre-affinity-changed",
                        ),
                    );
                } catch (affinityError) {
                    /*
                     * La valoración ya está guardada.
                     * Un error en la afinidad no debe
                     * bloquear el flujo.
                     */
                    console.error(
                        "No se pudo actualizar la afinidad:",
                        affinityError,
                    );
                }
            }

            await refreshProfile();

            window.dispatchEvent(
                new CustomEvent(
                    "audite:listening-changed",
                ),
            );

            window.dispatchEvent(
                new CustomEvent(
                    "audite:music-changed",
                ),
            );

            navigate("/library", {
                replace: true,
                state: {
                    message:
                        reaction === "abandoned"
                            ? "El disco se ha guardado como no terminado."
                            : "Disco valorado y añadido a tu Biblioteca.",
                },
            });
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido guardar la valoración.",
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <section className="review-page">
                <p className="review-page__eyebrow">
                    VALORANDO
                </p>

                <h1>Preparando tu valoración...</h1>
            </section>
        );
    }

    if (!userAlbum) {
        return <Navigate to="/listening" replace />;
    }

    const album = userAlbum.album;

    return (
        <section className="review-page">
            <header className="review-page__header">
                <p className="review-page__eyebrow">
                    FIN DE LA ESCUCHA
                </p>

                <h1>¿Qué te ha parecido?</h1>
            </header>

            <article className="review-album">
                {album.cover_url ? (
                    <img
                        src={album.cover_url}
                        alt={`Portada de ${album.title}`}
                    />
                ) : (
                    <div>💿</div>
                )}

                <div>
                    <h2>{album.title}</h2>
                    <p>{album.artist_name}</p>
                </div>
            </article>

            <form
                className="review-form"
                onSubmit={handleSubmit}
            >
                <section className="review-section">
                    <div className="review-section__header">
                        <span>01</span>

                        <div>
                            <h2>Sensación general</h2>
                            <p>
                                Elige la opción que mejor represente
                                tu escucha.
                            </p>
                        </div>
                    </div>

                    <div className="reaction-grid">
                        {reactions.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={
                                    reaction === item.id
                                        ? "reaction-card reaction-card--active"
                                        : "reaction-card"
                                }
                                onClick={() =>
                                    handleReactionChange(item.id)
                                }
                            >
                                <span>{item.emoji}</span>

                                <div>
                                    <strong>{item.label}</strong>
                                    <small>{item.description}</small>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {selectedReaction && (
                    <section className="review-section">
                        <div className="review-section__header">
                            <span>02</span>

                            <div>
                                <h2>Puntuación</h2>

                                <p>
                                    {selectedReaction.id === "abandoned"
                                        ? "Puedes dejarlo sin nota o puntuar lo que escuchaste."
                                        : `Puedes puntuarlo entre ${selectedReaction.min} y ${selectedReaction.max}.`}
                                </p>
                            </div>
                        </div>

                        {selectedReaction.id === "abandoned" ? (
                            <select
                                className="rating-select"
                                value={rating}
                                onChange={(event) =>
                                    setRating(event.target.value)
                                }
                            >
                                <option value="">
                                    Sin puntuación
                                </option>
                                {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(
                                    (score) => (
                                        <option
                                            key={score}
                                            value={score}
                                        >
                                            {Number.isInteger(score)
                                                ? score
                                                : score.toFixed(1).replace(".", ",")}
                                        </option>
                                    ),
                                )}
                            </select>
                        ) : (
                            <div className="rating-options">
                                {Array.from(
                                    {
                                        length:
                                            (selectedReaction.max -
                                                selectedReaction.min) *
                                            2 +
                                            1,
                                    },
                                    (_, index) =>
                                        selectedReaction.min + index * 0.5,
                                ).map((score) => (
                                    <button
                                        key={score}
                                        type="button"
                                        className={
                                            Number(rating) === score
                                                ? "rating-options__item rating-options__item--active"
                                                : "rating-options__item"
                                        }
                                        onClick={() =>
                                            setRating(String(score))
                                        }
                                    >
                                        {Number.isInteger(score)
                                            ? score
                                            : score.toFixed(1).replace(".", ",")}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="review-section">
                    <div className="review-section__header">
                        <span>03</span>

                        <div>
                            <h2>Tus canciones top</h2>
                            <p>
                                Selecciona todas las que quieras guardar.
                            </p>
                        </div>
                    </div>

                    {tracks.length > 0 ? (
                        <div className="review-track-list">
                            {tracks.map((track) => {
                                const selected =
                                    favoriteTrackIds.includes(track.id);

                                return (
                                    <button
                                        key={track.id}
                                        type="button"
                                        className={
                                            selected
                                                ? "review-track review-track--active"
                                                : "review-track"
                                        }
                                        onClick={() =>
                                            toggleFavoriteTrack(track.id)
                                        }
                                    >
                                        <span>{track.track_number}</span>
                                        <strong>{track.title}</strong>
                                        <i>{selected ? "★" : "☆"}</i>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="review-section__empty">
                            No tenemos disponible la lista de canciones.
                        </p>
                    )}
                </section>

                <section className="review-section">
                    <div className="review-section__header">
                        <span>04</span>

                        <div>
                            <h2>¿Volverías a escucharlo?</h2>
                            <p>
                                A veces una nota no cuenta toda la historia.
                            </p>
                        </div>
                    </div>

                    <div className="listen-again-options">
                        <button
                            type="button"
                            className={
                                wouldListenAgain === true
                                    ? "listen-again-options__active"
                                    : ""
                            }
                            onClick={() => setWouldListenAgain(true)}
                        >
                            Sí, volvería
                        </button>

                        <button
                            type="button"
                            className={
                                wouldListenAgain === false
                                    ? "listen-again-options__active"
                                    : ""
                            }
                            onClick={() => setWouldListenAgain(false)}
                        >
                            Probablemente no
                        </button>
                    </div>
                </section>

                <section className="review-section">
                    <div className="review-section__header">
                        <span>05</span>

                        <div>
                            <h2>Reseña personal</h2>
                            <p>
                                Opcional. Escribe lo que quieras recordar.
                            </p>
                        </div>
                    </div>

                    <textarea
                        value={reviewText}
                        onChange={(event) =>
                            setReviewText(event.target.value)
                        }
                        placeholder="Qué te ha gustado, qué no, cómo te ha hecho sentir..."
                        maxLength={2000}
                    />

                    <small className="review-form__counter">
                        {reviewText.length}/2000
                    </small>
                </section>

                {message && (
                    <p className="review-form__message">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    className="review-form__submit"
                    disabled={saving}
                >
                    {saving
                        ? "Guardando valoración..."
                        : "Guardar en mi Biblioteca"}
                </button>
            </form>
        </section>
    );
}

export default Review;