import { test } from 'node:test'
import assert from 'node:assert/strict'
import { predictNextStool, findTimeClusters } from './prediction.js'
import { averagePerDay, countsPerDay, streakDays, minutesOfDay, hourHistogram, fmtDuration, fmtDurationShort, toiletTimeStats, drinkTotalToday, averageDrinkPerDay, fmtMl } from './stats.js'
import { healthCheck } from './tips.js'
import { mergeEntries, parseImport } from './storage.js'

const iso = (day, h, m = 0) => {
  const d = new Date(2026, 0, day, h, m, 0)
  return d.toISOString()
}

test('findTimeClusters findet einen morgendlichen Gipfel bei ~7:40', () => {
  // 8 Uhr = 480 Min; wir streuen um 460 (7:40).
  const mins = [455, 460, 465, 470, 458, 462]
  const clusters = findTimeClusters(mins)
  assert.ok(clusters.length >= 1)
  assert.ok(Math.abs(clusters[0].center - 461) < 30, `center war ${clusters[0].center}`)
})

test('predictNextStool: lernt eine 07:40-Gewohnheit und sagt sie voraus', () => {
  const entries = []
  for (let day = 1; day <= 14; day++) entries.push({ type: 'stool', ts: iso(day, 7, 40) })
  // "Jetzt" ist 06:00 am 15. -> nächste Vorhersage sollte ~07:40 heute sein.
  const now = new Date(2026, 0, 15, 6, 0, 0)
  const p = predictNextStool(entries, now)
  assert.equal(p.status, 'ok')
  const [hh, mm] = p.time.split(':').map(Number)
  assert.ok(Math.abs(hh * 60 + mm - 460) < 40, `Vorhersage war ${p.time}`)
  assert.ok(!p.tomorrow)
  assert.ok(p.confidence > 40)
})

test('predictNextStool: wenn heutige Zeit vorbei ist, wird auf morgen verschoben', () => {
  const entries = []
  for (let day = 1; day <= 14; day++) entries.push({ type: 'stool', ts: iso(day, 7, 40) })
  const now = new Date(2026, 0, 15, 12, 0, 0) // 12 Uhr, 7:40 ist vorbei
  const p = predictNextStool(entries, now)
  assert.equal(p.status, 'ok')
  assert.ok(p.tomorrow, 'sollte auf morgen zeigen')
  assert.ok(p.inMinutes > 60)
})

test('predictNextStool: zu wenige Daten -> learning', () => {
  const p = predictNextStool([{ type: 'stool', ts: iso(1, 8) }], new Date(2026, 0, 2, 6))
  assert.equal(p.status, 'learning')
  assert.equal(p.need - p.have, 3)
})

test('averagePerDay rechnet über getrackte Tage', () => {
  const entries = [
    { type: 'stool', ts: iso(1, 8) },
    { type: 'stool', ts: iso(2, 8) },
    { type: 'stool', ts: iso(3, 8) }
  ]
  const now = new Date(2026, 0, 3, 20)
  const avg = averagePerDay(entries, 'stool', 30, now)
  assert.ok(Math.abs(avg - 1) < 0.01, `avg war ${avg}`)
})

test('countsPerDay liefert korrekte Tagesbuckets', () => {
  const entries = [
    { type: 'stool', ts: iso(3, 8) },
    { type: 'stool', ts: iso(3, 20) },
    { type: 'urine', ts: iso(3, 9) }
  ]
  const now = new Date(2026, 0, 3, 23)
  const rows = countsPerDay(entries, 'stool', 7, now)
  assert.equal(rows.length, 7)
  assert.equal(rows[rows.length - 1].count, 2)
})

test('streakDays zählt aufeinanderfolgende Tage', () => {
  const entries = [
    { type: 'urine', ts: iso(3, 8) },
    { type: 'urine', ts: iso(2, 8) },
    { type: 'urine', ts: iso(1, 8) }
  ]
  const now = new Date(2026, 0, 3, 12)
  assert.equal(streakDays(entries, now), 3)
})

test('healthCheck: >3 Stuhlgänge/Tag -> alert (zu häufig)', () => {
  const entries = []
  for (let day = 1; day <= 5; day++) {
    for (let n = 0; n < 5; n++) entries.push({ type: 'stool', ts: iso(day, 8 + n) })
  }
  const now = new Date(2026, 0, 5, 23)
  const res = healthCheck(entries, now)
  assert.equal(res.level, 'alert')
  assert.ok(res.findings.some((f) => /häufig/i.test(f.title)))
})

test('healthCheck: sehr selten -> watch (Verstopfungshinweis)', () => {
  const entries = [
    { type: 'stool', ts: iso(1, 8) },
    { type: 'stool', ts: iso(8, 8) }
  ]
  const now = new Date(2026, 0, 14, 23)
  const res = healthCheck(entries, now)
  assert.ok(res.findings.some((f) => f.level === 'watch'))
})

