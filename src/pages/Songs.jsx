import { useEffect, useMemo, useState } from "react";
import LibraryTabs from "../components/LibraryTabs";
import { useAuth } from "../context/AuthContext";
import { getFavoriteTracks } from "../services/reviews";
import {
    addTrackToSpotifyPlaylist,
    getSpotifyConnection,
    getSpotifyPlaylistTrackIds,
    removeTrackFromSpotifyPlaylist,
} from "../services/spotify";
import "./Songs.css";

function Songs() {
    const { user } = useAuth();

    const [favoriteTracks, setFavoriteTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [sortMode, setSortMode] = useState("recent");
    const [
        spotifyConnection,
        setSpotifyConnection,
    ] = useState(null);
    const [
        spotifyTrackIds,
        setSpotifyTrackIds,
    ] = useState([]);
    const [
        syncingTrackIds,
        setSyncingTrackIds,
    ] = useState([]);
    const [
        spotifyMessage,
        setSpotifyMessage,
    ] = useState("");

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadSpotifyState() {
            try {
                const connection =
                    await getSpotifyConnection();

                if (cancelled) {
                    return;
                }

                setSpotifyConnection(connection);

                if (!connection) {
                    setSpotifyTrackIds([]);
                    return;
                }

                const trackIds =
                    await getSpotifyPlaylistTrackIds();

                if (!cancelled) {
                    setSpotifyTrackIds(trackIds);
                }
            } catch (error) {
                console.error(
                    "No se pudo cargar Spotify:",
                    error,
                );
            }
        }

        loadSpotifyState();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadFavoriteTracks() {
            try {
                const tracks = await getFavoriteTracks(user.id);

                if (!cancelled) {
                    setFavoriteTracks(tracks);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMessage(
                        "No hemos podido cargar tus canciones top.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadFavoriteTracks();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const filteredTracks = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        const tracks = favoriteTracks.filter((item) => {
            if (!normalizedSearch) {
                return true;
            }

            const title = item.track?.title
                ?.toLowerCase() ?? "";

            const albumTitle = item.album?.title
                ?.toLowerCase() ?? "";

            const artist = item.album?.artist_name
                ?.toLowerCase() ?? "";

            return (
                title.includes(normalizedSearch) ||
                albumTitle.includes(normalizedSearch) ||
                artist.includes(normalizedSearch)
            );
        });

        return [...tracks].sort((first, second) => {
            if (sortMode === "title") {
                return (
                    first.track?.title ?? ""
                ).localeCompare(
                    second.track?.title ?? "",
                    "es",
                );
            }

            if (sortMode === "album") {
                return (
                    first.album?.title ?? ""
                ).localeCompare(
                    second.album?.title ?? "",
                    "es",
                );
            }

            if (sortMode === "rating") {
                return (
                    Number(second.review?.rating ?? 0) -
                    Number(first.review?.rating ?? 0)
                );
            }

            return (
                new Date(second.created_at).getTime() -
                new Date(first.created_at).getTime()
            );
        });
    }, [favoriteTracks, search, sortMode]);

    const albumsWithTracks = useMemo(() => {
        return filteredTracks.reduce((groups, item) => {
            const albumId = item.album?.id;

            if (!albumId) {
                return groups;
            }

            if (!groups[albumId]) {
                groups[albumId] = {
                    album: item.album,
                    review: item.review,
                    tracks: [],
                };
            }

            groups[albumId].tracks.push(item);

            return groups;
        }, {});
    }, [filteredTracks]);

    const groupedAlbums = Object.values(albumsWithTracks);

    async function handleSpotifyToggle(item) {
        const trackId =
            item.track?.id;

        if (!trackId) {
            setSpotifyMessage(
                "Esta canción no tiene un identificador válido.",
            );
            return;
        }

        if (!spotifyConnection) {
            setSpotifyMessage(
                "Conecta tu cuenta de Spotify desde Perfil.",
            );
            return;
        }

        const isAdded =
            spotifyTrackIds.includes(trackId);

        setSyncingTrackIds((current) => [
            ...current,
            trackId,
        ]);

        setSpotifyMessage("");

        try {
            if (isAdded) {
                await removeTrackFromSpotifyPlaylist(
                    trackId,
                );

                setSpotifyTrackIds(
                    (current) =>
                        current.filter(
                            (id) => id !== trackId,
                        ),
                );

                setSpotifyMessage(
                    `"${item.track.title}" se ha quitado de tu playlist.`,
                );
            } else {
                await addTrackToSpotifyPlaylist(
                    trackId,
                );

                setSpotifyTrackIds(
                    (current) =>
                        current.includes(trackId)
                            ? current
                            : [...current, trackId],
                );

                setSpotifyMessage(
                    `"${item.track.title}" se ha añadido a tu playlist.`,
                );
            }
        } catch (error) {
            console.error(error);

            setSpotifyMessage(
                error.message ||
                "No hemos podido sincronizar la canción.",
            );
        } finally {
            setSyncingTrackIds(
                (current) =>
                    current.filter(
                        (id) => id !== trackId,
                    ),
            );
        }
    }

    if (loading) {
        return (
            <section className="songs-page">
                <p className="songs-page__eyebrow">
                    TUS FAVORITAS
                </p>

                <h1>Cargando canciones...</h1>
            </section>
        );
    }

    return (
        <section className="songs-page">
            <header className="songs-page__header">
                <div>
                    <p className="songs-page__eyebrow">
                        TUS FAVORITAS
                    </p>

                    <h1>Canciones top</h1>

                    <p>
                        Todas las canciones que destacaste durante
                        tus escuchas.
                    </p>
                </div>

                <div className="songs-page__counter">
                    <strong>{favoriteTracks.length}</strong>

                    <span>
                        {favoriteTracks.length === 1
                            ? "canción guardada"
                            : "canciones guardadas"}
                    </span>
                </div>
            </header>

            <LibraryTabs />

            {message && (
                <p className="songs-page__message">
                    {message}
                </p>
            )}

            {spotifyMessage && (
                <p className="songs-page__message songs-page__message--spotify">
                    {spotifyMessage}
                </p>
            )}

            {favoriteTracks.length > 0 && (
                <div className="songs-toolbar">
                    <label className="songs-search">
                        <span>⌕</span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Buscar canción, disco o artista"
                        />
                    </label>

                    <select
                        value={sortMode}
                        onChange={(event) =>
                            setSortMode(event.target.value)
                        }
                    >
                        <option value="recent">
                            Más recientes
                        </option>

                        <option value="title">
                            Por canción
                        </option>

                        <option value="album">
                            Por disco
                        </option>

                        <option value="rating">
                            Mejor nota
                        </option>
                    </select>
                </div>
            )}

            {groupedAlbums.length === 0 ? (
                <article className="songs-empty">
                    <span>♪</span>

                    <h2>
                        {favoriteTracks.length === 0
                            ? "Todavía no tienes canciones top"
                            : "No hay resultados"}
                    </h2>

                    <p>
                        Marca tus canciones favoritas al terminar
                        y valorar un disco.
                    </p>
                </article>
            ) : (
                <div className="songs-albums">
                    {groupedAlbums.map((group) => (
                        <article
                            className="songs-album-card"
                            key={group.album.id}
                        >
                            <header className="songs-album-card__header">
                                <div className="songs-album-card__cover">
                                    {group.album.cover_url ? (
                                        <img
                                            src={group.album.cover_url}
                                            alt={`Portada de ${group.album.title}`}
                                        />
                                    ) : (
                                        <div>💿</div>
                                    )}
                                </div>

                                <div className="songs-album-card__info">
                                    <p>
                                        {group.tracks.length}
                                        {group.tracks.length === 1
                                            ? " canción top"
                                            : " canciones top"}
                                    </p>

                                    <h2>{group.album.title}</h2>
                                    <h3>{group.album.artist_name}</h3>

                                    <div className="songs-album-card__metadata">
                                        {group.album.release_year && (
                                            <span>
                                                {group.album.release_year}
                                            </span>
                                        )}

                                        {group.review?.rating !== null &&
                                            group.review?.rating !==
                                            undefined && (
                                                <span>
                                                    ★ {group.review.rating}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </header>

                            <ol className="songs-track-list">
                                {group.tracks.map((item, index) => (
                                    <li key={item.id}>
                                        <span className="songs-track-list__position">
                                            {index + 1}
                                        </span>

                                        <div>
                                            <strong>
                                                {item.track?.title ??
                                                    "Canción sin título"}
                                            </strong>

                                            <small>
                                                Pista{" "}
                                                {item.track?.track_number ?? "—"}
                                            </small>
                                        </div>

                                        <div className="songs-track-list__actions">
                                            {item.track?.spotify_url ? (
                                                <a
                                                    className="songs-track-list__play"
                                                    href={item.track.spotify_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Abrir ${item.track.title} en Spotify`}
                                                >
                                                    ▶
                                                </a>
                                            ) : (
                                                <span className="songs-track-list__unavailable">
                                                    —
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                className={`songs-track-list__sync ${spotifyTrackIds.includes(
                                                    item.track?.id,
                                                )
                                                        ? "songs-track-list__sync--added"
                                                        : ""
                                                    }`}
                                                onClick={() =>
                                                    handleSpotifyToggle(item)
                                                }
                                                disabled={
                                                    !item.track?.spotify_uri ||
                                                    syncingTrackIds.includes(
                                                        item.track?.id,
                                                    )
                                                }
                                                aria-label={
                                                    spotifyTrackIds.includes(
                                                        item.track?.id,
                                                    )
                                                        ? `Quitar ${item.track?.title} de la playlist`
                                                        : `Añadir ${item.track?.title} a la playlist`
                                                }
                                                title={
                                                    !spotifyConnection
                                                        ? "Conecta Spotify desde Perfil"
                                                        : spotifyTrackIds.includes(
                                                            item.track?.id,
                                                        )
                                                            ? "Quitar de Audite — Mis canciones"
                                                            : "Añadir a Audite — Mis canciones"
                                                }
                                            >
                                                {syncingTrackIds.includes(
                                                    item.track?.id,
                                                )
                                                    ? "…"
                                                    : spotifyTrackIds.includes(
                                                        item.track?.id,
                                                    )
                                                        ? "✓"
                                                        : "+"}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ol>

                            {group.album.spotify_url && (
                                <a
                                    className="songs-album-card__spotify"
                                    href={group.album.spotify_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <span>▶</span>
                                    Abrir disco en Spotify
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Songs;