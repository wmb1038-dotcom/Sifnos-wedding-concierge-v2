import { useState, useMemo } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import IslandMap from '../components/IslandMap.jsx'
import AppFooter from '../components/AppFooter.jsx'
import sifnosData from '../data/sifnos-places.json'
import { PLACES as CURATED_PLACES, CATEGORIES, COUPLES_MAP_URL } from '../data/places.js'
import { useWeather } from '../lib/weather.js'
import { useT } from '../i18n/index.jsx'

// ---------------------------------------------------------------------------
// Data merging
// ---------------------------------------------------------------------------

const PRICE_LABELS = { 0: 'free', 1: '€', 2: '€€', 3: '€€€', 4: '€€€€' }

// Build a name → Google place lookup for augmenting curated entries
const GOOGLE_BY_NORM = new Map(
  (sifnosData.places || [])
    .filter(p => !p._stale)
    .map(p => [p.name?.toLowerCase().trim(), p])
)

// All curated places, augmented with Google ratings/hours where names match
const AUGMENTED_CURATED = CURATED_PLACES.map(p => {
  const gp = GOOGLE_BY_NORM.get(p.name?.toLowerCase().trim())
  return {
    ...p,
    source: gp ? 'google' : 'curated',
    rating: gp?.rating ?? null,
    ratingCount: gp?.ratingCount ?? null,
    openingHours: gp?.openingHours ?? null,
    priceLevel: gp?.priceLevel ?? null,
  }
})

// Google-only places: non-picks not matching any curated name
const CURATED_NAMES_LOWER = new Set(CURATED_PLACES.map(p => p.name?.toLowerCase().trim()))
const GOOGLE_ONLY = (sifnosData.places || [])
  .filter(p => !p._stale && !p.couplePick && !CURATED_NAMES_LOWER.has(p.name?.toLowerCase().trim()))
  .map(p => ({
    id: p.id,
    name: p.name,
    category: p.category || 'other',
    couplePick: false,
    lat: p.location?.lat ?? null,
    lng: p.location?.lng ?? null,
    mapsUrl: p.googleMapsUri || '',
    address: p.address || '',
    rating: p.rating ?? null,
    ratingCount: p.ratingCount ?? null,
    priceLevel: p.priceLevel ?? null,
    openingHours: p.openingHours ?? null,
    source: 'google',
  }))

const ALL_PLACES = [...AUGMENTED_CURATED, ...GOOGLE_ONLY]

// ---------------------------------------------------------------------------
// Open-hours helper (Athens time)
// ---------------------------------------------------------------------------

