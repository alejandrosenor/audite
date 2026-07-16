import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    getDailyChallenges,
} from "../services/dailyChallenges";
import "./DailyChallengesCard.css";

const difficultyLabels = {
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
};

function DailyChallengesCard() {
    const [data, setData] =
        useState(null);
    const [loading, setLoading] =
        useState(true);
    const [message, setMessage] =
        useState("");

    const loadChallenges =
        useCallback(async () => {
            setLoading(true);
            setMessage("");

            try {
                setData(
                    await getDailyChallenges(),
                );
            } catch (error) {
                console.error(error);
                setMessage(
                    error.message ||
                    "No hemos podido cargar los retos.",
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        loadChallenges();

        window.addEventListener(
            "audite:daily-challenges-changed",
            loadChallenges,
        );

        return () => {
            window.removeEventListener(
                "audite:daily-challenges-changed",
                loadChallenges,
            );
        };
    }, [loadChallenges]);

    const completedCount = useMemo(
        () =>
            data?.challenges?.filter(
                (item) =>
                    item.completed_at,
            ).length ?? 0,
        [data],
    );

    if (loading) {
        return (
            <section className="daily-challenges-card">
                <p>RETOS DE HOY</p>
                <h2>
                    Preparando tus misiones...
                </h2>
            </section>
        );
    }

    if (message) {
        return (
            <section className="daily-challenges-card">
                <p>RETOS DE HOY</p>
                <h2>
                    No han podido cargar
                </h2>
                <span>{message}</span>
                <button
                    type="button"
                    onClick={loadChallenges}
                >
                    Reintentar
                </button>
            </section>
        );
    }

    return (
        <section className="daily-challenges-card">
            <header>
                <div>
                    <p>RETOS DE HOY</p>
                    <h2>
                        Tu misión musical
                    </h2>
                    <span>
                        Un reto fácil, uno
                        medio y uno difícil.
                    </span>
                </div>

                <strong>
                    {completedCount}/3
                </strong>
            </header>

            <div className="daily-challenges-list">
                {data?.challenges?.map(
                    (item) => {
                        const challenge =
                            item.challenge;

                        const percentage =
                            Math.min(
                                100,
                                (
                                    item.current_value /
                                    item.target_value
                                ) * 100,
                            );

                        return (
                            <article
                                key={item.id}
                                className={[
                                    "daily-challenge",
                                    `daily-challenge--${challenge.difficulty}`,
                                    item.completed_at
                                        ? "daily-challenge--completed"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                            >
                                <div className="daily-challenge__icon">
                                    {item.completed_at
                                        ? "✓"
                                        : item.slot}
                                </div>

                                <div className="daily-challenge__content">
                                    <header>
                                        <div>
                                            <small>
                                                {
                                                    difficultyLabels[
                                                    challenge
                                                        .difficulty
                                                    ]
                                                }
                                            </small>

                                            <h3>
                                                {
                                                    challenge.title
                                                }
                                            </h3>
                                        </div>

                                        <strong>
                                            +
                                            {
                                                challenge.reward_xp
                                            }{" "}
                                            XP
                                        </strong>
                                    </header>

                                    <p>
                                        {
                                            challenge.description
                                        }
                                    </p>

                                    <div className="daily-challenge__progress-info">
                                        <span>
                                            {
                                                item.current_value
                                            }
                                            /
                                            {
                                                item.target_value
                                            }
                                        </span>

                                        <span>
                                            {Math.round(
                                                percentage,
                                            )}
                                            %
                                        </span>
                                    </div>

                                    <div className="daily-challenge__track">
                                        <span
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </article>
                        );
                    },
                )}
            </div>

            <article
                className={[
                    "daily-challenge-bonus",
                    data?.bonus?.completed_at
                        ? "daily-challenge-bonus--completed"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <span>🎁</span>

                <div>
                    <small>
                        BONUS DEL DÍA
                    </small>

                    <strong>
                        Completa los tres retos
                    </strong>

                    <p>
                        +
                        {data?.bonus
                            ?.reward_xp ??
                            250}{" "}
                        XP adicionales
                    </p>
                </div>
            </article>
        </section>
    );
}

export default DailyChallengesCard;
