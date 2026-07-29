import React from 'react'
import { hourHistogram } from '../lib/stats.js'

// Radiale 24-Stunden-Uhr: zeigt, zu welcher Tageszeit am meisten los ist.
// Die vorhergesagte nächste Stuhlgang-Zeit wird als Zeiger markiert.
export default function HourClock({ entries, prediction, now }) {
  const size = 240
  const c = size / 2
  const rInner = 42
  const rOuter = 104
  const stool = hourHistogram(entries, 'stool')
  const urine = hourHistogram(entries, 'urine')
  const max = Math.max(1, ...stool.map((v, i) => v + urine[i]))

  const polar = (hour, r) => {
    // 0 Uhr oben, im Uhrzeigersinn.
    const a = (hour / 24) * Math.PI * 2 - Math.PI / 2
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }

  const wedge = (hour, count, base) => {
    const r = rInner + ((rOuter - rInner) * (base + count)) / max
    const rBase = rInner + ((rOuter - rInner) * base) / max
    const a0 = (hour / 24) * Math.PI * 2 - Math.PI / 2
    const a1 = ((hour + 1) / 24) * Math.PI * 2 - Math.PI / 2
    const pad = 0.02
    const [x0, y0] = [c + rBase * Math.cos(a0 + pad), c + rBase * Math.sin(a0 + pad)]
    const [x1, y1] = [c + r * Math.cos(a0 + pad), c + r * Math.sin(a0 + pad)]
    const [x2, y2] = [c + r * Math.cos(a1 - pad), c + r * Math.sin(a1 - pad)]
    const [x3, y3] = [c + rBase * Math.cos(a1 - pad), c + rBase * Math.sin(a1 - pad)]
    return `M${x0} ${y0} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${rBase} ${rBase} 0 0 0 ${x0} ${y0} Z`
  }

  const nowHour = new Date(now).getHours() + new Date(now).getMinutes() / 60
  const [nx, ny] = polar(nowHour, rOuter + 8)

  let predHand = null
  if (prediction?.status === 'ok') {
    const ph = prediction.minutes / 60
    const [px, py] = polar(ph, rOuter + 2)
    predHand = { px, py, ph }
  }

  return (
    <div className="card">
      <div className="eyebrow">Dein Tagesrhythmus</div>
      <h2 style={{ marginTop: 4 }}>Wann ist bei dir was los? 🕐</h2>
      <div className="clock-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Ziffernblatt */}
          <circle cx={c} cy={c} r={rOuter + 6} fill="none" stroke="var(--line)" strokeWidth="1" />
          {[0, 6, 12, 18].map((h) => {
            const [lx, ly] = polar(h, rOuter + 20)
            return (
              <text key={h} x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fill="var(--ink-soft)" fontWeight="700">
                {h === 0 ? '0' : h}
              </text>
            )
          })}
          {/* Wedges */}
          {urine.map((v, h) => (v > 0 ? <path key={'u' + h} d={wedge(h, v, 0)} fill="var(--gold)" opacity="0.9" /> : null))}
          {stool.map((v, h) => (v > 0 ? <path key={'s' + h} d={wedge(h, v, urine[h])} fill="var(--brown-2)" /> : null))}
          {/* Nabe */}
          <circle cx={c} cy={c} r={rInner - 4} fill="var(--bg)" stroke="var(--line)" />
          {/* Jetzt-Marker */}
          <circle cx={nx} cy={ny} r="4" fill="var(--blue)" />
          {/* Vorhersage-Zeiger */}
          {predHand && (
            <>
              <line x1={c} y1={c} x2={predHand.px} y2={predHand.py} stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
              <circle cx={predHand.px} cy={predHand.py} r="5" fill="var(--red)" />
            </>
          )}
          <text x={c} y={c - 2} textAnchor="middle" fontSize="18">🚽</text>
          <text x={c} y={c + 14} textAnchor="middle" fontSize="8" fill="var(--ink-soft)">24h</text>
        </svg>
      </div>
      <div className="legend" style={{ justifyContent: 'center' }}>
        <span><i className="dot stool" /> Stuhlgang</span>
        <span><i className="dot urine" /> Wasserlassen</span>
        {predHand && <span><i className="dot" style={{ background: 'var(--red)' }} /> Prognose</span>}
        <span><i className="dot" style={{ background: 'var(--blue)' }} /> Jetzt</span>
      </div>
    </div>
  )
}
