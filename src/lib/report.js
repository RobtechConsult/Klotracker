// Arzt-Report: sachliche Zusammenfassung des Trackings über einen Zeitraum,
// als druckbares HTML (Browser -> „Als PDF speichern"). Bewusst nüchtern,
// kein Humor. reportData() ist rein/testbar, renderReportHtml() erzeugt das
// Dokument.

import { averagePerDay, averageDrinkPerDay, averageIntervalHours, toiletTimeStats, dayKey, fmtMl, fmtDuration, fmtDurationShort } from './stats.js'
import { BRISTOL, SYMPTOMS } from './tips.js'

const symLabel = (k) => (SYMPTOMS.find((s) => s.key === k)?.label || k)
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const deDate = (d) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function reportData(entries, settings = {}, now = new Date(), days = 30) {
  const end = new Date(now)
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  cutoff.setHours(0, 0, 0, 0)
  const inPeriod = (e) => { const t = new Date(e.ts); return t >= cutoff && t <= end }
  const period = entries.filter(inPeriod)
  const stool = period.filter((e) => e.type === 'stool')
  const urine = period.filter((e) => e.type === 'urine')

  const dist = [0, 0, 0, 0, 0, 0, 0]
  let bristolTotal = 0
  for (const e of stool) {
    if (e.bristol >= 1 && e.bristol <= 7) { dist[e.bristol - 1]++; bristolTotal++ }
  }

  const symptoms = { blood: 0, pain: 0, mucus: 0, bloating: 0, urgency: 0 }
  for (const e of period) {
    if (Array.isArray(e.symptoms)) for (const s of e.symptoms) if (s in symptoms) symptoms[s]++
  }

  const daily = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const k = dayKey(d)
    const dayE = period.filter((e) => dayKey(e.ts) === k)
    if (dayE.length === 0) continue // nur Tage mit Einträgen -> kompakt
    daily.push({
      date: new Date(d),
      stool: dayE.filter((e) => e.type === 'stool').length,
      urine: dayE.filter((e) => e.type === 'urine').length,
      bristols: dayE.filter((e) => e.type === 'stool' && e.bristol).map((e) => e.bristol),
      symptoms: [...new Set(dayE.flatMap((e) => e.symptoms || []))]
    })
  }

  return {
    name: settings.name || '',
    from: cutoff,
    to: end,
    days,
    stoolCount: stool.length,
    urineCount: urine.length,
    stoolPerDay: averagePerDay(entries, 'stool', days, now),
    urinePerDay: averagePerDay(entries, 'urine', days, now),
    drinkPerDay: averageDrinkPerDay(entries, days, now),
    intervalH: averageIntervalHours(period, 'stool'),
    toilet: toiletTimeStats(entries, days, now),
    dist,
    bristolTotal,
    symptoms,
    daily
  }
}

