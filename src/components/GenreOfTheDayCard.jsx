import {
    useEffect,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    getDailyGenreResponse,
    saveDailyGenreResponse,
} from "../services/dailyGenre";
import "./GenreOfTheDayCard.css";

const responseOptions = [
    {
        value: "known",
        icon: "✓",
        label: "Sí, lo conozco",
    },
    {
        value: "familiar",
        icon: "◌",
        label: "Me suena",
    },
    {
        value: "new",
        icon: "✦",
        label: "Primera vez",
    },
];

function GenreOfTheDayCard({
    genre,
    userId,
}) {
    const navigate = useNavigate();

    const [selectedResponse, setSelectedResponse] =
        useState("");

    const [savingResponse, setSavingResponse] =
        useState("");

    const [message, setMessage] = useState("");

    useEffect(() => {
        if (
            !genre?.id ||
            !genre?.dateKey ||
            !userId
        ) {
            return;
        }

        let cancelled = false;

        async function loadResponse() {
            try {
                const storedResponse =
                    await getDailyGenreResponse({
                        userId,
                        genreId: genre.id,
                        responseDate: genre.dateKey,
                    });

                if (!cancelled) {
                    setSelectedResponse(
                        storedResponse?.response ?? "",
                    );
                }
            } catch (error) {
                console.error(
                    "No se pudo cargar la respuesta del género:",
                    error,
                );
            }
        }

        loadResponse();

        return () => {
            cancelled = true;
        };
    }, [
        genre?.id,
        genre?.dateKey,
        userId,
    ]);

    async function handleResponse(response) {
        if (
            savingResponse ||
            !genre ||
            !userId
        ) {
            return;
        }

        setSavingResponse(response);
        setMessage("");

        try {
            await saveDailyGenreResponse({
                userId,
                genre,
                response,
            });

            setSelectedResponse(response);
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido guardar tu respuesta.",
            );
        } finally {
            setSavingResponse("");
        }
    }

    function handleDiscoverGenre() {
        navigate("/discover", {
            state: {
                autoGenerate: true,
                selectedGenre:
                    genre.discoverGenre ?? genre.name,
            },
        });
    }

    if (!genre) {
        return null;
    }

    return (
        <article
            className="genre-day-card"
            style={{
                "--genre-day-accent":
                    genre.accent,
            }}
        >
            <div className="genre-day-card__background">
                <span>{genre.icon}</span>
            </div>

            <header className="genre-day-card__header">
                <div>
                    <p>GÉNERO DEL DÍA</p>

                    <span>{genre.category}</span>
                </div>

                <div className="genre-day-card__difficulty">
                    <span>
                        {genre.accessibility.icon}
                    </span>

                    <strong>
                        {genre.accessibility.label}
                    </strong>
                </div>
            </header>

            <section className="genre-day-card__hero">
                <div className="genre-day-card__icon">
                    {genre.icon}
                </div>

                <div>
                    <h2>{genre.name}</h2>

                    <p>{genre.description}</p>
                </div>
            </section>

            <blockquote>
                “{genre.invitation}”
            </blockquote>

            <section className="genre-day-traits">
                <header>
                    <p>¿A QUÉ SUENA?</p>
                    <h3>La personalidad del género</h3>
                </header>

                <div className="genre-day-traits__grid">
                    {genre.traits.map((trait) => (
                        <article key={trait.label}>
                            <div>
                                <span>{trait.label}</span>

                                <strong>
                                    {trait.value}/5
                                </strong>
                            </div>

                            <div className="genre-day-trait-bar">
                                <span
                                    style={{
                                        width: `${trait.value * 20
                                            }%`,
                                    }}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <div className="genre-day-information">
                <section>
                    <p>TE HARÁ SENTIR</p>

                    <div className="genre-day-tags">
                        {genre.moods.map((mood) => (
                            <span key={mood}>
                                {mood}
                            </span>
                        ))}
                    </div>
                </section>

                <section>
                    <p>SONIDO HABITUAL</p>

                    <ul>
                        {genre.instruments.map(
                            (instrument) => (
                                <li key={instrument}>
                                    <span>♪</span>
                                    {instrument}
                                </li>
                            ),
                        )}
                    </ul>
                </section>
            </div>

            <section className="genre-day-artists">
                <header>
                    <p>NOMBRES IMPRESCINDIBLES</p>
                    <h3>Por dónde empezar</h3>
                </header>

                <div>
                    {genre.artists.map(
                        (artist, index) => (
                            <article key={artist}>
                                <strong>{index + 1}</strong>
                                <span>{artist}</span>
                            </article>
                        ),
                    )}
                </div>
            </section>

            <section className="genre-day-album">
                <div className="genre-day-album__disc">
                    <span>33</span>
                    <small>RPM</small>
                </div>

                <div>
                    <p>DISCO PERFECTO PARA EMPEZAR</p>

                    <h3>
                        {genre.starterAlbum.title}
                    </h3>

                    <span>
                        {genre.starterAlbum.artist}
                    </span>
                </div>

                <a
                    href={
                        genre.starterAlbum.spotifyUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                >
                    ▶ Spotify
                </a>
            </section>

            <aside className="genre-day-fact">
                <span>💡</span>

                <div>
                    <strong>Una curiosidad</strong>
                    <p>{genre.fact}</p>
                </div>
            </aside>

            <section className="genre-day-response">
                <header>
                    <p>TU DESCUBRIMIENTO</p>
                    <h3>
                        ¿Ya conocías este género?
                    </h3>
                </header>

                <div>
                    {responseOptions.map(
                        (option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    selectedResponse ===
                                        option.value
                                        ? "genre-day-response__selected"
                                        : ""
                                }
                                onClick={() =>
                                    handleResponse(
                                        option.value,
                                    )
                                }
                                disabled={Boolean(
                                    savingResponse,
                                )}
                            >
                                <span>{option.icon}</span>
                                {savingResponse ===
                                    option.value
                                    ? "Guardando..."
                                    : option.label}
                            </button>
                        ),
                    )}
                </div>

                {message && <small>{message}</small>}
            </section>

            <footer className="genre-day-card__actions">
                <button
                    type="button"
                    onClick={handleDiscoverGenre}
                >
                    <span>✦</span>
                    Descubrir un disco de{" "}
                    {genre.name}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/discover", {
                            state: {
                                openGenreSelector: true,
                            },
                        })
                    }
                >
                    Explorar otros géneros
                </button>
            </footer>
        </article>
    );
}

export default GenreOfTheDayCard;