import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const avatars = ["🎧", "💿", "🎸", "🎹", "🎷", "🥁", "🎤", "📻"];

function Auth() {
    const { user, loading, signIn, signUp } = useAuth();

    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState("🎧");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    if (!loading && user) {
        return <Navigate to="/" replace />;
    }

    function resetMessage() {
        setMessage("");
        setMessageType("");
    }

    function changeMode(newMode) {
        setMode(newMode);
        resetMessage();
    }

    async function handleSubmit(event) {
        event.preventDefault();
        resetMessage();

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setMessage("Introduce tu correo y tu contraseña.");
            setMessageType("error");
            return;
        }

        if (password.length < 6) {
            setMessage("La contraseña debe tener al menos 6 caracteres.");
            setMessageType("error");
            return;
        }

        if (mode === "register" && !username.trim()) {
            setMessage("Elige un nombre para tu perfil.");
            setMessageType("error");
            return;
        }

        setSubmitting(true);

        try {
            if (mode === "register") {
                const { data, error } = await signUp({
                    email: normalizedEmail,
                    password,
                    username: username.trim(),
                    avatar,
                });

                if (error) {
                    setMessage(error.message);
                    setMessageType("error");
                    return;
                }

                if (!data.session) {
                    setMessage(
                        "Cuenta creada. Revisa tu correo para confirmar el registro.",
                    );
                    setMessageType("success");
                    return;
                }

                setMessage("Cuenta creada correctamente.");
                setMessageType("success");
            } else {
                const { error } = await signIn({
                    email: normalizedEmail,
                    password,
                });

                if (error) {
                    setMessage("Correo o contraseña incorrectos.");
                    setMessageType("error");
                }
            }
        } catch (error) {
            console.error(error);
            setMessage("Ha ocurrido un error inesperado.");
            setMessageType("error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-page__glow auth-page__glow--one" />
            <div className="auth-page__glow auth-page__glow--two" />

            <section className="auth-card fade-up">
                <header className="auth-card__header">
                    <div className="auth-brand">
                        <div className="auth-brand__logo">A</div>

                        <div>
                            <strong>Audite</strong>
                            <span>Un disco al día</span>
                        </div>
                    </div>

                    <p className="auth-card__eyebrow">
                        {mode === "login" ? "BIENVENIDO DE NUEVO" : "EMPIEZA EL RETO"}
                    </p>

                    <h1>
                        {mode === "login"
                            ? "Continúa descubriendo música."
                            : "Tu próxima obsesión empieza aquí."}
                    </h1>

                    <p className="auth-card__description">
                        Escucha un disco cada día, mantén tu racha y construye tu propia
                        historia musical.
                    </p>
                </header>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={mode === "login" ? "auth-tabs__button--active" : ""}
                        onClick={() => changeMode("login")}
                    >
                        Entrar
                    </button>

                    <button
                        type="button"
                        className={mode === "register" ? "auth-tabs__button--active" : ""}
                        onClick={() => changeMode("register")}
                    >
                        Crear cuenta
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {mode === "register" && (
                        <>
                            <label className="auth-field">
                                <span>Nombre</span>

                                <input
                                    type="text"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="¿Cómo quieres que te llamemos?"
                                    maxLength={30}
                                    autoComplete="nickname"
                                />
                            </label>

                            <fieldset className="avatar-selector">
                                <legend>Elige tu avatar musical</legend>

                                <div className="avatar-selector__grid">
                                    {avatars.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className={
                                                avatar === item
                                                    ? "avatar-selector__item avatar-selector__item--active"
                                                    : "avatar-selector__item"
                                            }
                                            onClick={() => setAvatar(item)}
                                            aria-label={`Seleccionar avatar ${item}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        </>
                    )}

                    <label className="auth-field">
                        <span>Correo electrónico</span>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="tu@email.com"
                            autoComplete="email"
                        />
                    </label>

                    <label className="auth-field">
                        <span>Contraseña</span>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            autoComplete={
                                mode === "login" ? "current-password" : "new-password"
                            }
                        />
                    </label>

                    {message && (
                        <p
                            className={`auth-message auth-message--${messageType}`}
                            role="alert"
                        >
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Un momento..."
                            : mode === "login"
                                ? "Entrar en Audite"
                                : "Empezar mi reto"}
                    </button>
                </form>

                <p className="auth-card__footer">
                    {mode === "login"
                        ? "Tu biblioteca, tu racha y tus descubrimientos te esperan."
                        : "Un álbum puede cambiar un día. Algunos cambian una vida."}
                </p>
            </section>

            <section className="auth-visual">
                <div className="auth-record">
                    <div className="auth-record__label">
                        <span>A</span>
                    </div>
                </div>

                <div className="auth-visual__copy">
                    <p>DESCUBRE · ESCUCHA · RECUERDA</p>
                    <h2>365 días.<br />Infinitas historias.</h2>
                </div>
            </section>
        </main>
    );
}

export default Auth;