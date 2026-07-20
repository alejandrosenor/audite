import { supabase } from "./supabase";

const FORMAT = "audite-backup";
const VERSION = 1;

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function csvValue(value) {
    if (value == null) return "";
    const text = Array.isArray(value)
        ? value.join(" | ")
        : typeof value === "object"
            ? JSON.stringify(value)
            : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function toCSV(columns, rows) {
    return [
        columns.map((column) => csvValue(column.label)).join(","),
        ...rows.map((row) =>
            columns.map((column) => csvValue(column.get(row))).join(","),
        ),
    ].join("\n");
}

export async function getAuditeBackup() {
    const { data, error } = await supabase.rpc("get_my_audite_backup");
    if (error) throw error;

    if (data?.format !== FORMAT || Number(data?.version) !== VERSION) {
        throw new Error("Formato de copia desconocido.");
    }

    return data;
}

export function downloadAuditeBackup(backup) {
    const date = new Date(backup.exportedAt ?? Date.now())
        .toISOString()
        .slice(0, 10);

    downloadBlob(
        new Blob([JSON.stringify(backup, null, 2)], {
            type: "application/json;charset=utf-8",
        }),
        `audite-backup-${date}.json`,
    );
}

export function exportLibraryCSV(backup) {
    const rows = backup?.data?.userAlbums ?? [];
    const csv = toCSV(
        [
            { label: "Título", get: (row) => row.album?.title },
            { label: "Artista", get: (row) => row.album?.artist_name },
            { label: "Año", get: (row) => row.album?.release_year },
            { label: "Géneros", get: (row) => row.album?.genres },
            { label: "Estado", get: (row) => row.status },
            { label: "Origen", get: (row) => row.source },
            { label: "Añadido", get: (row) => row.createdAt },
            { label: "Terminado", get: (row) => row.completedAt },
            { label: "Spotify", get: (row) => row.album?.spotify_url },
        ],
        rows,
    );

    downloadBlob(
        new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
        "audite-biblioteca.csv",
    );
}

export function exportReviewsCSV(backup) {
    const albums = new Map(
        (backup?.data?.userAlbums ?? []).map((row) => [row.albumId, row.album]),
    );
    const rows = backup?.data?.reviews ?? [];
    const csv = toCSV(
        [
            { label: "Título", get: (row) => albums.get(row.album_id)?.title },
            { label: "Artista", get: (row) => albums.get(row.album_id)?.artist_name },
            { label: "Nota", get: (row) => row.rating },
            { label: "Reacción", get: (row) => row.reaction },
            { label: "Volvería a escucharlo", get: (row) => row.would_listen_again },
            { label: "Reseña", get: (row) => row.review_text },
            { label: "Creada", get: (row) => row.created_at },
        ],
        rows,
    );

    downloadBlob(
        new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
        "audite-resenas.csv",
    );
}

export function exportFavoriteTracksCSV(backup) {
    const albums = new Map(
        (backup?.data?.userAlbums ?? []).map((row) => [row.albumId, row.album]),
    );
    const rows = backup?.data?.favoriteTracks ?? [];
    const csv = toCSV(
        [
            { label: "Disco", get: (row) => albums.get(row.albumId)?.title },
            { label: "Artista", get: (row) => albums.get(row.albumId)?.artist_name },
            { label: "Posición", get: (row) => row.position },
            { label: "Canción", get: (row) => row.track?.title },
            { label: "Pista", get: (row) => row.track?.track_number },
            { label: "Spotify", get: (row) => row.track?.spotify_url },
        ],
        rows,
    );

    downloadBlob(
        new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
        "audite-canciones-favoritas.csv",
    );
}

export async function readBackupFile(file) {
    if (!file?.name?.toLowerCase().endsWith(".json")) {
        throw new Error("Selecciona una copia JSON.");
    }

    let backup;
    try {
        backup = JSON.parse(await file.text());
    } catch {
        throw new Error("El archivo no contiene un JSON válido.");
    }

    if (backup?.format !== FORMAT || Number(backup?.version) !== VERSION) {
        throw new Error("Este archivo no es una copia compatible de Audite.");
    }

    if (!Array.isArray(backup?.data?.userAlbums) || !Array.isArray(backup?.data?.reviews)) {
        throw new Error("La copia está incompleta o dañada.");
    }

    return backup;
}
