import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import AppFooter from '../components/AppFooter.jsx'
import { SCHEDULE, VENUE, TAGLINE } from '../data/wedding.js'
import { timeUntil, currentEvent, nextEvent, weddingIsOver, formatRange, tripPhase } from '../lib/schedule.js'
import { useWeather } from '../lib/weather.js'
import { useT } from '../i18n/index.jsx'

export default function TodayTab({ onAsk, setTab }) {
  const t = useT()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000)
    return () => clearInterval(id)
  }, [])

  const phase = tripPhase(now)
  const current = currentEvent(now)
  const next = nextEvent(now)
  const ceremony = SCHEDULE.find(e => e.id === 'ceremony')
  const ceremonyCountdown = timeUntil(ceremony.start, now)
  const isOver = weddingIsOver(now)

  return (
    <div className="page page-today">
      <PageHeader
        eyebrow={t('today.eyebrow')}
        title={`<span>${t('today.title1')}</span><em>${t('today.title2')}</em>`}
        subtitle={t('today.subtitle')}
      />

      <HeroCard
        phase={phase}
        ceremonyCountdown={ceremonyCountdown}
        currentEvent={current}
        nextEvent={next}
        isOver={isOver}
      />

      <WeatherCard />

      <section className="card card-quick">
        <h2 className="card-title">{t('today.quickTaps')}</h2>
        <div className="quick-grid">
          <QuickAction icon="map"      label={t('today.openVenue')}      href={VENUE.mapsUrl} />
          <QuickAction icon="pin"      label={t('today.islandMap')}      onClick={() => setTab('sifnos')} />
          <QuickAction icon="calendar" label={t('today.fullAgenda')}     onClick={() => setTab('wedding')} />
          <QuickAction icon="ferry"    label={t('today.ferriesTransit')} onClick={() => setTab('travel')} />
          <QuickAction icon="ask"      label={t('today.askConcierge')}   onClick={() => onAsk('', null)} />
          <QuickAction icon="phone"    label={t('today.emergency')}      href="tel:112" tone="urgent" />
        </div>
      </section>

      <DailySuggestionCard phase={phase} onAsk={onAsk} />

      <p className="page-tagline" lang="el">{TAGLINE.greek}</p>

      <AppFooter />
    </div>
  )
}

function HeroCard({ phase, ceremonyCountdown, currentEvent, nextEvent, isOver }) {
  const t = useT()

  if (currentEvent) {
    const schedTitle = t(`wedding.schedule.${currentEvent.id}.title`) || currentEvent.title
    const schedDetail = t(`wedding.schedule.${currentEvent.id}.detail`) || currentEvent.detail
    return (
      <section className="hero-card hero-now">
        <p className="hero-eyebrow live">{t('today.happening')}</p>
        <h2 className="hero-title">{schedTitle}</h2>
        <p className="hero-detail">{schedDetail}</p>
        <p className="hero-time">{formatRange(currentEvent.start, currentEvent.end)} · Greek time</p>
      </section>
    )
  }

  if (isOver) {
    return (
      <section className="hero-card hero-over">
        <p className="hero-eyebrow">{t('today.until')}</p>
        <h2 className="hero-title">{t('today.thanks')}</h2>
        <p className="hero-detail">{t('today.thanksBody')}</p>
        <p className="greek-tagline-small" lang="el">Ζήτω η αγάπη!</p>
      </section>
    )
  }

  if (nextEvent) {
    const next = timeUntil(nextEvent.start)
    const schedTitle = t(`wedding.schedule.${nextEvent.id}.title`) || nextEvent.title
    const schedDetail = t(`wedding.schedule.${nextEvent.id}.detail`) || nextEvent.detail
    return (
      <section className="hero-card hero-next">
        <p className="hero-eyebrow">{t('today.nextUp')}</p>
        <h2 className="hero-title">{schedTitle}</h2>
        <p className="hero-detail">{schedDetail}</p>
        <p className="hero-time">
          {formatRange(nextEvent.start, nextEvent.end)}
          {next && next.totalMs < 1000*60*60*6 && (
            <> · in {next.hours > 0 ? `${next.hours}${t('today.hr')} ` : ''}{next.minutes}{t('today.min')}</>
          )}
        </p>
      </section>
    )
  }

  return (
    <section className="hero-card hero-countdown">
      <p className="hero-eyebrow">{t('today.weddingIn')}</p>
      <CountdownDisplay countdown={ceremonyCountdown} />
      <p className="hero-detail">{t('today.untilCeremony')}</p>
    </section>
  )
}

