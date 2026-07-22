import {
    useEffect,
    useState,
} from "react";

import {
    answerDailyMusicQuote,
    getDailyMusicQuote,
} from "../services/dailyMusicQuote";

import {
    updateDailyChallenges,
} from "../services/dailyChallenges";

import "./DailyMusicQuote.css";

function DailyMusicQuote() {
    const [
        question,
        setQuestion,
    ] = useState(null);

    const [
        answer,
        setAnswer,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        answering,
        setAnswering,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadQuote() {
            try {
                const result =
                    await getDailyMusicQuote();

                if (cancelled) {
                    return;
                }

                setQuestion(
                    result?.question ??
                    null,
                );

                setAnswer(
                    result?.answer ??
                    null,
                );

                setMessage(
                    result?.message ??
                    "",
                );
            } catch (error) {
                console.error(
                    "Error cargando la frase del día:",
                    error,
                );

                if (!cancelled) {
                    setMessage(
                        error.message ||
                        "No hemos podido cargar la frase del día.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadQuote();

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleAnswer(
        selectedPerson,
    ) {
        if (
            answer ||
            answering
        ) {
            return;
        }

        setAnswering(true);
        setMessage("");

        try {
            const result =
                await answerDailyMusicQuote(
                    selectedPerson,
                );

            setQuestion(
                result.question,
            );

            setAnswer(
                result.answer,
            );

            try {
                await updateDailyChallenges({
                    eventType:
                        "daily_music_quote_completed",

                    eventId:
                        `daily-music-quote:${result.question.id}`,

                    metadata: {
                        questionId:
                            result.question.id,

                        selectedPerson,

                        correct:
                            result.answer.isCorrect,

                        source:
                            "daily_music_quote",
                    },
                });
            } catch (challengeError) {
                console.error(
                    "La respuesta se guardó, pero no se pudo actualizar el reto diario:",
                    challengeError,
                );
            }
        } catch (error) {
            console.error(
                "Error respondiendo la cita:",
                error,
            );

            setMessage(
                error.message ||
                "No hemos podido guardar tu respuesta.",
            );
        } finally {
            setAnswering(false);
        }
    }

    function getOptionClass(
        option,
    ) {
        if (!answer) {
            return "";
        }

        if (
            option ===
            answer.correctPerson
        ) {
            return "daily-music-quote__option--correct";
        }

        if (
            option ===
            answer.selectedPerson &&
            !answer.isCorrect
        ) {
            return "daily-music-quote__option--incorrect";
        }

        return "daily-music-quote__option--disabled";
    }

    if (loading) {
        return (
            <section className="daily-music-quote daily-music-quote--loading">
                <span />
                <strong />
                <p />
                <div />
            </section>
        );
    }

    if (!question) {
        return (
            <section className="daily-music-quote daily-music-quote--empty">
                <span>🎙️</span>

                <div>
                    <p>
                        LA FRASE DEL DÍA
                    </p>

                    <h3>
                        Hoy el micrófono guarda silencio
                    </h3>

                    <small>
                        {message ||
                            "Mañana volveremos con otra cita musical."}
                    </small>
                </div>
            </section>
        );
    }

    return (
        <section className="daily-music-quote">
            <header className="daily-music-quote__header">
                <div>
                    <p>
                        LA FRASE DEL DÍA
                    </p>

                    <h2>
                        ¿Quién dijo esto?
                    </h2>
                </div>

                <span>“</span>
            </header>

            <blockquote>
                {question.quoteText}
            </blockquote>

            <div className="daily-music-quote__options">
                {question.options.map(
                    (option) => (
                        <button
                            key={option}
                            type="button"
                            className={
                                getOptionClass(
                                    option,
                                )
                            }
                            onClick={() =>
                                handleAnswer(
                                    option,
                                )
                            }
                            disabled={
                                Boolean(
                                    answer,
                                ) ||
                                answering
                            }
                        >
                            <span />

                            <strong>
                                {option}
                            </strong>
                        </button>
                    ),
                )}
            </div>

            {answer && (
                <div
                    className={
                        answer.isCorrect
                            ? "daily-music-quote__result daily-music-quote__result--correct"
                            : "daily-music-quote__result daily-music-quote__result--incorrect"
                    }
                >
                    <span>
                        {answer.isCorrect
                            ? "✓"
                            : "×"}
                    </span>

                    <div>
                        <strong>
                            {answer.isCorrect
                                ? `¡Correcto! Era ${answer.correctPerson}`
                                : `No era esa. La respuesta era ${answer.correctPerson}`}
                        </strong>

                        {answer.explanation && (
                            <p>
                                {
                                    answer.explanation
                                }
                            </p>
                        )}

                        {answer.xpAwarded >
                            0 && (
                                <b>
                                    +{
                                        answer.xpAwarded
                                    } XP
                                </b>
                            )}

                        {answer.sourceUrl && (
                            <a
                                href={
                                    answer.sourceUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                Fuente:{" "}
                                {
                                    answer.sourceName
                                }{" "}
                                →
                            </a>
                        )}
                    </div>
                </div>
            )}

            {message && (
                <p className="daily-music-quote__message">
                    {message}
                </p>
            )}
        </section>
    );
}

export default DailyMusicQuote;