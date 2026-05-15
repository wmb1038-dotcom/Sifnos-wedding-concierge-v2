import { WEDDING_WEBSITE } from '../data/wedding.js'
import { useT } from '../i18n/index.jsx'

function P1({ text }) {
  const parts = text.split('caroychris.com')
  if (parts.length < 2) return <p>{text}</p>
  return (
    <p>
      {parts[0]}
      <a href={WEDDING_WEBSITE} target="_blank" rel="noopener noreferrer">caroychris.com</a>
      {parts[1]}
    </p>
  )
}

export default function PrivacyModal({ onClose }) {
  const t = useT()
  return (
    <div className="privacy-backdrop" onClick={onClose} aria-modal="true" role="dialog" aria-label={t('privacy.title')}>
      <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="privacy-modal-title">{t('privacy.title')}</h2>
        <div className="privacy-modal-body">
          <P1 text={t('privacy.p1')} />
          <p>{t('privacy.p2')}</p>
          <p>{t('privacy.p3')}</p>
        </div>
        <button className="privacy-modal-close" onClick={onClose}>{t('privacy.close')}</button>
      </div>
    </div>
  )
}