function CountdownDisplay({ countdown }) {
  const t = useT()
  if (!countdown) return null
  return (
    <div className="countdown">
      <div className="countdown-unit">
        <span className="countdown-num">{countdown.days}</span>
        <span className="countdown-label">{countdown.days === 1 ? t('today.day') : t('today.days')}</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-num">{countdown.hours}</span>
        <span className="countdown-label">{t('today.hr')}</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-num">{countdown.minutes}</span>
        <span className="countdown-label">{t('today.min')}</span>
      </div>
    </div>
  )
}

function WeatherCard() {
  const t = useT()
  const { weather, loading } = useWeather()
  if (loading || !weather) {
    return (
      <section className="card card-weather loading">
        <h2 className="card-title">{t('today.weatherTitle')}</h2>
        <p className="loading-text">{t('today.weatherLoading')}</p>
      </section>
    )
  }

  const sunsetTime = weather.sunsetIso
    ? new Date(weather.sunsetIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Europe/Athens' }).toLowerCase().replace(' ', '')
    : null

  return (
    <section className="card card-weather">
      <div className="weather-header">
        <h2 className="card-title">{t('today.weatherTitle')}</h2>
        <div className="weather-icon"><Icon name={weather.icon} size={32} /></div>
      </div>
      <div className="weather-main">
        <p className="weather-temp">{weather.tempC}°<span className="unit">C</span> <span className="weather-temp-f">/ {weather.tempF}°F</span></p>
        <p className="weather-condition">{weather.condition}</p>
      </div>
      <div className="weather-details">
        <div className="weather-stat">
          <Icon name="wind" size={14} />
          <span>{weather.windKmh} km/h {weather.windDirection}{weather.isMeltemi ? ' · meltemi' : ''}</span>
        </div>
        {sunsetTime && (
          <div className="weather-stat">
            <Icon name="sun" size={14} />
            <span>Sunset {sunsetTime}</span>
          </div>
        )}
        {weather.minTempC != null && weather.maxTempC != null && (
          <div className="weather-stat">
            <Icon name="calendar" size={14} />
            <span>{weather.minTempC}° – {weather.maxTempC}° today</span>
          </div>
        )}
      </div>
      {weather.isMeltemi && (
        <p className="weather-note">{t('today.meltemiNote')}</p>
      )}
      {!weather.isMeltemi && weather.windKmh != null && (
        <p className="weather-note subtle">{t('today.windNote', { direction: weather.windDirection, speed: weather.windKmh })}</p>
      )}
    </section>
  )
}

function QuickAction({ icon, label, onClick, href, tone }) {
  const className = `quick-action ${tone === 'urgent' ? 'urgent' : ''}`
  if (href) {
    return (
      <a className={className} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        <Icon name={icon} size={20} />
        <span>{label}</span>
      </a>
    )
  }
  return (
    <button className={className} onClick={onClick} type="button">
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </button>
  )
}

function DailySuggestionCard({ phase, onAsk }) {
  const t = useT()
  const key = phase.phase
  const s = t(`today.suggestions.${key}`) || t('today.suggestions.on-island')

  return (
    <section className="card card-suggestion">
      <p className="card-eyebrow">{t('today.ideaEyebrow')}</p>
      <h2 className="card-title">{s?.title}</h2>
      <p className="card-body">{s?.body}</p>
      <button className="card-cta" onClick={() => onAsk(s?.ask, 'today')}>
        {t('today.askAbout')} <Icon name="chat" size={14} />
      </button>
    </section>
  )
}
