import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const allowedRewards = {
  album_completed: {
    amount: 250,
    reason: "Disco terminado",
  },

  album_reviewed: {
    amount: 40,
    reason: "Valoración guardada",
  },

  favorite_tracks: {
    amount: 25,
    reason: "Canciones top elegidas",
  },

  new_genre: {
    amount: 100,
    reason: "Nuevo género descubierto",
  },

  daily_challenge: {
    amount: 250,
    reason: "Reto diario completado",
  },

  weekly_challenge: {
    amount: 1200,
    reason: "Reto semanal completado",
  },
} as const;

type RewardType =
  keyof typeof allowedRewards;

function jsonResponse(
  body: unknown,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getXPRequiredForLevel(
  level: number,
) {
  if (level <= 1) {
    return 0;
  }

  const previousLevel = level - 1;

  return (
    500 * previousLevel +
    50 *
      previousLevel *
      (previousLevel - 1)
  );
}

function getLevelFromXP(totalXP: number) {
  let level = 1;

  while (
    totalXP >=
    getXPRequiredForLevel(level + 1)
  ) {
    level += 1;
  }

  return level;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Método no permitido.",
      },
      405,
    );
  }

  try {
    const authorization =
      request.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(
        {
          error:
            "No existe una sesión válida.",
        },
        401,
      );
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const anonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      );

    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Falta la configuración interna de Supabase.",
      );
    }

    const userClient = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization:
              authorization,
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        {
          error:
            "La sesión no es válida.",
        },
        401,
      );
    }

    const body = await request.json();

    const rewardType =
      body?.rewardType as RewardType;

    const sourceId =
      typeof body?.sourceId === "string"
        ? body.sourceId.trim()
        : "";

    const metadata =
      typeof body?.metadata === "object" &&
      body.metadata !== null
        ? body.metadata
        : {};

    if (
      !rewardType ||
      !allowedRewards[rewardType]
    ) {
      return jsonResponse(
        {
          error:
            "El tipo de recompensa no es válido.",
        },
        400,
      );
    }

    if (!sourceId) {
      return jsonResponse(
        {
          error:
            "La recompensa necesita un identificador.",
        },
        400,
      );
    }

    const reward =
      allowedRewards[rewardType];

    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    /*
     * Comprobamos si esta recompensa ya fue
     * concedida anteriormente.
     */
    const {
      data: existingHistory,
      error: existingError,
    } = await adminClient
      .from("xp_history")
      .select("id")
      .eq("user_id", user.id)
      .eq("source_type", rewardType)
      .eq("source_id", sourceId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingHistory) {
      const {
        data: existingProfile,
        error: profileError,
      } = await adminClient
        .from("profiles")
        .select(`
          total_xp,
          musical_level
        `)
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return jsonResponse({
        awarded: false,
        alreadyAwarded: true,
        amount: 0,
        totalXP:
          existingProfile.total_xp ?? 0,
        previousLevel:
          existingProfile.musical_level ??
          1,
        level:
          existingProfile.musical_level ??
          1,
        leveledUp: false,
      });
    }

    const {
      data: profile,
      error: profileReadError,
    } = await adminClient
      .from("profiles")
      .select(`
        total_xp,
        musical_level
      `)
      .eq("id", user.id)
      .single();

    if (profileReadError) {
      throw profileReadError;
    }

    const previousXP = Number(
      profile.total_xp ?? 0,
    );

    const previousLevel = Number(
      profile.musical_level ?? 1,
    );

    const nextXP =
      previousXP + reward.amount;

    const nextLevel =
      getLevelFromXP(nextXP);

    const {
      error: historyInsertError,
    } = await adminClient
      .from("xp_history")
      .insert({
        user_id: user.id,
        amount: reward.amount,
        reason: reward.reason,
        source_type: rewardType,
        source_id: sourceId,
        metadata,
      });

    if (historyInsertError) {
      /*
       * Evita recompensas duplicadas aunque
       * lleguen dos peticiones simultáneas.
       */
      if (
        historyInsertError.code ===
        "23505"
      ) {
        return jsonResponse({
          awarded: false,
          alreadyAwarded: true,
          amount: 0,
          totalXP: previousXP,
          previousLevel,
          level: previousLevel,
          leveledUp: false,
        });
      }

      throw historyInsertError;
    }

    const {
      error: profileUpdateError,
    } = await adminClient
      .from("profiles")
      .update({
        total_xp: nextXP,
        musical_level: nextLevel,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      /*
       * Si falla la actualización del perfil,
       * retiramos el registro de XP para que
       * pueda volver a intentarse.
       */
      await adminClient
        .from("xp_history")
        .delete()
        .eq("user_id", user.id)
        .eq("source_type", rewardType)
        .eq("source_id", sourceId);

      throw profileUpdateError;
    }

    return jsonResponse({
      awarded: true,
      alreadyAwarded: false,
      amount: reward.amount,
      reason: reward.reason,
      totalXP: nextXP,
      previousLevel,
      level: nextLevel,
      leveledUp:
        nextLevel > previousLevel,
    });
  } catch (error) {
    console.error(
      "award-xp error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "No hemos podido conceder la experiencia.",
      },
      500,
    );
  }
});