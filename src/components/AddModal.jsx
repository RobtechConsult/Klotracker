import React, { useState } from 'react'
import { BRISTOL, SYMPTOMS } from '../lib/tips.js'
import { fmtDuration } from '../lib/stats.js'
import Icon from './Icon.jsx'

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
  const [symptoms, setSymptoms] = useState([])
  const isStool = type === 'stool'
  const timed = durationSec > 0
  const hasSerious = symptoms.some((k) => SYMPTOMS.find((s) => s.key === k)?.serious)

  const toggleSymptom = (key) =>
    setSymptoms((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const save = () => {
    onSave({
      type,
      ts: new Date(when).toISOString(),
      bristol: isStool ? bristol || undefined : undefined,
      note: note.trim() || undefined,
      durationSec: timed ? Math.round(durationSec) : undefined,
      symptoms: symptoms.length ? symptoms : undefined
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
            <div className="muted" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span>Konsistenz (optional):</span>
              <span className="bristol-legend">
                <span><i style={{ background: 'var(--amber)' }} />fest</span>
                <span><i style={{ background: 'var(--green)' }} />ideal</span>
                <span><i style={{ background: 'var(--blue)' }} />flüssig</span>
              </span>
            </div>
            <div className="bristol-pick">
              {BRISTOL.map((b) => (
                <button
                  key={b.n}
                  className={bristol === b.n ? 'sel' : ''}
                  data-zone={b.zone}
                  onClick={() => setBristol(bristol === b.n ? null : b.n)}
                  title={`${b.label} – ${b.hint}`}
                  aria-label={`Typ ${b.n}: ${b.label}`}
                >
                  <Icon name={`bristol${b.n}`} size={30} />
                  <span className="bp-short">{b.short}</span>
                  <span className="bp-n">Typ {b.n}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="muted" style={{ marginBottom: 6 }}>Symptome (optional):</div>
        <div className="symptom-pick">
          {SYMPTOMS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={symptoms.includes(s.key) ? 'sel' : ''}
              data-serious={s.serious ? 'true' : undefined}
              onClick={() => toggleSymptom(s.key)}
              aria-pressed={symptoms.includes(s.key)}
            >
              <span aria-hidden="true">{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
        {hasSerious && (
          <div className="serious-note">
            ⚕️ Blut oder anhaltende Schmerzen bitte ärztlich abklären lassen – das ist kein Grund zur Panik, aber ein Grund zum Nachschauen.
          </div>
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
