import React from 'react'
import { DRINKS } from '../lib/tips.js'
import { drinkTotalToday, fmtMl } from '../lib/stats.js'

// Trink-Tracking: ein Tipp genügt. Zeigt den Tagesfortschritt zum Ziel und
// bietet Schnell-Buttons für die üblichen Getränke.
export default function DrinkTracker({ entries, now, goalMl = 2000, onAdd }) {
  const today = drinkTotalToday(entries, now)
  const pct = Math.min(100, Math.round((today / goalMl) * 100))
  const reached = today >= goalMl

  return (
    <div className="card drink-card">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div className="eyebrow" style={{ flex: 1 }}>Trinken heute 💧</div>
        <div className="drink-amount">{fmtMl(today)}<span className="muted"> / {fmtMl(goalMl)}</span></div>
      </div>

      <div className="drink-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${pct}%` }} className={reached ? 'full' : ''} />
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
        {reached ? 'Tagesziel geschafft – deine Nieren jubeln! 🎉' : `Noch ${fmtMl(goalMl - today)} bis zum Ziel.`}
      </div>

      <div className="drink-grid">
        {DRINKS.map((d) => (
          <button
            key={d.key}
            className="drink-btn"
            onClick={() => onAdd({ type: 'drink', ts: new Date().toISOString(), drink: d.key, amount: d.ml })}
            aria-label={`${d.label} ${d.ml} Milliliter hinzufügen`}
          >
            <span className="drink-emoji" aria-hidden="true">{d.emoji}</span>
            <span className="drink-label">{d.label}</span>
            <span className="drink-ml">{d.ml} ml</span>
          </button>
        ))}
      </div>
    </div>
  )
}
