import React from 'react'
import { toiletTimeStats, fmtDuration, fmtDurationShort } from '../lib/stats.js'

// Lustige Umrechnungen der "Thron-Zeit" – wie viel Alltag passt da rein?
function funnyComparison(totalSec) {
  const min = totalSec / 60
  const items = [
    { each: 3.5, label: 'Lieblingssongs 🎵', verb: 'durchgehört' },
    { each: 22, label: 'Sitcom-Folgen 📺', verb: 'geschaut' },
    { each: 1.5, label: 'mal Zähneputzen 🪥', verb: 'geschafft' },
    { each: 90, label: 'Fußballspiele ⚽', verb: 'verfolgt' }
  ]
  // Wähle die Einheit, die eine schöne Zahl (>= 1) ergibt.
  const best = items.find((i) => min / i.each >= 1) || items[0]
  const n = min / best.each
  const val = n >= 10 ? Math.round(n) : n.toFixed(1).replace('.', ',')
  return `Das sind ~${val} ${best.label} – theoretisch nebenbei ${best.verb}.`
}

export default function ThroneTime({ entries, now }) {
  const week = toiletTimeStats(entries, 7, now)
  const today = toiletTimeStats(entries, 1, now)

  return (
    <div className="card throne">
      <div className="eyebrow">Zeit auf dem Thron 👑</div>
      <h2 style={{ marginTop: 4 }}>Wie lange sitzt du? ⏱️</h2>

      {week.count === 0 ? (
        <div className="muted">
          Noch keine gestoppte Sitzung diese Woche. Starte den Timer auf der Startseite –
          dann messen wir, wie königlich du residierst. 👑🧻
        </div>
      ) : (
        <>
          <div className="throne-hero">
            <div className="throne-big">{fmtDuration(week.totalSec)}</div>
            <div className="muted">diese Woche insgesamt · {week.count} {week.count === 1 ? 'Sitzung' : 'Sitzungen'}</div>
          </div>

          <div className="tiles" style={{ marginTop: 12 }}>
            <div className="tile"><div className="num">{fmtDurationShort(today.totalSec)}</div><div className="lbl">heute</div></div>
            <div className="tile"><div className="num">{fmtDuration(week.avgSec)}</div><div className="lbl">Ø pro Sitzung</div></div>
            <div className="tile"><div className="num">{fmtDuration(week.longestSec)}</div><div className="lbl">🏆 Rekord</div></div>
          </div>

          <p className="quip" style={{ marginTop: 12 }}>{funnyComparison(week.totalSec)}</p>
        </>
      )}
    </div>
  )
}
