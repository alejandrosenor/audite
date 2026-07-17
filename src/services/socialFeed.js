import { supabase } from "./supabase";

export async function getSocialFeed({ limit = 20, offset = 0 } = {}) {
    const { data, error } = await supabase.rpc("get_social_feed", { feed_limit: limit, feed_offset: offset });
    if (error) throw error;
    return Promise.all((data ?? []).map(async post => {
        const { data: tracks, error: tracksError } = await supabase.rpc("get_post_top_tracks", { target_review_id: post.review_id });
        if (tracksError) console.error(tracksError);
        return { ...post, top_tracks: tracks ?? [] };
    }));
}
export async function publishReview({ userId, reviewId, visibility = "friends" }) {
    const { data, error } = await supabase.from("social_posts").upsert({ user_id: userId, review_id: reviewId, visibility, updated_at: new Date().toISOString() }, { onConflict: "user_id,review_id" }).select().single();
    if (error) throw error; return data;
}
export async function togglePostLike({ postId, userId, liked }) {
    if (liked) { const { error } = await supabase.from("social_post_likes").delete().eq("post_id", postId).eq("user_id", userId); if (error) throw error; return false; }
    const { error } = await supabase.from("social_post_likes").insert({ post_id: postId, user_id: userId }); if (error && error.code !== "23505") throw error; return true;
}
export async function getPostComments(postId) { const { data, error } = await supabase.from("social_post_comments").select(`id,content,created_at,user_id,profile:profiles(username,display_name,avatar_url)`).eq("post_id", postId).order("created_at"); if (error) throw error; return data ?? []; }
export async function addPostComment({ postId, userId, content }) { const clean = content.trim(); if (!clean) throw new Error("Escribe un comentario."); const { data, error } = await supabase.from("social_post_comments").insert({ post_id: postId, user_id: userId, content: clean }).select().single(); if (error) throw error; return data; }
export async function deletePostComment({ commentId, userId }) { const { error } = await supabase.from("social_post_comments").delete().eq("id", commentId).eq("user_id", userId); if (error) throw error; }
export async function getSocialProfile(userId) { const { data, error } = await supabase.rpc("get_social_profile", { target_user_id: userId }); if (error) throw error; return data; }
