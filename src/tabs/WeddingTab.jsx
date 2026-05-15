import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import AppFooter from '../components/AppFooter.jsx'
import { SCHEDULE, VENUE, RSVP_URL, WEDDING_WEBSITE, WEDDING_EMAIL, TAGLINE } from '../data/wedding.js'
import { formatRange } from '../lib/schedule.js'
import { useT } from '../i18n/index.jsx'

export default function WeddingTab({ onAsk }) {
  const t = useT()

  return (
    <div className="page page-wedding">
      <PageHeader
        eyebrow={t('wedding.eyebrow')}
        title="Caro <em>& </em>Chris"
        subtitle={t('wedding.subtitle')}
      />

      {/* SCHEDULE */}
      <section className="card card-schedule">
        <h2 className="card-title">{t('wedding.scheduleTitle')}</h2>
        <ol className="timeline">
          {SCHEDULE.map((ev) => {
            const title  = t(`wedding.schedule.${ev.id}.title`)  || ev.title
            const detail = t(`wedding.schedule.${ev.id}.detail`) || ev.detail
            return (
              <li key={ev.id} className={`timeline-item ${ev.highlight ? 'highlight' : ''}`}>
                <div className="timeline-marker" aria-hidden="true">
                  <Icon name={ev.icon} size={18} />
                </div>
                <div className="timeline-body">
                  <div className="timeline-head">
                    <h3 className="timeline-title">{title}</h3>
                    <span className="timeline-time">{formatRange(ev.start, ev.end)}</span>
                  </div>
                  <p className="timeline-detail">{detail}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* VENUE */}
      <section className="card card-venue">
        <p className="card-eyebrow">{t('wedding.venueEyebrow')}</p>
        <h2 className="card-title">{VENUE.name}</h2>
        <p className="card-body">{VENUE.address}</p>
        <p className="card-body">{t('wedding.venueBeachDesc')}</p>
        <p className="card-body subtle">{t('wedding.venueParking')}</p>
        <div className="card-actions">
          <a className="btn-primary" href={VENUE.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="map" size={16} /> {t('wedding.openInMaps')}
          </a>
          <button className="btn-secondary" onClick={() => onAsk(t('wedding.askDirectionsPrompt'), 'wedding-venue')}>
            <Icon name="ask" size={16} /> {t('wedding.askDirections')}
          </button>
        </div>
      </section>

      {/* DRESS CODE */}
      <section className="card">
        <p className="card-eyebrow">{t('wedding.dressEyebrow')}</p>
        <h2 className="card-title">{t('wedding.dressShort')}</h2>
        <ul className="bullet-list">
          {(t('wedding.dressLong') || []).map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      </section>

      {/* BUS */}
      <section className="card">
        <p className="card-eyebrow">{t('wedding.gettingThereEyebrow')}</p>
        <h2 className="card-title">{t('wedding.busTitle')}</h2>
        <p className="card-body">{t('wedding.busDesc')}</p>
        <ul className="bullet-list">
          <li><strong>Apollonia central</strong> &mdash; {t('wedding.busStopApolonia')}</li>
          <li><strong>Platis Gialos central square</strong> &mdash; {t('wedding.busStopPlatisGialos')}</li>
          <li><strong>Tsapis Tavern (return)</strong> &mdash; {t('wedding.busStopTsapis')}</li>
        </ul>
        <a className="btn-link" href="https://www.caroychris.com/busroute" target="_blank" rel="noopener noreferrer">
          {t('wedding.busMapLink')}
        </a>
      </section>

      {/* QUICK INFO */}
      <section className="card">
        <p className="card-eyebrow">{t('wedding.quickInfoEyebrow')}</p>
        <dl className="info-list">
          <div className="info-row">
            <dt>{t('wedding.rsvpBy')}</dt>
            <dd>{t('wedding.rsvpDeadline')} · <a href={RSVP_URL} target="_blank" rel="noopener noreferrer">caroychris.com/rsvp</a></dd>
          </div>
          <div className="info-row">
            <dt>{t('wedding.plusOnes')}</dt>
            <dd>{t('wedding.plusOnePolicy')}</dd>
          </div>
          <div className="info-row">
            <dt>{t('wedding.gifts')}</dt>
            <dd>{t('wedding.giftPolicy')}</dd>
          </div>
          <div className="info-row">
            <dt>{t('wedding.weddingWebsite')}</dt>
            <dd><a href={WEDDING_WEBSITE} target="_blank" rel="noopener noreferrer">caroychris.com</a></dd>
          </div>
          <div className="info-row">
            <dt>{t('wedding.emailCouple')}</dt>
            <dd><a href={`mailto:${WEDDING_EMAIL}`}>{WEDDING_EMAIL}</a></dd>
          </div>
        </dl>
      </section>

      {/* FAQ */}
      <section className="card">
        <p className="card-eyebrow">{t('wedding.faqEyebrow')}</p>
        <h2 className="card-title">{t('wedding.faqTitle')}</h2>
        <div className="faq-list">
          {(t('wedding.faq') || []).map((item, i) => (
            <details key={i} className="faq-item">
              <summary>{item.q}</summary>
              <p dangerouslySetInnerHTML={{ __html: item.a }} />
            </details>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="card card-story">
        <p className="card-eyebrow">{t('wedding.storyEyebrow')}</p>
        <h2 className="card-title">{t('wedding.storyTitle')}</h2>
        {(t('wedding.coupleStory') || []).map((para, i) => (
          <p key={i} className="card-body">{para}</p>
        ))}
        <p className="greek-tagline-small" lang="el">{TAGLINE.greek}</p>
      </section>

      <AppFooter />
    </div>
  )
}
