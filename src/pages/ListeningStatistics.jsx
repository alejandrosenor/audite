import { useEffect, useMemo, useState } from "react";
import { getListeningStatistics } from "../services/listeningStatistics";
import "./ListeningStatistics.css";

const xpLabels = {
    album_completed: "Discos terminados",
    album_reviewed: "Valoraciones",
    favorite_tracks: "Canciones top",
    new_genre: "Nuevos géneros",
    daily_challenge: "Retos diarios",
    weekly_challenge: "Retos semanales",
};

function formatDuration(ms) {
    const minutes = Math.floor(Number(ms ?? 0) / 60000);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return `${rest} min`;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function formatRating(value) {
    if (value === null || value === undefined) return "—";
    return Number(value).toFixed(1).replace(".", ",");
}

function RecordCard({ label, record, value, empty }) {
    return (
        <article className="listening-record">
            <p>{label}</p>
            {record ? (
                <div className="listening-record__body">
                    <div className="listening-record__cover">
                        {record.coverUrl ? (
                            <img src={record.coverUrl} alt="" />
                        ) : (
                            <span>💿</span>
                        )}
                    </div>
                    <div>
                        <h3>{record.title}</h3>
                        <span>{record.artistName}</span>
                        <strong>{value}</strong>
                    </div>
                </div>
            ) : (
                <div className="listening-record__empty">{empty}</div>
            )}
        </article>
    );
}

function ListeningStatistics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await getListeningStatistics();
                if (!cancelled) setData(result);
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setMessage("No hemos podido cargar tus estadísticas.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const xpRows = useMemo(() => {
        if (!data?.xp) return [];
        return [
            ["Discos terminados", data.xp.albumCompleted],
            ["Valoraciones", data.xp.albumReviewed],
            ["Canciones top", data.xp.favoriteTracks],
            ["Nuevos géneros", data.xp.newGenre],
            ["Retos diarios", data.xp.dailyChallenges],
            ["Retos semanales", data.xp.weeklyChallenges],
        ];
    }, [data]);

    if (loading) {
        return <section className="listening-stats"><h1>Calculando tus estadísticas...</h1></section>;
    }

    if (!data || message) {
        return <section className="listening-stats"><h1>Estadísticas de escucha</h1><p>{message}</p></section>;
    }

    const { summary, records, artists, genres, xp } = data;
    const maxXP = Math.max(1, ...xpRows.map(([, value]) => Number(value ?? 0)));
    const maxGenreXP = Math.max(1, Number(genres.distribution?.[0]?.genreXP ?? 0));

    return (
        <section className="listening-stats">
            <header className="listening-stats__hero">
                <p>TU HISTORIA EN NÚMEROS</p>
                <h1>Estadísticas de escucha</h1>
                <span>Cada disco terminado deja una huella en tu perfil musical.</span>
            </header>

            <div className="listening-summary">
                {[
                    ["💿", summary.completedAlbums, "Discos terminados"],
                    ["⏳", formatDuration(summary.totalListeningMs), "Tiempo total"],
                    ["⭐", formatRating(summary.averageRating), "Nota media"],
                    ["🎵", summary.favoriteTracks, "Canciones favoritas"],
                    ["🎤", summary.distinctArtists, "Artistas distintos"],
                    ["🔶", summary.exploredGenres, "Géneros explorados"],
                ].map(([icon, value, label]) => (
                    <article key={label}>
                        <span>{icon}</span><strong>{value}</strong><p>{label}</p>
                    </article>
                ))}
            </div>

            <section className="listening-section">
                <header><p>TUS RÉCORDS</p><h2>Discos que hicieron historia</h2></header>
                <div className="listening-records">
                    <RecordCard label="DISCO MÁS LARGO" record={records.longestAlbum}
                        value={records.longestAlbum ? formatDuration(records.longestAlbum.durationMs) : ""}
                        empty="Necesitamos tener sus canciones sincronizadas." />
                    <RecordCard label="MEJOR VALORADO" record={records.highestRatedAlbum}
                        value={records.highestRatedAlbum ? `${formatRating(records.highestRatedAlbum.rating)}/10` : ""}
                        empty="Todavía no has valorado ningún disco." />
                    <RecordCard label="MÁS FAVORITAS" record={records.mostFavoritedAlbum}
                        value={records.mostFavoritedAlbum ? `${records.mostFavoritedAlbum.favoriteCount} canciones` : ""}
                        empty="Todavía no has guardado favoritas." />
                    <RecordCard label="MÁS ANTIGUO" record={records.oldestAlbum}
                        value={records.oldestAlbum?.releaseYear ?? ""}
                        empty="No tenemos fechas suficientes." />
                    <RecordCard label="MÁS MODERNO" record={records.newestAlbum}
                        value={records.newestAlbum?.releaseYear ?? ""}
                        empty="No tenemos fechas suficientes." />
                    <RecordCard label="MÁS CANCIONES" record={records.mostTracksAlbum}
                        value={records.mostTracksAlbum ? `${records.mostTracksAlbum.trackCount} canciones` : ""}
                        empty="No hay información de canciones." />
                </div>
            </section>

            <section className="listening-section">
                <header><p>TUS ARTISTAS</p><h2>Quiénes más han sonado</h2></header>
                <div className="listening-artists">
                    <article className="featured">
                        <span>MÁS REPETIDO</span>
                        {artists.mostRepeated ? <>
                            <h3>{artists.mostRepeated.artistName}</h3>
                            <strong>{artists.mostRepeated.completedAlbums} discos</strong>
                            <p>Nota media {formatRating(artists.mostRepeated.averageRating)}</p>
                        </> : <p>Todavía no has escuchado más de un disco del mismo artista.</p>}
                    </article>
                    <article>
                        <span>MEJOR VALORADO</span>
                        {artists.highestRated ? <>
                            <h3>{artists.highestRated.artistName}</h3>
                            <strong>{formatRating(artists.highestRated.averageRating)}</strong>
                        </> : <p>Necesitas repetir artista para calcularlo.</p>}
                    </article>
                    <article>
                        <span>MÁS FAVORITAS</span>
                        {artists.mostFavorited ? <>
                            <h3>{artists.mostFavorited.artistName}</h3>
                            <strong>{artists.mostFavorited.favoriteCount} canciones</strong>
                        </> : <p>Aún no hay favoritas suficientes.</p>}
                    </article>
                </div>
            </section>

            <section className="listening-section">
                <header><p>TU MAPA SONORO</p><h2>Afinidad por géneros</h2></header>
                {genres.favorite ? (
                    <article className="favorite-genre">
                        <div><span>GÉNERO FAVORITO</span><h3>{genres.favorite.genre}</h3>
                            <p>{genres.favorite.completedAlbums} discos · Media {formatRating(genres.favorite.averageRating)}</p></div>
                        <strong>{genres.favorite.genreXP} XP</strong>
                    </article>
                ) : <p>No hay afinidades calculadas todavía.</p>}

                <div className="genre-list">
                    {genres.distribution?.map((genre) => (
                        <article key={genre.genre}>
                            <header><strong>{genre.genre}</strong><span>{genre.genreXP} XP</span></header>
                            <div><span style={{ width: `${Math.round(Number(genre.genreXP) / maxGenreXP * 100)}%` }} /></div>
                            <p>{genre.completedAlbums} discos · Media {formatRating(genre.averageRating)}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="listening-section">
                <header><p>TU EXPERIENCIA</p><h2>De dónde viene tu XP</h2></header>
                <article className="xp-total">
                    <span>XP REGISTRADA</span><strong>{xp.total}</strong>
                    <p>Tu género favorito acumula <b>{xp.favoriteGenreXP} XP</b>.</p>
                </article>
                <div className="xp-list">
                    {xpRows.map(([label, value]) => (
                        <article key={label}>
                            <header><span>{label}</span><strong>{value} XP</strong></header>
                            <div><span style={{ width: `${Math.round(Number(value) / maxXP * 100)}%` }} /></div>
                        </article>
                    ))}
                </div>
                <div className="xp-highlights">
                    <article><span>MAYOR FUENTE</span>
                        <strong>{xp.topSource ? (xpLabels[xp.topSource.sourceType] ?? xp.topSource.sourceType) : "Sin datos"}</strong>
                        <p>{xp.topSource ? `${xp.topSource.amount} XP` : "—"}</p>
                    </article>
                    <article><span>MEJOR DÍA</span>
                        <strong>{xp.bestDay ? new Date(`${xp.bestDay.day}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" }) : "Sin datos"}</strong>
                        <p>{xp.bestDay ? `${xp.bestDay.amount} XP` : "—"}</p>
                    </article>
                </div>
            </section>
        </section>
    );
}

export default ListeningStatistics;
