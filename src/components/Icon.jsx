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
