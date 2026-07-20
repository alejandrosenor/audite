import { useEffect, useState } from "react";
import { getAnnualChallengeCalendar } from "../services/challengeCalendar";
import "./ChallengeCalendar.css";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEK = ["L", "M", "X", "J", "V", "S", "D"];

function rating(value) {
  return value == null ? "Sin nota" : Number(value).toFixed(1).replace(".", ",");
}

function Day({ day, onOpen }) {
  return <button
    type="button"
    className={`calendar-day calendar-day--${day.status}`}
    onClick={() => onOpen(day)}
  >
    <span>{day.day}</span>
    <i />
    {day.completedCount > 1 && <b>{day.completedCount}</b>}
  </button>;
}

function Month({ month, onOpen }) {
  const blanks = Math.max(0, (month.days?.[0]?.weekday ?? 1) - 1);
  return <article className="calendar-month">
    <header>
      <div><p>MES {String(month.month).padStart(2, "0")}</p><h2>{MONTHS[month.month - 1]}</h2></div>
      <strong>{month.completedDays}<small>días</small></strong>
    </header>
    <div className="calendar-week">{WEEK.map(d => <span key={d}>{d}</span>)}</div>
    <div className="calendar-grid">
      {Array.from({ length: blanks }).map((_, i) => <span key={`b-${i}`} />)}
      {month.days.map(day => <Day key={day.date} day={day} onOpen={onOpen} />)}
    </div>
  </article>;
}

function Detail({ day, onClose }) {
  if (!day) return null;
  const albums = day.completedAlbums ?? [];
  return <div className="calendar-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="calendar-detail">
      <header>
        <div><p>TU DÍA MUSICAL</p><h2>{new Date(`${day.date}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</h2></div>
        <button type="button" onClick={onClose}>×</button>
      </header>
      <div className="calendar-detail__stats">
        <article><strong>{day.completedCount}</strong><span>terminados</span></article>
        <article><strong>{day.abandonedCount}</strong><span>abandonados</span></article>
        <article><strong>{day.xp}</strong><span>XP</span></article>
      </div>
      {albums.length ? <div className="calendar-detail__albums">
        {albums.map(album => <article key={album.userAlbumId}>
          <div>{album.coverUrl ? <img src={album.coverUrl} alt="" /> : "💿"}</div>
          <section><h3>{album.title}</h3><span>{album.artistName}</span><strong>{rating(album.rating)}</strong>{album.reviewText && <p>“{album.reviewText}”</p>}</section>
        </article>)}
      </div> : <div className="calendar-detail__empty"><strong>◯</strong><h3>Día sin disco terminado</h3><p>Este día aún no forma parte de la racha.</p></div>}
    </section>
  </div>;
}

export default function ChallengeCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(""); setSelected(null);
    getAnnualChallengeCalendar(year)
      .then(result => !cancelled && setData(result))
      .catch(err => { console.error(err); if (!cancelled) setError("No hemos podido cargar el calendario."); })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true };
  }, [year]);

  if (loading) return <section className="challenge-calendar"><h1>Construyendo tu año musical...</h1></section>;
  if (error || !data) return <section className="challenge-calendar"><h1>Calendario del reto</h1><p>{error}</p></section>;

  const leap = new Date(year, 1, 29).getMonth() === 1;
  return <section className="challenge-calendar">
    <header className="calendar-hero">
      <div><p>TU RETO ANUAL</p><h1>Un año.<br />Cientos de discos.</h1><span>Cada día completado construye tu historia musical.</span></div>
      <select value={year} onChange={e => setYear(Number(e.target.value))}>
        {[year - 2, year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}
      </select>
    </header>

    <div className="calendar-summary">
      <article className="calendar-summary__main">
        <span>DÍAS CUMPLIDOS</span><strong>{data.summary.completedDays}</strong><p>de {leap ? 366 : 365}</p>
        <div><i style={{ width: `${Math.min(100, Number(data.summary.challengeCompletion || 0))}%` }} /></div>
      </article>
      <article><span>🔥</span><strong>{data.summary.currentStreak}</strong><p>Racha actual</p></article>
      <article><span>🏆</span><strong>{data.summary.bestStreak}</strong><p>Mejor racha</p></article>
      <article><span>💿</span><strong>{data.summary.completedAlbums}</strong><p>Discos</p></article>
      <article><span>✦</span><strong>{data.summary.totalXP}</strong><p>XP del año</p></article>
    </div>

    <div className="calendar-legend"><span><i className="done" />Completado</span><span><i className="abandoned" />Abandonado</span><small>Toca un día para abrirlo</small></div>
    <div className="calendar-months">{data.months.map(month => <Month key={month.month} month={month} onOpen={setSelected} />)}</div>
    <Detail day={selected} onClose={() => setSelected(null)} />
  </section>;
}
