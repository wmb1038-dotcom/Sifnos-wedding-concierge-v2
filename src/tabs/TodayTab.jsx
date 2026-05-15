import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import AppFooter from '../components/AppFooter.jsx'
import { SCHEDULE, VENUE, TAGLINE } from '../data/wedding.js'
import { timeUntil, currentEvent, nextEvent, weddingIsOver, formatRange, tripPhase } from '../lib/schedule.js'
import { useWeather } from '../lib/weather.js'

export default function TodayTab({ onAsk, setTab }) {
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
        eyebrow="Today on Sifnos"
        title={`<span>Welcome</span><em>kalimera</em>`}
        subtitle="Your one-stop wedding companion. Tap any card to dive in."
      />

      {/* HERO CARD — adapts based on trip phase */}
      <HeroCard
        phase={phase}
        ceremonyCountdown={ceremonyCountdown}
        currentEvent={current}
        nextEvent={next}
        isOver={isOver}
      />

      {/* WEATHER */}
      <WeatherCard />

      {/* QUICK ACTIONS */}
      <section className="card card-quick">
        <h2 className="card-title">Quick taps</h2>
        <div className="quick-grid">
          <QuickAction icon="map" label="Open the venue in Maps" href={VENUE.mapsUrl} />
          <QuickAction icon="pin" label="See the island map" onClick={() => setTab('sifnos')} />
          <QuickAction icon="calendar" label="Full wedding agenda" onClick={() => setTab('wedding')} />
          <QuickAction icon="ferry" label="Ferries &amp; transit" onClick={() => setTab('travel')} />
          <QuickAction icon="ask" label="Ask the concierge" onClick={() => onAsk('', null)} />
          <QuickAction icon="phone" label="Emergency: 112" href="tel:112" tone="urgent" />
        </div>
      </section>

      {/* DAILY SUGGESTION */}
      <DailySuggestionCard phase={phase} onAsk={onAsk} />

      {/* Tagline footer */}
      <p className="page-tagline" lang="el">{TAGLINE.greek}</p>

      <AppFooter />
    </div>
  )
}

function HeroCard({ phase, ceremonyCountdown, currentEvent, nextEvent, isOver }) {
  if (currentEvent) {
    return (
      <section className="hero-card hero-now">
        <p className="hero-eyebrow live">● Happening now</p>
        <h2 className="hero-title">{currentEvent.title}</h2>
        <p className="hero-detail">{currentEvent.detail}</p>
        <p className="hero-time">{formatRange(currentEvent.start, currentEvent.end)} · Greek time</p>
      </section>
    )
  }

  if (isOver) {
    return (
      <section className="hero-card hero-over">
        <p className="hero-eyebrow">Until next time</p>
        <h2 className="hero-title">Thank you for being here</h2>
        <p className="hero-detail">A piece of Sifnos &mdash; and a piece of Caro and Chris's day &mdash; goes home with you.</p>
        <p className="greek-tagline-small" lang="el">Ζήτω η αγάπη!</p>
      </section>
    )
  }

  if (phase.phase === 'pre-trip') {
    return (
      <section className="hero-card hero-countdown">
        <p className="hero-eyebrow">The wedding is in</p>
        <CountdownDisplay countdown={ceremonyCountdown} />
        <p className="hero-detail">until the ceremony on Apokofto beach</p>
      </section>
    )
  }

  if (nextEvent) {
    const next = timeUntil(nextEvent.start)
    return (
      <section className="hero-card hero-next">
        <p className="hero-eyebrow">Next up</p>
        <h2 className="hero-title">{nextEvent.title}</h2>
        <p className="hero-detail">{nextEvent.detail}</p>
        <p className="hero-time">
          {formatRange(nextEvent.start, nextEvent.end)}
          {next && next.totalMs < 1000*60*60*6 && (
            <> · in {next.hours > 0 ? `${next.hours}h ` : ''}{next.minutes}m</>
          )}
        </p>
      </section>
    )
  }

  return (
    <section className="hero-card hero-countdown">
      <p className="hero-eyebrow">The wedding is in</p>
      <CountdownDisplay countdown={ceremonyCountdown} />
      <p className="hero-detail">until the ceremony on Apokofto beach</p>
    </section>
  )
}

