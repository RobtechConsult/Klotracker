// Tipps & Gesundheits-Check – mit Augenzwinkern, aber ehrlichem Kern.
//
// WICHTIG: Klotracker ist keine medizinische App und ersetzt keine Ärztin
// und keinen Arzt. Die Hinweise sind Orientierung, kein Befund.

import { averagePerDay, bristolDistribution, countToday, averageDrinkPerDay, fmtMl } from './stats.js'

// --- Medizinisch grobe Richtwerte (bewusst konservativ) -------------------
// Stuhlgang gilt weithin als normal zwischen 3x pro Woche und 3x pro Tag.
const STOOL_MIN_PER_DAY = 3 / 7 // ~0.43
const STOOL_MAX_PER_DAY = 3
// Wasserlassen: grob 4–8x pro Tag ist üblich.
const URINE_MIN_PER_DAY = 4
const URINE_MAX_PER_DAY = 9

/**
 * Analysiert Regelmäßigkeit und liefert eine Statusbewertung.
 * level: 'good' | 'watch' | 'alert'
 */
export function healthCheck(entries, now = new Date()) {
  const findings = []
  const stoolAvg = averagePerDay(entries, 'stool', 14, now)
  const urineAvg = averagePerDay(entries, 'urine', 14, now)
  const stoolToday = countToday(entries, 'stool', now)
  const urineToday = countToday(entries, 'urine', now)
  const { dist, total } = bristolDistribution(entries)

  const hasStool = entries.some((e) => e.type === 'stool')
  const hasUrine = entries.some((e) => e.type === 'urine')

  // --- Warnzeichen (Symptome) – ganz oben, bewusst sachlich, kein Humor ---
  const cutoff14 = new Date(now)
  cutoff14.setDate(cutoff14.getDate() - 13)
  cutoff14.setHours(0, 0, 0, 0)
  const symCounts = {}
  for (const e of entries) {
    if (Array.isArray(e.symptoms) && new Date(e.ts) >= cutoff14) {
      for (const s of e.symptoms) symCounts[s] = (symCounts[s] || 0) + 1
    }
  }
  if (symCounts.blood) {
    findings.push({
      level: 'alert',
      icon: '🩸',
      title: 'Blut bemerkt',
      text: `${symCounts.blood}x Blut in den letzten 14 Tagen vermerkt. Blut im/am Stuhl sollte ärztlich abgeklärt werden – auch wenn es meist harmlose Ursachen (z. B. Hämorrhoiden) hat. Bitte ernst nehmen.`
    })
  }
  if (symCounts.pain >= 2) {
    findings.push({
      level: 'watch',
      icon: '😣',
      title: 'Wiederkehrende Schmerzen',
      text: `${symCounts.pain}x Schmerzen vermerkt. Halten Bauch- oder Darmschmerzen an, ist ein ärztlicher Check sinnvoll.`
    })
  }
  if (symCounts.bloating >= 4) {
    findings.push({
      level: 'watch',
      icon: '💨',
      title: 'Oft Blähungen',
      text: `${symCounts.bloating}x Blähungen zuletzt. Häufige Auslöser: hastiges Essen, kohlensäurehaltige Getränke, bestimmte Lebensmittel. Beobachte, was bei dir dazugehört.`
    })
  }

  // --- Stuhlgang-Frequenz ---
  if (hasStool) {
    if (stoolAvg > STOOL_MAX_PER_DAY) {
      findings.push({
        level: 'alert',
        icon: '🚽💨',
        title: 'Ganz schön häufig unterwegs',
        text: `Im Schnitt ${stoolAvg.toFixed(1)}x Stuhlgang pro Tag – das ist über dem üblichen Rahmen. Wenn das anhält, dünnflüssig ist oder von Bauchweh begleitet wird: mal ärztlich checken lassen. Dein Klo braucht auch mal Pause. 🧻`
      })
    } else if (stoolAvg > 0 && stoolAvg < STOOL_MIN_PER_DAY) {
      findings.push({
        level: 'watch',
        icon: '🐢',
        title: 'Eher gemütliches Tempo',
        text: `Nur ~${(stoolAvg * 7).toFixed(1)}x pro Woche. Seltener als 3x/Woche kann auf Verstopfung hindeuten. Mehr Wasser, Ballaststoffe und Bewegung sind die klassische Notfall-Crew. 🥦💧`
      })
    } else {
      findings.push({
        level: 'good',
        icon: '👌',
        title: 'Alles im grünen (na ja, braunen) Bereich',
        text: `~${stoolAvg.toFixed(1)}x Stuhlgang pro Tag – schön regelmäßig. Dein Darm läuft wie ein Schweizer Uhrwerk. ⏱️`
      })
    }
    if (stoolToday >= 5) {
      findings.push({
        level: 'alert',
        icon: '🎢',
        title: 'Heute ist Achterbahn',
        text: `${stoolToday}x heute schon. Das ist ein Marathon, kein Sprint. Viel trinken, und wenn es wässrig bleibt, ist die Apotheke dein Freund.`
      })
    }
  }

  // --- Bristol-Konsistenz ---
  if (total >= 3) {
    const hard = dist[0] + dist[1] // Typ 1–2: hart
    const loose = dist[5] + dist[6] // Typ 6–7: flüssig
    if (hard / total > 0.5) {
      findings.push({
        level: 'watch',
        icon: '🪨',
        title: 'Team Kieselstein',
        text: 'Überwiegend harte Konsistenz (Bristol 1–2). Klassisches Zeichen für zu wenig Flüssigkeit. Trink ein Glas Wasser auf mich. 💧'
      })
    } else if (loose / total > 0.5) {
      findings.push({
        level: 'watch',
        icon: '🌊',
        title: 'Team Wackelpudding',
        text: 'Überwiegend flüssig (Bristol 6–7). Hält das länger an, könnte etwas im Bauch nicht einverstanden sein. Beobachte es.'
      })
    } else {
      findings.push({
        level: 'good',
        icon: '🍌',
        title: 'Lehrbuch-Konsistenz',
        text: 'Überwiegend Bristol 3–5 – genau so wünscht sich das die Wissenschaft. Chapeau!'
      })
    }
  }

  // --- Wasserlassen-Frequenz ---
  if (hasUrine) {
    if (urineAvg > URINE_MAX_PER_DAY) {
      findings.push({
        level: 'watch',
        icon: '🚰',
        title: 'Kleine Blase, großer Durst?',
        text: `~${urineAvg.toFixed(1)}x pinkeln pro Tag. Entweder du trinkst vorbildlich viel – oder deine Blase ist übermotiviert. Bei ständigem Drang oder Brennen: abklären lassen.`
      })
    } else if (urineAvg > 0 && urineAvg < URINE_MIN_PER_DAY) {
      findings.push({
        level: 'watch',
        icon: '🏜️',
        title: 'Wüstenmodus',
        text: `Nur ~${urineAvg.toFixed(1)}x pinkeln pro Tag. Das riecht nach zu wenig trinken. Deine Nieren hätten gern ein Glas Wasser. 💧`
      })
    } else {
      findings.push({
        level: 'good',
        icon: '💛',
        title: 'Flüssigkeitshaushalt im Lot',
        text: `~${urineAvg.toFixed(1)}x pinkeln pro Tag – solide. Weiter so.`
      })
    }
    if (urineToday === 0 && new Date(now).getHours() >= 14) {
      findings.push({
        level: 'watch',
        icon: '⏰',
        title: 'Heute noch trocken geblieben?',
        text: 'Noch kein einziges Mal pinkeln getrackt und es ist schon Nachmittag. Trinken nicht vergessen – oder Tracken nicht vergessen. 😉'
      })
    }
  }

  // --- Trinkmenge (belegt die "mehr trinken"-Hinweise mit echten Daten) ---
  if (entries.some((e) => e.type === 'drink')) {
    const drinkAvg = averageDrinkPerDay(entries, 7, now)
    const GOAL = 2000
    if (drinkAvg < GOAL * 0.5) {
      findings.push({
        level: 'watch',
        icon: '🏜️',
        title: 'Trink-Wüste',
        text: `Nur ~${fmtMl(drinkAvg)} pro Tag getrunken – das ist wenig. Kein Wunder, wenn's beim großen Geschäft mal hakt. Stell dir eine Flasche in Sichtweite. 💧`
      })
    } else if (drinkAvg < GOAL * 0.9) {
      findings.push({
        level: 'watch',
        icon: '🚰',
        title: 'Da geht noch was',
        text: `~${fmtMl(drinkAvg)} pro Tag – solide, aber unter dem üblichen Richtwert (~2 L). Ein Glas mehr schadet selten.`
      })
    } else {
      findings.push({
        level: 'good',
        icon: '💦',
        title: 'Gut hydriert',
        text: `~${fmtMl(drinkAvg)} pro Tag – deine Nieren geben dir ein High-Five. 🙌`
      })
    }
  }

  const worst = findings.some((f) => f.level === 'alert')
    ? 'alert'
    : findings.some((f) => f.level === 'watch')
      ? 'watch'
      : findings.length
        ? 'good'
        : 'empty'

  return { level: worst, findings, stoolAvg, urineAvg }
}

