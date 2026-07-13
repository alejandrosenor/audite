import "./UserAvatar.css";

function UserAvatar({
    profile,
    size = "medium",
    showSpotifyLink = false,
}) {
    const hasImage =
        profile?.avatar_type !== "emoji" &&
        profile?.avatar_url;

    const content = hasImage ? (
        <img
            src={profile.avatar_url}
            alt={
                profile.avatar_artist_name
                    ? `Imagen de ${profile.avatar_artist_name}`
                    : `Avatar de ${profile.username}`
            }
        />
    ) : (
        <span>{profile?.avatar ?? "🎧"}</span>
    );

    const className = [
        "user-avatar",
        `user-avatar--${size}`,
        hasImage
            ? "user-avatar--image"
            : "user-avatar--emoji",
    ].join(" ");

    if (
        showSpotifyLink &&
        profile?.avatar_type ===
        "spotify_artist" &&
        profile?.avatar_spotify_artist_url
    ) {
        return (
            <a
                className={className}
                href={
                    profile.avatar_spotify_artist_url
                }
                target="_blank"
                rel="noreferrer"
                title={`Ver ${profile.avatar_artist_name} en Spotify`}
            >
                {content}

                <small className="user-avatar__spotify">
                    Spotify
                </small>
            </a>
        );
    }

    return (
        <div className={className}>
            {content}
        </div>
    );
}

export default UserAvatar;