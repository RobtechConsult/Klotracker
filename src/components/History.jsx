import React from 'react'
import { BRISTOL } from '../lib/tips.js'
import { dayKey } from '../lib/stats.js'

const fmt = (ts) => {
  const d = new Date(ts)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function relDay(key, now) {
  const today = dayKey(now)
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  if (key === today) return 'Heute'
  if (key === dayKey(y)) return 'Gestern'
  const d = new Date(key)
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export default function History({ entries, onDelete, now }) {
  if (entries.length === 0) {
    return (
      <div className="empty">
        <span className="big">🧻</span>
        Noch nichts getrackt. Der erste Gang ist der schwerste – tippe oben einen Button.
      </div>
    )
  }

  // Nach Tagen gruppieren.
  const groups = []
  let cur = null
  for (const e of entries) {
    const k = dayKey(e.ts)
    if (!cur || cur.key !== k) {
      cur = { key: k, items: [] }
      groups.push(cur)
    }
    cur.items.push(e)
  }

  return (
    <div>
      {groups.map((g) => (
        <div key={g.key}>
          <div className="section-title">{relDay(g.key, now)} · {g.items.length}x</div>
          <div className="card" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {g.items.map((e) => {
              const b = e.bristol ? BRISTOL[e.bristol - 1] : null
              return (
                <div className="hist-item" key={e.id}>
                  <div className="he">{e.type === 'stool' ? '💩' : '💧'}</div>
                  <div className="ht">
                    <div className="h1">{e.type === 'stool' ? 'Stuhlgang' : 'Wasserlassen'}{b ? ` · ${b.emoji} Typ ${b.n}` : ''}</div>
                    <div className="h2">{fmt(e.ts)} Uhr{e.note ? ` · ${e.note}` : ''}</div>
                  </div>
                  <button className="del" onClick={() => onDelete(e.id)} title="Löschen" aria-label="Löschen">🗑️</button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
