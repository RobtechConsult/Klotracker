// Persistenz – alles bleibt lokal auf dem Gerät. Kein Server, keine Cloud,
// kein Mitlesen. Was aufs Klo geht, bleibt auf dem Klo.

const KEY = 'klotracker.entries.v1'
const SETTINGS_KEY = 'klotracker.settings.v1'
const SESSION_KEY = 'klotracker.session.v1'

/** @typedef {{ id:string, ts:string, type:'stool'|'urine', bristol?:number, note?:string, durationSec?:number }} Entry */

export function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    // Neueste zuerst
    return data
      .filter((e) => e && e.ts && (e.type === 'stool' || e.type === 'urine'))
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    /* Speicher voll oder privater Modus – wir tun so, als wäre nichts. */
  }
}

export function makeId() {
  return 'e_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function loadSettings() {
  try {
    return { humor: true, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return { humor: true }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

export function exportJSON(entries) {
  return JSON.stringify({ app: 'klotracker', version: 1, exportedAt: new Date().toISOString(), entries }, null, 2)
}

// --- Laufende Sitzung (Timer) -------------------------------------------
// Wird separat gespeichert, damit ein laufender Timer einen App-Neustart oder
// das versehentliche Schließen übersteht. Der Darm wartet schließlich nicht.
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    return s && s.startedAt ? s : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
