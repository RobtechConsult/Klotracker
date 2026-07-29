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
  ),
  // Getränke – im gleichen Umriss-Stil wie die Tab-Icons
  water: (
    <>
      <path d="M6.5 4.5h11l-1 14.4a1.3 1.3 0 0 1-1.3 1.1H8.8a1.3 1.3 0 0 1-1.3-1.1z" />
      <path d="M7.2 10h9.6" />
    </>
  ),
  coffee: (
    <>
      <path d="M4.5 7.5H15v6.5a4 4 0 0 1-4 4H8.5a4 4 0 0 1-4-4z" />
      <path d="M15 9h2.2a2.4 2.4 0 0 1 0 4.8H15" />
      <path d="M7.6 3.2c-.4.7.4 1.3 0 2.3" />
      <path d="M11 3.2c-.4.7.4 1.3 0 2.3" />
    </>
  ),
  tea: (
    <>
      <path d="M5 8h9.5v5a4.75 4.75 0 0 1-9.5 0z" />
      <path d="M14.5 9h1.7a2.1 2.1 0 0 1 0 4.2h-1.7" />
      <path d="M4 20.5h11.5" />
    </>
  ),
  bottle: (
    <>
      <path d="M10 3.2h4v2c0 .9.3 1.4 1 2.1.9.9 1.1 1.7 1.1 2.9V19a2 2 0 0 1-2 2H9.9a2 2 0 0 1-2-2v-8.8c0-1.2.2-2 1.1-2.9.7-.7 1-1.2 1-2.1z" />
      <path d="M9.5 12.5h5" />
    </>
  )
}

// Bristol-Silhouetten – bewusst kräftig und deutlich unterscheidbar.
// Sie füllen die ganze Icon-Fläche, damit sie auch klein gut erkennbar sind.
const FILL = {
  // 1 – einzelne harte Klümpchen (mehrere klar getrennte Kugeln)
  bristol1: (
    <>
      <circle cx="7" cy="7.5" r="3.1" />
      <circle cx="16.5" cy="7" r="2.7" />
      <circle cx="9.5" cy="16" r="3.6" />
      <circle cx="17.5" cy="15.5" r="3" />
    </>
  ),
  // 2 – klumpige, dicke Wurst (stark bucklige Kontur)
  bristol2: (
    <path d="M2.5 12c0-2.6 1.7-4 3.7-3.9 1.2 0 1.6 1.1 3 1.1s1.8-1.2 3.3-1.2 1.8 1.2 3.3 1.2c2 .1 3.7 1.2 3.7 3.8s-1.7 3.9-3.7 3.8c-1.5 0-1.9-1.2-3.3-1.2s-1.8 1.2-3.3 1.2-1.8-1.1-3-1.1C4.2 16 2.5 14.6 2.5 12z" />
  ),
  // 3 – Wurst mit Rissen (in Segmente „gebrochen")
  bristol3: (
    <>
      <path d="M2.5 12a4.2 4.2 0 0 1 4.2-4.2h.8v8.4h-.8A4.2 4.2 0 0 1 2.5 12z" />
      <rect x="9" y="7.8" width="6" height="8.4" rx="1.6" />
      <path d="M16.5 7.8h.8A4.2 4.2 0 0 1 17.3 16.2h-.8z" />
    </>
  ),
  // 4 – glatte, weiche Wurst (der Goldstandard: sauberer Riegel)
  bristol4: <rect x="2.5" y="8" width="19" height="8" rx="4" />,
  // 5 – weiche Klümpchen (wenige große, runde Blobs)
  bristol5: (
    <>
      <ellipse cx="7.2" cy="12" rx="4.7" ry="4.3" />
      <ellipse cx="16.4" cy="12.3" rx="4" ry="3.8" />
    </>
  ),
  // 6 – breiig, matschig (fluffige, ausgefranste Wolke)
  bristol6: (
    <path d="M5 17.5C3.3 17.5 2 16.2 2 14.5c0-1.4 1-2.6 2.4-2.9C4.7 9.4 6.3 8 8.2 8c.8 0 1.5.3 2.1.7C11 7.2 12.6 6.5 14.2 6.5c2.1 0 3.9 1.4 4.5 3.4.3-.1.7-.2 1-.2 1.9 0 3.4 1.4 3.6 3.3 1.2.2 2.2 1.2 2.2 2.5 0 1.4-1.2 2.5-2.6 2.5H5z" />
  ),
  // 7 – komplett flüssig (breite Pfütze mit welligem Rand)
  bristol7: (
    <path d="M1.5 15c1.8 0 1.8-1.5 3.6-1.5S6.9 15 8.7 15s1.8-1.5 3.6-1.5S14.1 15 15.9 15s1.8-1.5 3.6-1.5S21.3 15 22.5 15v2.4c0 1.1-.9 2.1-2.1 2.1H3.6c-1.2 0-2.1-.9-2.1-2.1z" />
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
