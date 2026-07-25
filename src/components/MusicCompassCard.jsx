import "./MusicCompassCard.css";

function MusicCompassCard({
    compass,
    loading = false,
    message = "",
    onAction,
}) {
    if (loading) {
        return (
            <article className="music-compass music-compass--loading">
                <div className="music-compass__glow" />

                <div className="music-compass__skeleton-icon" />

                <div className="music-compass__skeleton-content">
                    <span />
                    <strong />
                    <p />
                    <p />
                </div>
            </article>
        );
    }

    if (message || !compass) {
        return null;
    }

    return (
        <article
            className={`music-compass music-compass--${compass.tone ?? "discovery"}`}
        >
            <div className="music-compass__noise" />
            <div className="music-compass__glow" />

            <div className="music-compass__symbol">
                <span>{compass.icon}</span>

                <div className="music-compass__orbit">
                    <i />
                    <i />
                </div>
            </div>

            <div className="music-compass__content">
                <p className="music-compass__eyebrow">
                    <span>✦</span>
                    {compass.eyebrow}
                </p>

                <h2>{compass.title}</h2>

                <p className="music-compass__text">
                    {compass.text}
                </p>

                {compass.button &&
                    compass.action && (
                        <button
                            type="button"
                            className="music-compass__button"
                            onClick={() =>
                                onAction?.(
                                    compass.action,
                                )
                            }
                        >
                            <span>
                                {compass.button}
                            </span>

                            <strong>→</strong>
                        </button>
                    )}
            </div>

            <div className="music-compass__signature">
                <span>🧭</span>
                <small>TU BRÚJULA MUSICAL</small>
            </div>
        </article>
    );
}

export default MusicCompassCard;