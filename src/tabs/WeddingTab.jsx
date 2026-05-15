import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import AppFooter from '../components/AppFooter.jsx'
import {
  SCHEDULE, VENUE, DRESS_CODE, BUS_ROUTE,
  PLUS_ONE_POLICY, GIFT_POLICY, RSVP_DEADLINE, RSVP_URL,
  WEDDING_WEBSITE, WEDDING_EMAIL, COUPLE_STORY, TAGLINE,
} from '../data/wedding.js'
import { FAQ } from '../data/travel.js'
import { formatRange } from '../lib/schedule.js'

export default function WeddingTab({ onAsk }) {
  return (
    <div className="page page-wedding">
      <PageHeader
        eyebrow="Friday, 4 September 2026"
        title="Caro <em>& </em>Chris"
        subtitle="Everything you need for the day itself, drawn from caroychris.com."
      />

      {/* SCHEDULE TIMELINE */}
      <section className="card card-schedule">
        <h2 className="card-title">The day, hour by hour</h2>
        <ol className="timeline">
          {SCHEDULE.map((ev) => (
            <li key={ev.id} className={`timeline-item ${ev.highlight ? 'highlight' : ''}`}>
              <div className="timeline-marker" aria-hidden="true">
                <Icon name={ev.icon} size={18} />
              </div>
              <div className="timeline-body">
                <div className="timeline-head">
                  <h3 className="timeline-title">{ev.title}</h3>
                  <span className="timeline-time">{formatRange(ev.start, ev.end)}</span>
                </div>
                <p className="timeline-detail">{ev.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* VENUE */}
      <section className="card card-venue">
        <p className="card-eyebrow">The venue</p>
        <h2 className="card-title">{VENUE.name}</h2>
        <p className="card-body">{VENUE.address}</p>
        <p className="card-body">On {VENUE.beach}, with the Chrysopigi monastery just there. The ceremony is on the sand.</p>
        <p className="card-body subtle">{VENUE.parking}</p>
        <div className="card-actions">
          <a className="btn-primary" href={VENUE.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="map" size={16} /> Open in Maps
          </a>
          <button className="btn-secondary" onClick={() => onAsk('How do I get to Tsapis Tavern from where I\'m staying?', 'wedding-venue')}>
            <Icon name="ask" size={16} /> Ask for directions
          </button>
        </div>
      </section>

      {/* DRESS CODE */}
      <section className="card">
        <p className="card-eyebrow">Dress code</p>
        <h2 className="card-title">{DRESS_CODE.short}</h2>
        <ul className="bullet-list">
          {DRESS_CODE.long.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      </section>

      {/* BUS */}
      <section className="card">
        <p className="card-eyebrow">Getting there &amp; back</p>
        <h2 className="card-title">Wedding-night bus</h2>
        <p className="card-body">{BUS_ROUTE.description}</p>
        <ul className="bullet-list">
          {BUS_ROUTE.stops.map((stop, i) => (
            <li key={i}><strong>{stop.name}</strong> &mdash; {stop.detail}</li>
          ))}
        </ul>
        <a className="btn-link" href={BUS_ROUTE.link} target="_blank" rel="noopener noreferrer">
          See the route map on caroychris.com →
        </a>
      </section>

      {/* QUICK INFO */}
      <section className="card">
        <p className="card-eyebrow">Quick info</p>
        <dl className="info-list">
          <div className="info-row">
            <dt>RSVP by</dt>
            <dd>{RSVP_DEADLINE} · <a href={RSVP_URL} target="_blank" rel="noopener noreferrer">caroychris.com/rsvp</a></dd>
          </div>
          <div className="info-row">
            <dt>Plus-ones</dt>
            <dd>{PLUS_ONE_POLICY}</dd>
          </div>
          <div className="info-row">
            <dt>Gifts</dt>
            <dd>{GIFT_POLICY}</dd>
          </div>
          <div className="info-row">
            <dt>Wedding website</dt>
            <dd><a href={WEDDING_WEBSITE} target="_blank" rel="noopener noreferrer">caroychris.com</a></dd>
          </div>
          <div className="info-row">
            <dt>Email Caro &amp; Chris</dt>
            <dd><a href={`mailto:${WEDDING_EMAIL}`}>{WEDDING_EMAIL}</a></dd>
          </div>
        </dl>
      </section>

      {/* FAQ */}
      <section className="card">
        <p className="card-eyebrow">Common questions</p>
        <h2 className="card-title">FAQ</h2>
        <div className="faq-list">
          {FAQ.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>{item.q}</summary>
              <p dangerouslySetInnerHTML={{ __html: item.a }} />
            </details>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="card card-story">
        <p className="card-eyebrow">How they got here</p>
        <h2 className="card-title">From neighbors to wives</h2>
        {COUPLE_STORY.split('\n\n').map((p, i) => <p key={i} className="card-body">{p}</p>)}
        <p className="greek-tagline-small" lang="el">{TAGLINE.greek}</p>
      </section>

      <AppFooter />
    </div>
  )
}
