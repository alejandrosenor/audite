import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import AvatarSelector from "../components/AvatarSelector";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { updateProfileAvatar } from "../services/artists";
import { getProfileStats } from "../services/profile";
import { supabase } from "../services/supabase";
import {
    achievements,
    achievementRarities,
    getAchievementById,
} from "../data/achievements";
import {
    evaluateAchievements,
    getAchievementsState,
} from "../services/achievements";
import {
    getLevelProgress,
    getMusicalTitle,
} from "../utils/xp";
import { getXPHistory } from "../services/xp";
import GenreAffinitySection from "../components/GenreAffinitySection";
import "./Profile.css";

const activityLabels = {
    generated: "Descubriste",
    to_listen: "Añadiste a pendientes",
    listening: "Empezaste a escuchar",
    completed: "Terminaste",
    abandoned: "Dejaste sin terminar",
    rejected: "Rechazaste",
    known: "Marcaste como conocido"
};

function formatMinutes(totalMinutes) {
    if (!totalMinutes) {
        return "0 h";
    }

    if (totalMinutes < 60) {
        return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes
        ? `${hours} h ${minutes} min`
        : `${hours} h`;
}

function Profile() {
    const navigate = useNavigate();

    const {
        user,
        profile,
        signOut,
        refreshProfile,
    } = useAuth();

    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] =
        useState(true);

    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(
        profile?.username ?? "",
    );

    const [avatarType, setAvatarType] = useState(
        profile?.avatar_type ?? "emoji",
    );

    const [selectedEmoji, setSelectedEmoji] =
        useState(profile?.avatar ?? "🎧");

    const [selectedArtist, setSelectedArtist] =
        useState(
            profile?.avatar_type === "spotify_artist"
                ? {
                    spotify_id:
                        profile.avatar_spotify_artist_id,
                    name: profile.avatar_artist_name,
                    image_url: profile.avatar_url,
                    spotify_url:
                        profile.avatar_spotify_artist_url,
                }
                : null,
        );

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("");
    const [
        achievementState,
        setAchievementState,
    ] = useState({
        unlocked: [],
        progress: [],
        rewards: {
            streak_shields: 0,
            triple_choice_tokens: 0,
            legendary_frames: [],
            auto_use_streak_shield: true,
        },
        showcase: [],
    });
    const [xpHistory, setXPHistory] =
        useState([]);

    const xpProgress = useMemo(
        () =>
            getLevelProgress(
                profile?.total_xp ?? 0,
            ),
        [profile?.total_xp],
    );

    const musicalTitle = useMemo(
        () =>
            getMusicalTitle(
                xpProgress.level,
            ),
        [xpProgress.level],
    );

    const loadAchievementState =
        useCallback(async () => {
            if (!user?.id) {
                return;
            }

            try {
                await evaluateAchievements();

                const nextAchievementState =
                    await getAchievementsState(
                        user.id,
                    );

                setAchievementState({
                    unlocked:
                        nextAchievementState.unlocked ?? [],

                    progress:
                        nextAchievementState.progress ?? [],

                    rewards:
                        nextAchievementState.rewards ?? {
                            streak_shields: 0,
                            triple_choice_tokens: 0,
                            legendary_frames: [],
                            auto_use_streak_shield: true,
                        },

                    showcase:
                        nextAchievementState.showcase ?? [],
                });
            } catch (error) {
                console.error(
                    "No se pudieron cargar los logros del perfil:",
                    error,
                );
            }
        }, [user?.id]);

    const loadStats = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        setLoadingStats(true);

        try {
            const profileStats = await getProfileStats(
                user.id,
            );

            setStats(profileStats);
        } catch (error) {
            console.error(error);
            setMessage(
                "No hemos podido cargar todas tus estadísticas.",
            );
            setMessageType("error");
        } finally {
            setLoadingStats(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        let cancelled = false;

        async function loadXPHistory() {
            try {
                const history =
                    await getXPHistory(
                        user.id,
                        8,
                    );

                if (!cancelled) {
                    setXPHistory(history);
                }
            } catch (error) {
                console.error(
                    "No se pudo cargar el historial de XP:",
                    error,
                );
            }
        }

        loadXPHistory();

        window.addEventListener(
            "audite:xp-earned",
            loadXPHistory,
        );

        return () => {
            cancelled = true;

            window.removeEventListener(
                "audite:xp-earned",
                loadXPHistory,
            );
        };
    }, [user?.id]);

    useEffect(() => {
        setUsername(profile?.username ?? "");
        setAvatarType(
            profile?.avatar_type ?? "emoji",
        );
        setSelectedEmoji(profile?.avatar ?? "🎧");

        if (
            profile?.avatar_type === "spotify_artist"
        ) {
            setSelectedArtist({
                spotify_id:
                    profile.avatar_spotify_artist_id,
                name: profile.avatar_artist_name,
                image_url: profile.avatar_url,
                spotify_url:
                    profile.avatar_spotify_artist_url,
            });
        }
    }, [profile]);

    useEffect(() => {
        loadAchievementState();

        window.addEventListener(
            "audite:achievements-changed",
            loadAchievementState,
        );

        return () => {
            window.removeEventListener(
                "audite:achievements-changed",
                loadAchievementState,
            );
        };
    }, [loadAchievementState]);

    const memberSince = useMemo(() => {
        if (!profile?.created_at) {
            return "Fecha desconocida";
        }

        return new Intl.DateTimeFormat("es-ES", {
            month: "long",
            year: "numeric",
        }).format(new Date(profile.created_at));
    }, [profile?.created_at]);

    async function handleSaveProfile(event) {
        event.preventDefault();

        if (!username.trim()) {
            setMessage("El nombre no puede estar vacío.");
            setMessageType("error");
            return;
        }

        if (
            avatarType === "spotify_artist" &&
            !selectedArtist
        ) {
            setMessage(
                "Selecciona un artista antes de guardar.",
            );
            setMessageType("error");
            return;
        }

        setSaving(true);
        setMessage("");
        setMessageType("");

        try {
            const { error: usernameError } =
                await supabase
                    .from("profiles")
                    .update({
                        username: username.trim(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", user.id);

            if (usernameError) {
                throw usernameError;
            }

            await updateProfileAvatar({
                userId: user.id,
                avatarType,
                emoji: selectedEmoji,
                artist: selectedArtist,
            });

            await refreshProfile();

            setEditing(false);
            setMessage("Perfil actualizado correctamente.");
            setMessageType("success");
        } catch (error) {
            console.error(error);

            setMessage(
                error.message ||
                "No hemos podido actualizar tu perfil.",
            );
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    }

    async function handleSignOut() {
        const { error } = await signOut();

        if (!error) {
            navigate("/auth", {
                replace: true,
            });
        }
    }

    const previewProfile = {
        ...profile,
        username,
        avatar_type: avatarType,
        avatar: selectedEmoji,
        avatar_url:
            avatarType === "spotify_artist"
                ? selectedArtist?.image_url
                : null,
        avatar_artist_name:
            selectedArtist?.name ?? null,
        avatar_spotify_artist_url:
            selectedArtist?.spotify_url ?? null,
    };

    return (
        <section className="profile-page">
            <header className="profile-page__title">
                <p>TU ESPACIO MUSICAL</p>
                <h1>Perfil</h1>
            </header>

            <article className="profile-identity">
                <div className="profile-identity__glow" />

                <UserAvatar
                    profile={profile}
                    size="large"
                    showSpotifyLink
                />

                <div className="profile-identity__content">
                    <p>
                        NIVEL {xpProgress.level} ·{" "}
                        {musicalTitle.toUpperCase()}
                    </p>

                    <h2>
                        {profile?.username ?? "Usuario"}
                    </h2>

                    <span>{user?.email}</span>

                    <small>
                        Miembro desde {memberSince}
                    </small>
                </div>

                <button
                    type="button"
                    onClick={() => setEditing((value) => !value)}
                >
                    {editing ? "Cerrar edición" : "Editar perfil"}
                </button>
            </article>

            {editing && (
                <form
                    className="profile-editor"
                    onSubmit={handleSaveProfile}
                >
                    <header>
                        <p>PERSONALIZACIÓN</p>
                        <h2>Edita tu identidad musical</h2>
                    </header>

                    <label className="profile-editor__name">
                        <span>Nombre</span>

                        <input
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            maxLength={40}
                            placeholder="Tu nombre"
                        />
                    </label>

                    <AvatarSelector
                        profile={previewProfile}
                        selectedType={avatarType}
                        selectedEmoji={selectedEmoji}
                        selectedArtist={selectedArtist}
                        onTypeChange={setAvatarType}
                        onEmojiChange={setSelectedEmoji}
                        onArtistChange={setSelectedArtist}
                    />

                    <button
                        type="submit"
                        className="profile-editor__submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Guardando..."
                            : "Guardar cambios"}
                    </button>
                </form>
            )}

            <section className="profile-xp-card">
                <header className="profile-xp-card__header">
                    <div>
                        <p>NIVEL MUSICAL</p>

                        <h2>
                            Nivel {xpProgress.level}
                        </h2>

                        <span>{musicalTitle}</span>
                    </div>

                    <strong>
                        {xpProgress.totalXP.toLocaleString(
                            "es-ES",
                        )}
                        <small> XP</small>
                    </strong>
                </header>

                <div className="profile-xp-card__progress-information">
                    <span>
                        {xpProgress.xpInsideLevel.toLocaleString(
                            "es-ES",
                        )}
                        {" / "}
                        {xpProgress.xpNeededForLevel.toLocaleString(
                            "es-ES",
                        )}
                        {" XP"}
                    </span>

                    <span>
                        {Math.round(
                            xpProgress.percentage,
                        )}
                        %
                    </span>
                </div>

                <div className="profile-xp-card__track">
                    <div
                        style={{
                            width: `${xpProgress.percentage}%`,
                        }}
                    />
                </div>

                <p>
                    Te faltan{" "}
                    <strong>
                        {xpProgress.xpRemaining.toLocaleString(
                            "es-ES",
                        )}{" "}
                        XP
                    </strong>{" "}
                    para alcanzar el nivel{" "}
                    {xpProgress.level + 1}.
                </p>
            </section>

            {message && (
                <p
                    className={`profile-page__message profile-page__message--${messageType}`}
                >
                    {message}
                </p>
            )}

            <NavLink
                to="/social"
                className="profile-social-card"
            >
                <div className="profile-social-card__icon">
                    👥
                </div>

                <div className="profile-social-card__content">
                    <span className="profile-social-card__eyebrow">
                        COMUNIDAD
                    </span>

                    <h3>Social</h3>

                    <p>
                        Encuentra amigos, comparte
                        discos y descubre qué están
                        escuchando.
                    </p>

                    <strong>
                        Entrar en Social
                        <span>→</span>
                    </strong>
                </div>
            </NavLink>

            <section className="profile-section">
                <header className="profile-section__header">
                    <div>
                        <p>TUS NÚMEROS</p>
                        <h2>Estadísticas</h2>
                    </div>

                    {loadingStats && <span>Actualizando...</span>}
                </header>

                <div className="profile-stats-grid">
                    <article>
                        <span>🔥</span>
                        <strong>
                            {profile?.current_streak ?? 0}
                        </strong>
                        <p>Racha actual</p>
                    </article>

                    <article>
                        <span>👑</span>
                        <strong>
                            {profile?.best_streak ?? 0}
                        </strong>
                        <p>Mejor racha</p>
                    </article>

                    <article>
                        <span>📀</span>
                        <strong>
                            {stats?.totalCompleted ?? 0}
                        </strong>
                        <p>Discos escuchados</p>
                    </article>

                    <article>
                        <span>⭐</span>
                        <strong>
                            {stats?.averageRating === null ||
                                stats?.averageRating === undefined
                                ? "—"
                                : stats.averageRating
                                    .toFixed(1)
                                    .replace(".", ",")}
                        </strong>
                        <p>Nota media</p>
                    </article>

                    <article>
                        <span>🎶</span>
                        <strong>
                            {stats?.favoriteTracks ?? 0}
                        </strong>
                        <p>Canciones top</p>
                    </article>

                    <article>
                        <span>⏱️</span>
                        <strong>
                            {formatMinutes(
                                stats?.totalMinutes ?? 0,
                            )}
                        </strong>
                        <p>Tiempo escuchado</p>
                    </article>
                </div>
            </section>

            <section className="profile-section">
                <header className="profile-section__header">
                    <div>
                        <p>TU ADN MUSICAL</p>
                        <h2>Lo que define tus escuchas</h2>
                    </div>
                </header>

                <div className="musical-dna-grid">
                    <article>
                        <span>Género favorito</span>
                        <strong>
                            {stats?.favoriteGenre ??
                                "Aún por descubrir"}
                        </strong>
                    </article>

                    <article>
                        <span>Década favorita</span>
                        <strong>
                            {stats?.favoriteDecade ??
                                "Aún por descubrir"}
                        </strong>
                    </article>

                    <article>
                        <span>Artista más repetido</span>
                        <strong>
                            {stats?.topArtist ??
                                "Aún por descubrir"}
                        </strong>
                    </article>

                    <article>
                        <span>Discos pendientes</span>
                        <strong>
                            {stats?.pendingAlbums ?? 0}
                        </strong>
                    </article>
                </div>

                {stats?.bestReview && (
                    <article className="profile-best-album">
                        <div className="profile-best-album__cover">
                            {stats.bestReview.album?.cover_url ? (
                                <img
                                    src={
                                        stats.bestReview.album.cover_url
                                    }
                                    alt={`Portada de ${stats.bestReview.album.title}`}
                                />
                            ) : (
                                <span>💿</span>
                            )}
                        </div>

                        <div>
                            <p>TU DISCO MEJOR VALORADO</p>

                            <h3>
                                {stats.bestReview.album?.title}
                            </h3>

                            <span>
                                {
                                    stats.bestReview.album
                                        ?.artist_name
                                }
                            </span>
                        </div>

                        <strong>
                            {stats.bestReview.rating}
                        </strong>
                    </article>
                )}
            </section>

            <section className="profile-achievements">
                <header>
                    <div>
                        <p>TU HISTORIA MUSICAL</p>
                        <h2>Logros</h2>
                    </div>

                    <span>
                        {achievementState.unlocked.length}
                        /{achievements.length}
                    </span>
                </header>

                <div className="profile-achievements__showcase">
                    {achievementState.showcase.length ? (
                        achievementState.showcase.map(
                            (showcaseItem) => {
                                const achievement =
                                    getAchievementById(
                                        showcaseItem.achievement_id,
                                    );

                                if (!achievement) {
                                    return null;
                                }

                                const rarity =
                                    achievementRarities[
                                    achievement.rarity
                                    ];

                                return (
                                    <article
                                        key={achievement.id}
                                        style={{
                                            "--achievement-color":
                                                rarity.color,
                                        }}
                                    >
                                        <span>
                                            {achievement.icon}
                                        </span>

                                        <strong>
                                            {achievement.title}
                                        </strong>

                                        <small>
                                            {rarity.label}
                                        </small>
                                    </article>
                                );
                            },
                        )
                    ) : (
                        <p>
                            Todavía no has elegido logros para
                            tu vitrina.
                        </p>
                    )}
                </div>

                <div className="profile-achievements__footer">
                    <div>
                        <span>🛡️</span>

                        <strong>
                            {achievementState.rewards
                                ?.streak_shields ?? 0}
                        </strong>

                        <small>
                            Comodines de racha
                        </small>
                    </div>

                    <Link to="/achievements">
                        Ver todos los logros →
                    </Link>
                </div>
            </section>

            <section className="profile-section">
                <header className="profile-section__header">
                    <div>
                        <p>TU PROGRESO</p>
                        <h2>Última experiencia</h2>
                    </div>

                    <span>
                        {profile?.total_xp ?? 0} XP totales
                    </span>
                </header>

                {xpHistory.length > 0 ? (
                    <div className="profile-xp-history">
                        {xpHistory.map((entry) => (
                            <article key={entry.id}>
                                <div>
                                    <span>
                                        {entry.source_type ===
                                            "album_completed"
                                            ? "💿"
                                            : entry.source_type ===
                                                "album_reviewed"
                                                ? "⭐"
                                                : entry.source_type ===
                                                    "favorite_tracks"
                                                    ? "🎵"
                                                    : entry.source_type ===
                                                        "achievement"
                                                        ? "🏆"
                                                        : entry.source_type ===
                                                            "daily_challenge"
                                                            ? "🎯"
                                                            : "✦"}
                                    </span>
                                </div>

                                <p>
                                    <strong>{entry.reason}</strong>

                                    <span>
                                        {new Intl.DateTimeFormat(
                                            "es-ES",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            },
                                        ).format(
                                            new Date(
                                                entry.created_at,
                                            ),
                                        )}
                                    </span>
                                </p>

                                <strong>
                                    +{entry.amount} XP
                                </strong>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="profile-section__empty">
                        Tus recompensas de experiencia aparecerán aquí.
                    </p>
                )}
            </section>

            <GenreAffinitySection
                userId={user?.id}
            />

            <section className="profile-section">
                <header className="profile-section__header">
                    <div>
                        <p>ÚLTIMOS MOVIMIENTOS</p>
                        <h2>Actividad reciente</h2>
                    </div>
                </header>

                {stats?.recentActivity?.length ? (
                    <div className="profile-activity-list">
                        {stats.recentActivity
                            .slice(0, 7)
                            .map((activity) => (
                                <article key={activity.id}>
                                    <div>
                                        {activity.album?.cover_url ? (
                                            <img
                                                src={
                                                    activity.album.cover_url
                                                }
                                                alt=""
                                            />
                                        ) : (
                                            <span>💿</span>
                                        )}
                                    </div>

                                    <p>
                                        <strong>
                                            {activityLabels[
                                                activity.status
                                            ] ?? "Actualizaste"}
                                        </strong>

                                        <span>
                                            {activity.album?.title}
                                        </span>
                                    </p>

                                    <small>
                                        {new Intl.DateTimeFormat(
                                            "es-ES",
                                            {
                                                day: "numeric",
                                                month: "short",
                                            },
                                        ).format(
                                            new Date(
                                                activity.completed_at ??
                                                activity.abandoned_at ??
                                                activity.started_at ??
                                                activity.accepted_at ??
                                                activity.generated_at ??
                                                activity.created_at,
                                            ),
                                        )}
                                    </small>
                                </article>
                            ))}
                    </div>
                ) : (
                    <p className="profile-section__empty">
                        Tu actividad aparecerá aquí conforme uses
                        Audite.
                    </p>
                )}
            </section>

            <button
                type="button"
                className="profile-page__logout"
                onClick={handleSignOut}
            >
                Cerrar sesión
            </button>
        </section>
    );
}

export default Profile;