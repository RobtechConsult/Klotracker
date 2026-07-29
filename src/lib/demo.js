// Erzeugt realistische Beispieldaten mit erkennbarer Gewohnheit, damit man
// die Vorhersage und die Diagramme sofort in Aktion sieht.
//
// Gewohnheits-Persona: morgendlicher "Kaffee-Typ" (~07:40) mit gelegentlichem
// Nachmittags-Gang (~15:00), dazu über den Tag verteiltes Wasserlassen.

import { makeId } from './storage.js'

// Deterministischer Pseudo-Zufall (kein Math.random, damit reproduzierbar).
function rng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function makeDemoEntries(now = new Date(), days = 21) {
  const rand = rng(42)
  const out = []
  const at = (base, h, m, jitter) => {
    const d = new Date(base)
    d.setHours(h, m + Math.round((rand() - 0.5) * 2 * jitter), 0, 0)
    return d
  }

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(day.getDate() - i)

    // Morgendlicher Stuhlgang (fast täglich, ~07:40) – die Gewohnheit.
    if (rand() > 0.12) {
      out.push({
        id: makeId(),
        ts: at(day, 7, 40, 35).toISOString(),
        type: 'stool',
        bristol: [3, 4, 4, 4, 5][Math.floor(rand() * 5)]
      })
    }
    // Gelegentlicher Nachmittags-Gang (~15:00).
    if (rand() > 0.72) {
      out.push({
        id: makeId(),
        ts: at(day, 15, 0, 50).toISOString(),
        type: 'stool',
        bristol: [3, 4, 4, 5, 6][Math.floor(rand() * 5)]
      })
    }
    // Wasserlassen: 5–7x über den Tag verteilt.
    const times = [7, 9, 11, 13, 15, 18, 21]
    const count = 5 + Math.floor(rand() * 3)
    for (let k = 0; k < count; k++) {
      const h = times[k % times.length]
      out.push({ id: makeId(), ts: at(day, h, 15, 40).toISOString(), type: 'urine' })
    }
  }

  return out.sort((a, b) => new Date(b.ts) - new Date(a.ts))
}
