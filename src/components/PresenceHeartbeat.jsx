import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyPresence } from "../services/social";

function PresenceHeartbeat() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return;
        function sendHeartbeat() {
            if (document.visibilityState === "visible") {
                updateMyPresence({ userId: user.id });
            }
        }
        sendHeartbeat();
        const intervalId = window.setInterval(sendHeartbeat, 60_000);
        document.addEventListener("visibilitychange", sendHeartbeat);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", sendHeartbeat);
        };
    }, [user?.id]);

    return null;
}

export default PresenceHeartbeat;
