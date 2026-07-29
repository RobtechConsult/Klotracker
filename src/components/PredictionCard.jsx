import React from 'react'
import { humanizeDelta } from '../lib/prediction.js'

// Verpackt die Vorhersage in eine hübsche, augenzwinkernde Karte.
function quip(p) {
  if (p.confidence >= 75) return 'Stell schon mal die Zeitung bereit. 📰'
  if (p.confidence >= 50) return 'Ziemlich wahrscheinlich – aber der Darm hat immer das letzte Wort.'
  return 'Reine Kaffeesatzleserei bislang – gib mir mehr Daten. ☕'
}

export default function PredictionCard({ prediction }) {
  const p = prediction

  if (p.status === 'learning') {
    return (
      <div className="card pred">
        <div className="eyebrow">Gewohnheits-Prognose</div>
        <div style={{ fontSize: 40, margin: '10px 0' }}>🔮</div>
        <div className="muted">
          Noch {p.need - p.have} Stuhlgänge, dann errechne ich deine wahrscheinlichste Klo-Zeit.
          <br />Der Kristallkugel fehlt noch etwas Futter.
        </div>
      </div>
    )
  }

  if (p.status === 'chaos') {
    return (
      <div className="card pred">
        <div className="eyebrow">Gewohnheits-Prognose</div>
        <div style={{ fontSize: 40, margin: '10px 0' }}>🎲</div>
        <div className="muted">
          Dein Darm ist ein Freigeist – noch kein klares Muster erkennbar.
          <br />Tracke weiter, dann finden wir deinen Rhythmus.
        </div>
      </div>
    )
  }

  return (
    <div className="card pred">
      <div className="eyebrow">Nächster wahrscheinlicher Stuhlgang</div>
      <div className="time">{p.time}{p.tomorrow ? ' Uhr *' : ' Uhr'}</div>
      <div className="delta">{humanizeDelta(p.inMinutes)}{p.tomorrow ? ' (morgen)' : ''} · Zeitfenster {p.windowFrom}–{p.windowTo}</div>
      <div className="conf-bar"><div style={{ width: `${p.confidence}%` }} /></div>
      <div className="window">Sicherheit: {p.confidence}%</div>
      <div className="quip">{quip(p)}</div>
    </div>
  )
}
