import { useState, useMemo } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import IslandMap from '../components/IslandMap.jsx'
import AppFooter from '../components/AppFooter.jsx'
import { PLACES, CATEGORIES, COUPLES_MAP_URL } from '../data/places.js'
import { useWeather } from '../lib/weather.js'
import { useT } from '../i18n/index.jsx'

const FILTER_IDS = [
  { id: 'all',        tKey: 'all' },
  { id: 'restaurant', tKey: 'eat' },
  { id: 'beach',      tKey: 'beaches' },
  { id: 'sunset',     tKey: 'sunsets' },
  { id: 'pottery',    tKey: 'pottery' },
  { id: 'village',    tKey: 'villages' },
  { id: 'farm',       tKey: 'other' },
]

export default function SifnosTab({ onAsk }) {
  const t = useT()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return PLACES
    if (activeFilter === 'farm') return PLACES.filter(p => p.category === 'farm' || p.category === 'rental' || p.category === 'monastery')
    return PLACES.filter(p => p.category === activeFilter)
  }, [activeFilter])

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

      <AppFooter />
    </div>
  )
}

function PlaceCard({ place, expanded, onClick, onAsk }) {
  const t = useT()
  const cat = CATEGORIES[place.category]
  const placeT = t(`sifnos.places.${place.id}`) || {}
  const subtitle = placeT.subtitle || place.subtitle || ''
  const description = placeT.description || place.description || ''
  const tags = t('sifnos.tags') || {}

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
          <p className="place-description">{description}</p>
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
