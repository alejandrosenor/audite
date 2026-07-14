import { useEffect, useMemo } from "react";
import "./AlbumDetailModal.css";

const reactionInformation = {
    loved: {
        emoji: "🤯",
        label: "Me ha encantado",
    },
    liked: {
        emoji: "😍",
        label: "Me ha gustado",
    },
    okay: {
        emoji: "🙂",
        label: "Sin más",
    },
    weak: {
        emoji: "😕",
        label: "Flojo",
    },
    disliked: {
        emoji: "🙅",
        label: "No me ha gustado",
    },
    abandoned: {
        emoji: "⏹️",
        label: "No terminado",
    },
};

function formatDuration(durationMs) {
    if (!durationMs) {
        return null;
    }

    const totalMinutes = Math.round(
        durationMs / 60000,
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (!hours) {
        return `${minutes} min`;
    }

    return minutes
        ? `${hours} h ${minutes} min`
        : `${hours} h`;
}

function formatTrackDuration(durationMs) {
    if (!durationMs) {
        return "";
    }

    const totalSeconds = Math.round(
        durationMs / 1000,
    );

    const minutes = Math.floor(
        totalSeconds / 60,
    );

    const seconds = String(
        totalSeconds % 60,
    ).padStart(2, "0");

    return `${minutes}:${seconds}`;
}

function formatDate(value) {
    if (!value) {
        return null;
    }

    return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(value));
}

