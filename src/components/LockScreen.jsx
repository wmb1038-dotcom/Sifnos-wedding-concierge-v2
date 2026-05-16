import { useState } from 'react'
import { TAGLINE, WEDDING_WEBSITE } from '../data/wedding.js'
import PrivacyNotice from './PrivacyNotice.jsx'
import { useLocale, LOCALES } from '../i18n/index.jsx'

const CONSENT_KEY = 'sifnos_consent_ts'

export default function LockScreen({ onUnlock, unlocking, error }) {
  const { t, locale, setLocale } = useLocale()
  const [code, setCode] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  const canSubmit = code.trim() && consentGiven && !unlocking

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const ok = await onUnlock(code.trim())
    if (ok) {
      sessionStorage.setItem(CONSENT_KEY, new Date().toISOString())
    }
  }

  const openPrivacy = (e) => {
    e.preventDefault()
    setPrivacyOpen(true)
  }

  return (
    <section className="lock-screen">
      <div className="lock-card">

        {/* Language picker */}
        <nav className="lang-picker" aria-label="Language">
          {LOCALES.map(loc => (
            <button
              key={loc.code}
              className={`lang-pill ${locale === loc.code ? 'active' : ''}`}
              onClick={() => setLocale(loc.code)}
              aria-pressed={locale === loc.code}
              title={loc.label}
            >
              <span className="lang-flag">{loc.flag}</span>
              <span className="lang-name">{loc.label}</span>
            </button>
          ))}
        </nav>

        <div className="lock-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 50 H50 V32 L32 18 L14 32 Z" />
            <path d="M28 50 V40 H36 V50" />
            <path d="M32 14 V20 M29 17 H35" />
            <circle cx="32" cy="14" r="0.8" fill="currentColor" />
          </svg>
        </div>

        <p className="eyebrow">{t('lock.eyebrow')}</p>
        <h1 className="lock-title">Caro<br/>&amp; <em>Chris</em></h1>
        <p className="greek-tagline" lang="el">{TAGLINE.greek}</p>
        <p className="lock-body">{t('lock.body')}</p>

        <form className="lock-form" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="rsvp-input" className="lock-label">{t('lock.label')}</label>
          <div className="lock-input-row">
            <input
              id="rsvp-input"
              className="lock-input"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              spellCheck="false"
              placeholder={t('lock.placeholder')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={unlocking}
              autoFocus
              required
            />
            <button
              type="submit"
              className="lock-submit"
              disabled={!canSubmit}
              aria-label="Unlock"
              title={canSubmit ? undefined : t('lock.buttonTitle')}
            >
              {unlocking ? (
                <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="9" opacity="0.2" />
                  <path d="M21 12a9 9 0 0 0-9-9" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12 H19 M13 6 L19 12 L13 18" />
                </svg>
              )}
            </button>
          </div>

          <div className="lock-consent">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              disabled={unlocking}
            />
            <label htmlFor="consent-checkbox">
              {t('lock.consent.before')}<a href="#privacy" onClick={openPrivacy}>{t('lock.consent.linkText')}</a>{t('lock.consent.after')}
            </label>
          </div>

          {error && <p className="lock-error" role="alert">{error}</p>}
        </form>

        <div className="lock-disclaimer" role="note">
          <p>This concierge uses AI (Google&rsquo;s Gemini). It can be wrong &mdash; for anything that matters, double-check at <a href="https://www.caroychris.com" target="_blank" rel="noopener noreferrer">caroychris.com</a> or write to <a href="mailto:hello@caroychris.com">hello@caroychris.com</a>.</p>
          <p>No analytics, stored messages, or tracking. Your questions go to Google&rsquo;s Gemini API to generate replies; Vercel keeps basic server logs for about 24&nbsp;hours.</p>
          <p>Built with love for Caro &amp; Chris&rsquo;s friends and family &mdash; not a commercial product. Please be kind with it.</p>
          <p><a href="#privacy" onClick={openPrivacy}>Full privacy notice &rarr;</a></p>
        </div>

        {privacyOpen && <PrivacyNotice onClose={() => setPrivacyOpen(false)} />}

        <p className="lock-fineprint">
          {t('lock.fineprint')} <a href={WEDDING_WEBSITE} target="_blank" rel="noopener noreferrer">caroychris.com</a>.
        </p>
      </div>
    </section>
  )
}
