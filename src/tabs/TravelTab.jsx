import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import AppFooter from '../components/AppFooter.jsx'
import {
  ARRIVAL, FERRIES, GETTING_AROUND, PACKING_LIST,
  CURRENCY, PHRASEBOOK, EMERGENCY, ISLAND_HOPPING,
} from '../data/travel.js'

export default function TravelTab({ onAsk }) {
  return (
    <div className="page page-travel">
      <PageHeader
        eyebrow="Getting here & around"
        title="<span>Practical</span> <em>Sifnos</em>"
        subtitle="Ferries, transit, packing, money, language, and emergency info — in one place."
      />

      {/* ARRIVAL & FERRIES */}
      <section className="card">
        <p className="card-eyebrow">Step 1 · Athens</p>
        <h2 className="card-title">Fly into {ARRIVAL.airport.code}</h2>
        <p className="card-body"><strong>{ARRIVAL.airport.name}</strong> &mdash; {ARRIVAL.airport.formalName}.</p>
        <p className="card-body subtle">{ARRIVAL.airport.note}</p>
        <p className="card-body italic">{ARRIVAL.athensTip}</p>
      </section>

      <section className="card">
        <p className="card-eyebrow">Step 2 · Ferry</p>
        <h2 className="card-title">Piraeus → Sifnos</h2>
        <p className="card-body">{FERRIES.description}</p>
        <p className="card-body subtle"><strong>Tip:</strong> {FERRIES.tip}</p>
        <p className="card-body subtle">{FERRIES.returnNote}</p>
        <div className="card-actions">
          <a className="btn-primary" href={FERRIES.bookingUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="ferry" size={16} /> Book at ferries.gr
          </a>
          <a className="btn-secondary" href={FERRIES.stepByStepUrl} target="_blank" rel="noopener noreferrer">
            Step-by-step guide
          </a>
        </div>
      </section>

      {/* GETTING AROUND */}
      <section className="card">
        <p className="card-eyebrow">On the island</p>
        <h2 className="card-title">Getting around</h2>
        <ul className="method-list">
          {GETTING_AROUND.map((method, i) => (
            <li key={i} className={`method-row ${method.recommended ? 'recommended' : ''}`}>
              <span className="method-icon"><Icon name={method.icon} size={18} /></span>
              <div>
                <h3 className="method-name">
                  {method.method}
                  {method.recommended && <span className="recommended-badge">recommended</span>}
                </h3>
                <p className="method-detail">{method.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* PACKING LIST */}
      <PackingListCard onAsk={onAsk} />

      {/* CURRENCY */}
      <section className="card">
        <p className="card-eyebrow">Money</p>
        <h2 className="card-title">{CURRENCY.unit}</h2>
        <ul className="bullet-list">
          {CURRENCY.notes.map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      </section>

      {/* PHRASEBOOK */}
      <PhrasebookCard />

      {/* EMERGENCY */}
      <section className="card card-emergency">
        <p className="card-eyebrow">In case of</p>
        <h2 className="card-title">Emergency</h2>
        <a className="emergency-primary" href={`tel:${EMERGENCY.primary.number}`}>
          <span className="emergency-number">{EMERGENCY.primary.number}</span>
          <span className="emergency-label">{EMERGENCY.primary.label}<br/><small>{EMERGENCY.primary.detail}</small></span>
          <Icon name="phone" size={20} />
        </a>
        <div className="emergency-secondary">
          {EMERGENCY.secondary.map(e => (
            <a key={e.number} className="emergency-row" href={`tel:${e.number}`}>
              <span className="emergency-num-small">{e.number}</span>
              <span>{e.label}</span>
              <Icon name="phone" size={14} />
            </a>
          ))}
        </div>
        <p className="card-body subtle">{EMERGENCY.health}</p>
        <div className="wedding-contact">
          <p className="card-eyebrow">{EMERGENCY.weddingContact.label}</p>
          <p className="card-body subtle">{EMERGENCY.weddingContact.detail}</p>
          <a className="btn-link" href={`mailto:${EMERGENCY.weddingContact.email}`}>{EMERGENCY.weddingContact.email}</a>
        </div>
      </section>

      {/* ISLAND HOPPING */}
      <section className="card">
        <p className="card-eyebrow">If you're staying longer</p>
        <h2 className="card-title">Island hopping</h2>
        <p className="card-body">{ISLAND_HOPPING.intro}</p>

        <h3 className="subhead">Their favorites &mdash; quieter, more authentic</h3>
        <ul className="bullet-list">
          {ISLAND_HOPPING.favorites.map((isl, i) => (
            <li key={i}><strong>{isl.name}</strong> &mdash; {isl.note}</li>
          ))}
        </ul>

        <h3 className="subhead">Other options</h3>
        <ul className="bullet-list">
          {ISLAND_HOPPING.others.map((isl, i) => (
            <li key={i}><strong>{isl.name}</strong> &mdash; {isl.note}</li>
          ))}
        </ul>

        <button
          className="btn-secondary"
          onClick={() => onAsk('Help me plan a few days hopping to other Cycladic islands after the wedding.', 'island-hopping')}
        >
          <Icon name="ask" size={14} /> Help me plan a hop
        </button>
      </section>

      <AppFooter />
    </div>
  )
}

function PackingListCard({ onAsk }) {
  return (
    <section className="card">
      <p className="card-eyebrow">What to bring</p>
      <h2 className="card-title">Packing list</h2>
      <p className="card-body subtle">Tuned for early-September Sifnos &mdash; warm days, possibly breezy nights, and a beach wedding.</p>
      {PACKING_LIST.map((group, i) => (
        <div key={i} className="packing-group">
          <h3 className="subhead" dangerouslySetInnerHTML={{ __html: group.category }} />
          <ul className="checklist">
            {group.items.map((item, j) => (
              <li key={j} className="checklist-item">
                <input type="checkbox" id={`pack-${i}-${j}`} />
                <label htmlFor={`pack-${i}-${j}`} dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function PhrasebookCard() {
  const [showAll, setShowAll] = useState(false)
  const list = showAll ? PHRASEBOOK : PHRASEBOOK.slice(0, 8)
  return (
    <section className="card">
      <p className="card-eyebrow">Hello, hello</p>
      <h2 className="card-title">A few Greek words</h2>
      <ul className="phrasebook">
        {list.map((p, i) => (
          <li key={i} className="phrase-row">
            <span className="phrase-greek" lang="el">{p.greek}</span>
            <span className="phrase-romanized">{p.romanized}</span>
            <span className="phrase-english" dangerouslySetInnerHTML={{ __html: p.english }} />
          </li>
        ))}
      </ul>
      <button className="btn-link" onClick={() => setShowAll(s => !s)}>
        {showAll ? 'Show fewer' : `Show all ${PHRASEBOOK.length} phrases`}
      </button>
    </section>
  )
}
