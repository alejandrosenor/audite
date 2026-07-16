import "./AppLayout.css";
import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentListeningAlbum } from "../services/albums";
import UserAvatar from "../components/UserAvatar";
import XPToast from "../components/XPToast";

function AppLayout() {
    const { profile, user } = useAuth();
    const [listeningAlbum, setListeningAlbum] = useState(null);

    const navigationItems = [
        { to: "/", label: "Inicio", icon: "⌂" },
        { to: "/discover", label: "Descubrir", icon: "✦" },
        {
            to: listeningAlbum ? "/listening" : "/to-listen",
            label: listeningAlbum ? "Escuchando" : "Pendientes",
            icon: listeningAlbum ? "◉" : "◷",
        },
        { to: "/library", label: "Biblioteca", icon: "▦" },
        {
            to: "/ranking",
            label: "Ranking",
            icon: "♛",
            mobileHidden: true,
        },
        {
            to: "/songs",
            label: "Canciones top",
            icon: "♪",
            mobileHidden: true,
        },
    ];

    useEffect(() => {
        if (!user?.id) {
            setListeningAlbum(null);
            return;
        }

        let cancelled = false;

        async function loadListeningAlbum() {
            try {
                const currentAlbum = await getCurrentListeningAlbum(
                    user.id,
                );

                if (!cancelled) {
                    setListeningAlbum(currentAlbum);
                }
            } catch (error) {
                console.error(
                    "No se pudo comprobar la escucha activa:",
                    error,
                );
            }
        }

        loadListeningAlbum();

        window.addEventListener(
            "audite:listening-changed",
            loadListeningAlbum,
        );

        return () => {
            cancelled = true;

            window.removeEventListener(
                "audite:listening-changed",
                loadListeningAlbum,
            );
        };
    }, [user?.id]);

    return (
        <div className="app-layout">
            <header className="mobile-header">
                <NavLink
                    to="/"
                    className="mobile-header__brand"
                    aria-label="Ir al inicio"
                >
                    <span className="mobile-header__logo">A</span>

                    <span>
                        <strong>Audite</strong>
                        <small>Un disco al día</small>
                    </span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive
                            ? "mobile-header__profile mobile-header__profile--active"
                            : "mobile-header__profile"
                    }
                    aria-label="Abrir perfil"
                >
                    <UserAvatar
                        profile={profile}
                        size="small"
                    />
                </NavLink>
            </header>
            <aside className="sidebar">
                <div className="sidebar__brand">
                    <div className="sidebar__logo">A</div>

                    <div>
                        <strong>Audite</strong>
                        <span>Un disco al día</span>
                    </div>
                </div>

                <nav className="sidebar__navigation">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                [
                                    "sidebar__link",
                                    isActive
                                        ? "sidebar__link--active"
                                        : "",
                                    item.mobileHidden
                                        ? "sidebar__link--mobile-hidden"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            }
                        >
                            <span className="sidebar__link-icon">
                                {item.icon}
                            </span>

                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__footer">
                    <NavLink
                        to="/profile"
                        className="profile-preview"
                    >
                        <UserAvatar
                            profile={profile}
                            size="small"
                        />

                        <span>
                            <strong>
                                {profile?.username ?? "Usuario"}
                            </strong>

                            <small>
                                {profile?.current_streak ?? 0} días de racha
                            </small>
                        </span>
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className="sidebar__settings"
                    >
                        Ajustes
                    </NavLink>
                </div>
            </aside>

            <main className="app-content">
                <Outlet />
            </main>

            <XPToast />
        </div>
    );
}

export default AppLayout;