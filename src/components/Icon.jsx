import React from 'react'

// Eigenes Icon-Set im weichen Mascot-Stil (runde Formen). SVG erbt die Farbe
// über currentColor -> perfektes Light/Dark, kein Emoji-Wildwuchs zwischen
// Apple/Android, gestochen scharf und barrierefrei.
//
// Zwei Modi:
//  - 'stroke': Umriss-Icons (Tabs) – strokeWidth 2, runde Enden
//  - 'fill':   gefüllte Silhouetten (Bristol-Skala)

const STROKE = {
  home: (
    <>
      <path d="M3.5 11.5 12 4.5l8.5 7" />
      <path d="M5.5 10.5V19a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-8.5" />
      <path d="M9.8 20v-4.2a2.2 2.2 0 0 1 4.4 0V20" />
    </>
  ),
  stats: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-5.5" />
      <path d="M12 20V9" />
      <path d="M17 20v-8" />
    </>
  ),
  history: (
    <>
      <path d="M4.6 9.2A8 8 0 1 1 4 13" />
      <path d="M4.2 4.6v4.6h4.6" />
      <path d="M12 8.4V12l2.6 1.7" />
    </>
  )
}

const FILL = {
  // 1 – einzelne harte Klümpchen
  bristol1: (
    <>
      <circle cx="8" cy="8.6" r="2.3" />
      <circle cx="15.4" cy="8" r="1.9" />
      <circle cx="10.6" cy="14.6" r="2.7" />
      <circle cx="16.2" cy="14.2" r="2.1" />
    </>
  ),
  // 2 – klumpige, dicke Wurst
  bristol2: (
    <path d="M4 12c0-2.2 1.7-3.5 3.5-3.3 1 .1 1.3.8 2.6.8s1.6-.9 2.9-.8 1.6.9 2.7 1c1.8.2 2.3 1.3 2.3 2.3s-.5 2.1-2.3 2.3c-1.1.1-1.4 1-2.7 1s-1.6-.8-2.9-.8-1.6.7-2.6.8C5.7 15.5 4 14.2 4 12z" />
  ),
  // 3 – Wurst mit Rissen (leicht welliger Rücken)
  bristol3: (
    <path d="M3 12c0-1.7 1.3-3 3-3l1.3.02.9-.7.9.7H12l.9-.7.9.7 1.2.02c1.7 0 3 1.3 3 2.96s-1.3 3-3 3H6c-1.7 0-3-1.3-3-3z" />
  ),
  // 4 – glatte, weiche Wurst (der Goldstandard)
  bristol4: <rect x="3" y="9" width="18" height="6" rx="3" />,
  // 5 – weiche Klümpchen
  bristol5: (
    <path d="M4 12.4c0-2 1.6-3.5 3.6-3.5 1.7 0 2.5 1.1 2.5 1.1s.9-1.3 2.6-1.3c2 0 3.6 1.6 3.6 3.6s-1.6 3.6-3.6 3.6c-1.7 0-2.5-1.1-2.5-1.1s-.9 1.2-2.6 1.2C7.6 16 4 14.4 4 12.4z" />
  ),
  // 6 – breiig, matschig (fluffige Wolke)
  bristol6: (
    <path d="M5.5 15.5C4.1 15.5 3 14.4 3 13c0-1.2.9-2.3 2.1-2.5C5.4 9 6.8 8 8.4 8c.6 0 1.2.2 1.7.5C10.7 7.6 11.8 7 13 7c1.7 0 3.1 1.1 3.6 2.6.3-.1.6-.1.9-.1 1.6 0 2.9 1.2 3 2.7 1 .1 1.5.9 1.5 1.8 0 1-.9 1.8-2 1.8H5.5z" />
  ),
  // 7 – komplett flüssig (Pfütze mit welligem Rand)
  bristol7: (
    <path d="M3 14c1.5 0 1.5-1.1 3-1.1s1.5 1.1 3 1.1 1.5-1.1 3-1.1 1.5 1.1 3 1.1 1.5-1.1 3-1.1v2.6c0 .8-.7 1.5-1.6 1.5H4.6C3.7 17.5 3 16.8 3 16z" />
  )
}

export default function Icon({ name, size = 24, title, className }) {
  const stroke = STROKE[name]
  const fill = FILL[name]
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    className,
    role: title ? 'img' : undefined,
    'aria-hidden': title ? undefined : true,
    focusable: false
  }
  if (fill) {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        {title && <title>{title}</title>}
        {fill}
      </svg>
    )
  }
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {title && <title>{title}</title>}
      {stroke}
    </svg>
  )
}
