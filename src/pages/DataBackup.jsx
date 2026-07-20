import { useEffect, useRef, useState } from "react";
import {
    downloadAuditeBackup,
    exportFavoriteTracksCSV,
    exportLibraryCSV,
    exportReviewsCSV,
    getAuditeBackup,
    readBackupFile,
} from "../services/dataBackup";
import "./DataBackup.css";

function formatDate(value) {
    if (!value) return "Nunca";
    return new Date(value).toLocaleString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function DataBackup() {
    const inputRef = useRef(null);
    const [backup, setBackup] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [message, setMessage] = useState("");
    const [lastBackupAt, setLastBackupAt] = useState(
        localStorage.getItem("audite:last-backup-at"),
    );

    useEffect(() => {
        let cancelled = false;

        getAuditeBackup()
            .then((result) => {
                if (!cancelled) setBackup(result);
            })
            .catch((error) => {
                console.error(error);
                if (!cancelled) setMessage("No hemos podido preparar tus datos.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    async function refreshBackup() {
        const result = await getAuditeBackup();
        setBackup(result);
        return result;
    }

    async function handleCompleteBackup() {
        if (working) return;
        setWorking(true);
        setMessage("");

        try {
            const result = await refreshBackup();
            downloadAuditeBackup(result);

            const now = new Date().toISOString();
            localStorage.setItem("audite:last-backup-at", now);
            setLastBackupAt(now);
            setMessage("Copia completa descargada correctamente.");
        } catch (error) {
            console.error(error);
            setMessage("No hemos podido descargar la copia.");
        } finally {
            setWorking(false);
        }
    }

    async function handleCSV(exporter) {
        try {
            const result = backup ?? await refreshBackup();
            exporter(result);
        } catch (error) {
            console.error(error);
            setMessage("No hemos podido generar el CSV.");
        }
    }

    async function handleFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await readBackupFile(file);
            setPreview(result);
            setMessage("La copia es válida y compatible con Audite.");
        } catch (error) {
            console.error(error);
            setPreview(null);
            setMessage(error instanceof Error ? error.message : "No hemos podido leer la copia.");
        } finally {
            event.target.value = "";
        }
    }

    if (loading) {
        return (
            <section className="data-backup-page">
                <p className="data-backup-page__eyebrow">TUS DATOS</p>
                <h1>Preparando tu copia...</h1>
            </section>
        );
    }

    return (
        <section className="data-backup-page">
            <header className="data-backup-hero">
                <p className="data-backup-page__eyebrow">TU HISTORIA ES TUYA</p>
                <h1>Copia y exporta Audite.</h1>
                <span>
                    Guarda fuera de la aplicación tus discos, reseñas,
                    canciones favoritas, XP y afinidades.
                </span>
            </header>

            {message && <p className="data-backup-page__message">{message}</p>}

            <section className="data-backup-status">
                <article className="data-backup-status__main">
                    <span>ÚLTIMA COPIA</span>
                    <strong>{formatDate(lastBackupAt)}</strong>
                    <p>Haz una nueva copia después de cambios importantes.</p>
                </article>

                <article>
                    <span>💿</span>
                    <strong>{backup?.summary?.userAlbums ?? 0}</strong>
                    <p>Discos</p>
                </article>

                <article>
                    <span>✎</span>
                    <strong>{backup?.summary?.reviews ?? 0}</strong>
                    <p>Reseñas</p>
                </article>

                <article>
                    <span>♫</span>
                    <strong>{backup?.summary?.favoriteTracks ?? 0}</strong>
                    <p>Favoritas</p>
                </article>
            </section>

            <section className="data-backup-section">
                <header>
                    <p>COPIA COMPLETA</p>
                    <h2>Todo Audite en un solo archivo</h2>
                </header>

                <article className="data-backup-primary-card">
                    <div className="data-backup-primary-card__icon">↓</div>
                    <section>
                        <h3>Copia JSON</h3>
                        <p>
                            Perfil, biblioteca, estados, reseñas, favoritas,
                            historial de XP y géneros.
                        </p>
                        <small>Formato versionado para futuras restauraciones.</small>
                    </section>
                    <button type="button" onClick={handleCompleteBackup} disabled={working}>
                        {working ? "Preparando..." : "Descargar copia"}
                    </button>
                </article>
            </section>

            <section className="data-backup-section">
                <header>
                    <p>EXPORTACIONES</p>
                    <h2>Tus datos en formato legible</h2>
                </header>

                <div className="data-export-grid">
                    <article>
                        <span>▦</span>
                        <h3>Biblioteca</h3>
                        <p>Discos, estados, fechas, géneros y enlaces.</p>
                        <button type="button" onClick={() => handleCSV(exportLibraryCSV)}>
                            Descargar CSV
                        </button>
                    </article>

                    <article>
                        <span>★</span>
                        <h3>Reseñas</h3>
                        <p>Notas, reacciones, textos y reescuchas.</p>
                        <button type="button" onClick={() => handleCSV(exportReviewsCSV)}>
                            Descargar CSV
                        </button>
                    </article>

                    <article>
                        <span>♫</span>
                        <h3>Canciones top</h3>
                        <p>Favoritas, posiciones y enlaces de Spotify.</p>
                        <button type="button" onClick={() => handleCSV(exportFavoriteTracksCSV)}>
                            Descargar CSV
                        </button>
                    </article>
                </div>
            </section>

            <section className="data-backup-section">
                <header>
                    <p>COMPROBAR UNA COPIA</p>
                    <h2>Verifica tu archivo</h2>
                </header>

                <article className="data-backup-import-card">
                    <div>
                        <h3>Validar copia JSON</h3>
                        <p>Comprueba que el archivo conserva la estructura de Audite.</p>
                    </div>

                    <button type="button" onClick={() => inputRef.current?.click()}>
                        Seleccionar archivo
                    </button>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={handleFile}
                        hidden
                    />
                </article>

                {preview && (
                    <article className="data-backup-preview">
                        <span>COPIA VÁLIDA</span>
                        <h3>{formatDate(preview.exportedAt)}</h3>
                        <div>
                            <p><strong>{preview.summary.userAlbums}</strong> discos</p>
                            <p><strong>{preview.summary.reviews}</strong> reseñas</p>
                            <p><strong>{preview.summary.favoriteTracks}</strong> favoritas</p>
                        </div>
                    </article>
                )}

                <p className="data-backup-warning">
                    La validación no modifica tu cuenta. La restauración automática
                    se implementará como una operación transaccional separada para
                    evitar duplicados o datos incompletos.
                </p>
            </section>
        </section>
    );
}
