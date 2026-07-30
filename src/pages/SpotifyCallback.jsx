import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { completeSpotifyLogin }
    from "../services/spotify";

function SpotifyCallback() {
    const navigate = useNavigate();

    const requestStarted =
        useRef(false);

    useEffect(() => {
        if (requestStarted.current) {
            return;
        }

        requestStarted.current = true;

        async function finishLogin() {
            try {
                const params =
                    new URLSearchParams(
                        window.location.search,
                    );

                const spotifyError =
                    params.get("error");

                const code =
                    params.get("code");

                const returnedState =
                    params.get("state");

                const expectedState =
                    sessionStorage.getItem(
                        "spotify_auth_state",
                    );

                if (spotifyError) {
                    throw new Error(
                        `Spotify rechazó la autorización: ${spotifyError}`,
                    );
                }

                if (!code) {
                    throw new Error(
                        "Spotify no devolvió el código de autorización.",
                    );
                }

                if (
                    !returnedState ||
                    !expectedState ||
                    returnedState !== expectedState
                ) {
                    throw new Error(
                        "El estado de autorización de Spotify no es válido.",
                    );
                }

                await completeSpotifyLogin(
                    code,
                );

                navigate(
                    "/profile?spotify=connected",
                    {
                        replace: true,
                    },
                );
            } catch (error) {
                console.error(
                    "Spotify callback:",
                    error,
                );

                sessionStorage.removeItem(
                    "spotify_code_verifier",
                );

                sessionStorage.removeItem(
                    "spotify_auth_state",
                );

                navigate(
                    "/profile?spotify=error",
                    {
                        replace: true,
                    },
                );
            }
        }

        finishLogin();
    }, [navigate]);

    return (
        <main className="spotify-callback">
            <p>
                Conectando tu cuenta de Spotify…
            </p>
        </main>
    );
}

export default SpotifyCallback;