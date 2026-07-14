import {
    useEffect,
    useRef,
    useState,
} from "react";
import "./DailyTrackCard.css";

function formatDuration(durationMs) {
    if (!durationMs) {
        return null;
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

function DailyTrackCard({
    track,
    loading,
    message,
}) {
    const audioRef = useRef(null);

    const [playing, setPlaying] =
        useState(false);

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
        };
    }, []);

    function handleTogglePreview() {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        if (playing) {
            audio.pause();
            setPlaying(false);
            return;
        }

        audio.play()
            .then(() => {
                setPlaying(true);
            })
            .catch((error) => {
                console.error(
                    "No se pudo reproducir la muestra:",
                    error,
                );
            });
    }

    if (loading) {
        return (
            <section className="daily-track-card daily-track-card--loading">
                <div className="daily-track-card__skeleton" />

                <div>
                    <span />
                    <strong />
                    <p />
                </div>
            </section>
        );
    }

    if (!track) {
        return (
            <section className="daily-track-card daily-track-card--empty">
                <span>🎵</span>

                <div>
                    <p>CANCIÓN DEL DÍA</p>
                    <h2>Hoy el tocadiscos está descansando</h2>

                    <small>
                        {message ??
                            "No hemos podido preparar la recomendación de hoy."}
                    </small>
                </div>
            </section>
        );
    }

    return (
        <section
            className="daily-track-card"
            style={
                track.album_cover_url
                    ? {
                        "--daily-cover":
                            `url("${track.album_cover_url}")`,
                    }
                    : {}
            }
        >
            <div className="daily-track-card__background" />

            <div className="daily-track-card__cover">
                {track.album_cover_url ? (
                    <img
                        src={track.album_cover_url}
                        alt={`Portada de ${track.album_title}`}
                    />
                ) : (
                    <div>🎵</div>
                )}

                {track.preview_url && (
                    <button
                        type="button"
                        onClick={handleTogglePreview}
                        aria-label={
                            playing
                                ? "Pausar muestra"
                                : "Escuchar muestra"
                        }
                    >
                        {playing ? "❚❚" : "▶"}
                    </button>
                )}
            </div>

            <div className="daily-track-card__content">
                <p>CANCIÓN DEL DÍA</p>

                <h2>{track.title}</h2>

                <h3>{track.artist_name}</h3>

                <div className="daily-track-card__metadata">
                    {track.genre && (
                        <span>{track.genre}</span>
                    )}

                    {track.release_year && (
                        <span>{track.release_year}</span>
                    )}

                    {track.duration_ms && (
                        <span>
                            {formatDuration(
                                track.duration_ms,
                            )}
                        </span>
                    )}
                </div>

                <p className="daily-track-card__description">
                    Una pequeña parada diaria fuera del reto
                    principal. Quizá aquí aparezca tu próxima
                    canción favorita.
                </p>

                <div className="daily-track-card__actions">
                    {track.preview_url && (
                        <button
                            type="button"
                            onClick={handleTogglePreview}
                        >
                            {playing
                                ? "Pausar muestra"
                                : "Escuchar muestra"}
                        </button>
                    )}

                    <a
                        href={track.spotify_url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        ▶ Abrir en Spotify
                    </a>
                </div>

                {track.preview_url && (
                    <audio
                        ref={audioRef}
                        src={track.preview_url}
                        preload="none"
                        onEnded={() =>
                            setPlaying(false)
                        }
                        onPause={() =>
                            setPlaying(false)
                        }
                    />
                )}
            </div>
        </section>
    );
}

export default DailyTrackCard;