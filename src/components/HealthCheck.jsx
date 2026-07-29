import React from 'react'
import { healthCheck } from '../lib/tips.js'

const LEVEL_LABEL = { good: 'Alles gut', watch: 'Beobachten', alert: 'Aufpassen', empty: '—' }

export default function HealthCheck({ entries, now }) {
  const result = healthCheck(entries, now)

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div className="eyebrow" style={{ flex: 1 }}>Regelmäßigkeits-Check</div>
        {result.level !== 'empty' && <span className={`badge ${result.level}`}>{LEVEL_LABEL[result.level]}</span>}
      </div>
      <h2 style={{ marginTop: 2 }}>Was sagen deine Muster? 🩺</h2>

      {result.findings.length === 0 ? (
        <div className="muted">Noch zu wenig Daten für eine Einschätzung. Tracke ein paar Tage, dann wird's aufschlussreich.</div>
      ) : (
        result.findings.map((f, i) => (
          <div className="finding" key={i}>
            <div className="fi">{f.icon}</div>
            <div>
              <div className="ft">{f.title}</div>
              <div className="fx">{f.text}</div>
            </div>
          </div>
        ))
      )}
      <div className="disclaimer" style={{ marginTop: 12 }}>
        ⚕️ Klotracker ist kein Arztersatz. Bei anhaltenden Beschwerden, Blut im Stuhl oder starken Schmerzen bitte ärztlich abklären lassen.
      </div>
    </div>
  )
}
