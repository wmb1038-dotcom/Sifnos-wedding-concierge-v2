import { useState, useMemo, useRef, useEffect } from 'react'
import { CATEGORIES } from '../data/places.js'

// Geographic bounds — slightly padded around the real island extents
const BOUNDS = { minLng: 24.620, maxLng: 24.790, minLat: 36.888, maxLat: 37.025 }
const VB_W = 340
const VB_H = 490
const MIN_W = VB_W / 6   // max zoom ≈ 6×
const MAX_W = VB_W

function project(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VB_W
  const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VB_H
  return { x, y }
}

function clampVB({ x, y, w, h }) {
  const margin = 30
  w = Math.max(MIN_W, Math.min(MAX_W, w))
  h = (w / VB_W) * VB_H
  x = Math.max(-margin, Math.min(VB_W + margin - w, x))
  y = Math.max(-margin, Math.min(VB_H + margin - h, y))
  return { x, y, w, h }
}

// Sifnos coastline — clockwise from north cape (37.012°N 24.698°E).
// Every vertex is projected from a real lat/lng via project(); the path is
// built with L segments for jagged coasts and Q curves only at smooth bays.
//
// Key geographic features encoded:
//   • Small bay on N coast just after the cape (192,61→184,67→204,67)
//   • NE headland (264-276, 97-140)
//   • Shallow cove below Kastro (272,140→260,153→270,153)
//   • Irregular SE coast: Glyfó/Faros/Apokofto coves (260-276, 237-297)
//   • Platis Gialos bay: E headland at (214,347), bottom at y=372, W exit at (160,354)
//   • Kamares bay: west coast at x≈70, port indent east to x=106, N exit at x=70,y=90
//   • NW coast curves NE from Kamares back to N cape
const OUTLINE = [
  'M 156,46',
  // ── North coast (cape → NE headland) ──────────────────────────────────────
  'L 172,53 L 192,61',
  'L 184,67 L 204,67',            // small bay notch right after cape
  'L 224,74 L 244,81 L 260,88 L 268,97',
  // ── East coast (NE headland → Kastro) ─────────────────────────────────────
  'L 276,107 L 276,118 L 276,130',
  'L 272,140',                     // Kastro headland
  'L 266,146 L 260,153',          // small cove below Kastro (indent west)
  'L 270,153 L 272,160 L 272,167 L 270,174 L 270,181 L 272,188',
  // ── East coast (Kastro → Faros) ───────────────────────────────────────────
  'L 274,195 L 274,202 L 274,209 L 276,216',
  'L 276,223 L 276,230 L 274,237 L 274,244 L 274,251',
  // ── SE coast: Glyfó / Faros / Apokofto coves ──────────────────────────────
  'L 272,258 L 268,265 L 264,269 L 262,272',
  'L 260,276 L 256,279 L 250,283 L 244,286',
  'L 236,290 L 228,297',
  // ── S coast sweeping SW toward Platis Gialos ──────────────────────────────
  'L 218,304 L 208,311 L 200,318 L 196,325 L 194,332',
  // ── Platis Gialos bay ─────────────────────────────────────────────────────
  'L 196,339 L 204,343 L 214,347', // E headland of bay
  'L 220,358 L 212,365',           // E wall of bay going south
  'L 200,372 L 188,372',           // bay bottom (beach runs E-W)
  'L 176,368 L 166,361 L 160,354', // W wall going north
  // ── SW coast heading NW ───────────────────────────────────────────────────
  'L 148,344 L 132,330 L 116,316 L 102,302 L 92,288',
  // ── West coast heading N ──────────────────────────────────────────────────
  'L 86,274 L 80,257 L 78,239 L 74,221',
  'L 70,203 L 70,185 L 70,173',
  // ── Kamares bay (port indent east to x=106 then back west) ────────────────
  'L 74,163 L 82,152 L 90,141 L 98,130 L 106,119', // S lip → port
  'L 90,108 L 78,97 L 70,90',                        // N lip → N entrance
  // ── NW coast back to N cape ───────────────────────────────────────────────
  'L 76,83 L 86,73 L 100,66 L 116,59 L 136,55 L 148,52',
  'Z',
].join(' ')

