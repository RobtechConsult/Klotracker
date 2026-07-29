// Persistenz – alles bleibt lokal auf dem Gerät. Kein Server, keine Cloud,
// kein Mitlesen. Was aufs Klo geht, bleibt auf dem Klo.

const KEY = 'klotracker.entries.v1'
const SETTINGS_KEY = 'klotracker.settings.v1'

/** @typedef {{ id:string, ts:string, type:'stool'|'urine', bristol?:number, note?:string }} Entry */

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
