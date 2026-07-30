import React, { useState } from 'react'

// Freundlicher 3-Schritt-Einstieg beim ersten Öffnen. Erklärt kurz Was/Warum
// und den Datenschutz – und bietet am Ende an, mit Beispieldaten zu starten.
const SLIDES = [
  {
    emoji: '🚽',
    title: 'Willkommen bei Klotracker',
    text: 'Tracke deine Toilettengänge – Stuhlgang & Wasserlassen – mit einem Tipp. Mit Augenzwinkern, aber ernst, wo es zählt.'
  },
  {
    emoji: '🔮',
    title: 'Mehr als nur zählen',
    text: 'Gewohnheits-Prognose (wann geht’s wohl wieder los?), Gesundheits-Check, Timer für die Thron-Zeit, Trinken, Symptome und Erfolge.'
  },
  {
    emoji: '🔒',
    title: 'Zu 100 % privat',
    text: 'Alle Daten bleiben nur auf deinem Gerät. Kein Server, kein Login, kein Mitlesen. Versprochen. 🤞'
  }
]

export default function Onboarding({ onDone, onLoadDemo }) {
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1
  const s = SLIDES[i]

  return (
    <div className="onb-back">
      <div className="onb">
        <button className="onb-skip" onClick={onDone}>Überspringen</button>
        <div className="onb-emoji" aria-hidden="true">{s.emoji}</div>
        <h2 className="onb-title">{s.title}</h2>
        <p className="onb-text">{s.text}</p>

        <div className="onb-dots" aria-hidden="true">
          {SLIDES.map((_, k) => (
            <span key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>

        {last ? (
          <div className="onb-actions">
            <button className="btn ghost" onClick={onLoadDemo}>Mit Beispieldaten starten</button>
            <button className="btn primary" onClick={onDone}>Los geht’s 🚀</button>
          </div>
        ) : (
          <div className="onb-actions">
            <button className="btn primary" onClick={() => setI(i + 1)}>Weiter</button>
          </div>
        )}
      </div>
    </div>
  )
}
