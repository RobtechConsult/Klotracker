import React, { useEffect, useMemo, useRef, useState } from 'react'
import { loadEntries, saveEntries, makeId, loadSettings, saveSettings, exportJSON, loadSession, saveSession, mergeEntries, parseImport } from './lib/storage.js'
import { predictNextStool } from './lib/prediction.js'
import { countToday, streakDays, averagePerDay, fmtDuration, fmtMl } from './lib/stats.js'
import { tipOfNow, DRINKS } from './lib/tips.js'
import { makeDemoEntries } from './lib/demo.js'

import PredictionCard from './components/PredictionCard.jsx'
import DayChart from './components/DayChart.jsx'
import HourClock from './components/HourClock.jsx'
import HealthCheck from './components/HealthCheck.jsx'
import BristolChart from './components/BristolChart.jsx'
import History from './components/History.jsx'
import ThroneTime from './components/ThroneTime.jsx'
import DrinkTracker from './components/DrinkTracker.jsx'
import Trends from './components/Trends.jsx'
import Achievements from './components/Achievements.jsx'
import FriendCompare from './components/FriendCompare.jsx'
import Onboarding from './components/Onboarding.jsx'
import ProLock from './components/ProLock.jsx'
import ProDialog from './components/ProDialog.jsx'
import AddModal from './components/AddModal.jsx'
import Icon from './components/Icon.jsx'
import { proStatus } from './lib/pro.js'

