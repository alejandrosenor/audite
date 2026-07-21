import { useState } from "react";
import {
    togglePostLike,
    getPostComments,
    addPostComment,
    deletePostComment,
    deleteSocialPost,
} from "../services/socialFeed";
import "./SocialPostCard.css";

const reactionLabels = {
    loved: "Me ha encantado",
    liked: "Me ha gustado",
    okay: "Sin más",
    weak: "Flojo",
    disliked: "No me ha gustado",
};

export default function SocialPostCard({
    post,
    currentUserId,
    onChanged,
}) {
    const [liked, setLiked] =
        useState(Boolean(post.liked_by_me));

    const [likeCount, setLikeCount] =
        useState(Number(post.like_count ?? 0));

    const [commentsOpen, setCommentsOpen] =
        useState(false);

    const [comments, setComments] =
        useState([]);

    const [commentText, setCommentText] =
        useState("");

    const [busy, setBusy] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [menuOpen, setMenuOpen] =
        useState(false);

    async function like() {
        setBusy(true);

        try {
            const next =
                await togglePostLike({
                    postId: post.post_id,
                    userId: currentUserId,
                    liked,
                });

            setLiked(next);

            setLikeCount((current) =>
                Math.max(
                    0,
                    current + (next ? 1 : -1),
                ),
            );
        } finally {
            setBusy(false);
        }
    }

    async function openComments() {
        const next = !commentsOpen;

        setCommentsOpen(next);

        if (
            next &&
            comments.length === 0
        ) {
            setComments(
                await getPostComments(
                    post.post_id,
                ),
            );
        }
    }

    async function submit(event) {
        event.preventDefault();

        if (!commentText.trim()) {
            return;
        }

        setBusy(true);

        try {
            await addPostComment({
                postId: post.post_id,
                userId: currentUserId,
                content: commentText,
            });

            setCommentText("");

            setComments(
                await getPostComments(
                    post.post_id,
                ),
            );

            onChanged?.();
        } finally {
            setBusy(false);
        }
    }

    async function handleDeletePost() {
        const confirmed = window.confirm(
            "¿Seguro que quieres eliminar esta publicación?",
        );

        if (!confirmed || deleting) {
            return;
        }

        setDeleting(true);

        try {
            await deleteSocialPost({
                postId: post.post_id,
                userId: currentUserId,
            });

            onChanged?.();
        } catch (error) {
            console.error(
                "No se pudo eliminar la publicación:",
                error,
            );

            window.alert(
                "No hemos podido eliminar la publicación.",
            );
        } finally {
            setDeleting(false);
            setMenuOpen(false);
        }
    }

    const isOwnPost =
        post.post_user_id === currentUserId;

    return (
        <article className="social-post">
            <header className="social-post__header">
                <div className="social-post__avatar">
                    {post.avatar_url ? (
                        <img
                            src={post.avatar_url}
                            alt={`Avatar de ${post.display_name}`}
                        />
                    ) : (
                        <span>
                            {post.display_name
                                ?.charAt(0)
                                ?.toUpperCase() ?? "A"}
                        </span>
                    )}
                </div>

                <div className="social-post__author">
                    <div>
                        <strong>
                            {post.display_name}
                        </strong>

                        <span>
                            @{post.username}
                        </span>
                    </div>

                    <small>
                        ha compartido una escucha
                    </small>
                </div>

                <div className="social-post__header-actions">
                    <time>
                        {new Date(
                            post.created_at,
                        ).toLocaleDateString(
                            "es-ES",
                            {
                                day: "2-digit",
                                month: "short",
                            },
                        )}
                    </time>

                    {isOwnPost && (
                        <div className="social-post__menu">
                            <button
                                type="button"
                                className="social-post__menu-trigger"
                                onClick={() =>
                                    setMenuOpen(
                                        (current) => !current,
                                    )
                                }
                                aria-label="Opciones de la publicación"
                                aria-expanded={menuOpen}
                            >
                                •••
                            </button>

                            {menuOpen && (
                                <div className="social-post__menu-panel">
                                    <button
                                        type="button"
                                        onClick={handleDeletePost}
                                        disabled={deleting}
                                    >
                                        <span>🗑</span>

                                        {deleting
                                            ? "Eliminando..."
                                            : "Eliminar publicación"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <section className="social-post__album">
                <div className="social-post__cover">
                    {post.cover_url ? (
                        <img
                            src={post.cover_url}
                            alt={`Portada de ${post.album_title}`}
                        />
                    ) : (
                        <span>💿</span>
                    )}
                </div>

                <div className="social-post__album-content">
                    <p className="social-post__eyebrow">
                        HA ESCUCHADO
                    </p>

                    <h2>
                        {post.album_title}
                    </h2>

                    <h3>
                        {post.artist_name}
                    </h3>

                    <div className="social-post__rating">
                        <strong>
                            {Number(
                                post.rating,
                            )
                                .toFixed(1)
                                .replace(".", ",")}
                        </strong>

                        <div>
                            <small>
                                VALORACIÓN
                            </small>

                            <span>
                                {reactionLabels[
                                    post.reaction
                                ]}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {post.review_text && (
                <blockquote>
                    <span>“</span>

                    <p>
                        {post.review_text}
                    </p>
                </blockquote>
            )}

            {post.top_tracks?.length > 0 && (
                <section className="social-post__top">
                    <header>
                        <div>
                            <p>
                                TOP 3 CANCIONES
                            </p>

                            <h3>
                                Lo mejor del disco
                            </h3>
                        </div>

                        <span>♪</span>
                    </header>

                    <ol>
                        {post.top_tracks.map(
                            (track) => (
                                <li
                                    key={
                                        track.track_id
                                    }
                                >
                                    <strong>
                                        {track.position}
                                    </strong>

                                    <span>
                                        {track.title}
                                    </span>

                                    <small>♪</small>
                                </li>
                            ),
                        )}
                    </ol>
                </section>
            )}

            <footer className="social-post__footer">
                <button
                    type="button"
                    className={
                        liked
                            ? "social-post__like active"
                            : "social-post__like"
                    }
                    onClick={like}
                    disabled={busy}
                >
                    <span>
                        {liked ? "♥" : "♡"}
                    </span>

                    {likeCount}
                </button>

                <button
                    type="button"
                    onClick={openComments}
                >
                    <span>💬</span>

                    {post.comment_count ?? 0}
                </button>

                {post.spotify_url && (
                    <a
                        href={post.spotify_url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <span>▶</span>
                        Escuchar
                    </a>
                )}
            </footer>

            {commentsOpen && (
                <section className="social-comments">
                    <div className="social-comments__list">
                        {comments.length === 0 && (
                            <p className="social-comments__empty">
                                Todavía no hay comentarios.
                            </p>
                        )}

                        {comments.map(
                            (comment) => (
                                <article
                                    key={comment.id}
                                >
                                    <div>
                                        <strong>
                                            {
                                                comment
                                                    .profile
                                                    ?.display_name
                                            }
                                        </strong>

                                        <p>
                                            {
                                                comment.content
                                            }
                                        </p>
                                    </div>

                                    {comment.user_id ===
                                        currentUserId && (
                                            <button
                                                type="button"
                                                aria-label="Eliminar comentario"
                                                onClick={async () => {
                                                    await deletePostComment({
                                                        commentId:
                                                            comment.id,
                                                        userId:
                                                            currentUserId,
                                                    });

                                                    setComments(
                                                        (
                                                            current,
                                                        ) =>
                                                            current.filter(
                                                                (
                                                                    item,
                                                                ) =>
                                                                    item.id !==
                                                                    comment.id,
                                                            ),
                                                    );
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                </article>
                            ),
                        )}
                    </div>

                    <form onSubmit={submit}>
                        <input
                            value={commentText}
                            onChange={(event) =>
                                setCommentText(
                                    event.target.value,
                                )
                            }
                            placeholder="Escribe un comentario..."
                            maxLength={1000}
                        />

                        <button
                            type="submit"
                            disabled={
                                busy ||
                                !commentText.trim()
                            }
                        >
                            Enviar
                        </button>
                    </form>
                </section>
            )}
        </article>
    );
}