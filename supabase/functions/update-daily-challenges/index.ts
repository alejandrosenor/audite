import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function madridDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}
const normalize = (value: unknown) =>
  String(value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const hasGenre = (genres: unknown, expected: string) =>
  Array.isArray(genres) && genres.some((genre) => normalize(genre).includes(normalize(expected)));

function matches(criteria: Record<string, any>, metadata: Record<string, any>) {
  if (
    criteria.correct != null &&
    metadata.correct !== criteria.correct
  ) return false;
  if (criteria.min_rating != null && Number(metadata.rating) < Number(criteria.min_rating)) return false;
  if (criteria.reaction && metadata.reaction !== criteria.reaction) return false;
  if (criteria.language && metadata.language !== criteria.language) return false;
  if (criteria.country && normalize(metadata.country) !== normalize(criteria.country)) return false;
  if (criteria.source && metadata.source !== criteria.source) return false;
  if (criteria.resumed === true && metadata.resumed !== true) return false;
  if (criteria.would_listen_again === true && metadata.wouldListenAgain !== true) return false;
  if (criteria.year_min != null && Number(metadata.releaseYear) < Number(criteria.year_min)) return false;
  if (criteria.year_max != null && Number(metadata.releaseYear) > Number(criteria.year_max)) return false;
  if (criteria.min_tracks != null && Number(metadata.trackCount) < Number(criteria.min_tracks)) return false;
  if (criteria.max_tracks != null && Number(metadata.trackCount) > Number(criteria.max_tracks)) return false;
  if (criteria.min_favorites != null && Number(metadata.favoriteCount) < Number(criteria.min_favorites)) return false;
  if (criteria.max_favorites != null && Number(metadata.favoriteCount) > Number(criteria.max_favorites)) return false;
  if (criteria.min_review_length != null && String(metadata.reviewText ?? "").trim().length < Number(criteria.min_review_length)) return false;
  if (criteria.genre_contains && !hasGenre(metadata.genres, criteria.genre_contains)) return false;
  return true;
}

function levelFromXP(totalXP: number) {
  let level = 1;
  const req = (target: number) => target <= 1 ? 0 : 500*(target-1)+50*(target-1)*(target-2);
  while (totalXP >= req(level + 1)) level += 1;
  return level;
}

async function award(admin: any, userId: string, sourceId: string, amount: number, reason: string, metadata: any) {
  const { data: existing, error: existingError } = await admin.from("xp_history")
    .select("id").eq("user_id", userId).eq("source_type", "daily_challenge")
    .eq("source_id", sourceId).maybeSingle();
  if (existingError) throw existingError;
  if (existing) return false;

  const { data: profile, error: profileError } = await admin.from("profiles")
    .select("total_xp").eq("id", userId).single();
  if (profileError) throw profileError;
  const nextXP = Number(profile.total_xp ?? 0) + amount;

  const { error: historyError } = await admin.from("xp_history").insert({
    user_id: userId, amount, reason, source_type: "daily_challenge", source_id: sourceId, metadata,
  });
  if (historyError) {
    if (historyError.code === "23505") return false;
    throw historyError;
  }

  const { error: updateError } = await admin.from("profiles").update({
    total_xp: nextXP, musical_level: levelFromXP(nextXP), updated_at: new Date().toISOString(),
  }).eq("id", userId);
  if (updateError) throw updateError;
  return true;
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

    const body = await request.json();
    const eventType = String(body?.eventType ?? "");
    const eventId = String(body?.eventId ?? "");
    const metadata = typeof body?.metadata === "object" && body.metadata ? body.metadata : {};
    if (!eventType || !eventId) return jsonResponse({ error: "Faltan eventType o eventId." }, 400);

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const challengeDate = madridDate();
    const {
      error: eventInsertError,
    } = await admin
      .from("daily_challenge_events")
      .insert({
        user_id: user.id,
        event_type: eventType,
        event_id: eventId,
        metadata,
      });

    if (
      eventInsertError?.code === "23505"
    ) {
      return jsonResponse({
        completed: [],
        bonusCompleted: false,
        duplicatedEvent: true,
      });
    }

    if (eventInsertError) {
      throw eventInsertError;
    }
    let quoteXPAwarded = false;

    if (
      eventType ===
        "daily_music_quote_completed" &&
      metadata.correct === true
    ) {
      quoteXPAwarded = await award(
        admin,
        user.id,
        `daily-music-quote-correct:${eventId}`,
        10,
        "Frase del día acertada",
        {
          eventId,
          questionId:
            metadata.questionId ?? null,
          selectedPerson:
            metadata.selectedPerson ?? null,
        },
      );
    }
    const { data: active, error: activeError } = await admin
      .from("user_daily_challenges")
      .select("*,challenge:challenge_definitions(*)")
      .eq("user_id", user.id)
      .eq("challenge_date", challengeDate)
      .is("completed_at", null);
    if (activeError) throw activeError;

    const completed: any[] = [];
    for (const row of active ?? []) {
      const challenge = row.challenge;
      if (!challenge || challenge.event_type !== eventType || !matches(challenge.criteria ?? {}, metadata)) continue;

      const criteria = challenge.criteria ?? {};
      let state = row.state ?? {};
      let value = Number(row.current_value ?? 0);

      if (criteria.distinct_field) {
        const values = new Set<string>(Array.isArray(state.values) ? state.values : []);
        const field = criteria.distinct_field;
        if (field === "genres" && Array.isArray(metadata.genres)) metadata.genres.forEach((v: string) => values.add(normalize(v)));
        if (field === "decade" && metadata.releaseYear) values.add(String(Math.floor(Number(metadata.releaseYear)/10)*10));
        if (field === "country" && metadata.country) values.add(normalize(metadata.country));
        if (field === "artist" && metadata.artistName) values.add(normalize(metadata.artistName));
        if (field === "source" && metadata.source) values.add(normalize(metadata.source));
        state = { ...state, values: [...values] };
        value = values.size;
      } else if (Array.isArray(criteria.required_genres)) {
        const found = new Set<string>(Array.isArray(state.found) ? state.found : []);
        criteria.required_genres.forEach((g: string) => { if (hasGenre(metadata.genres, g)) found.add(normalize(g)); });
        state = { ...state, found: [...found] };
        value = found.size;
      } else {
        value += eventType === "favorites_saved" ? Math.max(0, Number(metadata.favoriteCount ?? 0)) : 1;
      }

      value = Math.min(value, Number(row.target_value));
      const done = value >= Number(row.target_value);
      const now = new Date().toISOString();

      const { error: updateError } = await admin.from("user_daily_challenges").update({
        current_value: value, state, completed_at: done ? now : null, updated_at: now,
      }).eq("id", row.id);
      if (updateError) throw updateError;

      if (done) {
        const awarded = await award(admin, user.id, row.id, Number(challenge.reward_xp),
          `Reto diario: ${challenge.title}`, { challengeCode: challenge.code, eventId });
        if (awarded) await admin.from("user_daily_challenges").update({ xp_awarded_at: now }).eq("id", row.id);
        completed.push({ id: row.id, title: challenge.title, rewardXP: challenge.reward_xp, awarded });
      }
    }

    const { data: today, error: todayError } = await admin.from("user_daily_challenges")
      .select("completed_at").eq("user_id", user.id).eq("challenge_date", challengeDate);
    if (todayError) throw todayError;

    let bonusCompleted = false;
    if ((today ?? []).length === 3 && today.every((row: any) => row.completed_at)) {
      const { data: bonus, error: bonusError } = await admin.from("user_daily_challenge_bonus")
        .select("*").eq("user_id", user.id).eq("challenge_date", challengeDate).maybeSingle();
      if (bonusError) throw bonusError;
      if (bonus && !bonus.completed_at) {
        const now = new Date().toISOString();
        const awarded = await award(admin, user.id, `daily-bonus:${challengeDate}`, Number(bonus.reward_xp),
          "Bonus diario completado", { challengeDate });
        await admin.from("user_daily_challenge_bonus").update({
          completed_at: now, xp_awarded_at: awarded ? now : bonus.xp_awarded_at,
        }).eq("id", bonus.id);
        bonusCompleted = true;
      }
    }

    return jsonResponse({
      completed,
      bonusCompleted,
      quoteXPAwarded,
    });
  } catch (error) {
    console.error("update-daily-challenges error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "No hemos podido actualizar los retos." }, 500);
  }
});
