import { supabase } from "./supabase";

export async function searchSocialProfiles(query) {
    const cleanQuery = query?.trim() ?? "";
    if (cleanQuery.length < 2) return [];
    const { data, error } = await supabase.rpc("search_social_profiles", { search_text: cleanQuery });
    if (error) throw error;
    return data ?? [];
}

export async function getMyFriends() {
    const { data, error } = await supabase.rpc("get_my_friends");
    if (error) throw error;
    return data ?? [];
}

export async function getIncomingFriendRequests() {
    const { data, error } = await supabase.rpc("get_incoming_friend_requests");
    if (error) throw error;
    return data ?? [];
}

export async function sendFriendRequest({ requesterId, receiverId }) {
    const { data, error } = await supabase.from("friendships").insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: "pending",
    }).select().single();
    if (error) {
        if (error.code === "23505") throw new Error("Ya existe una relación o solicitud con este usuario.");
        throw error;
    }
    return data;
}

export async function acceptFriendRequest({ friendshipId, userId }) {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("friendships").update({
        status: "accepted", accepted_at: now, updated_at: now,
    }).eq("id", friendshipId).eq("receiver_id", userId).eq("status", "pending").select().single();
    if (error) throw error;
    return data;
}

export async function rejectFriendRequest({ friendshipId, userId }) {
    const { data, error } = await supabase.from("friendships").update({
        status: "rejected", updated_at: new Date().toISOString(),
    }).eq("id", friendshipId).eq("receiver_id", userId).eq("status", "pending").select().single();
    if (error) throw error;
    return data;
}

export async function cancelFriendRequest({ friendshipId, userId }) {
    const { error } = await supabase.from("friendships").delete()
        .eq("id", friendshipId).eq("requester_id", userId).eq("status", "pending");
    if (error) throw error;
}

export async function removeFriend({ friendshipId }) {
    const { error } = await supabase.from("friendships").delete()
        .eq("id", friendshipId).eq("status", "accepted");
    if (error) throw error;
}

export async function updateMyPresence({ userId }) {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update({
        last_seen_at: new Date().toISOString(),
    }).eq("id", userId);
    if (error) console.error("No se pudo actualizar la presencia:", error);
}

export async function updateSocialPrivacy({
    userId, isProfilePublic, allowFriendRequests, showLastSeen, showListeningStatus,
}) {
    const { data, error } = await supabase.from("profiles").update({
        is_profile_public: isProfilePublic,
        allow_friend_requests: allowFriendRequests,
        show_last_seen: showLastSeen,
        show_listening_status: showListeningStatus,
    }).eq("id", userId).select().single();
    if (error) throw error;
    return data;
}
