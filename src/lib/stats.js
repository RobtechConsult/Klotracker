// Reine Statistik-Funktionen. Kein State, keine Seiteneffekte – damit gut
// testbar. Zeitangaben immer als Date/ISO. "now" wird reingereicht, damit
// alles deterministisch bleibt.

export const dayKey = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

export const minutesOfDay = (d) => {
  const x = new Date(d)
  return x.getHours() * 60 + x.getMinutes()
}

export const fmtTime = (mins) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Anzahl pro Tag für die letzten n Tage, ältester zuerst. */
export function countsPerDay(entries, type, days, now = new Date()) {
  const buckets = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets.push({ key: dayKey(d), date: new Date(d), stool: 0, urine: 0 })
  }
  const index = new Map(buckets.map((b) => [b.key, b]))
  for (const e of entries) {
    const b = index.get(dayKey(e.ts))
    if (b) b[e.type] += 1
  }
  if (type) return buckets.map((b) => ({ key: b.key, date: b.date, count: b[type] }))
  return buckets
}

/** Durchschnitt pro Tag über einen Zeitraum (nur Tage seit erstem Eintrag zählen). */
export function averagePerDay(entries, type, days, now = new Date()) {
  const rows = countsPerDay(entries, type, days, now)
  const relevant = entries.filter((e) => !type || e.type === type)
  if (relevant.length === 0) return 0
  // Getrackte Tage = Anzahl Kalendertage von erstem Eintrag bis heute (inkl.).
  const firstTs = Math.min(...relevant.map((e) => new Date(e.ts).getTime()))
  const first = new Date(firstTs)
  const startMid = new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime()
  const nowMid = new Date(now).setHours(0, 0, 0, 0)
  const spanDays = Math.floor((nowMid - startMid) / 86400000) + 1
  const daysTracked = Math.min(days, Math.max(1, spanDays))
  const total = rows.reduce((s, r) => s + r.count, 0)
  return total / daysTracked
}

export function countToday(entries, type, now = new Date()) {
  const k = dayKey(now)
  return entries.filter((e) => e.type === type && dayKey(e.ts) === k).length
}

