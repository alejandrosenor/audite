import { supabase } from "./supabase";

const MONTH_NAMES = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
];

export async function getMonthlyListeningReport({
    year,
    month,
}) {
    const targetYear = Number(year);
    const targetMonth = Number(month);

    if (
        !Number.isInteger(targetYear) ||
        !Number.isInteger(targetMonth) ||
        targetMonth < 1 ||
        targetMonth > 12
    ) {
        throw new Error(
            "El mes seleccionado no es válido.",
        );
    }

    const { data, error } =
        await supabase.rpc(
            "get_monthly_listening_report",
            {
                target_year:
                    targetYear,
                target_month:
                    targetMonth,
            },
        );

    if (error) {
        throw error;
    }

    return data;
}

export function formatListeningDuration(
    milliseconds,
) {
    const totalMinutes =
        Math.floor(
            Number(milliseconds ?? 0) /
            60000,
        );

    const hours =
        Math.floor(
            totalMinutes / 60,
        );

    const minutes =
        totalMinutes % 60;

    if (!hours) {
        return `${minutes} min`;
    }

    return minutes
        ? `${hours} h ${minutes} min`
        : `${hours} h`;
}

export function formatReportRating(
    value,
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    return Number(value)
        .toFixed(1)
        .replace(".", ",");
}

function wrapCanvasText({
    context,
    text,
    x,
    y,
    maxWidth,
    lineHeight,
    maxLines = 2,
}) {
    const words =
        String(text ?? "")
            .split(/\s+/)
            .filter(Boolean);

    const lines = [];
    let current = "";

    for (const word of words) {
        const candidate =
            current
                ? `${current} ${word}`
                : word;

        if (
            context.measureText(
                candidate,
            ).width <= maxWidth
        ) {
            current =
                candidate;
            continue;
        }

        if (current) {
            lines.push(
                current,
            );
        }

        current = word;

        if (
            lines.length ===
            maxLines - 1
        ) {
            break;
        }
    }

    if (
        current &&
        lines.length < maxLines
    ) {
        lines.push(current);
    }

    lines.forEach(
        (line, index) => {
            context.fillText(
                line,
                x,
                y +
                index *
                lineHeight,
            );
        },
    );

    return (
        y +
        lines.length *
        lineHeight
    );
}

