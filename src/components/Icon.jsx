// Hand-tuned SVG icons. All use currentColor so they take on the surrounding
// text color, which lets us theme them per-category via CSS.

const ICONS = {
  sun: <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
  </>,
  'cloud-sun': <>
    <circle cx="8" cy="8" r="3" />
    <path d="M16 18h-7a3 3 0 0 1 0-6 4 4 0 0 1 7.6-1A3.5 3.5 0 0 1 16 18z" />
  </>,
  cloud: <path d="M17 18h-9a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4 4 0 0 1 17 18z" />,
  rain: <>
    <path d="M17 14h-9a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4 4 0 0 1 17 14z" />
    <path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
  </>,
  storm: <>
    <path d="M17 14h-9a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4 4 0 0 1 17 14z" />
    <path d="M11 16l-2 4h3l-1 3" />
  </>,
  glass: <>
    <path d="M8 4h8l-1 8a3 3 0 0 1-6 0z" />
    <path d="M12 12v6M9 21h6" />
  </>,
  rings: <>
    <circle cx="9" cy="14" r="5" />
    <circle cx="15" cy="14" r="5" />
    <path d="M7 6l2 3M17 6l-2 3" />
  </>,
  olive: <>
    <ellipse cx="12" cy="13" rx="4" ry="6" transform="rotate(-30 12 13)" />
    <path d="M14 8c1-2 3-3 5-3M14 8c-1 0-1.5-1-1-2" />
  </>,
  plate: <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
  </>,
  music: <>
    <path d="M9 18V6l10-2v12" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="16" r="2" />
  </>,
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  fork: <>
    <path d="M8 3v6a2 2 0 0 0 2 2h0v10" />
    <path d="M6 3v4M10 3v4" />
    <path d="M16 3c-1.5 0-2 1-2 3v6h2" />
    <path d="M16 12v9" />
  </>,
  wave: <>
    <path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
  </>,
  pot: <>
    <path d="M7 10h10v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
  </>,
  cross: <path d="M12 3v18M7 8h10" />,
  house: <>
    <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </>,
  leaf: <>
    <path d="M5 19c0-8 5-13 14-13 0 8-5 13-14 13z" />
    <path d="M5 19l8-8" />
  </>,
  car: <>
    <path d="M5 13l1.5-4a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 13" />
    <path d="M3 13h18v5h-2v2h-2v-2H7v2H5v-2H3z" />
    <circle cx="7.5" cy="16" r="1" />
    <circle cx="16.5" cy="16" r="1" />
  </>,
  bus: <>
    <path d="M5 17h14V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
    <path d="M5 12h14M9 17v2M15 17v2" />
    <circle cx="8" cy="15" r="0.8" />
    <circle cx="16" cy="15" r="0.8" />
  </>,
  taxi: <>
    <path d="M5 13l1.5-4a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 13" />
    <path d="M3 13h18v5h-2v2h-2v-2H7v2H5v-2H3z" />
    <path d="M9 7h6V5H9z" />
    <circle cx="7.5" cy="16" r="1" />
    <circle cx="16.5" cy="16" r="1" />
  </>,
  phone: <path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  pin: <>
    <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </>,
  calendar: <>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 9h16M8 3v4M16 3v4" />
  </>,
  map: <>
    <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
    <path d="M9 4v16M15 6v16" />
  </>,
  ask: <>
    <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    <path d="M9 10a3 3 0 0 1 6 0c0 2-3 2-3 4" />
  </>,
  ferry: <>
    <path d="M3 17c2 1 4 1 6 0s4-1 6 0 4 1 6 0" />
    <path d="M5 14l1-4h12l1 4" />
    <path d="M12 4v6M9 7h6" />
  </>,
  euro: <>
    <path d="M17 6a7 7 0 1 0 0 12" />
    <path d="M5 10h8M5 14h8" />
  </>,
  bag: <>
    <path d="M5 9h14l-1 11H6z" />
    <path d="M9 9V6a3 3 0 0 1 6 0v3" />
  </>,
  chat: <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z" />,
  wind: <>
    <path d="M3 8h12a3 3 0 1 0-3-3" />
    <path d="M3 12h17a3 3 0 1 1-3 3" />
    <path d="M3 16h9" />
  </>,
  shield: <path d="M12 3L4 7v5c0 4.8 3.4 9.3 8 10.9C16.6 21.3 20 16.8 20 12V7z" />,
  building: <>
    <path d="M3 21V7l9-4 9 4v14H3z" />
    <rect x="9" y="14" width="6" height="7" />
    <path d="M8 10h2M14 10h2M8 13h2M14 13h2" />
  </>,
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.5 }) {
  const path = ICONS[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon icon-${name} ${className}`}
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}
