// Pro-Status: 4-Tage-Testphase, danach Kauf ("Supporter"). Rein lokal berechnet.
// Der eigentliche Kauf wird später über native In-App-Käufe (StoreKit /
// Play Billing) freigeschaltet – hier wird nur das Flag settings.proUnlocked
// gesetzt.

export const TRIAL_DAYS = 4

export const PRO_FEATURES = [
  { emoji: '🔮', title: 'Gewohnheits-Prognose', desc: 'Deine wahrscheinlichste nächste Klo-Zeit.' },
  { emoji: '🕐', title: 'Tagesrhythmus', desc: 'Die radiale 24-Stunden-Uhr deiner Muster.' },
  { emoji: '📈', title: 'Trends & Muster', desc: 'Diese Woche vs. letzte, Ø-Abstand, aktivster Tag.' }
]

/**
 * @returns {{active:boolean, mode:'unlocked'|'trial'|'expired'|'none', daysLeft:number}}
 */
export function proStatus(settings = {}, now = new Date()) {
  if (settings.proUnlocked) return { active: true, mode: 'unlocked', daysLeft: Infinity }
  const start = settings.proTrialStart ? new Date(settings.proTrialStart).getTime() : null
  if (start) {
    const msLeft = start + TRIAL_DAYS * 86400000 - new Date(now).getTime()
    if (msLeft > 0) return { active: true, mode: 'trial', daysLeft: Math.max(1, Math.ceil(msLeft / 86400000)) }
    return { active: false, mode: 'expired', daysLeft: 0 }
  }
  return { active: false, mode: 'none', daysLeft: 0 }
}
