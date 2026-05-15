import { useState } from 'react'
import { TAGLINE, WEDDING_WEBSITE } from '../data/wedding.js'
import PrivacyModal from './PrivacyModal.jsx'

const CONSENT_KEY = 'sifnos_consent_ts'

export default function LockScreen({ onUnlock, unlocking, error }) {
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

  const closePrivacy = () => setPrivacyOpen(false)

  return (
    <section className="lock-screen">
      <div className="lock-card">
        <div className="lock-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 50 H50 V32 L32 18 L14 32 Z" />
            <path d="M28 50 V40 H36 V50" />
            <path d="M32 14 V20 M29 17 H35" />
            <circle cx="32" cy="14" r="0.8" fill="currentColor" />
          </svg>
        </div>

        <p className="eyebrow">Sifnos · 4 September 2026</p>
        <h1 className="lock-title">Caro<br/>&amp; <em>Chris</em></h1>
        <p className="greek-tagline" lang="el">{TAGLINE.greek}</p>
        <p className="lock-body">
          A companion for your trip to Sifnos &mdash;
          the schedule, the island, the best taverna,
          and a friendly concierge ready when you are.
        </p>

        <form className="lock-form" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="rsvp-input" className="lock-label">Enter your RSVP code</label>
          <div className="lock-input-row">
            <input
              id="rsvp-input"
              className="lock-input"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              spellCheck="false"
              placeholder="from your invitation"
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
              title={canSubmit ? undefined : 'Tick the box and enter your code to continue'}
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
              I&rsquo;ve read the{' '}
              <a href="#privacy" onClick={openPrivacy}>privacy notice</a>
              {' '}and agree that my messages may be sent to Google&rsquo;s Gemini API to generate replies.
              I can withdraw consent any time by closing the app.
            </label>
          </div>

          {error && <p className="lock-error" role="alert">{error}</p>}
        </form>

        {privacyOpen && <PrivacyModal onClose={closePrivacy} />}

        <p className="lock-fineprint">
          For canonical info, visit <a href={WEDDING_WEBSITE} target="_blank" rel="noopener noreferrer">caroychris.com</a>.
        </p>
      </div>
    </section>
  )
}