export default function App() {
  const [entries, setEntries] = useState(() => loadEntries())
  const [settings, setSettings] = useState(() => loadSettings())
  const [incomingCompare, setIncomingCompare] = useState(() => {
    try {
      const m = window.location.hash.match(/vergleich=([^&]+)/)
      return m ? m[1] : null
    } catch {
      return null
    }
  })
  const [tab, setTab] = useState(incomingCompare ? 'stats' : 'home')
  const [adding, setAdding] = useState(null) // { type, initialWhen?, durationSec? } | null
  const [toast, setToast] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showPro, setShowPro] = useState(false)
  const [session, setSession] = useState(() => loadSession()) // laufender Timer
  const [, setTick] = useState(0) // erzwingt Sekunden-Rerender bei laufendem Timer
  const importRef = useRef(null)
  const now = new Date()

  useEffect(() => saveEntries(entries), [entries])
  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => saveSession(session), [session])
  // Manuelle Design-Wahl auf <html> anwenden ('auto' = System-Einstellung).
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'light' || settings.theme === 'dark') root.dataset.theme = settings.theme
    else delete root.dataset.theme
  }, [settings.theme])

  const setSetting = (patch) => setSettings((s) => ({ ...s, ...patch }))

  // 4-Tage-Testphase beim allerersten Start anstoßen.
  useEffect(() => {
    if (!settings.proUnlocked && !settings.proTrialStart) {
      setSetting({ proTrialStart: new Date().toISOString() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pro = proStatus(settings, now)
  const unlockPro = () => {
    setSetting({ proUnlocked: true })
    setShowPro(false)
    flash('Danke für den Support! 🧻💛 Pro ist frei.')
  }
  const resetTrial = () => {
    setSetting({ proUnlocked: false, proTrialStart: new Date().toISOString() })
    setShowPro(false)
    flash('Testphase neu gestartet 🔄')
  }
  // Verstrichene Zeit wird beim Rendern aus startedAt berechnet (übersteht
  // App-Neustart/Reload); der Interval erzwingt nur die Sekundenanzeige.
  useEffect(() => {
    if (!session) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [session])

  const prediction = useMemo(() => predictNextStool(entries, now), [entries])
  const tipSeed = useMemo(() => Math.floor(Date.now() / 3600000) + entries.length, [entries.length])

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1900)
  }

  const addEntry = (data) => {
    const entry = { id: makeId(), ...data }
    setEntries((prev) => [entry, ...prev].sort((a, b) => new Date(b.ts) - new Date(a.ts)))
    setAdding(null)
    flash(
      data.durationSec
        ? `Sitzung gespeichert · ${fmtDuration(data.durationSec)} Min auf dem Thron 👑`
        : data.type === 'stool'
          ? 'Stuhlgang gespeichert 💩'
          : 'Wasserlassen gespeichert 💧'
    )
  }

  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id))

  // Getränk direkt (ohne Modal) eintragen – minimale Reibung.
  const addDrink = (data) => {
    const entry = { id: makeId(), ...data }
    setEntries((prev) => [entry, ...prev].sort((a, b) => new Date(b.ts) - new Date(a.ts)))
    flash('Prost! 🥤 Schluck gespeichert')
  }

  // Backup einlesen und mit vorhandenen Daten zusammenführen (Dedup per id).
  const importFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // erlaubt erneuten Import derselben Datei
    if (!file) return
    try {
      const text = await file.text()
      const incoming = parseImport(text)
      const { merged, added } = mergeEntries(entries, incoming)
      setEntries(merged)
      setShowSettings(false)
      flash(added > 0 ? `${added} Einträge importiert 📥` : 'Nichts Neues zu importieren 🤷')
    } catch {
      flash('Import fehlgeschlagen – keine gültige Datei 🙈')
    }
  }

  // --- Timer ("Schiss starten/stoppen") ---
  const startSession = () => {
    setSession({ startedAt: new Date().toISOString() })
    flash('Timer läuft – lass dir Zeit ⏱️')
  }
  const stopSession = () => {
    if (!session) return
    const durationSec = Math.max(1, (Date.now() - new Date(session.startedAt).getTime()) / 1000)
    const startedAt = session.startedAt
    // Vergessen zu stoppen? Bei sehr langer Sitzung freundlich nachfragen.
    if (durationSec > 45 * 60 && !confirm(`Der Timer lief ${fmtDuration(durationSec)} Min. So lange wirklich speichern – oder hast du das Stoppen vergessen?`)) {
      return
    }
    setSession(null)
    setAdding({ type: 'stool', initialWhen: startedAt, durationSec })
  }
  const cancelSession = () => {
    setSession(null)
    flash('Timer verworfen 🚮')
  }
  const elapsedSec = session ? Math.max(0, (Date.now() - new Date(session.startedAt).getTime()) / 1000) : 0

  const loadDemo = () => {
    setEntries(makeDemoEntries(now))
    setShowSettings(false)
    flash('Beispieldaten geladen 🎬')
  }

  // Onboarding (erster Start)
  const finishOnboarding = () => setSettings((s) => ({ ...s, onboarded: true }))
  const onboardWithDemo = () => {
    setEntries(makeDemoEntries(now))
    finishOnboarding()
    flash('Willkommen! Beispieldaten geladen 🎬')
  }
  const clearAll = () => {
    if (confirm('Wirklich ALLE Einträge löschen? Das kann niemand rückgängig machen – nicht mal die beste Spülung.')) {
      setEntries([])
      setShowSettings(false)
      flash('Alles blitzeblank 🧼')
    }
  }
  const doExport = () => {
    const blob = new Blob([exportJSON(entries)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `klotracker-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowSettings(false)
  }

  const stoolToday = countToday(entries, 'stool', now)
  const urineToday = countToday(entries, 'urine', now)
  const streak = streakDays(entries, now)
  const stoolAvg = averagePerDay(entries, 'stool', 30, now)

  return (
    <div className="app">
      <header className="header">
        <span className="logo">🚽</span>
        <div>
          <h1>Klotracker</h1>
          <p className="sub">{settings.name ? `Hallo, ${settings.name}! 👋` : 'Tracken mit Augenzwinkern'}</p>
        </div>
        <div className="spacer" />
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Einstellungen">⚙️</button>
      </header>

      {tab === 'home' && (
        <div className="stack">
          {/* Primäraktion: Loggen */}
          <div className="card" style={{ padding: 14 }}>
            <div className="quick">
              <button className="big-btn stool" onClick={() => setAdding({ type: 'stool' })}>
                <span className="emoji" aria-hidden="true">💩</span>
                Stuhlgang
                <span className="sub">jetzt eintragen</span>
              </button>
              <button className="big-btn urine" onClick={() => setAdding({ type: 'urine' })}>
                <span className="emoji" aria-hidden="true">💧</span>
                Wasserlassen
                <span className="sub">jetzt eintragen</span>
              </button>
            </div>
          </div>

          {/* Timer als schlanke Sekundär-Aktion (läuft: prominente Live-Karte) */}
          {session ? (
            <div className="card timer-card">
              <div className="timer-live-wrap">
                <div className="eyebrow">Sitzung läuft … 🚽</div>
                <div className="timer-live" aria-live="polite">{fmtDuration(elapsedSec)}</div>
                <div className="muted">
                  seit {new Date(session.startedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr · bleib entspannt 🧘
                </div>
                <div className="row" style={{ marginTop: 14 }}>
                  <button className="btn ghost" onClick={cancelSession}>Verwerfen</button>
                  <button className="btn primary" onClick={stopSession}>⏹ Stopp &amp; speichern</button>
                </div>
              </div>
            </div>
          ) : (
            <button className="timer-slim" onClick={startSession}>
              <span className="ts-ic" aria-hidden="true">⏱️</span>
              <span className="ts-txt"><strong>Sitzung starten</strong><small>„Schiss" starten &amp; stoppen</small></span>
            </button>
          )}

          {/* Hero-Insight: die Prognose (Pro) */}
          {pro.active ? (
            <PredictionCard prediction={prediction} humor={settings.humor} />
          ) : (
            <ProLock emoji="🔮" title="Nächster-Gang-Prognose" desc="Der Gewohnheits-Algorithmus sagt dir deine wahrscheinlichste nächste Klo-Zeit – ein Pro-Feature." onUnlock={() => setShowPro(true)} />
          )}

          <div className="tiles">
            <div className="tile"><div className="num">{stoolToday}</div><div className="lbl">💩 heute</div></div>
            <div className="tile"><div className="num">{urineToday}</div><div className="lbl">💧 heute</div></div>
            <div className="tile"><div className="num">{streak}</div><div className="lbl">🔥 Tage-Serie</div></div>
          </div>

          <DrinkTracker entries={entries} now={now} goalMl={settings.drinkGoalMl} sizes={settings.drinkSizes} onAdd={addDrink} />

          {settings.humor && (
            <div className="card tip">
              <div className="eyebrow">Spruch des Moments</div>
              <p className="quote" style={{ margin: '8px 0 0' }}>„{tipOfNow(tipSeed)}"</p>
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="stack">
          <div className="tiles">
            <div className="tile"><div className="num">{stoolAvg.toFixed(1)}</div><div className="lbl">Ø 💩 / Tag</div></div>
            <div className="tile"><div className="num">{averagePerDay(entries, 'urine', 30, now).toFixed(1)}</div><div className="lbl">Ø 💧 / Tag</div></div>
            <div className="tile"><div className="num">{entries.length}</div><div className="lbl">Einträge gesamt</div></div>
          </div>
          {pro.active ? (
            <>
              <HourClock entries={entries} prediction={prediction} now={now} />
              <ThroneTime entries={entries} now={now} humor={settings.humor} />
              <Trends entries={entries} now={now} />
            </>
          ) : (
            <>
              <ProLock emoji="📈" title="Erweiterte Statistiken" desc="Tagesrhythmus (24h-Uhr) & Trends (Woche vs. Woche) sind Pro-Features." onUnlock={() => setShowPro(true)} />
              <ThroneTime entries={entries} now={now} humor={settings.humor} />
            </>
          )}
          <DayChart entries={entries} days={7} now={now} />
          <BristolChart entries={entries} />
          <HealthCheck entries={entries} now={now} />
          <FriendCompare
            entries={entries}
            settings={settings}
            now={now}
            incoming={incomingCompare}
            onIncomingHandled={() => {
              setIncomingCompare(null)
              try { history.replaceState(null, '', location.pathname + location.search) } catch { /* ignore */ }
            }}
            onToast={flash}
          />
          <Achievements entries={entries} settings={settings} now={now} />
        </div>
      )}

      {tab === 'history' && (
        <>
          <div className="section-title" style={{ marginTop: 8 }}>Verlauf</div>
          <History entries={entries} onDelete={deleteEntry} now={now} />
        </>
      )}

      <nav className="tabbar">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')} aria-label="Start">
          <Icon name="home" size={23} className="ti" />Start
        </button>
        <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')} aria-label="Statistik">
          <Icon name="stats" size={23} className="ti" />Statistik
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')} aria-label="Verlauf">
          <Icon name="history" size={23} className="ti" />Verlauf
        </button>
      </nav>

      {adding && (
        <AddModal
          type={adding.type}
          initialWhen={adding.initialWhen}
          durationSec={adding.durationSec}
          onSave={addEntry}
          onClose={() => setAdding(null)}
        />
      )}

      {showSettings && (
        <div className="modal-back" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚙️ Einstellungen</h3>
            <p className="msub">Deine Daten bleiben zu 100 % auf diesem Gerät. Kein Server, kein Mitlesen.</p>

            <button className="pro-banner" onClick={() => { setShowSettings(false); setShowPro(true) }}>
              <span className="pb-ic" aria-hidden="true">🧻</span>
              <span className="pb-txt">
                <strong>Klotracker Pro</strong>
                <small>
                  {pro.mode === 'unlocked' ? 'Aktiv – danke für den Support! 💛'
                    : pro.mode === 'trial' ? `Testphase: noch ${pro.daysLeft} ${pro.daysLeft === 1 ? 'Tag' : 'Tage'}`
                    : 'Testphase vorbei – Supporter werden'}
                </small>
              </span>
              <span className="pb-arrow" aria-hidden="true">›</span>
            </button>

            <div className="set-title">Individualisierung</div>
            <div className="set-section">
              <div className="set-row">
                <label htmlFor="set-name">Dein Name</label>
                <input id="set-name" className="set-input" value={settings.name || ''} placeholder="optional"
                  onChange={(e) => setSetting({ name: e.target.value.slice(0, 24) })} />
              </div>
              <div className="set-row">
                <label>Tagesziel Trinken</label>
                <div className="stepper">
                  <button aria-label="weniger" onClick={() => setSetting({ drinkGoalMl: Math.max(1000, settings.drinkGoalMl - 250) })} disabled={settings.drinkGoalMl <= 1000}>−</button>
                  <span className="val">{fmtMl(settings.drinkGoalMl)}</span>
                  <button aria-label="mehr" onClick={() => setSetting({ drinkGoalMl: Math.min(4000, settings.drinkGoalMl + 250) })} disabled={settings.drinkGoalMl >= 4000}>+</button>
                </div>
              </div>
              <div className="set-row">
                <label>Design</label>
                <div className="seg" role="group" aria-label="Design">
                  {[['auto', 'Auto'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([v, l]) => (
                    <button key={v} className={settings.theme === v ? 'on' : ''} onClick={() => setSetting({ theme: v })}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="set-row">
                <label htmlFor="set-humor">Humor &amp; Sprüche</label>
                <button id="set-humor" role="switch" aria-checked={settings.humor} className={`toggle ${settings.humor ? 'on' : ''}`} onClick={() => setSetting({ humor: !settings.humor })}>
                  <span />
                </button>
              </div>
            </div>

            <div className="set-title">Portionsgrößen (Getränke)</div>
            <div className="set-section">
              {DRINKS.map((d) => {
                const ml = settings.drinkSizes?.[d.key] ?? d.ml
                const setMl = (v) => setSetting({ drinkSizes: { ...settings.drinkSizes, [d.key]: Math.max(50, Math.min(1000, v)) } })
                return (
                  <div className="set-row" key={d.key}>
                    <label><Icon name={d.icon} size={18} className="set-drink-ic" /> {d.label}</label>
                    <div className="stepper">
                      <button aria-label={`${d.label} weniger`} onClick={() => setMl(ml - 50)} disabled={ml <= 50}>−</button>
                      <span className="val">{ml} ml</span>
                      <button aria-label={`${d.label} mehr`} onClick={() => setMl(ml + 50)} disabled={ml >= 1000}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="set-title">Daten &amp; mehr</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn ghost" onClick={loadDemo}>🎬 Beispieldaten laden (zum Ausprobieren)</button>
              <button className="btn ghost" onClick={doExport} disabled={!entries.length}>⬇️ Daten exportieren (JSON)</button>
              <button className="btn ghost" onClick={() => importRef.current?.click()}>📥 Daten importieren (Backup)</button>
              <input ref={importRef} type="file" accept="application/json,.json" onChange={importFile} style={{ display: 'none' }} />
              <button className="btn ghost" onClick={() => { setSettings((s) => ({ ...s, onboarded: false })); setShowSettings(false) }}>ℹ️ Einführung nochmal zeigen</button>
              <button className="btn ghost" style={{ color: 'var(--red)' }} onClick={clearAll} disabled={!entries.length}>🗑️ Alle Daten löschen</button>
            </div>
            <p className="disclaimer" style={{ marginTop: 16 }}>
              Klotracker v1 · Made mit 💛 und einer Rolle Klopapier. Keine medizinische App.
            </p>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn primary" onClick={() => setShowSettings(false)}>Schließen</button>
            </div>
          </div>
        </div>
      )}

      {showPro && <ProDialog status={pro} onUnlock={unlockPro} onClose={() => setShowPro(false)} onResetTrial={resetTrial} />}

      {!settings.onboarded && <Onboarding onDone={finishOnboarding} onLoadDemo={onboardWithDemo} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
