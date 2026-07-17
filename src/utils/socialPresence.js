export function formatPresence({ lastSeenAt, showLastSeen = true }) {
    if (!showLastSeen || !lastSeenAt) return "";
    const difference = Date.now() - new Date(lastSeenAt).getTime();
    if (!Number.isFinite(difference) || difference < 0) return "";
    if (difference < 2 * 60 * 1000) return "En línea";
    const minutes = Math.floor(difference / 60000);
    if (minutes < 60) return `Conectado hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Conectado hace ${hours} h`;
    return `Conectado hace ${Math.floor(hours / 24)} d`;
}
