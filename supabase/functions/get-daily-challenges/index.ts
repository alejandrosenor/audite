import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function madridDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function seededIndex(seed: string, length: number) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Método no permitido." }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authorization) return jsonResponse({ error: "No existe una sesión válida." }, 401);
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Falta configuración de Supabase.");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return jsonResponse({ error: "La sesión no es válida." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const challengeDate = madridDate();

    const { data: existing, error: existingError } = await admin
      .from("user_daily_challenges")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_date", challengeDate);
    if (existingError) throw existingError;

    if (!existing?.length) {
      const selected: any[] = [];
      for (const [index, difficulty] of ["easy", "medium", "hard"].entries()) {
        const { data: candidates, error } = await admin
          .from("challenge_definitions")
          .select("*")
          .eq("difficulty", difficulty)
          .eq("is_active", true);
        if (error) throw error;
        if (!candidates?.length) throw new Error(`No hay retos ${difficulty} activos.`);
        const pick = candidates[seededIndex(`${user.id}:${challengeDate}:${difficulty}`, candidates.length)];
        selected.push({ ...pick, slot: index + 1 });
      }

      const { error: insertError } = await admin.from("user_daily_challenges").insert(
        selected.map((challenge) => ({
          user_id: user.id,
          challenge_date: challengeDate,
          challenge_id: challenge.id,
          slot: challenge.slot,
          target_value: challenge.target_value,
        })),
      );
      if (insertError && insertError.code !== "23505") throw insertError;

      const { error: bonusError } = await admin.from("user_daily_challenge_bonus").upsert({
        user_id: user.id, challenge_date: challengeDate, reward_xp: 250,
      }, { onConflict: "user_id,challenge_date" });
      if (bonusError) throw bonusError;
    }

    const { data: challenges, error: readError } = await admin
      .from("user_daily_challenges")
      .select("*,challenge:challenge_definitions(*)")
      .eq("user_id", user.id)
      .eq("challenge_date", challengeDate)
      .order("slot");
    if (readError) throw readError;

    const { data: bonus, error: bonusReadError } = await admin
      .from("user_daily_challenge_bonus")
      .select("*")
      .eq("user_id", user.id)
      .eq("challenge_date", challengeDate)
      .maybeSingle();
    if (bonusReadError) throw bonusReadError;

    return jsonResponse({ challengeDate, challenges: challenges ?? [], bonus });
  } catch (error) {
    console.error("get-daily-challenges error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "No hemos podido cargar los retos." }, 500);
  }
});