test('fmtDuration formatiert Minuten/Stunden', () => {
  assert.equal(fmtDuration(95), '1:35')
  assert.equal(fmtDuration(600), '10:00')
  assert.equal(fmtDuration(3720), '1 Std 2 Min')
})

test('fmtDurationShort', () => {
  assert.equal(fmtDurationShort(45), '45 Sek')
  assert.equal(fmtDurationShort(600), '10 Min')
  assert.equal(fmtDurationShort(3600), '1,0 Std')
})

test('toiletTimeStats summiert nur getimte Stuhlgänge im Zeitraum', () => {
  const now = new Date(2026, 0, 10, 20)
  const entries = [
    { type: 'stool', ts: iso(10, 8), durationSec: 300 }, // heute, 5 min
    { type: 'stool', ts: iso(9, 8), durationSec: 600 }, // gestern, 10 min
    { type: 'stool', ts: iso(8, 8) }, // ohne Dauer -> zählt nicht
    { type: 'urine', ts: iso(10, 9), durationSec: 120 }, // kein Stuhl -> zählt nicht
    { type: 'stool', ts: iso(1, 8), durationSec: 999 } // außerhalb 7-Tage-Fensters
  ]
  const s = toiletTimeStats(entries, 7, now)
  assert.equal(s.count, 2)
  assert.equal(s.totalSec, 900)
  assert.equal(s.avgSec, 450)
  assert.equal(s.longestSec, 600)
})

test('toiletTimeStats leer, wenn keine Dauern', () => {
  const s = toiletTimeStats([{ type: 'stool', ts: iso(1, 8) }], 7, new Date(2026, 0, 1, 20))
  assert.equal(s.count, 0)
  assert.equal(s.avgSec, 0)
})

test('drinkTotalToday & averageDrinkPerDay', () => {
  const now = new Date(2026, 0, 10, 20)
  const entries = [
    { type: 'drink', ts: iso(10, 8), drink: 'water', amount: 250 },
    { type: 'drink', ts: iso(10, 12), drink: 'coffee', amount: 125 },
    { type: 'drink', ts: iso(9, 8), drink: 'water', amount: 500 },
    { type: 'stool', ts: iso(10, 9) } // kein Getränk
  ]
  assert.equal(drinkTotalToday(entries, now), 375)
  // getrackt seit dem 9. bis 10. = 2 Tage, total 875 -> 437,5/Tag
  assert.equal(averageDrinkPerDay(entries, 7, now), 437.5)
})

test('averageDrinkPerDay zählt nur das Zeitfenster (kein Overcount)', () => {
  const now = new Date(2026, 0, 20, 20)
  const entries = []
  for (let d = 1; d <= 20; d++) entries.push({ type: 'drink', ts: iso(d, 10), drink: 'water', amount: 1000 })
  // 7-Tage-Fenster (14.–20.) = 7 Tage × 1000 ml / 7 = 1000, nicht 20×1000/7
  assert.equal(averageDrinkPerDay(entries, 7, now), 1000)
})

test('fmtMl', () => {
  assert.equal(fmtMl(300), '300 ml')
  assert.equal(fmtMl(1500), '1,5 L')
})

test('healthCheck: wenig Trinken -> Hinweis', () => {
  const now = new Date(2026, 0, 3, 20)
  const entries = [
    { type: 'drink', ts: iso(1, 8), drink: 'water', amount: 300 },
    { type: 'drink', ts: iso(2, 8), drink: 'water', amount: 300 },
    { type: 'drink', ts: iso(3, 8), drink: 'water', amount: 300 }
  ]
  const res = healthCheck(entries, now)
  assert.ok(res.findings.some((f) => /Wüste|geht noch/i.test(f.title)))
})

test('mergeEntries dedupliziert per id und ergänzt neue', () => {
  const existing = [{ id: 'a', type: 'stool', ts: iso(1, 8) }]
  const incoming = [
    { id: 'a', type: 'stool', ts: iso(1, 8) }, // Duplikat
    { id: 'b', type: 'drink', ts: iso(2, 8), drink: 'water', amount: 250 }, // neu
    { id: 'x', type: 'quatsch', ts: iso(3, 8) } // ungültig -> raus
  ]
  const { merged, added } = mergeEntries(existing, incoming)
  assert.equal(added, 1)
  assert.equal(merged.length, 2)
  assert.ok(merged.some((e) => e.id === 'b'))
})

test('parseImport akzeptiert Array und {entries:[…]}', () => {
  assert.equal(parseImport('[{"a":1}]').length, 1)
  assert.equal(parseImport('{"entries":[{"a":1},{"b":2}]}').length, 2)
  assert.throws(() => parseImport('{"foo":true}'))
})

test('minutesOfDay & hourHistogram', () => {
  assert.equal(minutesOfDay(new Date(2026, 0, 1, 7, 40)), 460)
  const h = hourHistogram([{ type: 'stool', ts: iso(1, 7) }, { type: 'stool', ts: iso(2, 7) }], 'stool')
  assert.equal(h[7], 2)
})
