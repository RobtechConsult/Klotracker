import React, { useState } from 'react'
import { BRISTOL } from '../lib/tips.js'
import { fmtDuration } from '../lib/stats.js'

// Detail-Erfassung nach dem Schnell-Tippen. Beim Stuhlgang lässt sich optional
// die Bristol-Konsistenz und eine Notiz angeben, außerdem die Uhrzeit anpassen
// (falls man mal vergessen hat zu tracken – kennt jeder).
// Kommt der Eintrag aus dem Timer, sind Startzeit und Dauer vorbelegt.
function toLocalInput(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function AddModal({ type, onSave, onClose, initialWhen, durationSec }) {
  const [when, setWhen] = useState(toLocalInput(initialWhen ? new Date(initialWhen) : new Date()))
  const [bristol, setBristol] = useState(null)
  const [note, setNote] = useState('')
  const isStool = type === 'stool'
  const timed = durationSec > 0

  const save = () => {
    onSave({
      type,
      ts: new Date(when).toISOString(),
      bristol: isStool ? bristol || undefined : undefined,
      note: note.trim() || undefined,
      durationSec: timed ? Math.round(durationSec) : undefined
    })
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{timed ? '⏱️ Sitzung eintragen' : isStool ? '💩 Stuhlgang eintragen' : '💧 Wasserlassen eintragen'}</h3>
        <p className="msub">{isStool ? 'Details sind optional – Hauptsache, es ist notiert.' : 'Kurz getippt, schon erledigt.'}</p>

        {timed && (
          <div className="duration-badge">
            <span className="de">⏱️</span>
            <span>Gestoppte Dauer: <strong>{fmtDuration(durationSec)}</strong> Min</span>
          </div>
        )}

        <div className="time-input">
          <label>Wann?</label>
          <input className="field" style={{ margin: 0 }} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>

        {isStool && (
          <>
            <div className="muted" style={{ marginBottom: 6 }}>Konsistenz (Bristol-Skala, optional):</div>
            <div className="bristol-pick">
              {BRISTOL.map((b) => (
                <button key={b.n} className={bristol === b.n ? 'sel' : ''} onClick={() => setBristol(bristol === b.n ? null : b.n)} title={b.label}>
                  {b.emoji}
                  <span className="n">{b.n}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <input className="field" placeholder="Notiz (optional) – z.B. 'nach 3 Kaffee' ☕" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="row">
          <button className="btn ghost" onClick={onClose}>Abbrechen</button>
          <button className="btn primary" onClick={save}>Speichern</button>
        </div>
      </div>
    </div>
  )
}
