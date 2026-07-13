import { useEffect, useRef, useState } from "react";
import { searchSpotifyArtists } from "../services/artists";
import UserAvatar from "./UserAvatar";
import "./AvatarSelector.css";

const musicalEmojis = [
    "🎧",
    "💿",
    "📀",
    "🎵",
    "🎶",
    "🎼",
    "🎤",
    "🎙️",
    "🎸",
    "🎹",
    "🥁",
    "🎷",
    "🎺",
    "🎻",
    "🪕",
    "🪘",
    "📻",
    "🔊",
    "🎚️",
    "🎛️",
];

function AvatarSelector({
    profile,
    selectedType,
    selectedEmoji,
    selectedArtist,
    onTypeChange,
    onEmojiChange,
    onArtistChange,
}) {
    const searchInputRef = useRef(null);

    const [query, setQuery] = useState("");
    const [artists, setArtists] = useState([]);
    const [searching, setSearching] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (
            selectedType !== "spotify_artist" ||
            query.trim().length < 2
        ) {
            setArtists([]);
            setSearching(false);
            setMessage("");
            return;
        }

        let cancelled = false;

        const searchTimer = window.setTimeout(async () => {
            setSearching(true);
            setMessage("");

            try {
                const results = await searchSpotifyArtists(
                    query.trim(),
                );

                if (!cancelled) {
                    setArtists(results);

                    if (!results.length) {
                        setMessage(
                            "No hemos encontrado artistas con esa búsqueda.",
                        );
                    }
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setArtists([]);
                    setMessage(
                        error.message ||
                        "No hemos podido buscar artistas.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setSearching(false);
                }
            }
        }, 450);

        return () => {
            cancelled = true;
            window.clearTimeout(searchTimer);
        };
    }, [query, selectedType]);

    const previewProfile =
        selectedType === "spotify_artist" &&
            selectedArtist
            ? {
                ...profile,
                avatar_type: "spotify_artist",
                avatar_url: selectedArtist.image_url,
                avatar_artist_name: selectedArtist.name,
                avatar_spotify_artist_url:
                    selectedArtist.spotify_url,
            }
            : {
                ...profile,
                avatar_type: "emoji",
                avatar: selectedEmoji,
                avatar_url: null,
            };

    return (
        <section className="avatar-selector-panel">
            <header className="avatar-selector-panel__header">
                <UserAvatar
                    profile={previewProfile}
                    size="large"
                    showSpotifyLink={false}
                />

                <div>
                    <p>PREVISUALIZACIÓN</p>

                    <h3>
                        {selectedType === "spotify_artist" &&
                            selectedArtist
                            ? selectedArtist.name
                            : "Avatar musical"}
                    </h3>

                    <span>
                        Así aparecerás en Audite.
                    </span>
                </div>
            </header>

            <div className="avatar-type-tabs">
                <button
                    type="button"
                    className={
                        selectedType === "emoji"
                            ? "avatar-type-tabs__active"
                            : ""
                    }
                    onClick={() => onTypeChange("emoji")}
                >
                    <span>🎧</span>
                    Emojis
                </button>

                <button
                    type="button"
                    className={
                        selectedType === "spotify_artist"
                            ? "avatar-type-tabs__active"
                            : ""
                    }
                    onClick={() => {
                        onTypeChange("spotify_artist");

                        window.setTimeout(() => {
                            searchInputRef.current?.focus();
                        }, 100);
                    }}
                >
                    <span>●</span>
                    Artista de Spotify
                </button>
            </div>

            {selectedType === "emoji" ? (
                <div className="avatar-emoji-grid">
                    {musicalEmojis.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            className={
                                selectedEmoji === emoji
                                    ? "avatar-emoji-grid__item avatar-emoji-grid__item--active"
                                    : "avatar-emoji-grid__item"
                            }
                            onClick={() => onEmojiChange(emoji)}
                            aria-label={`Seleccionar ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="artist-avatar-search">
                    <label>
                        <span>⌕</span>

                        <input
                            ref={searchInputRef}
                            type="search"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="Busca tu artista favorito..."
                        />

                        {searching && (
                            <i className="artist-avatar-search__loader" />
                        )}
                    </label>

                    {selectedArtist && (
                        <article className="artist-avatar-selected">
                            <div>
                                {selectedArtist.image_url ? (
                                    <img
                                        src={selectedArtist.image_url}
                                        alt=""
                                    />
                                ) : (
                                    <span>🎤</span>
                                )}
                            </div>

                            <p>
                                <small>SELECCIONADO</small>
                                <strong>{selectedArtist.name}</strong>
                            </p>

                            <button
                                type="button"
                                onClick={() => onArtistChange(null)}
                            >
                                Cambiar
                            </button>
                        </article>
                    )}

                    {!selectedArtist && artists.length > 0 && (
                        <div className="artist-avatar-results">
                            {artists.map((artist) => (
                                <button
                                    key={artist.spotify_id}
                                    type="button"
                                    onClick={() =>
                                        onArtistChange(artist)
                                    }
                                >
                                    <div>
                                        {artist.image_url ? (
                                            <img
                                                src={artist.image_url}
                                                alt=""
                                            />
                                        ) : (
                                            <span>🎤</span>
                                        )}
                                    </div>

                                    <p>
                                        <strong>{artist.name}</strong>

                                        <small>
                                            {artist.genres
                                                ?.slice(0, 2)
                                                .join(" · ") ||
                                                "Artista"}
                                        </small>
                                    </p>

                                    <span>›</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {message && (
                        <p className="artist-avatar-search__message">
                            {message}
                        </p>
                    )}

                    <p className="artist-avatar-search__attribution">
                        Imágenes y datos proporcionados por Spotify.
                        Al usar este avatar, la imagen enlazará al perfil
                        del artista.
                    </p>
                </div>
            )}
        </section>
    );
}

export default AvatarSelector;