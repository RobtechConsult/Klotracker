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
