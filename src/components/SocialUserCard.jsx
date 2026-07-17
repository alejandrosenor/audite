import { formatPresence } from "../utils/socialPresence";
import "./SocialUserCard.css";

function SocialUserCard({ profile, actionLoading, onSendRequest, onAcceptRequest, onRejectRequest, onCancelRequest, onRemoveFriend }) {
    const status = profile.friendship_status ?? profile.status ?? null;
    const direction = profile.friendship_direction ?? null;
    const presence = formatPresence({ lastSeenAt: profile.last_seen_at, showLastSeen: profile.show_last_seen });

    return (
        <article className="social-user-card">
            <div className="social-user-card__avatar">
                {profile.avatar_url ? <img src={profile.avatar_url} alt={`Avatar de ${profile.display_name}`} /> : <span>{profile.display_name?.charAt(0)?.toUpperCase() ?? "A"}</span>}
            </div>
            <div className="social-user-card__content">
                <header>
                    <div><h3>{profile.display_name}</h3><span>@{profile.username}</span></div>
                    {presence && <small>{presence}</small>}
                </header>
                {profile.bio && <p>{profile.bio}</p>}
                <div className="social-user-card__actions">
                    {!status && <button type="button" onClick={() => onSendRequest(profile)} disabled={actionLoading}>Añadir amigo</button>}
                    {status === "pending" && direction === "outgoing" && <button type="button" className="social-user-card__secondary" onClick={() => onCancelRequest(profile)} disabled={actionLoading}>Cancelar solicitud</button>}
                    {status === "pending" && direction === "incoming" && <>
                        <button type="button" onClick={() => onAcceptRequest(profile)} disabled={actionLoading}>Aceptar</button>
                        <button type="button" className="social-user-card__secondary" onClick={() => onRejectRequest(profile)} disabled={actionLoading}>Rechazar</button>
                    </>}
                    {status === "accepted" && <>
                        <span className="social-user-card__friend-badge">✓ Amigos</span>
                        <button type="button" className="social-user-card__secondary" onClick={() => onRemoveFriend(profile)} disabled={actionLoading}>Eliminar amigo</button>
                    </>}
                </div>
            </div>
        </article>
    );
}
export default SocialUserCard;
