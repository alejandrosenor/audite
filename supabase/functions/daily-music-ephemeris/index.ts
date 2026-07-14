import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type WikimediaPage = {
  title?: string;
  description?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
  thumbnail?: {
    source?: string;
  };
  originalimage?: {
    source?: string;
  };
};

type WikimediaItem = {
  year?: number;
  text?: string;
  pages?: WikimediaPage[];
};

type Candidate = {
  year: number | null;
  title: string;
  description: string;
  image_url: string | null;
  source_url: string | null;
  source_name: string;
  event_type:
    | "event"
    | "birth"
    | "death"
    | "release"
    | "fallback";
  score: number;
};

const strongMusicTerms = [
  "músico",
  "música",
  "musical",
  "cantante",
  "compositor",
  "compositora",
  "pianista",
  "guitarrista",
  "bajista",
  "baterista",
  "violinista",
  "saxofonista",
  "rapero",
  "rapera",
  "productor musical",
  "productora musical",
  "director de orquesta",
  "directora de orquesta",
  "cantautor",
  "cantautora",
  "álbum",
  "disco",
  "canción",
  "sencillo",
  "banda",
  "grupo musical",
  "orquesta",
  "ópera",
];

const weakMusicTerms = [
  "rock",
  "pop",
  "jazz",
  "blues",
  "soul",
  "funk",
  "folk",
  "country",
  "punk",
  "metal",
  "reggae",
  "hip hop",
  "rap",
  "flamenco",
  "electrónica",
  "sinfonía",
  "concierto",
  "festival",
  "grammy",
  "eurovisión",
  "billboard",
];

const fallbacks = [
  {
    title: "El sonido también guarda memoria",
    description:
      "Hoy es un buen día para volver a un disco que llevabas años sin escuchar y comprobar cuánto has cambiado tú.",
  },
  {
    title: "Una canción puede cambiar de significado",
    description:
      "La música que conocimos en una etapa de la vida puede sentirse completamente distinta años después.",
  },
  {
    title: "Los discos también cuentan épocas",
    description:
      "La producción, los instrumentos y hasta la duración de las canciones pueden revelar cuándo fue grabado un álbum.",
  },
  {
    title: "Escuchar un álbum exige otra atención",
    description:
      "El orden de las canciones suele formar parte de la obra: no siempre es una simple colección de temas.",
  },
  {
    title: "Cada escucha deja una versión distinta",
    description:
      "Un disco puede parecerte normal hoy y convertirse en uno de tus favoritos dentro de unos meses.",
  },
];

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

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function getMadridDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getMadridMonthAndDay() {
  const parts = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Europe/Madrid",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(new Date());

  const month =
    parts.find((part) => part.type === "month")
      ?.value ?? "01";

  const day =
    parts.find((part) => part.type === "day")
      ?.value ?? "01";

  return {
    month,
    day,
  };
}

function deterministicIndex(
  date: string,
  length: number,
) {
  if (length <= 0) {
    return 0;
  }

  const number = date
    .replaceAll("-", "")
    .split("")
    .reduce(
      (total, digit) =>
        total + Number(digit),
      0,
    );

  return number % length;
}

function calculateMusicScore(item: WikimediaItem) {
  const searchableText = normalizeText(
    [
      item.text ?? "",
      ...(item.pages ?? []).flatMap((page) => [
        page.title ?? "",
        page.description ?? "",
      ]),
    ].join(" "),
  );

  let score = 0;

  strongMusicTerms.forEach((term) => {
    if (
      searchableText.includes(
        normalizeText(term),
      )
    ) {
      score += 5;
    }
  });

  weakMusicTerms.forEach((term) => {
    if (
      searchableText.includes(
        normalizeText(term),
      )
    ) {
      score += 2;
    }
  });

  return score;
}

function convertItemsToCandidates(
  items: WikimediaItem[],
  eventType: "event" | "birth" | "death",
) {
  return items
    .map((item) => {
      const page = item.pages?.[0];

      return {
        year:
          typeof item.year === "number"
            ? item.year
            : null,

        title:
          page?.title?.trim() ||
          (eventType === "birth"
            ? "Nació una figura de la música"
            : eventType === "death"
              ? "La música despidió a una figura histórica"
              : "Un momento de la historia musical"),

        description:
          item.text?.trim() ||
          page?.description?.trim() ||
          "Un acontecimiento relacionado con la historia de la música.",

        image_url:
          page?.originalimage?.source ??
          page?.thumbnail?.source ??
          null,

        source_url:
          page?.content_urls?.desktop?.page ??
          null,

        source_name: "Wikipedia",

        event_type: eventType,

        score: calculateMusicScore(item),
      } satisfies Candidate;
    })
    .filter((candidate) => candidate.score >= 4);
}