function isOpenNow(openingHours) {
  if (!openingHours?.periods?.length) return null
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Athens',
      weekday: 'short',
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(now)
    const byType = Object.fromEntries(parts.map(p => [p.type, p.value]))
    const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const gday = dayMap[byType.weekday] ?? -1
    const hour = parseInt(byType.hour, 10) % 24
    const minute = parseInt(byType.minute, 10)
    const nowMins = (isNaN(hour) ? 0 : hour) * 60 + (isNaN(minute) ? 0 : minute)

    for (const p of openingHours.periods) {
      const o = p.open || {}
      const c = p.close || {}
      if (o.day === undefined) continue
      const openMins = (o.hour ?? 0) * 60 + (o.minute ?? 0)
      if (c.day === undefined) {
        if (o.day === gday) return true
        continue
      }
      const closeMins = (c.hour ?? 0) * 60 + (c.minute ?? 0)
      if (o.day === c.day) {
        if (gday === o.day && nowMins >= openMins && nowMins < closeMins) return true
      } else {
        if (gday === o.day && nowMins >= openMins) return true
        if (gday === c.day && nowMins < closeMins) return true
      }
    }
    return false
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Filter definitions
// ---------------------------------------------------------------------------

const FILTER_IDS = [
  { id: 'all',        tKey: 'all' },
  { id: 'restaurant', tKey: 'eat' },
  { id: 'beach',      tKey: 'beaches' },
  { id: 'sunset',     tKey: 'sunsets' },
  { id: 'pottery',    tKey: 'pottery' },
  { id: 'village',    tKey: 'villages' },
  { id: 'farm',       tKey: 'other' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SifnosTab({ onAsk }) {
  const t = useT()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [picksOnly, setPicksOnly] = useState(true)

  const filtered = useMemo(() => {
    let places = picksOnly ? ALL_PLACES.filter(p => p.couplePick) : ALL_PLACES
    if (activeFilter === 'all') return places
    if (activeFilter === 'farm') return places.filter(p =>
      p.category === 'farm' || p.category === 'rental' || p.category === 'monastery' || p.category === 'other'
    )
    return places.filter(p => p.category === activeFilter)
  }, [activeFilter, picksOnly])

  return (
    <div className="page page-sifnos">
      <PageHeader
        eyebrow={t('sifnos.eyebrow')}
        title="<span>Caro &amp; Chris's</span> <em>Sifnos</em>"
        subtitle={t('sifnos.subtitle')}
      />

      <section className="card card-map">
        <IslandMap places={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        <a className="btn-link map-external" href={COUPLES_MAP_URL} target="_blank" rel="noopener noreferrer">
          <Icon name="map" size={14} /> {t('sifnos.openMap')}
        </a>
      </section>

      <div className="picks-toggle">
        <button
          className={`picks-toggle-btn ${picksOnly ? 'active' : ''}`}
          onClick={() => { setPicksOnly(!picksOnly); setSelectedId(null) }}
        >
          ★ {t('sifnos.picksOnly')}
        </button>
      </div>

      <div className="filter-bar" role="tablist" aria-label="Filter places">
        {FILTER_IDS.map(group => (
          <button
            key={group.id}
            className={`filter-chip ${activeFilter === group.id ? 'active' : ''}`}
            onClick={() => { setActiveFilter(group.id); setSelectedId(null) }}
            role="tab"
            aria-selected={activeFilter === group.id}
          >
            {t(`sifnos.filters.${group.tKey}`)}
          </button>
        ))}
      </div>

      {activeFilter === 'beach' && <MeltemiNote />}

      <ul className="place-list">
        {filtered.map(place => (
          <PlaceCard
            key={place.id}
            place={place}
            expanded={selectedId === place.id}
            onClick={() => setSelectedId(selectedId === place.id ? null : place.id)}
            onAsk={onAsk}
          />
        ))}
      </ul>

      <p className="google-attr-note">{t('sifnos.googleAttribution')}</p>

      <AppFooter />
    </div>
  )
}

function PlaceCard({ place, expanded, onClick, onAsk }) {
  const t = useT()
  const cat = CATEGORIES[place.category] || CATEGORIES['restaurant']
  const placeT = t(`sifnos.places.${place.id}`) || {}
  const subtitle = placeT.subtitle || place.subtitle || place.address?.split(',')[0] || ''
  const description = placeT.description || place.description || ''
  const tags = t('sifnos.tags') || {}
  const openNow = expanded ? isOpenNow(place.openingHours) : null

  return (
    <li id={`place-${place.id}`} className={`place-card ${expanded ? 'expanded' : ''}`}>
      <button className="place-card-head" onClick={onClick}>
        <span className="place-cat-pin" style={{ color: cat?.color }} aria-hidden="true">
          <Icon name={cat?.icon || 'pin'} size={16} />
        </span>
        <div className="place-card-text">
          <h3 className="place-name">
            {place.name}
            {place.couplePick && <span className="couple-pick-badge">Caro &amp; Chris</span>}
          </h3>
          <p className="place-subtitle">{subtitle}</p>
        </div>
        <span className="place-chevron" aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="place-card-body">
          {description && <p className="place-description">{description}</p>}
          {(place.rating != null || place.priceLevel != null || openNow != null) && (
            <div className="place-rating-row">
              {place.rating != null && (
                <span className="place-rating">
                  {place.rating}★ <span className="google-attr-label">Google</span>
                  {place.ratingCount ? ` (${place.ratingCount.toLocaleString()})` : ''}
                </span>
              )}
              {place.priceLevel != null && PRICE_LABELS[place.priceLevel] && (
                <span className="place-price">{PRICE_LABELS[place.priceLevel]}</span>
              )}
              {openNow === true && <span className="place-open-badge open">{t('sifnos.openNow')}</span>}
              {openNow === false && <span className="place-open-badge closed">{t('sifnos.closed')}</span>}
            </div>
          )}
          {place.tags && (
            <div className="place-tags">
              {place.tags.map(tag => (
                <span key={tag} className="tag">{tags[tag] || tag}</span>
              ))}
            </div>
          )}
          <div className="place-actions">
            {place.mapsUrl && (
              <a className="btn-primary small" href={place.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="map" size={14} /> Maps
              </a>
            )}
            {place.bookingUrl && (
              <a className="btn-secondary small" href={place.bookingUrl} target="_blank" rel="noopener noreferrer">
                Book
              </a>
            )}
            <button
              className="btn-secondary small"
              onClick={() => onAsk(`Tell me more about ${place.name}.`, `place-${place.id}`)}
            >
              <Icon name="ask" size={14} /> Ask
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

function MeltemiNote() {
  const t = useT()
  const { weather } = useWeather()
  if (!weather) return null
  if (weather.isMeltemi) {
    return (
      <div className="weather-note inline">
        {t('sifnos.meltemiNote')}
      </div>
    )
  }
  return (
    <div className="weather-note inline subtle">
      {t('sifnos.windNote', { direction: weather.windDirection, speed: weather.windKmh })}
    </div>
  )
}
