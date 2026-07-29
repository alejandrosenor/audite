import { useState } from "react";
import "./MoodDiscoveryModal.css";

const MOODS = [
    {
        id: "energetic",
        emoji: "🔥",
        title: "Energía",
        description: "Guitarras, ritmo y potencia.",
    },
    {
        id: "relaxed",
        emoji: "😌",
        title: "Relajarme",
        description: "Sonidos tranquilos y envolventes.",
    },
    {
        id: "melancholic",
        emoji: "🌧️",
        title: "Melancolía",
        description: "Para dejarse llevar un rato.",
    },
    {
        id: "romantic",
        emoji: "❤️",
        title: "Romántico",
        description: "Discos para escuchar acompañado.",
    },
    {
        id: "roadtrip",
        emoji: "🚗",
        title: "Roadtrip",
        description: "Música para devorar kilómetros.",
    },
    {
        id: "night",
        emoji: "🌙",
        title: "Noche",
        description: "Oscuro, elegante y atmosférico.",
    },
    {
        id: "focus",
        emoji: "🧠",
        title: "Concentrarme",
        description: "Música que acompaña sin distraer.",
    },
    {
        id: "happy",
        emoji: "☀️",
        title: "Buen rollo",
        description: "Ritmo, luz y ganas de moverse.",
    },
    {
        id: "heartbroken",
        emoji: "💔",
        title: "Corazón roto",
        description: "Para cuando toca sentirlo todo.",
    },
    {
        id: "workout",
        emoji: "🏋️",
        title: "Entrenar",
        description: "Intensidad para no bajar el ritmo.",
    },
    {
        id: "sunset",
        emoji: "🌅",
        title: "Atardecer",
        description: "Cálido, suave y cinematográfico.",
    },
    {
        id: "adventurous",
        emoji: "🧭",
        title: "Sorprenderme",
        description: "Algo diferente y poco previsible.",
    },
];

export default function MoodDiscoveryModal({
    open,
    generating,
    onClose,
    onGenerate,
}) {
    const [selectedMood, setSelectedMood] =
        useState("");

    if (!open) {
        return null;
    }

    function handleGenerate() {
        if (!selectedMood || generating) {
            return;
        }

        onGenerate({
            mood: selectedMood,
        });
    }

    return (
        <div
            className="mood-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !generating
                ) {
                    onClose();
                }
            }}
        >
            <section
                className="mood-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mood-modal-title"
            >
                <header className="mood-modal__header">
                    <div>
                        <span className="mood-modal__eyebrow">
                            Descubrimiento emocional
                        </span>

                        <h2 id="mood-modal-title">
                            ¿Cómo te sientes?
                        </h2>

                        <p>
                            Elige el ambiente que buscas y Audite
                            encontrará un disco para ese momento.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="mood-modal__close"
                        onClick={onClose}
                        disabled={generating}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </header>

                <div className="mood-grid">
                    {MOODS.map((mood) => {
                        const selected =
                            mood.id === selectedMood;

                        return (
                            <button
                                key={mood.id}
                                type="button"
                                className={[
                                    "mood-option",
                                    selected
                                        ? "mood-option--selected"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() =>
                                    setSelectedMood(mood.id)
                                }
                                disabled={generating}
                                aria-pressed={selected}
                            >
                                <span className="mood-option__emoji">
                                    {mood.emoji}
                                </span>

                                <span className="mood-option__content">
                                    <strong>{mood.title}</strong>
                                    <small>{mood.description}</small>
                                </span>

                                <span
                                    className="mood-option__indicator"
                                    aria-hidden="true"
                                >
                                    {selected ? "✓" : ""}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <footer className="mood-modal__footer">
                    <button
                        type="button"
                        className="mood-modal__secondary"
                        onClick={onClose}
                        disabled={generating}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="mood-modal__primary"
                        onClick={handleGenerate}
                        disabled={
                            !selectedMood ||
                            generating
                        }
                    >
                        {generating
                            ? "Buscando el disco..."
                            : "Descubrir disco"}
                    </button>
                </footer>
            </section>
        </div>
    );
}