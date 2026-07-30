import React from 'react'
import { PRO_FEATURES, TRIAL_DAYS } from '../lib/pro.js'

// Pro-Info & Freischaltung. Der echte Kauf kommt später über native
// In-App-Käufe; hier wird zum Testen lokal freigeschaltet.
export default function ProDialog({ status, onUnlock, onClose, onResetTrial }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Klotracker Pro 🧻✨</h3>
        <p className="msub">
          {status.mode === 'unlocked'
            ? 'Du bist Supporter – danke! 💛 Alle Pro-Features sind freigeschaltet.'
            : status.mode === 'trial'
              ? `Testphase läuft: noch ${status.daysLeft} ${status.daysLeft === 1 ? 'Tag' : 'Tage'} voller Zugriff.`
              : `Deine ${TRIAL_DAYS}-Tage-Testphase ist vorbei. Werde Supporter und behalte alles.`}
        </p>

        <div className="pro-feats">
          {PRO_FEATURES.map((f) => (
            <div className="pro-feat" key={f.title}>
              <span className="pf-em" aria-hidden="true">{f.emoji}</span>
              <div>
                <div className="pf-title">{f.title}</div>
                <div className="pf-desc">{f.desc}</div>
              </div>
            </div>
          ))}
          <div className="pro-feat muted-feat">
            <span className="pf-em" aria-hidden="true">🚫</span>
            <div><div className="pf-title">Werbefrei – für immer</div><div className="pf-desc">Kein Tracking, keine Banner. Versprochen.</div></div>
          </div>
        </div>

        {status.mode !== 'unlocked' && (
          <>
            <div className="row" style={{ marginBottom: 8 }}>
              <button className="btn primary" onClick={onUnlock}>🧻 Supporter werden – freischalten</button>
            </div>
            <p className="disclaimer" style={{ marginTop: 0 }}>
              Im App Store per einmaligem Kauf. Hier zum Testen sofort freischaltbar.
            </p>
          </>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={onClose}>Schließen</button>
          {onResetTrial && (
            <button className="btn ghost" onClick={onResetTrial}>Testphase neu (Test)</button>
          )}
        </div>
      </div>
    </div>
  )
}