// Main road network
const ROADS = [
  // Kamares → Apollonia (main arterial, climbs east through the interior)
  'M 106,119 C 132,122 160,146 186,162 Q 196,168 204,172',
  // Apollonia ↔ Artemonas
  'M 204,172 L 198,147',
  // Apollonia → Kastro (NE along ridge)
  'M 204,172 C 220,162 240,150 258,140',
  // Apollonia → Platis Gialos (main south road)
  'M 204,172 C 204,220 204,278 200,332',
  // SE branch → Faros
  'M 218,298 C 236,282 254,268 272,254',
  // SE branch → Chrysopigi / Apokofto
  'M 228,304 C 242,292 252,282 260,276',
  // Artemonas / Apollonia → Vroulidia (NW road)
  'M 198,147 C 170,128 146,112 118,97',
  // Platis Gialos E connector (road along southern approach)
  'M 200,332 C 208,332 216,340 222,350',
]

// Static place-name labels shown directly on the map
const MAP_LABELS = [
  { ...project(36.977, 24.722), text: 'Apollonia',    anchor: 'middle', dy: -13, capital: true },
  { ...project(36.984, 24.719), text: 'Artemonas',    anchor: 'end',    dx: -8,  dy: -6  },
  { ...project(36.986, 24.749), text: 'Kastro',       anchor: 'start',  dx: 10,  dy:  4  },
  { ...project(36.992, 24.673), text: 'Kamares',      anchor: 'end',    dx: -13, dy:  5, ferry: true },
  { ...project(36.937, 24.722), text: 'Platis Gialos',anchor: 'middle', dy: 14                       },
  { ...project(36.954, 24.756), text: 'Faros',        anchor: 'start',  dx: 10,  dy:  4  },
  { ...project(36.948, 24.749), text: 'Chrysopigi',   anchor: 'end',    dx: -10, dy: -9  },
  { ...project(36.998, 24.679), text: 'Vroulidia',    anchor: 'end',    dx: -10, dy: -8  },
]

// Interior terrain — central Profitis Ilias ridge running N-S through the island,
// with NE arm toward Kastro and a SE branch toward the south.
const RIDGES = [
  'M 178,95  Q 181,122 183,150 Q 185,174 186,200', // N ridge spine
  'M 186,200 Q 188,226 190,254 Q 192,274 194,298', // S ridge spine
  'M 183,150 Q 208,148 232,146 Q 250,144 258,141', // NE arm → Kastro
  'M 186,200 Q 162,152 140,155 Q 120,158 110,160', // W arm toward Kamares
  'M 190,255 Q 202,268 214,282 Q 220,294 222,302', // SE branch
]

