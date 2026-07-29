import { test } from 'node:test'
import assert from 'node:assert/strict'
import { predictNextStool, findTimeClusters } from './prediction.js'
import { averagePerDay, countsPerDay, streakDays, minutesOfDay, hourHistogram } from './stats.js'
import { healthCheck } from './tips.js'

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

test('minutesOfDay & hourHistogram', () => {
  assert.equal(minutesOfDay(new Date(2026, 0, 1, 7, 40)), 460)
  const h = hourHistogram([{ type: 'stool', ts: iso(1, 7) }, { type: 'stool', ts: iso(2, 7) }], 'stool')
  assert.equal(h[7], 2)
})
