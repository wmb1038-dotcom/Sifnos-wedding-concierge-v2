import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import AppFooter from '../components/AppFooter.jsx'
import { ARRIVAL, FERRIES, GETTING_AROUND, PHRASEBOOK, EMERGENCY, ISLAND_HOPPING, LOCAL_DIRECTORY } from '../data/travel.js'
import { useT } from '../i18n/index.jsx'

export default function TravelTab({ onAsk }) {
  const t = useT()

  return (
    <div className="page page-travel">
      <PageHeader
        eyebrow={t('travel.eyebrow')}
        title={`<span>${t('travel.title1')}</span> <em>${t('travel.title2')}</em>`}
        subtitle={t('travel.subtitle')}
      />

      {/* STEP 1: ATHENS */}
      <section className="card">
        <p className="card-eyebrow">{t('travel.step1Eyebrow')}</p>
        <h2 className="card-title">Fly into {ARRIVAL.airport.code}</h2>
        <p className="card-body"><strong>{ARRIVAL.airport.name}</strong> &mdash; {ARRIVAL.airport.formalName}.</p>
        <p className="card-body subtle">{t('travel.airportNote')}</p>
        <p className="card-body italic">{t('travel.athensTip')}</p>
      </section>

      {/* STEP 2: FERRY */}
      <section className="card">
        <p className="card-eyebrow">{t('travel.step2Eyebrow')}</p>
        <h2 className="card-title">Piraeus → Sifnos</h2>
        <p className="card-body">{t('travel.ferriesDesc')}</p>
        <p className="card-body subtle"><strong>Tip:</strong> {t('travel.ferriesTip')}</p>
        <p className="card-body subtle">{t('travel.ferriesReturn')}</p>
        <div className="card-actions">
          <a className="btn-primary" href={FERRIES.bookingUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="ferry" size={16} /> {t('travel.bookFerries')}
          </a>
          <a className="btn-secondary" href={FERRIES.stepByStepUrl} target="_blank" rel="noopener noreferrer">
            {t('travel.stepByStep')}
          </a>
        </div>
      </section>

      {/* GETTING AROUND */}
      <section className="card">
        <p className="card-eyebrow">{t('travel.onIslandEyebrow')}</p>
        <h2 className="card-title">{t('travel.gettingAroundTitle')}</h2>
        <ul className="method-list">
          {(t('travel.methods') || GETTING_AROUND).map((method, i) => (
            <li key={i} className={`method-row ${GETTING_AROUND[i]?.recommended ? 'recommended' : ''}`}>
              <span className="method-icon"><Icon name={GETTING_AROUND[i]?.icon || 'car'} size={18} /></span>
              <div>
                <h3 className="method-name">
                  {method.method}
                  {GETTING_AROUND[i]?.recommended && <span className="recommended-badge">{t('travel.recommended')}</span>}
                </h3>
                <p className="method-detail">{method.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* PACKING */}
      <PackingListCard onAsk={onAsk} />

      {/* CURRENCY */}
      <section className="card">
        <p className="card-eyebrow">{t('travel.moneyEyebrow')}</p>
        <h2 className="card-title">Euro (€)</h2>
        <ul className="bullet-list">
          {(t('travel.currencyNotes') || []).map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      </section>

      {/* PHRASEBOOK */}
      <PhrasebookCard />

      {/* EMERGENCY */}
      <section className="card card-emergency">
        <p className="card-eyebrow">{t('travel.emergencyEyebrow')}</p>
        <h2 className="card-title">{t('travel.emergencyTitle')}</h2>
        <a className="emergency-primary" href={`tel:${EMERGENCY.primary.number}`}>
          <span className="emergency-number">{EMERGENCY.primary.number}</span>
          <span className="emergency-label">
            {t('travel.emergency.primaryLabel')}<br/>
            <small>{t('travel.emergency.primaryDetail')}</small>
          </span>
          <Icon name="phone" size={20} />
        </a>
        <div className="emergency-secondary">
          {[
            { number: '166', labelKey: 'ambulance' },
            { number: '100', labelKey: 'police' },
            { number: '199', labelKey: 'fire' },
          ].map(e => (
            <a key={e.number} className="emergency-row" href={`tel:${e.number}`}>
              <span className="emergency-num-small">{e.number}</span>
              <span>{t(`travel.emergency.${e.labelKey}`)}</span>
              <Icon name="phone" size={14} />
            </a>
          ))}
        </div>
        <p className="card-body subtle">{t('travel.emergency.health')}</p>
        <div className="wedding-contact">
          <p className="card-eyebrow">{t('travel.emergency.weddingContactEyebrow')}</p>
          <p className="card-body subtle">{t('travel.emergency.weddingContactDetail')}</p>
          <a className="btn-link" href={`mailto:${EMERGENCY.weddingContact.email}`}>{EMERGENCY.weddingContact.email}</a>
        </div>
      </section>

      {/* LOCAL DIRECTORY */}
      <LocalDirectorySection />

      {/* ISLAND HOPPING */}
      <section className="card">
        <p className="card-eyebrow">{t('travel.islandHoppingEyebrow')}</p>
        <h2 className="card-title">{t('travel.islandHoppingTitle')}</h2>
        <p className="card-body">{t('travel.islandHoppingIntro')}</p>

        <h3 className="subhead">{t('travel.islandHoppingFavSub')}</h3>
        <ul className="bullet-list">
          {ISLAND_HOPPING.favorites.map((isl, i) => (
            <li key={i}><strong>{isl.name}</strong> &mdash; {(t('travel.favorites') || [])[i] || isl.note}</li>
          ))}
        </ul>

        <h3 className="subhead">{t('travel.islandHoppingOtherSub')}</h3>
        <ul className="bullet-list">
          {ISLAND_HOPPING.others.map((isl, i) => (
            <li key={i}><strong>{isl.name}</strong> &mdash; {(t('travel.others') || [])[i] || isl.note}</li>
          ))}
        </ul>

        <button
          className="btn-secondary"
          onClick={() => onAsk(t('travel.islandHoppingAskPrompt'), 'island-hopping')}
        >
          <Icon name="ask" size={14} /> {t('travel.islandHoppingAsk')}
        </button>
      </section>

      <AppFooter />
    </div>
  )
}

function PackingListCard({ onAsk }) {
  const t = useT()
  const packingData = t('travel.packing') || []
  return (
    <section className="card">
      <p className="card-eyebrow">{t('travel.packingEyebrow')}</p>
      <h2 className="card-title">{t('travel.packingTitle')}</h2>
      <p className="card-body subtle">{t('travel.packingSubtitle')}</p>
      {packingData.map((group, i) => (
        <div key={i} className="packing-group">
          <h3 className="subhead">{group.category}</h3>
          <ul className="checklist">
            {(group.items || []).map((item, j) => (
              <li key={j} className="checklist-item">
                <input type="checkbox" id={`pack-${i}-${j}`} />
                <label htmlFor={`pack-${i}-${j}`}>{item}</label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function LocalDirectorySection() {
  const t = useT()
  const dir = t('travel.directory') || {}

  const fineprint = (dir.fineprint || '')
    .replace('{source}', '')
    .replace('{date}', LOCAL_DIRECTORY.verified_on)

  return (
    <section className="card card-directory">
      <p className="card-eyebrow">{dir.sectionEyebrow}</p>
      <h2 className="card-title">{dir.sectionTitle}</h2>
      <div className="directory-categories">
        {LOCAL_DIRECTORY.categories.map(cat => (
          <DirectoryCategory key={cat.id} cat={cat} t={t} />
        ))}
      </div>
      <p className="directory-fineprint">
        {(dir.fineprint || '').split('{source}')[0]}
        <a
          href={LOCAL_DIRECTORY.source}
          target="_blank"
          rel="noopener noreferrer"
          className="directory-source-link"
        >
          {dir.source_label}
        </a>
        {((dir.fineprint || '').split('{source}')[1] || '').replace('{date}', LOCAL_DIRECTORY.verified_on)}
      </p>
    </section>
  )
}

function DirectoryCategory({ cat, t }) {
  const [open, setOpen] = useState(false)
  const label = t('travel.' + cat.label_key) || cat.id
  const note  = cat.note_key ? t('travel.' + cat.note_key) : null

  return (
    <div className="directory-category">
      <button className="directory-header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="directory-header-left">
          <Icon name={cat.icon} size={16} />
          <span className="directory-label">{label}</span>
          <span className="directory-badge">{cat.entries.length}</span>
        </span>
        <span className="directory-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="directory-body">
          {note && <p className="directory-note">{note}</p>}
          <ul className="directory-list">
            {cat.entries.map(entry => (
              <li key={entry.phone} className="directory-entry">
                <span className="directory-name">{entry.name}</span>
                <a href={`tel:${entry.phone}`} className="directory-phone">
                  <Icon name="phone" size={12} />
                  {entry.phone.replace('+30', '+30 ')}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PhrasebookCard() {
  const t = useT()
  const [showAll, setShowAll] = useState(false)
  const glosses = t('travel.phraseGlosses') || []
  const list = showAll ? PHRASEBOOK : PHRASEBOOK.slice(0, 8)

  return (
    <section className="card">
      <p className="card-eyebrow">{t('travel.phrasebookEyebrow')}</p>
      <h2 className="card-title">{t('travel.phrasebookTitle')}</h2>
      <ul className="phrasebook">
        {list.map((p, i) => (
          <li key={i} className="phrase-row">
            <span className="phrase-greek" lang="el">{p.greek}</span>
            <span className="phrase-romanized">{p.romanized}</span>
            <span className="phrase-english">{glosses[i] || p.english}</span>
          </li>
        ))}
      </ul>
      <button className="btn-link" onClick={() => setShowAll(s => !s)}>
        {showAll
          ? t('travel.showFewer')
          : t('travel.showAll', { n: PHRASEBOOK.length })}
      </button>
    </section>
  )
}
