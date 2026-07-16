import {
    useEffect,
    useRef,
    useState,
} from "react";
import "./XPToast.css";

function XPToast() {
    const timeoutRef = useRef(null);

    const [reward, setReward] =
        useState(null);

    useEffect(() => {
        function handleXPEarned(event) {
            const detail = event.detail;

            if (!detail?.awarded) {
                return;
            }

            setReward(detail);

            window.clearTimeout(
                timeoutRef.current,
            );

            timeoutRef.current =
                window.setTimeout(() => {
                    setReward(null);
                }, 4200);
        }

        window.addEventListener(
            "audite:xp-earned",
            handleXPEarned,
        );

        return () => {
            window.clearTimeout(
                timeoutRef.current,
            );

            window.removeEventListener(
                "audite:xp-earned",
                handleXPEarned,
            );
        };
    }, []);

    if (!reward) {
        return null;
    }

    return (
        <aside
            className={[
                "xp-toast",
                reward.leveledUp
                    ? "xp-toast--level-up"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="xp-toast__icon">
                {reward.leveledUp
                    ? "🎉"
                    : "✦"}
            </div>

            <div>
                <p>
                    {reward.leveledUp
                        ? `¡Nivel ${reward.level}!`
                        : reward.reason}
                </p>

                <strong>
                    +{reward.amount} XP
                </strong>

                {reward.leveledUp && (
                    <span>
                        Has subido del nivel{" "}
                        {reward.previousLevel} al{" "}
                        {reward.level}.
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={() =>
                    setReward(null)
                }
                aria-label="Cerrar aviso"
            >
                ×
            </button>
        </aside>
    );
}

export default XPToast;