function CountdownDisplay({ countdown }) {
  if (!countdown) return null
  return (
    <div className="countdown">
      <div className="countdown-unit">
        <span className="countdown-num">{countdown.days}</span>
        <span className="countdown-label">{countdown.days === 1 ? 'day' : 'days'}</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-num">{countdown.hours}</span>
        <span className="countdown-label">hr</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-num">{countdown.minutes}</span>
        <span className="countdown-label">min</span>
      </div>
    </div>
  )
}

function WeatherCard() {
  const { weather, loading } = useWeather()
  if (loading || !weather) {
    return (
      <section className="card card-weather loading">
        <h2 className="card-title">Sifnos right now</h2>
        <p className="loading-text">Loading weather…</p>
      </section>
    )
  }

  const sunsetTime = weather.sunsetIso
    ? new Date(weather.sunsetIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Europe/Athens' }).toLowerCase().replace(' ', '')
    : null

  return (
    <section className="card card-weather">
      <div className="weather-header">
        <h2 className="card-title">Sifnos right now</h2>
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
        <p className="weather-note">The meltemi is blowing today &mdash; windward beaches like Vroulidia may be tough. Lee-side beaches (Faros, Chrysopigi, Platis Gialos) will be calmer.</p>
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
        <span dangerouslySetInnerHTML={{ __html: label }} />
      </a>
    )
  }
  return (
    <button className={className} onClick={onClick} type="button">
      <Icon name={icon} size={20} />
      <span dangerouslySetInnerHTML={{ __html: label }} />
    </button>
  )
}

function DailySuggestionCard({ phase, onAsk }) {
  const suggestions = {
    'pre-trip': {
      title: 'Before you fly',
      body: 'Have you booked your ferry yet? Prices climb as the date approaches. The couple put together a step-by-step guide.',
      ask: 'Help me figure out how to book my ferry from Athens to Sifnos.',
    },
    'on-island': {
      title: 'While you\'re here',
      body: 'Get out and explore. Today\'s a great day to wander Kastro or take it slow on a beach. Caro and Chris pinned their favorites for you.',
      ask: 'Plan me a relaxed day on Sifnos based on Caro and Chris\'s recommendations.',
    },
    eve: {
      title: 'The day before',
      body: 'Easy day. A swim in the morning, maybe a long lunch in Apollonia. Save energy &mdash; tomorrow runs late.',
      ask: 'What\'s a low-key plan for the day before the wedding?',
    },
    'wedding-day': {
      title: 'The day is here',
      body: 'A swim or a long breakfast, then start getting ready around mid-afternoon. The bus runs from Apollonia and Platis Gialos to the venue.',
      ask: 'Walk me through the wedding day timing and transportation.',
    },
    'morning-after': {
      title: 'The morning after',
      body: 'Slow start. A swim at Chrysopigi cures most things. If you\'re extending the trip, ask me about Folegandros or Serifos.',
      ask: 'What should I do today, the day after the wedding?',
    },
    'post-trip': {
      title: 'Until next time',
      body: 'Hope you carried a piece of Sifnos home with you. Καλό ταξίδι &mdash; safe travels.',
      ask: 'Tell me about the couple\'s love story one more time.',
    },
  }
  const s = suggestions[phase.phase] || suggestions['on-island']

  return (
    <section className="card card-suggestion">
      <p className="card-eyebrow">An idea for today</p>
      <h2 className="card-title">{s.title}</h2>
      <p className="card-body" dangerouslySetInnerHTML={{ __html: s.body }} />
      <button className="card-cta" onClick={() => onAsk(s.ask, 'today')}>
        Ask about this <Icon name="chat" size={14} />
      </button>
    </section>
  )
}
