import React, { useEffect, useState } from 'react'
import { buildSummary, encodeSummary, decodeSummary, compare, shareUrl } from '../lib/social.js'

// Serverloser Freundes-Vergleich per teilbarem Code/Link.
export default function FriendCompare({ entries, settings, now, incoming, onIncomingHandled, onToast }) {
  const [myCode, setMyCode] = useState('')
  const [friendInput, setFriendInput] = useState('')
  const [result, setResult] = useState(null) // { mine, friend, cmp }
  const [error, setError] = useState('')

  const runCompare = (code) => {
    try {
      const friend = decodeSummary(code)
      const mine = buildSummary(entries, settings, now)
      setResult({ mine, friend, cmp: compare(mine, friend) })
      setError('')
    } catch {
      setError('Hm, dieser Code sieht nicht gültig aus. 🤔')
    }
  }

  // Über Link (#vergleich=…) hereinkommender Code
  useEffect(() => {
    if (incoming) {
      runCompare(incoming)
      onIncomingHandled && onIncomingHandled()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming])

  const shareMine = async () => {
    const code = encodeSummary(buildSummary(entries, settings, now))
    setMyCode(code)
    const url = shareUrl(code)
    const text = 'Vergleich mal deine Klo-Woche mit meiner 🚽 (Klotracker):'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Klotracker-Vergleich', text, url })
        return
      }
    } catch {
      /* Nutzer hat abgebrochen – dann zeigen wir den Code unten an. */
    }
    try {
      await navigator.clipboard.writeText(url)
      onToast && onToast('Link kopiert – teile ihn mit Freunden 📋')
    } catch {
      onToast && onToast('Code erzeugt – unten kopierbar 👇')
    }
  }

  return (
    <div className="card">
      <div className="eyebrow">Mit Freunden vergleichen 👯</div>
      <h2 style={{ marginTop: 4 }}>Wer ist Klo-Champion? 🏆</h2>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        Teile deine Wochen-Bilanz (nur Durchschnittswerte, keine Details) und vergleiche dich mit Freunden – komplett privat, ohne Server.
      </p>

      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn primary" onClick={shareMine}>📤 Meinen Wochen-Code teilen</button>
      </div>

      {myCode && (
        <div className="code-box" onClick={() => { navigator.clipboard?.writeText(shareUrl(myCode)); onToast && onToast('Link kopiert 📋') }} title="Zum Kopieren tippen">
          {myCode}
        </div>
      )}

      <div className="friend-in">
        <input
          className="field"
          style={{ margin: 0 }}
          placeholder="Freund-Code oder Link einfügen…"
          value={friendInput}
          onChange={(e) => setFriendInput(e.target.value)}
        />
        <button className="btn ghost" disabled={!friendInput.trim()} onClick={() => runCompare(friendInput)}>Vergleichen</button>
      </div>
      {error && <div className="muted" style={{ color: 'var(--red-ink)', marginTop: 8, fontSize: 13 }}>{error}</div>}

      {result && (
        <div className="modal-back" onClick={() => setResult(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🏆 Klo-Duell</h3>
            <div className="vs-head">
              <span>{result.mine.n || 'Du'}</span>
              <span className="vs">vs</span>
              <span>{result.friend.n || 'Freund'}</span>
            </div>
            <div className="vs-list">
              {result.cmp.rows.map((r, i) => (
                <div className="vs-row" key={i}>
                  <span className={`vs-val ${r.winner === 'me' ? 'win' : ''}`}>{r.mine}{r.winner === 'me' && ' 👑'}</span>
                  <span className="vs-mid"><span className="vs-em" aria-hidden="true">{r.emoji}</span>{r.label}</span>
                  <span className={`vs-val ${r.winner === 'friend' ? 'win' : ''}`}>{r.friend}{r.winner === 'friend' && ' 👑'}</span>
                </div>
              ))}
            </div>
            <p className="vs-verdict">{result.cmp.verdict}</p>
            <p className="disclaimer" style={{ marginTop: 0 }}>Nur zum Spaß – Toilette ist kein Wettbewerb. 😉 (Frequenz-Werte sind neutral, kein „Sieger".)</p>
            <div className="row">
              <button className="btn primary" onClick={() => setResult(null)}>Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
