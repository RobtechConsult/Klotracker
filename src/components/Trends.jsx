import React from 'react'
import { weekTrend, mostActiveWeekday, averageIntervalHours, fmtMl, fmtDurationShort } from '../lib/stats.js'

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

// Zeigt Pfeil + Prozent im Vergleich zur Vorwoche.
function TrendRow({ label, cur, prev, deltaPct, format }) {
  const dir = deltaPct === null ? 'neu' : deltaPct > 0 ? 'up' : deltaPct < 0 ? 'down' : 'flat'
  const arrow = { up: '▲', down: '▼', flat: '▬', neu: '•' }[dir]
  return (
    <div className="trend-row">
      <div className="trend-label">{label}</div>
      <div className="trend-val">{format(cur)}</div>
      <div className={`trend-delta ${dir}`}>
        {arrow} {deltaPct === null ? '—' : `${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
      </div>
    </div>
  )
}

export default function Trends({ entries, now }) {
  const hasEnough = entries.length >= 3
  const stool = weekTrend(entries, 'stool', now)
  const drink = weekTrend(entries, 'drink', now)
  const toilet = weekTrend(entries, 'toilet', now)
  const busiest = mostActiveWeekday(entries, 'stool', 30, now)
  const interval = averageIntervalHours(entries, 'stool')

  if (!hasEnough) {
    return (
      <div className="card">
        <div className="eyebrow">Trends & Muster</div>
        <h2 style={{ marginTop: 4 }}>Diese Woche vs. letzte 📈</h2>
        <div className="muted">Noch zu wenig Daten. Nach ein paar Tagen zeige ich dir hier deine Entwicklung.</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="eyebrow">Trends & Muster</div>
      <h2 style={{ marginTop: 4 }}>Diese Woche vs. letzte 📈</h2>

      <div className="trend-list">
        <TrendRow label="💩 Stuhlgänge" cur={stool.cur} prev={stool.prev} deltaPct={stool.deltaPct} format={(v) => `${v}x`} />
        <TrendRow label="💧 Getrunken" cur={drink.cur} prev={drink.prev} deltaPct={drink.deltaPct} format={fmtMl} />
        <TrendRow label="👑 Thron-Zeit" cur={toilet.cur} prev={toilet.prev} deltaPct={toilet.deltaPct} format={fmtDurationShort} />
      </div>

      <div className="trend-facts">
        {interval != null && (
          <div className="trend-fact">
            <span className="tf-ic" aria-hidden="true">⏳</span>
            Im Schnitt alle <strong>{interval < 24 ? `${interval.toFixed(1)} Std` : `${(interval / 24).toFixed(1)} Tage`}</strong> ein Stuhlgang.
          </div>
        )}
        {busiest && (
          <div className="trend-fact">
            <span className="tf-ic" aria-hidden="true">📅</span>
            Dein „produktivster" Tag ist der <strong>{WEEKDAYS[busiest.weekday]}</strong>.
          </div>
        )}
      </div>
    </div>
  )
}