export function renderReportHtml(d, generatedAt = new Date()) {
  const stoolNormal = d.stoolPerDay >= 3 / 7 && d.stoolPerDay <= 3
  const freqNote = d.stoolCount === 0
    ? 'Keine Stuhlgänge im Zeitraum dokumentiert.'
    : stoolNormal
      ? 'Frequenz innerhalb des üblichen Rahmens (3×/Woche bis 3×/Tag).'
      : d.stoolPerDay > 3
        ? 'Frequenz über dem üblichen Rahmen (> 3×/Tag).'
        : 'Frequenz unter dem üblichen Rahmen (< 3×/Woche).'

  const bristolRows = BRISTOL.map((b) => {
    const n = d.dist[b.n - 1]
    const pct = d.bristolTotal ? Math.round((n / d.bristolTotal) * 100) : 0
    return `<tr><td>Typ ${b.n}</td><td>${esc(b.label)}</td><td class="num">${n}</td><td class="num">${pct}%</td></tr>`
  }).join('')

  const symItems = SYMPTOMS.map((s) => {
    const n = d.symptoms[s.key] || 0
    if (!n) return ''
    const flag = s.serious ? ' class="flag"' : ''
    return `<li${flag}>${esc(s.label)}: ${n}×${s.serious ? ' — ärztliche Abklärung empfohlen' : ''}</li>`
  }).filter(Boolean).join('')

  const dailyRows = d.daily.map((r) => `
    <tr>
      <td>${deDate(r.date)}</td>
      <td class="num">${r.stool}</td>
      <td class="num">${r.urine}</td>
      <td>${r.bristols.join(', ') || '–'}</td>
      <td>${r.symptoms.map(symLabel).map(esc).join(', ') || '–'}</td>
    </tr>`).join('')

  const interval = d.intervalH == null ? '–' : d.intervalH < 24 ? `${d.intervalH.toFixed(1)} Std` : `${(d.intervalH / 24).toFixed(1)} Tage`

  return `<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>Klotracker – Verlaufsbericht</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 28px; font-size: 13px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  h2 { font-size: 14px; margin: 22px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  .sub { color: #555; margin: 0 0 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .kpi { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
  .kpi .v { font-size: 18px; font-weight: 800; }
  .kpi .l { color: #666; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
  th { background: #f4f4f4; }
  td.num, th.num { text-align: right; }
  ul { margin: 6px 0; padding-left: 18px; }
  li.flag { color: #b3261e; font-weight: 700; }
  .note { color: #444; }
  .foot { margin-top: 24px; color: #777; font-size: 11px; border-top: 1px solid #ccc; padding-top: 8px; }
  .toolbar { position: sticky; top: 0; background: #fff; padding-bottom: 10px; }
  .btn { font-size: 14px; padding: 8px 14px; border: 1px solid #333; border-radius: 8px; background: #333; color: #fff; cursor: pointer; }
  @media print { .toolbar { display: none; } body { padding: 0; } }
  @page { margin: 16mm; }
</style></head><body>
<div class="toolbar"><button class="btn" onclick="window.print()">🖨️ Als PDF speichern / drucken</button></div>
<h1>Klotracker – Verlaufsbericht</h1>
<p class="sub">${d.name ? 'Person: ' + esc(d.name) + ' · ' : ''}Zeitraum: ${deDate(d.from)} – ${deDate(d.to)} (${d.days} Tage)</p>
<p class="sub">Erstellt am ${deDate(generatedAt)}</p>

<h2>Zusammenfassung</h2>
<div class="grid">
  <div class="kpi"><div class="v">${d.stoolCount}</div><div class="l">Stuhlgänge gesamt</div></div>
  <div class="kpi"><div class="v">${d.stoolPerDay.toFixed(1)}/Tag</div><div class="l">Stuhlgang-Frequenz</div></div>
  <div class="kpi"><div class="v">${interval}</div><div class="l">Ø Abstand</div></div>
  <div class="kpi"><div class="v">${d.urinePerDay.toFixed(1)}/Tag</div><div class="l">Wasserlassen-Frequenz</div></div>
  <div class="kpi"><div class="v">${fmtMl(d.drinkPerDay)}/Tag</div><div class="l">Trinkmenge (getrackt)</div></div>
  <div class="kpi"><div class="v">${d.toilet.count ? fmtDurationShort(d.toilet.avgSec) : '–'}</div><div class="l">Ø Sitzungsdauer</div></div>
</div>
<p class="note">${freqNote}</p>

<h2>Stuhlkonsistenz (Bristol-Skala)</h2>
${d.bristolTotal ? `<table><thead><tr><th>Typ</th><th>Beschreibung</th><th class="num">Anzahl</th><th class="num">Anteil</th></tr></thead><tbody>${bristolRows}</tbody></table>` : '<p class="note">Keine Konsistenz-Angaben im Zeitraum.</p>'}

<h2>Symptome / Warnzeichen</h2>
${symItems ? `<ul>${symItems}</ul>` : '<p class="note">Keine Symptome dokumentiert.</p>'}

<h2>Tagesübersicht (Tage mit Einträgen)</h2>
${d.daily.length ? `<table><thead><tr><th>Datum</th><th class="num">Stuhl</th><th class="num">Wasser</th><th>Bristol</th><th>Symptome</th></tr></thead><tbody>${dailyRows}</tbody></table>` : '<p class="note">Keine Einträge im Zeitraum.</p>'}

<p class="foot">Erstellt mit Klotracker (Selbst-Tracking). Diese Übersicht ist keine ärztliche Diagnose und ersetzt keine ärztliche Untersuchung. Alle Daten stammen aus Selbsteinträgen der nutzenden Person.</p>
</body></html>`
}