async function fetchWithRetry(
  url: string,
  maxAttempts = 3,
) {
  let finalStatus = 500;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Api-User-Agent":
          "Audite/1.0 (daily music ephemeris)",
      },
    });

    if (response.ok) {
      return response.json();
    }

    finalStatus = response.status;

    console.error(
      `Wikimedia attempt ${attempt}:`,
      response.status,
      await response.text(),
    );

    if (
      ![429, 502, 503, 504].includes(
        response.status,
      ) ||
      attempt === maxAttempts
    ) {
      break;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, attempt * 500),
    );
  }

  throw new Error(
    `Wikimedia no ha respondido correctamente (${finalStatus}).`,
  );
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
          error: "No existe una sesión válida.",
        },
        401,
      );
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Falta la configuración interna de Supabase.",
      );
    }

    /*
     * Cliente del usuario: solo para comprobar
     * que la petición pertenece a una sesión válida.
     */
    const userClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
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
          error: "La sesión no es válida.",
        },
        401,
      );
    }

    /*
     * Cliente interno: puede insertar la efeméride
     * global aunque la tabla solo permita lectura
     * a los usuarios.
     */
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const today = getMadridDate();

    const {
      data: existingEphemeris,
      error: existingError,
    } = await adminClient
      .from("daily_music_ephemerides")
      .select("*")
      .eq("event_date", today)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingEphemeris) {
      return jsonResponse({
        ephemeris: existingEphemeris,
        generated: false,
      });
    }

    const { month, day } =
      getMadridMonthAndDay();

    const wikimediaUrl =
      `https://api.wikimedia.org/feed/v1/` +
      `wikipedia/es/onthisday/all/${month}/${day}`;

    let candidates: Candidate[] = [];

    try {
      const data =
        await fetchWithRetry(wikimediaUrl);

      candidates = [
        ...convertItemsToCandidates(
          data.events ?? [],
          "event",
        ),
        ...convertItemsToCandidates(
          data.births ?? [],
          "birth",
        ),
        ...convertItemsToCandidates(
          data.deaths ?? [],
          "death",
        ),
      ].sort(
        (first, second) =>
          second.score - first.score,
      );
    } catch (wikimediaError) {
      console.error(
        "No se pudo obtener la efeméride de Wikimedia:",
        wikimediaError,
      );
    }

    let ephemerisToStore;

    if (candidates.length > 0) {
      /*
       * Elegimos entre los mejores resultados,
       * pero de forma estable para todo el día.
       */
      const bestCandidates =
        candidates.slice(0, 8);

      const selectedCandidate =
        bestCandidates[
          deterministicIndex(
            today,
            bestCandidates.length,
          )
        ];

      ephemerisToStore = {
        event_date: today,
        year: selectedCandidate.year,
        title: selectedCandidate.title,
        description:
          selectedCandidate.description,
        image_url:
          selectedCandidate.image_url,
        source_url:
          selectedCandidate.source_url,
        source_name:
          selectedCandidate.source_name,
        event_type:
          selectedCandidate.event_type,
      };
    } else {
      const fallback =
        fallbacks[
          deterministicIndex(
            today,
            fallbacks.length,
          )
        ];

      ephemerisToStore = {
        event_date: today,
        year: null,
        title: fallback.title,
        description:
          fallback.description,
        image_url: null,
        source_url: null,
        source_name: "Audite",
        event_type: "fallback",
      };
    }

    const {
      data: storedEphemeris,
      error: insertError,
    } = await adminClient
      .from("daily_music_ephemerides")
      .insert(ephemerisToStore)
      .select()
      .single();

    if (insertError) {
      /*
       * Dos usuarios pueden abrir Inicio casi al
       * mismo tiempo. Si ambos intentan crear la
       * efeméride, recuperamos la que ganó.
       */
      if (insertError.code === "23505") {
        const {
          data: concurrentEphemeris,
          error: concurrentError,
        } = await adminClient
          .from("daily_music_ephemerides")
          .select("*")
          .eq("event_date", today)
          .single();

        if (concurrentError) {
          throw concurrentError;
        }

        return jsonResponse({
          ephemeris:
            concurrentEphemeris,
          generated: false,
        });
      }

      throw insertError;
    }

    return jsonResponse({
      ephemeris: storedEphemeris,
      generated: true,
    });
  } catch (error) {
    console.error(
      "daily-music-ephemeris error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "No hemos podido preparar la efeméride musical.",
      },
      500,
    );
  }
});