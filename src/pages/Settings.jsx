import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Settings() {
    const [connectionStatus, setConnectionStatus] = useState("Comprobando...");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function testConnection() {
            const { error } = await supabase
                .from("profiles")
                .select("id")
                .limit(1);

            if (error) {
                if (
                    error.message.toLowerCase().includes("permission") ||
                    error.code === "42501"
                ) {
                    setConnectionStatus("Conexión correcta");
                    setErrorMessage(
                        "Supabase responde correctamente. No hay sesión iniciada todavía.",
                    );
                    return;
                }

                setConnectionStatus("Error de conexión");
                setErrorMessage(error.message);
                return;
            }

            setConnectionStatus("Conexión correcta");
        }

        testConnection();
    }, []);

    return (
        <section>
            <p
                style={{
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    marginBottom: "8px",
                }}
            >
                SUPABASE
            </p>

            <h1
                style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(32px, 8vw, 52px)",
                }}
            >
                {connectionStatus}
            </h1>

            {errorMessage && (
                <p
                    style={{
                        color: "var(--color-text-secondary)",
                        marginTop: "16px",
                    }}
                >
                    {errorMessage}
                </p>
            )}
        </section>
    );
}

export default Settings;