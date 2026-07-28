import {
    useEffect,
    useState,
} from "react";
import "./TimeMachineModal.css";

const DECADES = [
    1950,
    1960,
    1970,
    1980,
    1990,
    2000,
    2010,
    2020,
];

function TimeMachineModal({
    open,
    generating,
    onClose,
    onGenerate,
}) {
    const currentYear =
        new Date().getFullYear();

    const [mode, setMode] =
        useState("decade");

    const [decade, setDecade] =
        useState(1990);

    const [year, setYear] =
        useState(1994);

    const [message, setMessage] =
        useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        setMessage("");
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event) {
            if (
                event.key === "Escape" &&
                !generating
            ) {
                onClose();
            }
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        open,
        generating,
        onClose,
    ]);

    if (!open) {
        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (mode === "year") {
            const numericYear =
                Number(year);

            if (
                !Number.isInteger(
                    numericYear,
                ) ||
                numericYear < 1950 ||
                numericYear > currentYear
            ) {
                setMessage(
                    `Elige un año entre 1950 y ${currentYear}.`,
                );

                return;
            }

            onGenerate({
                year: numericYear,
                decade: null,
            });

            return;
        }

        onGenerate({
            year: null,
            decade,
        });
    }

    return (
        <div
            className="time-machine-overlay"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget &&
                    !generating
                ) {
                    onClose();
                }
            }}
        >
            <section
                className="time-machine-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="time-machine-title"
            >
                <header>
                    <div>
                        <p>VIAJE TEMPORAL</p>

                        <h2
                            id="time-machine-title"
                        >
                            Máquina del tiempo
                        </h2>

                        <span>
                            Elige una época y Audite
                            buscará un disco nacido allí.
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

                <form
                    onSubmit={handleSubmit}
                >
                    <div className="time-machine-tabs">
                        <button
                            type="button"
                            className={
                                mode === "decade"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setMode(
                                    "decade",
                                )
                            }
                        >
                            Década
                        </button>

                        <button
                            type="button"
                            className={
                                mode === "year"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setMode(
                                    "year",
                                )
                            }
                        >
                            Año concreto
                        </button>
                    </div>

                    {mode === "decade" ? (
                        <div className="time-machine-decades">
                            {DECADES.map(
                                (
                                    decadeOption,
                                ) => (
                                    <button
                                        type="button"
                                        key={
                                            decadeOption
                                        }
                                        className={
                                            decade ===
                                                decadeOption
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setDecade(
                                                decadeOption,
                                            )
                                        }
                                    >
                                        <strong>
                                            {
                                                decadeOption
                                            }
                                            s
                                        </strong>

                                        <small>
                                            {
                                                decadeOption
                                            }
                                            –
                                            {Math.min(
                                                decadeOption +
                                                9,
                                                currentYear,
                                            )}
                                        </small>
                                    </button>
                                ),
                            )}
                        </div>
                    ) : (
                        <label className="time-machine-year">
                            <span>
                                ¿A qué año viajamos?
                            </span>

                            <input
                                type="number"
                                min="1950"
                                max={
                                    currentYear
                                }
                                value={year}
                                onChange={(
                                    event,
                                ) =>
                                    setYear(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                inputMode="numeric"
                            />
                        </label>
                    )}

                    {message && (
                        <p className="time-machine-message">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="time-machine-submit"
                        disabled={generating}
                    >
                        <span>⏳</span>

                        {generating
                            ? "Viajando..."
                            : mode === "year"
                                ? `Viajar a ${year}`
                                : `Explorar los ${decade}s`}
                    </button>
                </form>
            </section>
        </div>
    );
}

export default TimeMachineModal;