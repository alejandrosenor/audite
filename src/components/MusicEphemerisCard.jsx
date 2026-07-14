import "./MusicEphemerisCard.css";

const typeLabels = {
    event: "Un día como hoy",
    birth: "Nació un día como hoy",
    death: "La música lo recuerda",
    release: "Se publicó un día como hoy",
    fallback: "Píldora musical",
};

const typeIcons = {
    event: "📅",
    birth: "🎂",
    death: "🕯️",
    release: "💿",
    fallback: "♪",
};

function MusicEphemerisCard({
    ephemeris,
    loading,
    message,
}) {
    if (loading) {
        return (
            <article className="music-ephemeris music-ephemeris--loading">
                <div className="music-ephemeris__image-skeleton" />

                <div>
                    <span />
                    <strong />
                    <p />
                    <p />
                </div>
            </article>
        );
    }

    if (!ephemeris) {
        return (
            <article className="music-ephemeris music-ephemeris--empty">
                <span>📻</span>

                <div>
                    <p>EFEMÉRIDE MUSICAL</p>
                    <h3>Hoy la historia guarda silencio</h3>
                    <small>
                        {message ??
                            "Mañana volveremos con otro recuerdo musical."}
                    </small>
                </div>
            </article>
        );
    }

    const label =
        typeLabels[ephemeris.event_type] ??
        typeLabels.event;

    const icon =
        typeIcons[ephemeris.event_type] ??
        typeIcons.event;

    return (
        <article
            className="music-ephemeris"
            style={
                ephemeris.image_url
                    ? {
                        "--ephemeris-image":
                            `url("${ephemeris.image_url}")`,
                    }
                    : {}
            }
        >
            <div className="music-ephemeris__background" />

            <div className="music-ephemeris__visual">
                {ephemeris.image_url ? (
                    <img
                        src={ephemeris.image_url}
                        alt=""
                    />
                ) : (
                    <div>{icon}</div>
                )}

                {ephemeris.year && (
                    <strong>
                        {ephemeris.year}
                    </strong>
                )}
            </div>

            <div className="music-ephemeris__content">
                <p>{label}</p>

                <h3>{ephemeris.title}</h3>

                <div className="music-ephemeris__description">
                    {ephemeris.description}
                </div>

                <footer>
                    <span>
                        Fuente: {ephemeris.source_name}
                    </span>

                    {ephemeris.source_url && (
                        <a
                            href={ephemeris.source_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Leer la historia completa →
                        </a>
                    )}
                </footer>
            </div>
        </article>
    );
}

export default MusicEphemerisCard;