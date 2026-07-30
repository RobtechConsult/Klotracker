// Persistenz – alles bleibt lokal auf dem Gerät. Kein Server, keine Cloud,
// kein Mitlesen. Was aufs Klo geht, bleibt auf dem Klo.

const KEY = 'klotracker.entries.v1'
const SETTINGS_KEY = 'klotracker.settings.v1'
const SESSION_KEY = 'klotracker.session.v1'

/** @typedef {{ id:string, ts:string, type:'stool'|'urine'|'drink', bristol?:number, note?:string, durationSec?:number, drink?:string, amount?:number }} Entry */

const TYPES = ['stool', 'urine', 'drink']
const isValid = (e) => e && e.ts && TYPES.includes(e.type)

export function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    // Neueste zuerst
    return data.filter(isValid).sort((a, b) => new Date(b.ts) - new Date(a.ts))
  } catch {
    return []
  }
}

/**
 * Führt importierte Einträge mit den vorhandenen zusammen (Dedup per id).
 * Liefert die zusammengeführte, sortierte Liste plus Anzahl neu hinzugefügter.
 */
export function mergeEntries(existing, incoming) {
  const map = new Map(existing.map((e) => [e.id, e]))
  let added = 0
  for (const e of Array.isArray(incoming) ? incoming : []) {
    if (!isValid(e)) continue
    const id = e.id || makeId()
    if (!map.has(id)) {
      map.set(id, { ...e, id })
      added++
    }
  }
  const merged = [...map.values()].sort((a, b) => new Date(b.ts) - new Date(a.ts))
  return { merged, added }
}

/** Robustes Parsen einer Export-Datei: akzeptiert {entries:[…]} oder ein Array. */
export function parseImport(text) {
  const data = JSON.parse(text)
  const arr = Array.isArray(data) ? data : Array.isArray(data?.entries) ? data.entries : null
  if (!arr) throw new Error('Kein gültiges Klotracker-Backup.')
  return arr
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
  const defaults = { humor: true, drinkGoalMl: 2000, onboarded: false, name: '', theme: 'auto', drinkSizes: {}, proUnlocked: false, proTrialStart: null }
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return defaults
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
