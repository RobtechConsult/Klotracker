import React from 'react'
import { bristolDistribution } from '../lib/stats.js'
import { BRISTOL } from '../lib/tips.js'
import Icon from './Icon.jsx'

// Verteilung der Stuhl-Konsistenz nach der Bristol-Skala.
export default function BristolChart({ entries }) {
  const { dist, total } = bristolDistribution(entries)
  if (total === 0) return null
  const max = Math.max(...dist)

  return (
    <div className="card">
      <div className="eyebrow">Konsistenz nach Bristol-Skala</div>
      <h2 style={{ marginTop: 4 }}>Wie sieht's aus? 🔬</h2>
      <div className="bristol-list">
        {BRISTOL.map((b, i) => (
          <div className="bristol-row" key={b.n}>
            <div className="be"><Icon name={`bristol${b.n}`} size={24} title={`Typ ${b.n}`} /></div>
            <div className="bl">
              Typ {b.n}: {b.label}
              <small>{b.hint}</small>
            </div>
            <div style={{ width: 90, height: 8, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${max ? (dist[i] / max) * 100 : 0}%`, height: '100%', background: 'var(--brown-2)' }} />
            </div>
            <div className="bc" style={{ width: 22, textAlign: 'right' }}>{dist[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
