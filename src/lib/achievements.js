// Erfolge/Abzeichen – rein aus den Einträgen berechnet (deterministisch,
// offline, testbar). Mit Augenzwinkern, aber ohne Suchtdruck.

import { streakDays, bristolDistribution, dayKey } from './stats.js'

export function computeAchievements(entries, settings = {}, now = new Date()) {
  const goal = settings.drinkGoalMl || 2000
  const stools = entries.filter((e) => e.type === 'stool')
  const { dist } = bristolDistribution(entries)
  const ideal4 = dist[3] || 0
  const longReads = stools.filter((e) => (e.durationSec || 0) > 600).length
  const speedy = stools.some((e) => e.durationSec > 0 && e.durationSec < 60)
  const timer = entries.some((e) => e.durationSec > 0)

  // Getrunkene ml pro Tag – für „Trinkziel erreicht"
  const drinkByDay = {}
  for (const e of entries) {
    if (e.type === 'drink') {
      const k = dayKey(e.ts)
      drinkByDay[k] = (drinkByDay[k] || 0) + (e.amount || 0)
    }
  }
  const hydrationDay = Object.values(drinkByDay).some((ml) => ml >= goal)

  const streak = streakDays(entries, now)
  const weekdays = new Set(entries.map((e) => new Date(e.ts).getDay()))
  const coffee = entries.some((e) => e.note && /kaffee/i.test(e.note))
  const symptom = entries.some((e) => Array.isArray(e.symptoms) && e.symptoms.length > 0)
  const hour = (pred) => entries.some((e) => pred(new Date(e.ts).getHours()))

  const A = (key, emoji, title, desc, achieved, progress) => ({
    key,
    emoji,
    title,
    desc,
    achieved: !!achieved,
    progress: progress || null
  })

  return [
    A('first', '🎉', 'Der erste Gang', 'Den allerersten Eintrag gemacht.', entries.length >= 1),
    A('timer', '⏱️', 'Zeitnehmer', 'Eine Sitzung mit dem Timer gestoppt.', timer),
    A('early', '🐓', 'Frühaufsteher', 'Stuhlgang vor 7 Uhr morgens.', stools.some((e) => new Date(e.ts).getHours() < 7)),
    A('night', '🦉', 'Nachteule', 'Ein Eintrag zwischen 0 und 4 Uhr.', hour((h) => h >= 0 && h < 4)),
    A('ideal', '✨', 'Bristol-Perfektionist', '5× den Goldstandard (Typ 4).', ideal4 >= 5, { current: Math.min(ideal4, 5), target: 5 }),
    A('reader', '📖', 'Lesesaal-Abo', '3× länger als 10 Min gesessen.', longReads >= 3, { current: Math.min(longReads, 3), target: 3 }),
    A('speed', '⚡', 'Blitz-Besuch', 'Eine Sitzung unter 60 Sekunden.', speedy),
    A('hydration', '💧', 'Hydration-Held', 'An einem Tag das Trinkziel erreicht.', hydrationDay),
    A('streak', '🔥', 'Durchhalter', '7 Tage in Folge getrackt.', streak >= 7, { current: Math.min(streak, 7), target: 7 }),
    A('prolific', '✍️', 'Vielschreiber', '50 Einträge insgesamt.', entries.length >= 50, { current: Math.min(entries.length, 50), target: 50 }),
    A('weekend', '🛋️', 'Wochenend-Krieger', 'Am Samstag UND Sonntag getrackt.', weekdays.has(6) && weekdays.has(0)),
    A('coffee', '☕', 'Kaffee-Connection', 'Eine Notiz mit „Kaffee".', coffee),
    A('aware', '🔍', 'Aufmerksam', 'Ein Symptom mitgetrackt.', symptom)
  ]
}

export function achievementSummary(list) {
  const done = list.filter((a) => a.achieved).length
  return { done, total: list.length }
}
