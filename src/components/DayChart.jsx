import React from 'react'
import { countsPerDay } from '../lib/stats.js'

// Gestapeltes Balkendiagramm: Stuhlgang + Wasserlassen pro Tag.
export default function DayChart({ entries, days = 7, now }) {
  const rows = countsPerDay(entries, null, days, now)
  const max = Math.max(1, ...rows.map((r) => r.stool + r.urine))
  const weekday = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

  return (
    <div className="card">
      <div className="eyebrow">Letzte {days} Tage</div>
      <h2 style={{ marginTop: 4 }}>Wie oft pro Tag 📊</h2>
      <div className="bars">
        {rows.map((r) => {
          const total = r.stool + r.urine
          return (
            <div className="bar-col" key={r.key}>
              <div className="bar-stack" style={{ height: `${(total / max) * 100}%` }} title={`${total}x`}>
                {r.urine > 0 && <div className="bar-seg urine" style={{ height: `${(r.urine / Math.max(total, 1)) * 100}%` }} />}
                {r.stool > 0 && <div className="bar-seg stool" style={{ height: `${(r.stool / Math.max(total, 1)) * 100}%` }} />}
              </div>
              <div className="bar-lbl">{weekday[r.date.getDay()]}</div>
            </div>
          )
        })}
      </div>
      <div className="legend">
        <span><i className="dot stool" /> Stuhlgang</span>
        <span><i className="dot urine" /> Wasserlassen</span>
      </div>
    </div>
  )
}
