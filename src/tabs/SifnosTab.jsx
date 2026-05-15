import { useState, useMemo } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import IslandMap from '../components/IslandMap.jsx'
import AppFooter from '../components/AppFooter.jsx'
import { PLACES, CATEGORIES, COUPLES_MAP_URL } from '../data/places.js'
import { useWeather } from '../lib/weather.js'

const FILTER_GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'restaurant', label: 'Eat' },
  { id: 'beach', label: 'Beaches' },
  { id: 'sunset', label: 'Sunsets' },
  { id: 'pottery', label: 'Pottery' },
  { id: 'village', label: 'Villages' },
  { id: 'farm', label: 'Other' },  // farm + rental
]

export default function SifnosTab({ onAsk }) {
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
        eyebrow="The island"
        title="<span>Caro & Chris's</span> <em>Sifnos</em>"
        subtitle="The beaches, tavernas, sunset spots, and pottery workshops the couple wants you to find."
      />

      {/* MAP */}
      <section className="card card-map">
        <IslandMap places={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        <a className="btn-link map-external" href={COUPLES_MAP_URL} target="_blank" rel="noopener noreferrer">
          <Icon name="map" size={14} /> Open Caro &amp; Chris's full Google map →
        </a>
      </section>

      {/* FILTERS */}
      <div className="filter-bar" role="tablist" aria-label="Filter places">
        {FILTER_GROUPS.map(group => (
          <button
            key={group.id}
            className={`filter-chip ${activeFilter === group.id ? 'active' : ''}`}
            onClick={() => { setActiveFilter(group.id); setSelectedId(null); }}
            role="tab"
            aria-selected={activeFilter === group.id}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* BEACH-AWARE WEATHER STRIP */}
      {activeFilter === 'beach' && <MeltemiNote />}

      {/* PLACE LIST */}
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
  const cat = CATEGORIES[place.category]
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
          <p className="place-subtitle">{place.subtitle}</p>
        </div>
        <span className="place-chevron" aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="place-card-body">
          <p className="place-description" dangerouslySetInnerHTML={{ __html: place.description }} />
          {place.tags && (
            <div className="place-tags">
              {place.tags.map(t => <span key={t} className="tag">{t}</span>)}
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
  const { weather } = useWeather()
  if (!weather) return null
  if (weather.isMeltemi) {
    return (
      <div className="weather-note inline">
        Meltemi today &mdash; if a beach is exposed to the north (Vroulidia, Fikiada),
        consider a south-facing one like Faros or Chrysopigi instead.
      </div>
    )
  }
  return (
    <div className="weather-note inline subtle">
      Wind from {weather.windDirection} at {weather.windKmh} km/h &mdash; most beaches should be pleasant today.
    </div>
  )
}
