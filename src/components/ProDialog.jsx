import React from 'react'
import { PRO_FEATURES, TRIAL_DAYS, SUPPORTER_TIERS, TIP_TIERS } from '../lib/pro.js'

// Pro-Info, Kauf-Optionen (mehrere Stufen inkl. Trinkgeld) und – nach dem Kauf –
// ein dauerhafter Trinkgeld-Bereich. Der echte Kauf kommt später über native
// In-App-Käufe; hier wird zum Testen lokal freigeschaltet.
export default function ProDialog({ status, tipCount = 0, onBuy, onTip, onClose, onResetTrial }) {
  const unlocked = status.mode === 'unlocked'

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Klotracker Pro 🧻✨</h3>
        <p className="msub">
          {unlocked
            ? `Du bist Supporter – danke! 💛${tipCount ? ` Schon ${tipCount}× Klopapier spendiert. 🧻` : ''}`
            : status.mode === 'trial'
              ? `Testphase läuft: noch ${status.daysLeft} ${status.daysLeft === 1 ? 'Tag' : 'Tage'} voller Zugriff.`
              : `Deine ${TRIAL_DAYS}-Tage-Testphase ist vorbei. Werde Supporter und behalte alles.`}
        </p>

        <div className="pro-feats">
          {PRO_FEATURES.map((f) => (
            <div className="pro-feat" key={f.title}>
              <span className="pf-em" aria-hidden="true">{unlocked ? '✅' : f.emoji}</span>
              <div>
                <div className="pf-title">{f.title}</div>
                <div className="pf-desc">{f.desc}</div>
              </div>
            </div>
          ))}
          <div className="pro-feat">
            <span className="pf-em" aria-hidden="true">{unlocked ? '✅' : '🚫'}</span>
            <div><div className="pf-title">Werbefrei – für immer</div><div className="pf-desc">Kein Tracking, keine Banner. Versprochen.</div></div>
          </div>
        </div>

        {!unlocked ? (
          <>
            <div className="set-title">Pro freischalten &amp; unterstützen</div>
            <div className="tier-list">
              {SUPPORTER_TIERS.map((t) => (
                <button key={t.key} className={`tier ${t.popular ? 'popular' : ''}`} onClick={() => onBuy(t)}>
                  {t.popular && <span className="tier-pop">beliebt</span>}
                  <span className="tier-em" aria-hidden="true">{t.emoji}</span>
                  <span className="tier-body">
                    <span className="tier-title">{t.title}</span>
                    <span className="tier-note">{t.note}</span>
                  </span>
                  <span className="tier-price">{t.price}</span>
                </button>
              ))}
            </div>
            <p className="disclaimer" style={{ marginTop: 0 }}>
              Alle Optionen schalten Pro dauerhaft frei – höhere Stufen sind extra Trinkgeld fürs Klopapier. 🧻 (Preise Beispiel; final im App Store.)
            </p>
          </>
        ) : (
          <>
            <div className="set-title">Trinkgeld geben (jederzeit) 🧻</div>
            <div className="tier-list tips">
              {TIP_TIERS.map((t) => (
                <button key={t.key} className="tier" onClick={() => onTip(t)}>
                  <span className="tier-em" aria-hidden="true">{t.emoji}</span>
                  <span className="tier-body"><span className="tier-title">{t.title}</span></span>
                  <span className="tier-price">{t.price}</span>
                </button>
              ))}
            </div>
            <p className="disclaimer" style={{ marginTop: 0 }}>Du hast schon Pro – das hier ist reines Dankeschön. Freiwillig, jederzeit. 💛</p>
          </>
        )}

        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn ghost" onClick={onClose}>Schließen</button>
          {onResetTrial && (
            <button className="btn ghost" onClick={onResetTrial}>Testphase neu (Test)</button>
          )}
        </div>
      </div>
    </div>
  )
}
