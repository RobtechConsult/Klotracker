import React, { useEffect, useMemo, useState } from 'react'
import { loadEntries, saveEntries, makeId, loadSettings, saveSettings, exportJSON } from './lib/storage.js'
import { predictNextStool } from './lib/prediction.js'
import { countToday, streakDays, averagePerDay } from './lib/stats.js'
import { tipOfNow } from './lib/tips.js'
import { makeDemoEntries } from './lib/demo.js'

import PredictionCard from './components/PredictionCard.jsx'
import DayChart from './components/DayChart.jsx'
import HourClock from './components/HourClock.jsx'
import HealthCheck from './components/HealthCheck.jsx'
import BristolChart from './components/BristolChart.jsx'
import History from './components/History.jsx'
import AddModal from './components/AddModal.jsx'

export default function App() {
  const [entries, setEntries] = useState(() => loadEntries())
  const [settings, setSettings] = useState(() => loadSettings())
  const [tab, setTab] = useState('home')
  const [adding, setAdding] = useState(null) // 'stool' | 'urine' | null
  const [toast, setToast] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const now = new Date()

  useEffect(() => saveEntries(entries), [entries])
  useEffect(() => saveSettings(settings), [settings])

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
    flash(data.type === 'stool' ? 'Stuhlgang gespeichert 💩' : 'Wasserlassen gespeichert 💧')
  }

  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id))

  const loadDemo = () => {
    setEntries(makeDemoEntries(now))
    setShowSettings(false)
    flash('Beispieldaten geladen 🎬')
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
          <p className="sub">Tracken mit Augenzwinkern</p>
        </div>
        <div className="spacer" />
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Einstellungen">⚙️</button>
      </header>

      {tab === 'home' && (
        <>
          <div className="card" style={{ padding: 14 }}>
            <div className="quick">
              <button className="big-btn stool" onClick={() => setAdding('stool')}>
                <span className="emoji">💩</span>
                Stuhlgang
                <span className="sub">jetzt eintragen</span>
              </button>
              <button className="big-btn urine" onClick={() => setAdding('urine')}>
                <span className="emoji">💧</span>
                Wasserlassen
                <span className="sub">jetzt eintragen</span>
              </button>
            </div>
          </div>

          <div className="tiles">
            <div className="tile"><div className="num">{stoolToday}</div><div className="lbl">💩 heute</div></div>
            <div className="tile"><div className="num">{urineToday}</div><div className="lbl">💧 heute</div></div>
            <div className="tile"><div className="num">{streak}</div><div className="lbl">🔥 Tage-Serie</div></div>
          </div>

          <PredictionCard prediction={prediction} />

          <div className="card tip">
            <div className="eyebrow">Spruch des Moments</div>
            <p className="quote" style={{ margin: '8px 0 0' }}>„{tipOfNow(tipSeed)}"</p>
          </div>
        </>
      )}

      {tab === 'stats' && (
        <>
          <div className="tiles" style={{ marginBottom: 4 }}>
            <div className="tile"><div className="num">{stoolAvg.toFixed(1)}</div><div className="lbl">Ø 💩 / Tag</div></div>
            <div className="tile"><div className="num">{averagePerDay(entries, 'urine', 30, now).toFixed(1)}</div><div className="lbl">Ø 💧 / Tag</div></div>
            <div className="tile"><div className="num">{entries.length}</div><div className="lbl">Einträge gesamt</div></div>
          </div>
          <HourClock entries={entries} prediction={prediction} now={now} />
          <DayChart entries={entries} days={7} now={now} />
          <BristolChart entries={entries} />
          <HealthCheck entries={entries} now={now} />
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="section-title" style={{ marginTop: 8 }}>Verlauf</div>
          <History entries={entries} onDelete={deleteEntry} now={now} />
        </>
      )}

      <nav className="tabbar">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>
          <span className="ti">🏠</span>Start
        </button>
        <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
          <span className="ti">📊</span>Statistik
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          <span className="ti">📜</span>Verlauf
        </button>
      </nav>

      {adding && <AddModal type={adding} onSave={addEntry} onClose={() => setAdding(null)} />}

      {showSettings && (
        <div className="modal-back" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚙️ Einstellungen</h3>
            <p className="msub">Deine Daten bleiben zu 100 % auf diesem Gerät. Kein Server, kein Mitlesen.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn ghost" onClick={loadDemo}>🎬 Beispieldaten laden (zum Ausprobieren)</button>
              <button className="btn ghost" onClick={doExport} disabled={!entries.length}>⬇️ Daten exportieren (JSON)</button>
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
