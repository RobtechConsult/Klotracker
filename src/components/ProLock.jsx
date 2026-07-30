import React from 'react'

// Platzhalter-Karte für ein gesperrtes Pro-Feature (nach Ablauf der Testphase).
export default function ProLock({ emoji = '🔒', title, desc, onUnlock }) {
  return (
    <div className="card prolock" onClick={onUnlock} role="button" tabIndex={0}>
      <span className="pl-badge">PRO</span>
      <div className="pl-emoji" aria-hidden="true">{emoji}</div>
      <h2 className="pl-title">{title}</h2>
      <p className="muted pl-desc">{desc}</p>
      <button className="btn primary" onClick={onUnlock}>🔓 Klotracker Pro freischalten</button>
    </div>
  )
}