function AlbumDetailModal({
    detail,
    loading,
    onClose,
    onDelete,
    onEdit,
}) {
    useEffect(() => {
        if (!detail && !loading) {
            return;
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [detail, loading, onClose]);

    const favoriteTrackIds = useMemo(
        () =>
            new Set(
                detail?.favorite_tracks?.map(
                    (favorite) =>
                        favorite.track?.id,
                ) ?? [],
            ),
        [detail],
    );

    if (!detail && !loading) {
        return null;
    }

    if (loading) {
        return (
            <div className="album-detail-backdrop">
                <section className="album-detail-modal album-detail-modal--loading">
                    <div className="album-detail-loader" />

                    <h2>Abriendo tu disco...</h2>
                </section>
            </div>
        );
    }

    const album = detail.album;
    const userAlbum = detail.user_album;

    const reaction =
        reactionInformation[detail.reaction] ??
        reactionInformation.okay;

    const isAbandoned =
        detail.reaction === "abandoned";

    const coverStyle = album.cover_url
        ? {
            "--album-cover": `url("${album.cover_url}")`,
        }
        : {};

    const historyItems = [
        {
            icon: "✦",
            label: "Descubierto",
            value:
                userAlbum?.generated_at ??
                userAlbum?.created_at,
        },
        {
            icon: "＋",
            label: "Añadido a tu lista",
            value: userAlbum?.accepted_at,
        },
        {
            icon: "🎧",
            label: "Empezaste a escucharlo",
            value: userAlbum?.started_at,
        },
        {
            icon: isAbandoned ? "⏹️" : "★",
            label: isAbandoned
                ? "Dejaste la escucha"
                : "Terminaste y valoraste",
            value:
                userAlbum?.abandoned_at ??
                userAlbum?.completed_at ??
                detail.created_at,
        },
    ].filter((item) => item.value);

    return (
        <div
            className="album-detail-backdrop"
            onMouseDown={onClose}
        >
            <section
                className="album-detail-modal"
                style={coverStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="album-detail-title"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="album-detail-modal__background" />

                <header className="album-detail-modal__topbar">
                    <div>
                        <span>FICHA DEL DISCO</span>
                        <strong>Tu historia musical</strong>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar disco"
                    >
                        ×
                    </button>
                </header>

                <div className="album-detail-modal__scroll">
                    <section className="album-detail-hero">
                        <div className="album-detail-hero__cover">
                            {album.cover_url ? (
                                <img
                                    src={album.cover_url}
                                    alt={`Portada de ${album.title}`}
                                />
                            ) : (
                                <div>💿</div>
                            )}
                        </div>

                        <div className="album-detail-hero__content">
                            <p>
                                {isAbandoned
                                    ? "NO TERMINADO"
                                    : "DISCO ESCUCHADO"}
                            </p>

                            <h1 id="album-detail-title">
                                {album.title}
                            </h1>

                            <h2>{album.artist_name}</h2>

                            <div className="album-detail-metadata">
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

                                {album.duration_ms && (
                                    <span>
                                        {formatDuration(
                                            album.duration_ms,
                                        )}
                                    </span>
                                )}

                                {album.genres
                                    ?.slice(0, 3)
                                    .map((genre) => (
                                        <span key={genre}>
                                            {genre}
                                        </span>
                                    ))}
                            </div>

                            {album.spotify_url && (
                                <a
                                    href={album.spotify_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="album-detail-spotify"
                                >
                                    <span>▶</span>
                                    Abrir disco en Spotify
                                </a>
                            )}
                        </div>
                    </section>

                    <section className="album-detail-review">
                        <header>
                            <div>
                                <p>TU VALORACIÓN</p>
                                <h2>
                                    ¿Qué te pareció este disco?
                                </h2>
                            </div>

                            {detail.rating !== null &&
                                detail.rating !== undefined && (
                                    <strong>
                                        {Number(detail.rating)
                                            .toFixed(1)
                                            .replace(".", ",")}
                                    </strong>
                                )}
                        </header>

                        <div className="album-detail-reaction">
                            <span>{reaction.emoji}</span>

                            <div>
                                <strong>{reaction.label}</strong>

                                <small>
                                    {formatDate(
                                        userAlbum?.completed_at ??
                                        userAlbum?.abandoned_at ??
                                        detail.created_at,
                                    )}
                                </small>
                            </div>
                        </div>

                        {detail.review_text && (
                            <blockquote>
                                “{detail.review_text}”
                            </blockquote>
                        )}

                        {detail.would_listen_again !== null &&
                            detail.would_listen_again !==
                            undefined && (
                                <p className="album-detail-listen-again">
                                    {detail.would_listen_again
                                        ? "↻ Volverías a escucharlo"
                                        : "Probablemente no volverías a escucharlo"}
                                </p>
                            )}
                    </section>

                    {detail.favorite_tracks?.length >
                        0 && (
                            <section className="album-detail-section">
                                <header className="album-detail-section__header">
                                    <div>
                                        <p>TUS ELEGIDAS</p>
                                        <h2>Canciones top</h2>
                                    </div>

                                    <span>
                                        {
                                            detail.favorite_tracks
                                                .length
                                        }
                                    </span>
                                </header>

                                <ol className="album-detail-favorites">
                                    {detail.favorite_tracks.map(
                                        (favorite, index) => (
                                            <li key={favorite.id}>
                                                <strong>
                                                    {index + 1}
                                                </strong>

                                                <div>
                                                    <span>
                                                        {favorite.track?.title}
                                                    </span>

                                                    <small>
                                                        Pista{" "}
                                                        {favorite.track
                                                            ?.track_number ?? "—"}
                                                    </small>
                                                </div>

                                                {favorite.track
                                                    ?.spotify_url ? (
                                                    <a
                                                        href={
                                                            favorite.track
                                                                .spotify_url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        aria-label={`Abrir ${favorite.track.title} en Spotify`}
                                                    >
                                                        ▶
                                                    </a>
                                                ) : (
                                                    <span>★</span>
                                                )}
                                            </li>
                                        ),
                                    )}
                                </ol>
                            </section>
                        )}

                    <section className="album-detail-section">
                        <header className="album-detail-section__header">
                            <div>
                                <p>LISTA COMPLETA</p>
                                <h2>Tracklist</h2>
                            </div>

                            <span>
                                {detail.tracks?.length ?? 0}
                            </span>
                        </header>

                        {detail.tracks?.length ? (
                            <ol className="album-detail-tracklist">
                                {detail.tracks.map((track) => {
                                    const isFavorite =
                                        favoriteTrackIds.has(
                                            track.id,
                                        );

                                    return (
                                        <li
                                            key={track.id}
                                            className={
                                                isFavorite
                                                    ? "album-detail-tracklist__favorite"
                                                    : ""
                                            }
                                        >
                                            <span>
                                                {track.disc_number > 1
                                                    ? `${track.disc_number}.${track.track_number}`
                                                    : track.track_number}
                                            </span>

                                            <div>
                                                <strong>
                                                    {track.title}
                                                </strong>

                                                {isFavorite && (
                                                    <small>
                                                        ★ Canción top
                                                    </small>
                                                )}
                                            </div>

                                            <time>
                                                {formatTrackDuration(
                                                    track.duration_ms,
                                                )}
                                            </time>

                                            {track.spotify_url && (
                                                <a
                                                    href={
                                                        track.spotify_url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Abrir ${track.title} en Spotify`}
                                                >
                                                    ▶
                                                </a>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        ) : (
                            <p className="album-detail-empty">
                                No tenemos disponible el tracklist
                                completo.
                            </p>
                        )}
                    </section>

                    <section className="album-detail-section">
                        <header className="album-detail-section__header">
                            <div>
                                <p>TU RECUERDO</p>
                                <h2>
                                    Tu historia con este disco
                                </h2>
                            </div>
                        </header>

                        <div className="album-history">
                            {historyItems.map((item) => (
                                <article
                                    key={`${item.label}-${item.value}`}
                                >
                                    <span>{item.icon}</span>

                                    <div>
                                        <strong>
                                            {item.label}
                                        </strong>

                                        <p>
                                            {formatDate(item.value)}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {userAlbum?.source ===
                            "recommendation" && (
                                <div className="album-recommendation">
                                    <span>💬</span>

                                    <div>
                                        <strong>
                                            Recomendado por{" "}
                                            {userAlbum.recommended_by}
                                        </strong>

                                        {userAlbum.personal_note && (
                                            <p>
                                                {userAlbum.personal_note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                        {userAlbum?.source === "manual" &&
                            userAlbum.personal_note && (
                                <div className="album-recommendation">
                                    <span>📝</span>

                                    <div>
                                        <strong>
                                            Tu nota personal
                                        </strong>

                                        <p>
                                            {userAlbum.personal_note}
                                        </p>
                                    </div>
                                </div>
                            )}
                    </section>

                    <section className="album-detail-facts">
                        <article>
                            <span>◷</span>
                            <strong>
                                {formatDuration(
                                    album.duration_ms,
                                ) ?? "—"}
                            </strong>
                            <p>Duración</p>
                        </article>

                        <article>
                            <span>♪</span>
                            <strong>
                                {album.track_count ?? "—"}
                            </strong>
                            <p>Canciones</p>
                        </article>

                        <article>
                            <span>◉</span>
                            <strong>
                                {album.release_year ?? "—"}
                            </strong>
                            <p>Año</p>
                        </article>

                        <article>
                            <span>✦</span>
                            <strong>
                                {album.genres?.[0] ??
                                    "Sin género"}
                            </strong>
                            <p>Género principal</p>
                        </article>
                    </section>

                    <footer className="album-detail-actions">
                        {!isAbandoned && onEdit && (
                            <button
                                type="button"
                                onClick={() =>
                                    onEdit(detail)
                                }
                            >
                                Editar valoración
                            </button>
                        )}

                        {isAbandoned && onDelete && (
                            <button
                                type="button"
                                className="album-detail-actions__delete"
                                onClick={() =>
                                    onDelete(detail)
                                }
                            >
                                Eliminar de Biblioteca
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                        >
                            Cerrar ficha
                        </button>
                    </footer>
                </div>
            </section>
        </div>
    );
}

export default AlbumDetailModal;