import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { useAuth } from "../context/AuthContext";
import {
    achievementRarities,
    achievements,
} from "../data/achievements";
import {
    evaluateAchievements,
    getAchievementsState,
    updateAchievementShowcase,
} from "../services/achievements";
import "./Achievements.css";

const rarityFilters = [
    "all",
    "common",
    "rare",
    "epic",
    "legendary",
];

function Achievements() {
    const { user } = useAuth();

    const [state, setState] = useState({
        unlocked: [],
        progress: [],
        rewards: null,
        showcase: [],
    });

    const [loading, setLoading] =
        useState(true);

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [rarityFilter, setRarityFilter] =
        useState("all");

    const [showcaseIds, setShowcaseIds] =
        useState([]);

    const [savingShowcase, setSavingShowcase] =
        useState(false);

    const [message, setMessage] =
        useState("");

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadAchievements() {
            setLoading(true);

            try {
                await evaluateAchievements();

                const nextState =
                    await getAchievementsState(
                        user.id,
                    );

                if (!cancelled) {
                    setState(nextState);

                    setShowcaseIds(
                        nextState.showcase.map(
                            (item) =>
                                item.achievement_id,
                        ),
                    );
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMessage(
                        "No hemos podido cargar tus logros.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadAchievements();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const unlockedIds = useMemo(
        () =>
            new Set(
                state.unlocked.map(
                    (item) =>
                        item.achievement_id,
                ),
            ),
        [state.unlocked],
    );

    const progressMap = useMemo(
        () =>
            new Map(
                state.progress.map((item) => [
                    item.achievement_id,
                    item,
                ]),
            ),
        [state.progress],
    );

    const filteredAchievements =
        useMemo(() => {
            return achievements.filter(
                (achievement) => {
                    const unlocked =
                        unlockedIds.has(
                            achievement.id,
                        );

                    const statusMatches =
                        statusFilter === "all" ||
                        (statusFilter ===
                            "unlocked" &&
                            unlocked) ||
                        (statusFilter ===
                            "locked" &&
                            !unlocked);

                    const rarityMatches =
                        rarityFilter === "all" ||
                        achievement.rarity ===
                        rarityFilter;

                    return (
                        statusMatches &&
                        rarityMatches
                    );
                },
            );
        }, [
            unlockedIds,
            statusFilter,
            rarityFilter,
        ]);

    function toggleShowcase(
        achievementId,
    ) {
        if (!unlockedIds.has(achievementId)) {
            return;
        }

        setShowcaseIds((currentIds) => {
            if (
                currentIds.includes(
                    achievementId,
                )
            ) {
                return currentIds.filter(
                    (id) => id !== achievementId,
                );
            }

            if (currentIds.length >= 3) {
                setMessage(
                    "Solo puedes exhibir tres logros.",
                );

                return currentIds;
            }

            return [
                ...currentIds,
                achievementId,
            ];
        });
    }

    async function saveShowcase() {
        if (!user?.id || savingShowcase) {
            return;
        }

        setSavingShowcase(true);
        setMessage("");

        try {
            const savedShowcase =
                await updateAchievementShowcase({
                    userId: user.id,
                    achievementIds: showcaseIds,
                });

            setState((currentState) => ({
                ...currentState,
                showcase: savedShowcase,
            }));

            setShowcaseIds(
                savedShowcase.map(
                    (item) => item.achievement_id,
                ),
            );

            window.dispatchEvent(
                new CustomEvent(
                    "audite:achievements-changed",
                ),
            );

            setMessage(
                "Vitrina actualizada correctamente.",
            );
        } catch (error) {
            console.error(
                "Error guardando la vitrina:",
                error,
            );

            setMessage(
                error?.message ||
                "No hemos podido actualizar la vitrina.",
            );
        } finally {
            setSavingShowcase(false);
        }
    }

    if (loading) {
        return (
            <section className="achievements-page">
                <p className="achievements-page__eyebrow">
                    TU PROGRESO
                </p>

                <h1>Cargando logros...</h1>
            </section>
        );
    }

    return (
        <section className="achievements-page">
            <header className="achievements-page__header">
                <div>
                    <p className="achievements-page__eyebrow">
                        TU PROGRESO
                    </p>

                    <h1>Logros</h1>

                    <p>
                        Cada disco, género y día de
                        constancia construye tu historia
                        musical.
                    </p>
                </div>

                <article className="achievement-balance">
                    <span>🛡️</span>

                    <div>
                        <strong>
                            {state.rewards
                                ?.streak_shields ?? 0}
                        </strong>

                        <p>Comodines de racha</p>
                    </div>
                </article>
            </header>

            <section className="achievement-overview">
                <article>
                    <strong>
                        {state.unlocked.length}
                    </strong>

                    <span>Desbloqueados</span>
                </article>

                <article>
                    <strong>
                        {achievements.length}
                    </strong>

                    <span>Totales</span>
                </article>

                <article>
                    <strong>
                        {Math.round(
                            (state.unlocked.length /
                                achievements.length) *
                            100,
                        )}
                        %
                    </strong>

                    <span>Completado</span>
                </article>
            </section>

            <section className="achievement-showcase-editor">
                <div>
                    <p>TU VITRINA</p>

                    <h2>
                        Elige hasta tres logros
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={saveShowcase}
                    disabled={savingShowcase}
                >
                    {savingShowcase
                        ? "Guardando..."
                        : "Guardar vitrina"}
                </button>
            </section>

            {message && (
                <p className="achievements-page__message">
                    {message}
                </p>
            )}

            <div className="achievement-filters">
                <div>
                    {[
                        ["all", "Todos"],
                        [
                            "unlocked",
                            "Desbloqueados",
                        ],
                        ["locked", "Bloqueados"],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={
                                statusFilter === value
                                    ? "achievement-filter--active"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(value)
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div>
                    {rarityFilters.map(
                        (rarity) => (
                            <button
                                key={rarity}
                                type="button"
                                className={
                                    rarityFilter ===
                                        rarity
                                        ? "achievement-filter--active"
                                        : ""
                                }
                                onClick={() =>
                                    setRarityFilter(
                                        rarity,
                                    )
                                }
                            >
                                {rarity === "all"
                                    ? "Todas las rarezas"
                                    : achievementRarities[
                                        rarity
                                    ].label}
                            </button>
                        ),
                    )}
                </div>
            </div>

            <div className="achievements-grid">
                {filteredAchievements.map(
                    (achievement) => {
                        const rarity =
                            achievementRarities[
                            achievement.rarity
                            ];

                        const unlocked =
                            unlockedIds.has(
                                achievement.id,
                            );

                        const progress =
                            progressMap.get(
                                achievement.id,
                            );

                        const currentValue =
                            Math.min(
                                Number(
                                    progress?.current_value ??
                                    0,
                                ),
                                achievement.target,
                            );

                        const percentage =
                            Math.min(
                                100,
                                (currentValue /
                                    achievement.target) *
                                100,
                            );

                        const showcased =
                            showcaseIds.includes(
                                achievement.id,
                            );

                        return (
                            <article
                                key={achievement.id}
                                className={[
                                    "achievement-card",
                                    unlocked
                                        ? "achievement-card--unlocked"
                                        : "achievement-card--locked",
                                    `achievement-card--${achievement.rarity}`,
                                    showcased
                                        ? "achievement-card--showcased"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                style={{
                                    "--achievement-color":
                                        rarity.color,
                                }}
                            >
                                <header>
                                    <div className="achievement-card__icon">
                                        {unlocked
                                            ? achievement.icon
                                            : "?"}
                                    </div>

                                    <span>
                                        {rarity.icon}{" "}
                                        {rarity.label}
                                    </span>
                                </header>

                                <h2>
                                    {achievement.title}
                                </h2>

                                <p>
                                    {achievement.description}
                                </p>

                                <div className="achievement-card__progress">
                                    <div>
                                        <span>
                                            {currentValue}
                                        </span>

                                        <span>
                                            {achievement.target}
                                        </span>
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {achievement.reward && (
                                    <div className="achievement-card__reward">
                                        <span>🎁</span>

                                        <p>
                                            <strong>
                                                Recompensa
                                            </strong>

                                            {achievement.reward.label}
                                        </p>
                                    </div>
                                )}

                                {unlocked && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleShowcase(
                                                achievement.id,
                                            )
                                        }
                                    >
                                        {showcased
                                            ? "Quitar de la vitrina"
                                            : "Exhibir en el Perfil"}
                                    </button>
                                )}
                            </article>
                        );
                    },
                )}
            </div>
        </section>
    );
}

export default Achievements;