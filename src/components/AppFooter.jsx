import { useState } from 'react'
import PrivacyModal from './PrivacyModal.jsx'
import { useLocale, LOCALES } from '../i18n/index.jsx'

const DELETION_HREF =
  'mailto:wmb1038@gmail.com' +
  '?subject=Sifnos%20Concierge%20%E2%80%94%20Data%20Request' +
  '&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20deletion%20of%20any%20data%20associated%20with%20my%20use%20of%20the%20Sifnos%20Wedding%20Concierge.%0A%0A%5BYour%20name%20and%20any%20detail%20that%20may%20help%20identify%20your%20data.%5D%0A%0AThank%20you.'

export default function AppFooter() {
  const { t, locale, setLocale } = useLocale()
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  return (
    <>
      <footer className="app-footer">
        <span className="app-footer-mark">&mdash;&thinsp;Sifnos &middot; 4 Sept 2026</span>
        <nav className="app-footer-links">
          <button onClick={() => setPrivacyOpen(true)}>{t('footer.privacy')}</button>
          <a href={DELETION_HREF}>{t('footer.deletion')}</a>
          <div className="lang-globe-wrap">
            <button
              className="lang-globe-btn"
              onClick={() => setLangOpen(o => !o)}
              aria-label="Change language"
              aria-expanded={langOpen}
            >
              🌐
            </button>
            {langOpen && (
              <div className="lang-popover" role="menu">
                {LOCALES.map(loc => (
                  <button
                    key={loc.code}
                    role="menuitem"
                    className={`lang-popover-item ${locale === loc.code ? 'active' : ''}`}
                    onClick={() => { setLocale(loc.code); setLangOpen(false) }}
                  >
                    {loc.flag} {loc.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </footer>
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  )
}