export async function createMonthlyReportImage(
    report,
) {
    if (!report) {
        throw new Error(
            "No existe ningún informe para compartir.",
        );
    }

    const canvas =
        document.createElement(
            "canvas",
        );

    canvas.width = 1080;
    canvas.height = 1350;

    const context =
        canvas.getContext("2d");

    const gradient =
        context.createLinearGradient(
            0,
            0,
            1080,
            1350,
        );

    gradient.addColorStop(
        0,
        "#09090d",
    );

    gradient.addColorStop(
        0.5,
        "#181127",
    );

    gradient.addColorStop(
        1,
        "#4d238f",
    );

    context.fillStyle =
        gradient;

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height,
    );

    const glow =
        context.createRadialGradient(
            850,
            150,
            20,
            850,
            150,
            520,
        );

    glow.addColorStop(
        0,
        "rgba(166, 105, 255, .52)",
    );

    glow.addColorStop(
        1,
        "rgba(166, 105, 255, 0)",
    );

    context.fillStyle =
        glow;

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height,
    );

    context.fillStyle =
        "#ffffff";

    context.font =
        "800 38px Arial";

    context.fillText(
        "AUDITE",
        72,
        90,
    );

    context.fillStyle =
        "#ae7aff";

    context.font =
        "800 24px Arial";

    context.fillText(
        "TU MES MUSICAL",
        72,
        162,
    );

    const monthName =
        MONTH_NAMES[
            report.period.month -
            1
        ]?.toUpperCase() ??
        "";

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 92px Arial";

    context.fillText(
        monthName,
        72,
        265,
    );

    context.font =
        "900 92px Arial";

    context.fillText(
        String(
            report.period.year,
        ),
        72,
        356,
    );

    const summary =
        report.summary ?? {};

    const cards = [
        [
            String(
                summary.completedAlbums ??
                0,
            ),
            "DISCOS TERMINADOS",
        ],
        [
            formatListeningDuration(
                summary.totalListeningMs,
            ),
            "TIEMPO ESCUCHADO",
        ],
        [
            formatReportRating(
                summary.averageRating,
            ),
            "NOTA MEDIA",
        ],
        [
            String(
                summary.favoriteTracks ??
                0,
            ),
            "CANCIONES FAVORITAS",
        ],
    ];

    cards.forEach(
        (
            [value, label],
            index,
        ) => {
            const column =
                index % 2;

            const row =
                Math.floor(
                    index / 2,
                );

            const x =
                72 +
                column * 468;

            const y =
                438 +
                row * 190;

            context.fillStyle =
                "rgba(255,255,255,.08)";

            context.beginPath();

            context.roundRect(
                x,
                y,
                430,
                155,
                28,
            );

            context.fill();

            context.fillStyle =
                "#ffffff";

            context.font =
                "900 48px Arial";

            context.fillText(
                value,
                x + 28,
                y + 66,
            );

            context.fillStyle =
                "#b998e8";

            context.font =
                "800 18px Arial";

            context.fillText(
                label,
                x + 28,
                y + 112,
            );
        },
    );

    const highlights =
        report.highlights ?? {};

    const genre =
        highlights.monthGenre
            ?.genre ??
        "Sin género dominante";

    const artist =
        highlights.mostListenedArtist
            ?.artistName ??
        "Sin artista repetido";

    const best =
        highlights.bestDiscovery;

    const disappointment =
        highlights.biggestDisappointment;

    context.fillStyle =
        "#ae7aff";

    context.font =
        "800 21px Arial";

    context.fillText(
        "GÉNERO DEL MES",
        72,
        855,
    );

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 44px Arial";

    context.fillText(
        genre,
        72,
        908,
    );

    context.fillStyle =
        "#ae7aff";

    context.font =
        "800 21px Arial";

    context.fillText(
        "ARTISTA MÁS ESCUCHADO",
        72,
        978,
    );

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 38px Arial";

    context.fillText(
        artist,
        72,
        1028,
    );

    context.fillStyle =
        "#ae7aff";

    context.font =
        "800 21px Arial";

    context.fillText(
        "MEJOR DESCUBRIMIENTO",
        72,
        1098,
    );

    context.fillStyle =
        "#ffffff";

    context.font =
        "900 34px Arial";

    let finalY =
        wrapCanvasText({
            context,
            text: best
                ? `${best.title} — ${best.artistName}`
                : "Todavía sin descubrimiento destacado",
            x: 72,
            y: 1146,
            maxWidth: 900,
            lineHeight: 40,
            maxLines: 2,
        });

    if (
        disappointment &&
        disappointment.albumId !==
        best?.albumId
    ) {
        context.fillStyle =
            "#cbb6eb";

        context.font =
            "700 20px Arial";

        context.fillText(
            `Mayor decepción: ${disappointment.title}`,
            72,
            Math.min(
                finalY + 34,
                1275,
            ),
        );
    }

    context.fillStyle =
        "rgba(255,255,255,.56)";

    context.font =
        "700 17px Arial";

    context.fillText(
        "Un disco al día · Tu historia musical",
        72,
        1310,
    );

    return new Promise(
        (resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(
                            new Error(
                                "No hemos podido crear la imagen.",
                            ),
                        );

                        return;
                    }

                    resolve(blob);
                },
                "image/png",
                0.95,
            );
        },
    );
}

export async function shareMonthlyReport(
    report,
) {
    const imageBlob =
        await createMonthlyReportImage(
            report,
        );

    const monthName =
        MONTH_NAMES[
        report.period.month -
        1
        ] ??
        "mes";

    const filename =
        `audite-${monthName}-${report.period.year}.png`;

    const file =
        new File(
            [imageBlob],
            filename,
            {
                type:
                    "image/png",
            },
        );

    if (
        navigator.share &&
        navigator.canShare?.({
            files: [file],
        })
    ) {
        await navigator.share({
            title:
                `Mi ${monthName} musical`,
            text:
                "Mi informe mensual en Audite.",
            files: [file],
        });

        return;
    }

    const url =
        URL.createObjectURL(
            imageBlob,
        );

    const anchor =
        document.createElement(
            "a",
        );

    anchor.href = url;
    anchor.download =
        filename;

    document.body.appendChild(
        anchor,
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(
        url,
    );
}
