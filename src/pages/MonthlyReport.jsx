import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    formatListeningDuration,
    formatReportRating,
    getMonthlyListeningReport,
    shareMonthlyReport,
} from "../services/monthlyReport";
import "./MonthlyReport.css";

const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

function HighlightAlbum({
    label,
    album,
    emptyText,
    negative = false,
}) {
    return (
        <article
            className={[
                "monthly-highlight-album",
                negative
                    ? "monthly-highlight-album--negative"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <p>{label}</p>

            {album ? (
                <div>
                    <div className="monthly-highlight-album__cover">
                        {album.coverUrl ? (
                            <img
                                src={
                                    album.coverUrl
                                }
                                alt=""
                            />
                        ) : (
                            <span>
                                💿
                            </span>
                        )}
                    </div>

                    <section>
                        <h3>
                            {album.title}
                        </h3>

                        <span>
                            {
                                album.artistName
                            }
                        </span>

                        <strong>
                            {formatReportRating(
                                album.rating,
                            )}
                        </strong>

                        {album.reviewText && (
                            <blockquote>
                                “
                                {
                                    album.reviewText
                                }
                                ”
                            </blockquote>
                        )}
                    </section>
                </div>
            ) : (
                <span className="monthly-report__empty-copy">
                    {emptyText}
                </span>
            )}
        </article>
    );
}

export default function MonthlyReport() {
    const now = new Date();

    const initialMonth =
        now.getMonth() + 1;

    const initialYear =
        now.getFullYear();

    const [year, setYear] =
        useState(initialYear);

    const [month, setMonth] =
        useState(initialMonth);

    const [report, setReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [sharing, setSharing] =
        useState(false);

    const [message, setMessage] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setMessage("");

        getMonthlyListeningReport({
            year,
            month,
        })
            .then((result) => {
                if (!cancelled) {
                    setReport(result);
                }
            })
            .catch((error) => {
                console.error(error);

                if (!cancelled) {
                    setMessage(
                        "No hemos podido preparar tu informe mensual.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(
                        false,
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [year, month]);

    const archive =
        useMemo(
            () =>
                report?.availableMonths ??
                [],
            [report],
        );

    async function handleShare() {
        if (
            !report ||
            sharing
        ) {
            return;
        }

        setSharing(true);
        setMessage("");

        try {
            await shareMonthlyReport(
                report,
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "No hemos podido crear la portada para compartir.",
            );
        } finally {
            setSharing(false);
        }
    }

    if (loading) {
        return (
            <section className="monthly-report-page">
                <p className="monthly-report-page__eyebrow">
                    TU HISTORIA
                </p>

                <h1>
                    Preparando tu mes
                    musical...
                </h1>
            </section>
        );
    }

    if (
        !report ||
        message &&
        !report
    ) {
        return (
            <section className="monthly-report-page">
                <p className="monthly-report-page__eyebrow">
                    TU HISTORIA
                </p>

                <h1>
                    Informe mensual
                </h1>

                <p>
                    {message}
                </p>
            </section>
        );
    }

    const {
        summary,
        highlights,
        genreDistribution,
        albums,
    } = report;

    return (
        <section className="monthly-report-page">
            <header className="monthly-report-hero">
                <div>
                    <p className="monthly-report-page__eyebrow">
                        TU MES MUSICAL
                    </p>

                    <h1>
                        {MONTHS[
                            month - 1
                        ]}
                        <br />
                        {year}
                    </h1>

                    <span>
                        Todo lo que
                        descubriste,
                        sentiste y
                        escuchaste este
                        mes.
                    </span>
                </div>

                <div className="monthly-report-hero__actions">
                    <label>
                        <span>
                            MES
                        </span>

                        <select
                            value={`${year}-${month}`}
                            onChange={(
                                event,
                            ) => {
                                const [
                                    selectedYear,
                                    selectedMonth,
                                ] =
                                    event.target.value.split(
                                        "-",
                                    );

                                setYear(
                                    Number(
                                        selectedYear,
                                    ),
                                );

                                setMonth(
                                    Number(
                                        selectedMonth,
                                    ),
                                );
                            }}
                        >
                            {archive.length ? (
                                archive.map(
                                    (
                                        item,
                                    ) => (
                                        <option
                                            key={`${item.year}-${item.month}`}
                                            value={`${item.year}-${item.month}`}
                                        >
                                            {
                                                MONTHS[
                                                item.month -
                                                1
                                                ]
                                            }{" "}
                                            {
                                                item.year
                                            }
                                        </option>
                                    ),
                                )
                            ) : (
                                <option
                                    value={`${year}-${month}`}
                                >
                                    {
                                        MONTHS[
                                        month -
                                        1
                                        ]
                                    }{" "}
                                    {year}
                                </option>
                            )}
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={
                            handleShare
                        }
                        disabled={
                            sharing ||
                            summary.completedAlbums ===
                            0
                        }
                    >
                        {sharing
                            ? "Creando portada..."
                            : "Compartir informe"}
                    </button>
                </div>
            </header>

            {message && (
                <p className="monthly-report-page__message">
                    {message}
                </p>
            )}

            <section className="monthly-report-summary">
                <article className="monthly-report-summary__featured">
                    <span>
                        DISCOS TERMINADOS
                    </span>

                    <strong>
                        {
                            summary.completedAlbums
                        }
                    </strong>

                    <p>
                        en{" "}
                        {
                            summary.activeDays
                        }{" "}
                        días de escucha
                    </p>
                </article>

                <article>
                    <span>
                        ⏳
                    </span>

                    <strong>
                        {formatListeningDuration(
                            summary.totalListeningMs,
                        )}
                    </strong>

                    <p>
                        Tiempo escuchado
                    </p>
                </article>

                <article>
                    <span>
                        ★
                    </span>

                    <strong>
                        {formatReportRating(
                            summary.averageRating,
                        )}
                    </strong>

                    <p>
                        Nota media
                    </p>
                </article>

                <article>
                    <span>
                        ♫
                    </span>

                    <strong>
                        {
                            summary.favoriteTracks
                        }
                    </strong>

                    <p>
                        Canciones favoritas
                    </p>
                </article>

                <article>
                    <span>
                        ✦
                    </span>

                    <strong>
                        {
                            summary.totalXP
                        }
                    </strong>

                    <p>
                        XP ganada
                    </p>
                </article>
            </section>

            {summary.completedAlbums ===
                0 ? (
                <section className="monthly-report-empty">
                    <span>
                        ◯
                    </span>

                    <h2>
                        Un mes todavía en
                        blanco
                    </h2>

                    <p>
                        Cuando termines tu
                        primer disco de este
                        mes, Audite empezará
                        a construir el
                        informe.
                    </p>
                </section>
            ) : (
                <>
                    <section className="monthly-report-section">
                        <header>
                            <p>
                                LOS TITULARES
                            </p>

                            <h2>
                                Así sonó tu
                                mes
                            </h2>
                        </header>

                        <div className="monthly-report-headlines">
                            <article className="monthly-report-headline monthly-report-headline--genre">
                                <span>
                                    GÉNERO DEL
                                    MES
                                </span>

                                <strong>
                                    {highlights
                                        .monthGenre
                                        ?.genre ??
                                        "Sin género dominante"}
                                </strong>

                                <p>
                                    {highlights
                                        .monthGenre
                                        ? `${highlights.monthGenre.completedAlbums} discos · Media ${formatReportRating(
                                            highlights
                                                .monthGenre
                                                .averageRating,
                                        )}`
                                        : "Necesitamos más géneros guardados."}
                                </p>
                            </article>

                            <article>
                                <span>
                                    ARTISTA MÁS
                                    ESCUCHADO
                                </span>

                                <strong>
                                    {highlights
                                        .mostListenedArtist
                                        ?.artistName ??
                                        "Sin artista repetido"}
                                </strong>

                                <p>
                                    {highlights
                                        .mostListenedArtist
                                        ? `${highlights.mostListenedArtist.completedAlbums} discos`
                                        : "Este mes todos tus artistas fueron distintos."}
                                </p>
                            </article>

                            <article>
                                <span>
                                    DÍA MÁS
                                    ACTIVO
                                </span>

                                <strong>
                                    {highlights
                                        .mostActiveDay
                                        ? new Date(
                                            `${highlights.mostActiveDay.date}T12:00:00`,
                                        ).toLocaleDateString(
                                            "es-ES",
                                            {
                                                day:
                                                    "numeric",
                                                month:
                                                    "long",
                                            },
                                        )
                                        : "Sin datos"}
                                </strong>

                                <p>
                                    {highlights
                                        .mostActiveDay
                                        ? `${highlights.mostActiveDay.completedAlbums} discos terminados`
                                        : "—"}
                                </p>
                            </article>
                        </div>
                    </section>

                    <section className="monthly-report-section">
                        <header>
                            <p>
                                ALTOS Y BAJOS
                            </p>

                            <h2>
                                Los discos que
                                marcaron el mes
                            </h2>
                        </header>

                        <div className="monthly-highlight-grid">
                            <HighlightAlbum
                                label="MEJOR DESCUBRIMIENTO"
                                album={
                                    highlights.bestDiscovery
                                }
                                emptyText="No hay valoraciones suficientes."
                            />

                            <HighlightAlbum
                                label="MAYOR DECEPCIÓN"
                                album={
                                    highlights.biggestDisappointment
                                }
                                emptyText="No hay valoraciones suficientes."
                                negative
                            />
                        </div>
                    </section>

                    <section className="monthly-report-section">
                        <header>
                            <p>
                                TU MAPA DEL MES
                            </p>

                            <h2>
                                Géneros
                                escuchados
                            </h2>
                        </header>

                        <div className="monthly-genre-list">
                            {genreDistribution.map(
                                (
                                    genre,
                                    index,
                                ) => {
                                    const maximum =
                                        Math.max(
                                            1,
                                            Number(
                                                genreDistribution[
                                                    0
                                                ]
                                                    ?.completedAlbums ??
                                                0,
                                            ),
                                        );

                                    const percentage =
                                        Math.round(
                                            (Number(
                                                genre.completedAlbums,
                                            ) /
                                                maximum) *
                                            100,
                                        );

                                    return (
                                        <article
                                            key={
                                                genre.genre
                                            }
                                        >
                                            <strong>
                                                {String(
                                                    index +
                                                    1,
                                                ).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </strong>

                                            <section>
                                                <header>
                                                    <h3>
                                                        {
                                                            genre.genre
                                                        }
                                                    </h3>

                                                    <span>
                                                        {
                                                            genre.completedAlbums
                                                        }{" "}
                                                        discos
                                                    </span>
                                                </header>

                                                <div>
                                                    <i
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>

                                                <p>
                                                    Media{" "}
                                                    {formatReportRating(
                                                        genre.averageRating,
                                                    )}
                                                </p>
                                            </section>
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    </section>

                    <section className="monthly-report-section">
                        <header>
                            <p>
                                EL ARCHIVO
                            </p>

                            <h2>
                                Todos los discos
                                del mes
                            </h2>
                        </header>

                        <div className="monthly-album-grid">
                            {albums.map(
                                (
                                    album,
                                ) => (
                                    <article
                                        key={
                                            album.userAlbumId
                                        }
                                    >
                                        <div>
                                            {album.coverUrl ? (
                                                <img
                                                    src={
                                                        album.coverUrl
                                                    }
                                                    alt=""
                                                />
                                            ) : (
                                                <span>
                                                    💿
                                                </span>
                                            )}

                                            <strong>
                                                {formatReportRating(
                                                    album.rating,
                                                )}
                                            </strong>
                                        </div>

                                        <h3>
                                            {
                                                album.title
                                            }
                                        </h3>

                                        <p>
                                            {
                                                album.artistName
                                            }
                                        </p>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                </>
            )}
        </section>
    );
}
