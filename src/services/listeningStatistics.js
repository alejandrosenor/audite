import { supabase } from "./supabase";

export async function getListeningStatistics() {
    const { data, error } = await supabase.rpc(
        "get_listening_statistics",
    );

    if (error) throw error;
    return data ?? null;
}