// --- Zufällige Sprüche ----------------------------------------------------
const FUNNY_TIPS = [
  'Ein Tag ohne Klo ist wie ein Tag ohne Sonnenschein – nur unangenehmer.',
  'Handy mit aufs Klo nehmen? Klar. Aber danach desinfizieren, du Ferkel. 📱🧼',
  'Ballaststoffe sind wie gute Freunde: Man merkt erst, wie wichtig sie sind, wenn sie fehlen.',
  'Trink Wasser. Dein Darm dankt es dir mit Bristol-Typ 4.',
  'Sitzt du länger als ein Song dauert, ist es kein Klo mehr, sondern ein Lesesaal. 📖',
  'Kaffee am Morgen weckt nicht nur dich. ☕',
  'Bewegung bringt den Darm in Schwung. Ein Spaziergang zählt, ehrlich.',
  'Der beste Zeitpunkt fürs Klo war vor 10 Minuten. Der zweitbeste ist jetzt.',
  'Zwetschgen: die stille Superkraft im Kampf gegen die Verstopfung. 🍑',
  'Pupsen ist gesund. Nur nicht im Aufzug. 🛗',
  'Dein Beckenboden ist auch ein Muskel. Sei nett zu ihm, presse nicht.',
  'Ein Glas Wasser nach dem Aufstehen ist der Espresso für deinen Darm.',
  'Regelmäßigkeit schlägt Perfektion. Auch auf dem Klo.',
  'Wer viel sitzt, sollte viel trinken. Steht zwar nicht im Gesetz, sollte aber.'
]

