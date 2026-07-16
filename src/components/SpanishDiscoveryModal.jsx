import { useEffect, useState } from "react";
import "./SpanishDiscoveryModal.css";

const regions = [
    {
        id: "all",
        icon: "🌎",
        label: "Todo el mundo hispano",
        description:
            "España y Latinoamérica.",
    },
    {
        id: "spain",
        icon: "🇪🇸",
        label: "España",
        description:
            "Discos publicados por artistas españoles.",
    },
    {
        id: "latin-america",
        icon: "🌎",
        label: "Latinoamérica",
        description:
            "Argentina, México, Chile, Colombia y más.",
    },
];

const styles = [
    {
        id: "all",
        icon: "✦",
        label: "Cualquier estilo",
    },
    {
        id: "rock",
        icon: "🎸",
        label: "Rock",
    },
    {
        id: "pop",
        icon: "🎤",
        label: "Pop",
    },
    {
        id: "indie",
        icon: "✨",
        label: "Indie",
    },
    {
        id: "singer-songwriter",
        icon: "✍️",
        label: "Cantautor",
    },
    {
        id: "folk",
        icon: "🪕",
        label: "Folk y raíces",
    },
    {
        id: "flamenco",
        icon: "💃",
        label: "Flamenco",
    },
    {
        id: "tropical",
        icon: "🌴",
        label: "Tropical",
    },
    {
        id: "urban",
        icon: "🎧",
        label: "Urbano",
    },
];

function SpanishDiscoveryModal({
    open,
    generating = false,
    onClose,
    onGenerate,
}) {
    const [region, setRegion] =
        useState("all");

    const [style, setStyle] =
        useState("all");

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.body.style.overflow =
            "hidden";

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                "";

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();

        onGenerate({
            region,
            style,
        });
    }

    return (
        <div
            className="spanish-discovery-overlay"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <section className="spanish-discovery-modal">
                <header>
                    <div>
                        <p>
                            DESCUBRE EN NUESTRA LENGUA
                        </p>

                        <h2>
                            Música en español
                        </h2>

                        <span>
                            Elige una región y un
                            estilo. Audite hará el
                            resto.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={generating}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <section className="spanish-discovery-field">
                        <div className="spanish-discovery-field__heading">
                            <span>01</span>

                            <div>
                                <h3>
                                    ¿De dónde?
                                </h3>

                                <p>
                                    Puedes explorar
                                    todo el catálogo o
                                    centrarte en una
                                    región.
                                </p>
                            </div>
                        </div>

                        <div className="spanish-region-grid">
                            {regions.map(
                                (item) => (
                                    <button
                                        key={
                                            item.id
                                        }
                                        type="button"
                                        className={
                                            region ===
                                                item.id
                                                ? "spanish-region-card spanish-region-card--active"
                                                : "spanish-region-card"
                                        }
                                        onClick={() =>
                                            setRegion(
                                                item.id,
                                            )
                                        }
                                    >
                                        <span>
                                            {
                                                item.icon
                                            }
                                        </span>

                                        <div>
                                            <strong>
                                                {
                                                    item.label
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    item.description
                                                }
                                            </small>
                                        </div>
                                    </button>
                                ),
                            )}
                        </div>
                    </section>

                    <section className="spanish-discovery-field">
                        <div className="spanish-discovery-field__heading">
                            <span>02</span>

                            <div>
                                <h3>
                                    ¿Qué te apetece?
                                </h3>

                                <p>
                                    Escoge un estilo o
                                    déjate sorprender.
                                </p>
                            </div>
                        </div>

                        <div className="spanish-style-grid">
                            {styles.map(
                                (item) => (
                                    <button
                                        key={
                                            item.id
                                        }
                                        type="button"
                                        className={
                                            style ===
                                                item.id
                                                ? "spanish-style-chip spanish-style-chip--active"
                                                : "spanish-style-chip"
                                        }
                                        onClick={() =>
                                            setStyle(
                                                item.id,
                                            )
                                        }
                                    >
                                        <span>
                                            {
                                                item.icon
                                            }
                                        </span>

                                        {
                                            item.label
                                        }
                                    </button>
                                ),
                            )}
                        </div>
                    </section>

                    <footer>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={generating}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={generating}
                        >
                            {generating
                                ? "Buscando una joya..."
                                : "Ñ Descubrir un disco"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default SpanishDiscoveryModal;