// Serverloser Freundes-Vergleich: eine kompakte Wochen-Bilanz wird als
// URL-sicherer Code kodiert und geteilt. Es werden NUR Aggregatwerte geteilt
// (keine Zeitstempel, keine Rohdaten) – und nur, wenn man den Code aktiv teilt.

import { weekTrend, averagePerDay, averageDrinkPerDay, toiletTimeStats, streakDays, fmtMl, fmtDuration, fmtDurationShort } from './stats.js'

const r1 = (x) => Math.round(x * 10) / 10

/** Baut die teilbare Wochen-Bilanz (nur Aggregate). */
export function buildSummary(entries, settings = {}, now = new Date()) {
  const tt = toiletTimeStats(entries, 7, now)
  return {
    v: 1,
    n: (settings.name || '').slice(0, 20),
    s7: weekTrend(entries, 'stool', now).cur, // Stuhlgänge letzte 7 Tage
    sa: r1(averagePerDay(entries, 'stool', 7, now)),
    ua: r1(averagePerDay(entries, 'urine', 7, now)),
    dr: Math.round(averageDrinkPerDay(entries, 7, now)),
    tt: Math.round(tt.totalSec),
    rec: Math.round(tt.longestSec),
    st: streakDays(entries, now)
  }
}

// --- URL-sichere Base64-Kodierung (UTF-8-fest) ---------------------------
function toB64Url(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64Url(code) {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeSummary(summary) {
  return toB64Url(JSON.stringify(summary))
}

export function decodeSummary(code) {
  const clean = String(code).trim().replace(/^.*vergleich=/, '') // erlaubt auch ganze Links
  const obj = JSON.parse(fromB64Url(clean))
  if (!obj || obj.v !== 1 || typeof obj.s7 !== 'number') throw new Error('Ungültiger Code')
  return obj
}

/**
 * Vergleicht zwei Bilanzen. „Duell"-Metriken haben einen Sieger (höher = besser,
 * augenzwinkernd), die Frequenz-Werte werden neutral nebeneinander gezeigt.
 */
export function compare(mine, friend) {
  const rows = []
  let me = 0
  let them = 0

  const duel = (label, emoji, a, b, fmt) => {
    const winner = a > b ? 'me' : b > a ? 'friend' : 'tie'
    if (winner === 'me') me++
    else if (winner === 'friend') them++
    rows.push({ label, emoji, mine: fmt(a), friend: fmt(b), winner, duel: true })
  }
  const neutral = (label, emoji, a, b, fmt) => {
    rows.push({ label, emoji, mine: fmt(a), friend: fmt(b), winner: null, duel: false })
  }

  duel('Durchhalte-Serie', '🔥', mine.st, friend.st, (v) => `${v} Tage`)
  duel('Thron-Zeit (Woche)', '👑', mine.tt, friend.tt, fmtDurationShort)
  duel('Rekord-Sitzung', '📖', mine.rec, friend.rec, fmtDuration)
  duel('Trinken Ø/Tag', '💧', mine.dr, friend.dr, fmtMl)
  neutral('Stuhlgänge/Tag', '💩', mine.sa, friend.sa, (v) => `${v.toFixed(1)}x`)
  neutral('Wasserlassen/Tag', '🚰', mine.ua, friend.ua, (v) => `${v.toFixed(1)}x`)

  const verdict =
    me > them
      ? `Du führst ${me}:${them}! 🎉 Klo-Champion des Hauses.`
      : them > me
        ? `Dein Freund führt ${them}:${me}. 💪 Aufholjagd!`
        : `Unentschieden ${me}:${them} – Kopf an Kopf auf dem Thron. 👑`

  return { rows, meScore: me, friendScore: them, verdict }
}

/** Baut einen teilbaren Link mit eingebettetem Code. */
export function shareUrl(code) {
  const base = (typeof location !== 'undefined' ? location.origin + location.pathname : '')
  return `${base}#vergleich=${code}`
}
