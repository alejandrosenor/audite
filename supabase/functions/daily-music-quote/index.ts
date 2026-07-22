import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import {
    createClient,
} from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",

    "Access-Control-Allow-Methods":
        "POST, OPTIONS",
};

type QuoteAction =
    | "get"
    | "answer";

function jsonResponse(
    body: unknown,
    status = 200,
) {
    return new Response(
        JSON.stringify(body),
        {
            status,

            headers: {
                ...corsHeaders,

                "Content-Type":
                    "application/json",
            },
        },
    );
}

function getMadridDate() {
    const formatter =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Europe/Madrid",

                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            },
        );

    return formatter.format(
        new Date(),
    );
}

function shuffle<T>(
    values: T[],
) {
    const result =
        [...values];

    for (
        let index =
            result.length - 1;

        index > 0;

        index -= 1
    ) {
        const randomIndex =
            Math.floor(
                Math.random() *
                (index + 1),
            );

        [
            result[index],
            result[randomIndex],
        ] = [
            result[randomIndex],
            result[index],
        ];
    }

    return result;
}

Deno.serve(
    async (request) => {
        if (
            request.method ===
            "OPTIONS"
        ) {
            return new Response(
                "ok",
                {
                    headers:
                        corsHeaders,
                },
            );
        }

        if (
            request.method !==
            "POST"
        ) {
            return jsonResponse(
                {
                    error:
                        "Método no permitido.",
                },
                405,
            );
        }

        try {
            const authorization =
                request.headers.get(
                    "Authorization",
                );

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
                Deno.env.get(
                    "SUPABASE_URL",
                );

            const anonKey =
                Deno.env.get(
                    "SUPABASE_ANON_KEY",
                );

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

            const userClient =
                createClient(
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

            const adminClient =
                createClient(
                    supabaseUrl,
                    serviceRoleKey,
                );

            const {
                data: {
                    user,
                },

                error:
                    userError,
            } =
                await userClient
                    .auth
                    .getUser();

            if (
                userError ||
                !user
            ) {
                return jsonResponse(
                    {
                        error:
                            "La sesión no es válida.",
                    },
                    401,
                );
            }

            const body =
                await request
                    .json()
                    .catch(
                        () => ({}),
                    );

            const action:
                QuoteAction =
                body?.action ===
                    "answer"
                    ? "answer"
                    : "get";

            const today =
                getMadridDate();

            const {
                data: scheduledQuestion,
                error:
                    scheduledError,
            } =
                await adminClient
                    .from(
                        "daily_music_quotes",
                    )
                    .select("*")
                    .eq(
                        "scheduled_date",
                        today,
                    )
                    .eq(
                        "is_active",
                        true,
                    )
                    .maybeSingle();

            if (scheduledError) {
                throw scheduledError;
            }

            let question =
                scheduledQuestion;

            /*
             * Si no hemos programado una pregunta
             * específicamente para hoy, elegimos
             * una del catálogo de forma estable.
             */
            if (!question) {
                const {
                    data: availableQuestions,
                    error:
                        availableError,
                } =
                    await adminClient
                        .from(
                            "daily_music_quotes",
                        )
                        .select("*")
                        .eq(
                            "is_active",
                            true,
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    true,
                            },
                        );

                if (availableError) {
                    throw availableError;
                }

                if (
                    !availableQuestions
                        ?.length
                ) {
                    return jsonResponse(
                        {
                            question:
                                null,

                            answer:
                                null,

                            message:
                                "Todavía no hay citas musicales disponibles.",
                        },
                    );
                }

                const dateNumber =
                    Number(
                        today.replaceAll(
                            "-",
                            "",
                        ),
                    );

                const questionIndex =
                    dateNumber %
                    availableQuestions
                        .length;

                question =
                    availableQuestions[
                        questionIndex
                    ];
            }

            const {
                data:
                    existingAnswer,

                error:
                    existingAnswerError,
            } =
                await adminClient
                    .from(
                        "daily_music_quote_answers",
                    )
                    .select("*")
                    .eq(
                        "question_id",
                        question.id,
                    )
                    .eq(
                        "user_id",
                        user.id,
                    )
                    .maybeSingle();

            if (
                existingAnswerError
            ) {
                throw existingAnswerError;
            }

            if (
                action === "get"
            ) {
                return jsonResponse({
                    question: {
                        id:
                            question.id,

                        quoteText:
                            question.quote_text,

                        /*
                         * Mezclamos el orden de las
                         * respuestas sin enviar la correcta.
                         */
                        options:
                            shuffle(
                                question.options,
                            ),
                    },

                    answer:
                        existingAnswer
                            ? {
                                selectedPerson:
                                    existingAnswer
                                        .selected_person,

                                isCorrect:
                                    existingAnswer
                                        .is_correct,

                                correctPerson:
                                    question
                                        .correct_person,

                                explanation:
                                    question
                                        .explanation,

                                sourceName:
                                    question
                                        .source_name,

                                sourceUrl:
                                    question
                                        .source_url,

                                xpAwarded:
                                    existingAnswer
                                        .xp_awarded,
                            }
                            : null,
                });
            }

            if (
                existingAnswer
            ) {
                return jsonResponse({
                    question: {
                        id:
                            question.id,

                        quoteText:
                            question.quote_text,

                        options:
                            question.options,
                    },

                    answer: {
                        selectedPerson:
                            existingAnswer
                                .selected_person,

                        isCorrect:
                            existingAnswer
                                .is_correct,

                        correctPerson:
                            question
                                .correct_person,

                        explanation:
                            question
                                .explanation,

                        sourceName:
                            question
                                .source_name,

                        sourceUrl:
                            question
                                .source_url,

                        xpAwarded:
                            existingAnswer
                                .xp_awarded,
                    },

                    alreadyAnswered:
                        true,
                });
            }

            const selectedPerson =
                typeof body
                    ?.selectedPerson ===
                    "string"
                    ? body
                        .selectedPerson
                        .trim()
                    : "";

            if (
                !selectedPerson ||
                !question.options
                    .includes(
                        selectedPerson,
                    )
            ) {
                return jsonResponse(
                    {
                        error:
                            "La respuesta seleccionada no es válida.",
                    },
                    400,
                );
            }

            const isCorrect =
                selectedPerson ===
                question.correct_person;

            const xpAwarded =
                isCorrect
                    ? 10
                    : 0;

            const {
                data: storedAnswer,
                error:
                    insertError,
            } =
                await adminClient
                    .from(
                        "daily_music_quote_answers",
                    )
                    .insert({
                        question_id:
                            question.id,

                        user_id:
                            user.id,

                        selected_person:
                            selectedPerson,

                        is_correct:
                            isCorrect,

                        xp_awarded:
                            xpAwarded,
                    })
                    .select()
                    .single();

            if (insertError) {
                throw insertError;
            }

            return jsonResponse({
                question: {
                    id:
                        question.id,

                    quoteText:
                        question.quote_text,

                    options:
                        question.options,
                },

                answer: {
                    selectedPerson:
                        storedAnswer
                            .selected_person,

                    isCorrect,

                    correctPerson:
                        question
                            .correct_person,

                    explanation:
                        question
                            .explanation,

                    sourceName:
                        question
                            .source_name,

                    sourceUrl:
                        question
                            .source_url,

                    xpAwarded,
                },

                alreadyAnswered:
                    false,
            });
        } catch (error) {
            console.error(
                "daily-music-quote:",
                error,
            );

            return jsonResponse(
                {
                    error:
                        error instanceof
                            Error
                            ? error.message
                            : "No hemos podido cargar la cita del día.",
                },
                500,
            );
        }
    },
);