export default function IslandMap({ places, selectedId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [vb, setVb] = useState({ x: 0, y: 0, w: VB_W, h: VB_H })
  const [isPanning, setIsPanning] = useState(false)

  const svgRef = useRef(null)
  const vbRef = useRef({ x: 0, y: 0, w: VB_W, h: VB_H })
  const panRef = useRef(null)      // { clientX, clientY, startVB }
  const gestureRef = useRef(null)  // pinch state
  const didPanRef = useRef(false)  // suppress click after drag

  // Keep vbRef in sync so event handlers always see fresh vb without stale closures
  useEffect(() => { vbRef.current = vb }, [vb])

  // ── Wheel: zoom around cursor ──────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      // deltaMode 1 = lines; normalize to pixel-equivalent
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      const rect = el.getBoundingClientRect()
      const fracX = (e.clientX - rect.left) / rect.width
      const fracY = (e.clientY - rect.top) / rect.height
      setVb(prev => {
        // zoom in when scrolling up (delta < 0), out when scrolling down (delta > 0)
        const newW = prev.w * Math.pow(1.001, delta)
        const newH = (newW / VB_W) * VB_H
        // keep the SVG point under the cursor stationary
        const svgX = prev.x + fracX * prev.w
        const svgY = prev.y + fracY * prev.h
        return clampVB({ x: svgX - fracX * newW, y: svgY - fracY * newH, w: newW, h: newH })
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Touch: 1-finger pan + 2-finger pinch ──────────────────────────────────
  useEffect(() => {
    const el = svgRef.current
    if (!el) return

    const onTouchStart = (e) => {
      e.preventDefault()
      if (e.touches.length === 2) {
        const t0 = e.touches[0]; const t1 = e.touches[1]
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
        const rect = el.getBoundingClientRect()
        const midClientX = (t0.clientX + t1.clientX) / 2
        const midClientY = (t0.clientY + t1.clientY) / 2
        const midFracX = (midClientX - rect.left) / rect.width
        const midFracY = (midClientY - rect.top) / rect.height
        const sv = vbRef.current
        gestureRef.current = {
          startDist: dist,
          startVB: { ...sv },
          midFracX,
          midFracY,
          // fixed SVG point at the pinch midpoint
          midSVGX: sv.x + midFracX * sv.w,
          midSVGY: sv.y + midFracY * sv.h,
        }
        panRef.current = null
      } else if (e.touches.length === 1) {
        const t = e.touches[0]
        gestureRef.current = null
        panRef.current = {
          clientX: t.clientX,
          clientY: t.clientY,
          startVB: { ...vbRef.current },
        }
        didPanRef.current = false
      }
    }

    const onTouchMove = (e) => {
      e.preventDefault()
      if (e.touches.length === 2 && gestureRef.current) {
        const t0 = e.touches[0]; const t1 = e.touches[1]
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
        const { startDist, startVB, midFracX, midFracY, midSVGX, midSVGY } = gestureRef.current
        // fingers spreading apart → dist > startDist → scale < 1 → viewBox shrinks → zoom in
        const scale = startDist / dist
        const newW = startVB.w * scale
        const newH = (newW / VB_W) * VB_H
        // keep midSVG point at midFrac position in the new viewBox
        setVb(clampVB({
          x: midSVGX - midFracX * newW,
          y: midSVGY - midFracY * newH,
          w: newW, h: newH,
        }))
      } else if (e.touches.length === 1 && panRef.current) {
        const t = e.touches[0]
        const rect = el.getBoundingClientRect()
        const dx = (t.clientX - panRef.current.clientX) / rect.width * panRef.current.startVB.w
        const dy = (t.clientY - panRef.current.clientY) / rect.height * panRef.current.startVB.h
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) didPanRef.current = true
        setVb(clampVB({
          x: panRef.current.startVB.x - dx,
          y: panRef.current.startVB.y - dy,
          w: panRef.current.startVB.w,
          h: panRef.current.startVB.h,
        }))
      }
    }

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) gestureRef.current = null
      if (e.touches.length === 0) panRef.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  // ── Mouse drag: pan ────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.button !== 0) return
    panRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startVB: { ...vbRef.current },
    }
    didPanRef.current = false
    setIsPanning(true)
  }

  const onMouseMove = (e) => {
    if (!panRef.current) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = (e.clientX - panRef.current.clientX) / rect.width * panRef.current.startVB.w
    const dy = (e.clientY - panRef.current.clientY) / rect.height * panRef.current.startVB.h
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didPanRef.current = true
    setVb(clampVB({
      x: panRef.current.startVB.x - dx,
      y: panRef.current.startVB.y - dy,
      w: panRef.current.startVB.w,
      h: panRef.current.startVB.h,
    }))
  }

  const onMouseUp = () => {
    panRef.current = null
    setIsPanning(false)
  }

  // ── Zoom control buttons ───────────────────────────────────────────────────
  const isZoomed = vb.w < VB_W * 0.98

  const zoomIn = () => setVb(prev => {
    const cx = prev.x + prev.w / 2; const cy = prev.y + prev.h / 2
    const newW = prev.w * 0.65; const newH = (newW / VB_W) * VB_H
    return clampVB({ x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH })
  })

  const zoomOut = () => setVb(prev => {
    const cx = prev.x + prev.w / 2; const cy = prev.y + prev.h / 2
    const newW = prev.w / 0.65; const newH = (newW / VB_W) * VB_H
    return clampVB({ x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH })
  })

  const resetZoom = () => setVb({ x: 0, y: 0, w: VB_W, h: VB_H })

  // ── Tooltip: percentage-positioned, accounts for current viewBox ──────────
  const projected = useMemo(
    () => places.map(p => ({ ...p, ...project(p.lat, p.lng) })),
    [places]
  )

  const activeId = hoveredId ?? selectedId
  const activePlace = projected.find(p => p.id === activeId)

  let tooltipStyle = null
  let tooltipBelow = false
  let showTooltip = false
  if (activePlace) {
    const pctX = (activePlace.x - vb.x) / vb.w * 100
    const pctY = (activePlace.y - vb.y) / vb.h * 100
    showTooltip = pctX >= -2 && pctX <= 102 && pctY >= -2 && pctY <= 102
    if (showTooltip) {
      tooltipBelow = pctY < 18
      let tx = '-50%'
      if (pctX < 18) tx = '-6px'
      if (pctX > 82) tx = 'calc(-100% + 6px)'
      const ty = tooltipBelow ? '12px' : 'calc(-100% - 12px)'
      tooltipStyle = {
        left: `${Math.max(0, Math.min(100, pctX))}%`,
        top:  `${Math.max(0, Math.min(100, pctY))}%`,
        transform: `translateX(${tx}) translateY(${ty})`,
      }
    }
  }

  return (
    <div className="island-map-wrap" style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        className="island-map"
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Map of Sifnos"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          cursor: isPanning ? 'grabbing' : (isZoomed ? 'grab' : 'default'),
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <defs>
          {/* Subtle sea wave pattern */}
          <pattern id="sea" patternUnits="userSpaceOnUse" width="18" height="18" patternTransform="rotate(12)">
            <path d="M 0 9 Q 4.5 5 9 9 T 18 9" stroke="#5b8aa8" strokeWidth="0.55" fill="none" opacity="0.22" />
          </pattern>
          {/* Light paper grain on land */}
          <filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence baseFrequency="0.9" numOctaves="3" seed="7" />
            <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.07 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="pin-drop" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Sea */}
        <rect width={VB_W} height={VB_H} fill="#ddeaf2" />
        <rect width={VB_W} height={VB_H} fill="url(#sea)" />

        {/* Island fill */}
        <path d={OUTLINE} fill="#f4ead8" stroke="#b8956a" strokeWidth="1.4" strokeLinejoin="round" />
        {/* Paper grain overlay */}
        <path d={OUTLINE} filter="url(#grain)" fill="white" />

        {/* Interior hill ridges */}
        <g stroke="#c8a878" strokeWidth="0.7" fill="none" opacity="0.45" strokeLinecap="round">
          {RIDGES.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* Road network */}
        <g stroke="#c9a06a" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
          {ROADS.map((d, i) => <path key={i} d={d} />)}
        </g>
        {/* Road casing (lighter line on top gives a two-tone road look) */}
        <g stroke="#f0dbb8" strokeWidth="0.55" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
          {ROADS.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* Village dots + labels */}
        {MAP_LABELS.map((lbl, i) => {
          const lx = lbl.x + (lbl.dx || 0)
          const ly = lbl.y + (lbl.dy || 0)
          return (
            <g key={i}>
              <circle
                cx={lbl.x} cy={lbl.y}
                r={lbl.capital ? 3.5 : 2.4}
                fill={lbl.capital ? '#1a2738' : '#6b7a8d'}
                stroke="#f4ead8" strokeWidth="0.8"
              />
              {lbl.ferry && (
                <g transform={`translate(${lbl.x - 18}, ${lbl.y - 4})`} fill="#1a2738" opacity="0.65">
                  <text fontSize="8" fontFamily="sans-serif">⚓</text>
                </g>
              )}
              <text
                x={lx} y={ly}
                textAnchor={lbl.anchor || 'middle'}
                fontSize={lbl.capital ? 7.5 : 6.2}
                fontFamily="'Karla', sans-serif"
                fontWeight={lbl.capital ? '700' : '500'}
                fill="#1a2738"
                opacity="0.82"
                letterSpacing="0.04em"
              >
                {lbl.text.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* Compass rose */}
        <g transform="translate(310,34)" fill="#1a2738" opacity="0.45">
          <circle cx="0" cy="0" r="11" fill="none" stroke="#1a2738" strokeWidth="0.6" />
          <path d="M 0,-11 L 2.2,0 L 0,11 L -2.2,0 Z" fill="#1a2738" />
          <path d="M -11,0 L 0,-2.2 L 11,0 L 0,2.2 Z" fill="#1a2738" opacity="0.3" />
          <text y="-14" textAnchor="middle" fontSize="7" fontFamily="serif" fontStyle="italic" fill="#1a2738" opacity="0.7">N</text>
        </g>

        {/* Aegean Sea label */}
        <text x="22" y="452" fontFamily="serif" fontStyle="italic" fontSize="8.5" fill="#3d6a88" opacity="0.65">
          Aegean Sea
        </text>

        {/* Ferry route hint */}
        <g opacity="0.45">
          <line x1="68" y1="119" x2="22" y2="119" stroke="#3d6a88" strokeWidth="0.8" strokeDasharray="3,3" />
          <text x="20" y="116" textAnchor="end" fontFamily="serif" fontStyle="italic" fontSize="6.5" fill="#3d6a88">
            Piraeus
          </text>
          <text x="20" y="124" textAnchor="end" fontFamily="serif" fontStyle="italic" fontSize="5.5" fill="#3d6a88">
            2.5 hrs
          </text>
        </g>

        {/* Scale bar */}
        <g transform="translate(22, 468)" opacity="0.55">
          <line x1="0" y1="0" x2="40" y2="0" stroke="#1a2738" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="4" stroke="#1a2738" strokeWidth="1" />
          <line x1="40" y1="0" x2="40" y2="4" stroke="#1a2738" strokeWidth="1" />
          <text x="20" y="12" textAnchor="middle" fontSize="6" fontFamily="sans-serif" fill="#1a2738">2 km</text>
        </g>

        {/* Place pins */}
        {projected.map(p => {
          const cat = CATEGORIES[p.category]
          const isActive = p.id === activeId
          return (
            <g
              key={p.id}
              transform={`translate(${p.x},${p.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (didPanRef.current) return
                onSelect(p.id === selectedId ? null : p.id)
              }}
              onTouchEnd={() => {
                if (didPanRef.current) return
                onSelect(p.id === selectedId ? null : p.id)
              }}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              filter="url(#pin-drop)"
              className={`pin${isActive ? ' selected' : ''}`}
            >
              <path
                d="M 0,-15 C -6,-15 -10,-11 -10,-6 C -10,-1 0,6 0,6 C 0,6 10,-1 10,-6 C 10,-11 6,-15 0,-15 Z"
                fill={isActive ? '#1a2738' : (cat?.color || '#1a2738')}
                stroke="#f4ead8"
                strokeWidth={isActive ? 1.8 : 0.9}
              />
              <circle cx="0" cy="-8" r={isActive ? 3.8 : 3} fill="#f4ead8" />
            </g>
          )
        })}
      </svg>

      {/* Tooltip — rendered outside SVG so it never shifts pin layout.
           Visibility check ensures off-screen (panned/zoomed) pins hide their tooltip. */}
      {showTooltip && activePlace && (
        <div
          className={`map-tooltip${tooltipBelow ? ' below' : ''}`}
          style={tooltipStyle}
          onMouseEnter={() => setHoveredId(activePlace.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <span className="map-tooltip-name">{activePlace.name}</span>
          <span className="map-tooltip-cat">{CATEGORIES[activePlace.category]?.label}</span>
          <a
            className="map-tooltip-link"
            href={`#place-${activePlace.id}`}
            onClick={(e) => {
              e.preventDefault()
              onSelect(activePlace.id)
              setTimeout(() => {
                document.getElementById(`place-${activePlace.id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 40)
            }}
          >
            View info ↓
          </a>
        </div>
      )}

      {/* Zoom controls — bottom-right corner */}
      <div className="map-zoom-controls">
        <button className="map-zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button className="map-zoom-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
        {isZoomed && (
          <button className="map-zoom-btn map-zoom-reset" onClick={resetZoom} aria-label="Reset zoom">⊙</button>
        )}
      </div>
    </div>
  )
}
