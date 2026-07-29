// Gewohnheitsalgorithmus: "Nächster wahrscheinlicher Stuhlgang XX:XX Uhr".
//
// Idee: Menschen sind Gewohnheitstiere. Der Darm oft auch. Wir schauen uns
// die Uhrzeiten vergangener Stuhlgänge an und suchen wiederkehrende Muster.
//
// Der Tag ist ein Kreis (23:59 liegt neben 00:00). Deshalb legen wir über
// jede beobachtete Uhrzeit einen weichen "Gauß-Hügel" (Kernel Density
// Estimation) auf einem 1440-Minuten-Ring. Wo sich viele Hügel überlagern,
// entsteht ein Gipfel = eine typische Klo-Zeit. Der nächste Gipfel nach
// "jetzt" ist die Vorhersage.

import { minutesOfDay, fmtTime } from './stats.js'

const DAY = 1440
const SIGMA = 50 // Streubreite eines Hügels in Minuten (~ Toleranz einer Gewohnheit)

// Kürzeste Distanz auf dem Tages-Ring (in Minuten, 0..720).
function ringDist(a, b) {
  const d = Math.abs(a - b) % DAY
  return Math.min(d, DAY - d)
}

/**
 * Findet wiederkehrende Uhrzeiten (Cluster) aus einer Liste von Minuten-des-Tages.
 * Gibt Gipfel sortiert nach Stärke zurück: { center, strength, share, spread }.
 */
export function findTimeClusters(minutesList) {
  if (minutesList.length === 0) return []
  const step = 5 // Auflösung: alle 5 Minuten auswerten
  const density = []
  for (let t = 0; t < DAY; t += step) {
    let sum = 0
    for (const m of minutesList) {
      const dist = ringDist(t, m)
      sum += Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA))
    }
    density.push({ t, sum })
  }
  // Lokale Maxima auf dem Ring finden.
  const n = density.length
  const peaks = []
  for (let i = 0; i < n; i++) {
    const prev = density[(i - 1 + n) % n]
    const cur = density[i]
    const next = density[(i + 1) % n]
    if (cur.sum > prev.sum && cur.sum >= next.sum && cur.sum > 0.35) {
      peaks.push(cur)
    }
  }
  const maxStrength = Math.max(...peaks.map((p) => p.sum), 1e-9)
  // Für jeden Gipfel: welche Beobachtungen "gehören" dazu (innerhalb 2*SIGMA)?
  return peaks
    .map((p) => {
      const members = minutesList.filter((m) => ringDist(p.t, m) <= 2 * SIGMA)
      const spread =
        members.length > 1
          ? Math.sqrt(members.reduce((s, m) => s + ringDist(p.t, m) ** 2, 0) / members.length)
          : SIGMA
      return {
        center: p.t,
        strength: p.sum / maxStrength, // 0..1 relativ zum stärksten Gipfel
        share: members.length / minutesList.length,
        count: members.length,
        spread
      }
    })
    .sort((a, b) => b.strength - a.strength)
}

/**
 * Hauptfunktion. Liefert eine Vorhersage für den nächsten Stuhlgang.
 * @returns {{status:string, ...}}
 */
export function predictNextStool(entries, now = new Date(), type = 'stool') {
  const relevant = entries.filter((e) => e.type === type)
  const MIN = 4
  if (relevant.length < MIN) {
    return { status: 'learning', have: relevant.length, need: MIN }
  }

  const minutes = relevant.map((e) => minutesOfDay(e.ts))
  const clusters = findTimeClusters(minutes)
  if (clusters.length === 0) {
    return { status: 'chaos' } // keine erkennbare Regelmäßigkeit
  }

  const nowMin = minutesOfDay(now)
  // Für jeden bedeutenden Cluster: Minuten bis zum nächsten Auftreten.
  const significant = clusters.filter((c) => c.count >= 2 && c.share >= 0.12)
  const pool = significant.length ? significant : clusters

  const candidates = pool
    .map((c) => {
      let delta = c.center - nowMin
      if (delta < 0) delta += DAY // heute schon vorbei -> morgen
      return { ...c, delta, nextTime: c.center }
    })
    .sort((a, b) => a.delta - b.delta)

  const best = candidates[0]

  // Konfidenz: viele Datenpunkte + enger Cluster + hoher Anteil => sicherer.
  const tightness = 1 - Math.min(best.spread / 120, 1) // enger = besser
  const dataFactor = Math.min(relevant.length / 20, 1)
  const confidence = Math.round((0.4 * best.strength + 0.35 * best.share + 0.15 * tightness + 0.1 * dataFactor) * 100)

  const windowMin = Math.max(20, Math.round(best.spread))

  return {
    status: 'ok',
    time: fmtTime(best.nextTime),
    minutes: best.nextTime,
    inMinutes: best.delta,
    windowFrom: fmtTime(best.nextTime - windowMin),
    windowTo: fmtTime(best.nextTime + windowMin),
    windowMin,
    confidence: Math.max(15, Math.min(confidence, 95)),
    tomorrow: best.delta + nowMin >= DAY,
    clusters: candidates.slice(0, 3).map((c) => ({ time: fmtTime(c.center), count: c.count }))
  }
}

// Kleine sprachliche Verpackung, damit die Vorhersage "in X Std" lesbar wird.
export function humanizeDelta(inMinutes) {
  if (inMinutes < 60) return `in ${Math.max(1, Math.round(inMinutes))} Min`
  const h = Math.floor(inMinutes / 60)
  const m = Math.round(inMinutes % 60)
  return m ? `in ${h} Std ${m} Min` : `in ${h} Std`
}