/** Anzahl der Tage in Folge (bis heute/gestern) mit mindestens einem Eintrag. */
export function streakDays(entries, now = new Date()) {
  if (entries.length === 0) return 0
  const keys = new Set(entries.map((e) => dayKey(e.ts)))
  let streak = 0
  const d = new Date(now)
  // Heute darf noch leer sein, ohne die Serie zu brechen.
  if (!keys.has(dayKey(d))) d.setDate(d.getDate() - 1)
  while (keys.has(dayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/** Verteilung der Bristol-Stuhltypen (1..7). */
export function bristolDistribution(entries) {
  const dist = [0, 0, 0, 0, 0, 0, 0]
  let total = 0
  for (const e of entries) {
    if (e.type === 'stool' && e.bristol >= 1 && e.bristol <= 7) {
      dist[e.bristol - 1]++
      total++
    }
  }
  return { dist, total }
}

/** Aktivität pro Stunde (0..23), summiert über alle Tage. Für die Heatmap. */
export function hourHistogram(entries, type) {
  const hours = new Array(24).fill(0)
  for (const e of entries) {
    if (!type || e.type === type) hours[new Date(e.ts).getHours()]++
  }
  return hours
}

/** Sekunden menschenlesbar: 95 -> "1:35", 3720 -> "1 Std 2 Min". */
export function fmtDuration(sec) {
  const s = Math.max(0, Math.round(sec))
  if (s < 3600) {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${String(r).padStart(2, '0')}`
  }
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  return m ? `${h} Std ${m} Min` : `${h} Std`
}

/** Kompakt für Kacheln: 620 -> "10 Min", 3720 -> "1,0 Std". */
export function fmtDurationShort(sec) {
  const s = Math.max(0, Math.round(sec))
  if (s < 60) return `${s} Sek`
  if (s < 3600) return `${Math.round(s / 60)} Min`
  return `${(s / 3600).toFixed(1).replace('.', ',')} Std`
}

/**
 * Auswertung der "Thron-Zeit": alle Stuhlgänge mit gemessener Dauer im
 * Zeitraum. Liefert Gesamt-, Durchschnitts- und Rekordzeit.
 */
export function toiletTimeStats(entries, days = 7, now = new Date()) {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  cutoff.setHours(0, 0, 0, 0)
  const timed = entries.filter(
    (e) => e.type === 'stool' && e.durationSec > 0 && new Date(e.ts) >= cutoff
  )
  const totalSec = timed.reduce((s, e) => s + e.durationSec, 0)
  const count = timed.length
  const longest = timed.reduce((m, e) => (e.durationSec > m ? e.durationSec : m), 0)
  return {
    totalSec,
    count,
    avgSec: count ? totalSec / count : 0,
    longestSec: longest
  }
}

// --- Trinken -------------------------------------------------------------
/** Getrunkene Menge (ml) heute. */
export function drinkTotalToday(entries, now = new Date()) {
  const k = dayKey(now)
  return entries
    .filter((e) => e.type === 'drink' && dayKey(e.ts) === k)
    .reduce((s, e) => s + (e.amount || 0), 0)
}

/** Getrunkene ml pro Tag für die letzten n Tage, ältester zuerst. */
export function drinkMlByDay(entries, days, now = new Date()) {
  const buckets = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets.push({ key: dayKey(d), date: new Date(d), ml: 0 })
  }
  const index = new Map(buckets.map((b) => [b.key, b]))
  for (const e of entries) {
    if (e.type !== 'drink') continue
    const b = index.get(dayKey(e.ts))
    if (b) b.ml += e.amount || 0
  }
  return buckets
}

/** Durchschnittliche Trinkmenge (ml) pro Tag – nur im Zeitfenster der letzten `days`. */
export function averageDrinkPerDay(entries, days, now = new Date()) {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  cutoff.setHours(0, 0, 0, 0)
  const drinks = entries.filter((e) => e.type === 'drink' && new Date(e.ts) >= cutoff)
  if (drinks.length === 0) return 0
  const firstTs = Math.min(...drinks.map((e) => new Date(e.ts).getTime()))
  const first = new Date(firstTs)
  const startMid = new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime()
  const nowMid = new Date(now).setHours(0, 0, 0, 0)
  const spanDays = Math.min(days, Math.max(1, Math.floor((nowMid - startMid) / 86400000) + 1))
  const total = drinks.reduce((s, e) => s + (e.amount || 0), 0)
  return total / spanDays
}

/** Menge menschenlesbar: 1500 -> "1,5 L", 300 -> "300 ml". */
export function fmtMl(ml) {
  const v = Math.max(0, Math.round(ml))
  return v >= 1000 ? `${(v / 1000).toFixed(1).replace('.', ',')} L` : `${v} ml`
}

// --- Trends / Muster -----------------------------------------------------
// Vergleicht die letzten 7 Tage mit den 7 Tagen davor.
function windowValue(entries, now, olderDaysBack, newerDaysBack, valueFn) {
  const nowMs = new Date(now).getTime()
  const start = nowMs - olderDaysBack * 86400000
  const end = nowMs - newerDaysBack * 86400000
  let sum = 0
  for (const e of entries) {
    const t = new Date(e.ts).getTime()
    if (t >= start && t < end) sum += valueFn(e)
  }
  return sum
}

/**
 * Woche-über-Woche-Trend. kind: 'stool' | 'urine' | 'drink' | 'toilet'.
 * Liefert { cur, prev, deltaPct|null } (Menge/Anzahl je nach kind).
 */
export function weekTrend(entries, kind, now = new Date()) {
  let valueFn
  if (kind === 'drink') valueFn = (e) => (e.type === 'drink' ? e.amount || 0 : 0)
  else if (kind === 'toilet') valueFn = (e) => (e.type === 'stool' ? e.durationSec || 0 : 0)
  else valueFn = (e) => (e.type === kind ? 1 : 0)

  const cur = windowValue(entries, now, 7, 0, valueFn)
  const prev = windowValue(entries, now, 14, 7, valueFn)
  const deltaPct = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null
  return { cur, prev, deltaPct }
}

/** Aktivster Wochentag (0=So..6=Sa) für einen Typ über die letzten `days` Tage. */
export function mostActiveWeekday(entries, type, days = 30, now = new Date()) {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  cutoff.setHours(0, 0, 0, 0)
  const counts = new Array(7).fill(0)
  for (const e of entries) {
    if (e.type === type && new Date(e.ts) >= cutoff) counts[new Date(e.ts).getDay()]++
  }
  const max = Math.max(...counts)
  if (max === 0) return null
  return { weekday: counts.indexOf(max), count: max }
}

/** Durchschnittlicher Abstand zwischen Stuhlgängen in Stunden. */
export function averageIntervalHours(entries, type = 'stool') {
  const times = entries
    .filter((e) => e.type === type)
    .map((e) => new Date(e.ts).getTime())
    .sort((a, b) => a - b)
  if (times.length < 2) return null
  let sum = 0
  for (let i = 1; i < times.length; i++) sum += times[i] - times[i - 1]
  return sum / (times.length - 1) / 3600000
}
