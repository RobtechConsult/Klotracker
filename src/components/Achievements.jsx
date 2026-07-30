import React from 'react'
import { computeAchievements, achievementSummary } from '../lib/achievements.js'

export default function Achievements({ entries, settings, now }) {
  const list = computeAchievements(entries, settings, now)
  const { done, total } = achievementSummary(list)

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div className="eyebrow" style={{ flex: 1 }}>Erfolge</div>
        <div className="ach-count">{done}/{total} freigeschaltet</div>
      </div>
      <h2 style={{ marginTop: 4 }}>Deine Abzeichen 🏅</h2>

      <div className="ach-grid">
        {list.map((a) => {
          const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : 0
          return (
            <div key={a.key} className={`ach ${a.achieved ? 'on' : 'off'}`}>
              <div className="ach-emoji" aria-hidden="true">{a.achieved ? a.emoji : '🔒'}</div>
              <div className="ach-body">
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
                {!a.achieved && a.progress && (
                  <div className="ach-prog" title={`${a.progress.current}/${a.progress.target}`}>
                    <div style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