export function tipOfNow(seed = 0) {
  return FUNNY_TIPS[Math.abs(Math.floor(seed)) % FUNNY_TIPS.length]
}

export function funnyTipsCount() {
  return FUNNY_TIPS.length
}

// Getränke-Typen für das Trink-Tracking (Standard-Portionsgrößen in ml).
export const DRINKS = [
  { key: 'water', emoji: '🚰', icon: 'water', label: 'Wasser', ml: 250 },
  { key: 'coffee', emoji: '☕', icon: 'coffee', label: 'Kaffee', ml: 125 },
  { key: 'tea', emoji: '🍵', icon: 'tea', label: 'Tee', ml: 200 },
  { key: 'other', emoji: '🥤', icon: 'bottle', label: 'Sonstiges', ml: 330 }
]
export const drinkByKey = (key) => DRINKS.find((d) => d.key === key) || DRINKS[3]

// Bristol-Skala als Text – kurz, verständlich, mit Prise Humor.
// `short` = Alltagswort für die Auswahl, `zone` = fest|ideal|flüssig für die
// Farb-Orientierung (schneller Überblick, wo der gute Bereich liegt).
export const BRISTOL = [
  { n: 1, emoji: '🪨', short: 'hart', zone: 'fest', label: 'Einzelne harte Klümpchen', hint: 'wie Nüsse, schwer rauszubekommen – zu trocken' },
  { n: 2, emoji: '🌰', short: 'klumpig', zone: 'fest', label: 'Wurstartig, klumpig', hint: 'leicht verstopft' },
  { n: 3, emoji: '🌭', short: 'rissig', zone: 'ideal', label: 'Wurst mit Rissen', hint: 'völlig okay' },
  { n: 4, emoji: '🍌', short: 'ideal', zone: 'ideal', label: 'Glatte, weiche Wurst', hint: 'der Goldstandard ✨' },
  { n: 5, emoji: '🫧', short: 'weich', zone: 'ideal', label: 'Weiche Klümpchen', hint: 'tendenziell etwas locker' },
  { n: 6, emoji: '🥣', short: 'breiig', zone: 'flüssig', label: 'Breiig, matschig', hint: 'Richtung Durchfall' },
  { n: 7, emoji: '🌊', short: 'flüssig', zone: 'flüssig', label: 'Komplett flüssig', hint: 'Durchfall' }
]

// Optionale Symptome/Warnzeichen. `serious` = ärztlich relevant (kein Humor).
export const SYMPTOMS = [
  { key: 'blood', label: 'Blut', emoji: '🩸', serious: true },
  { key: 'pain', label: 'Schmerzen', emoji: '😣', serious: true },
  { key: 'mucus', label: 'Schleim', emoji: '🫧' },
  { key: 'bloating', label: 'Blähungen', emoji: '💨' },
  { key: 'urgency', label: 'Starker Drang', emoji: '🚨' }
]
export const symptomByKey = (key) => SYMPTOMS.find((s) => s.key === key)

export const BRISTOL_ZONES = {
  fest: { label: 'fest', color: 'var(--amber)' },
  ideal: { label: 'ideal', color: 'var(--green)' },
  'flüssig': { label: 'flüssig', color: 'var(--blue)' }
}
