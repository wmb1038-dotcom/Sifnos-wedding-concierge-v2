import { WEDDING_WEBSITE } from '../data/wedding.js'

export default function PrivacyModal({ onClose }) {
  return (
    <div className="privacy-backdrop" onClick={onClose} aria-modal="true" role="dialog" aria-label="Privacy notice">
      <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="privacy-modal-title">Privacy notice</h2>
        <div className="privacy-modal-body">
          <p>This concierge is powered by Google&rsquo;s Gemini AI &mdash; genuinely useful, but not always right. For anything that matters, trust <a href={WEDDING_WEBSITE} target="_blank" rel="noopener noreferrer">caroychris.com</a> or write to Caro &amp; Chris directly.</p>
          <p>No analytics, no stored messages, no tracking here. Your questions are sent to Google&rsquo;s Gemini API to generate replies; Vercel, the hosting provider, keeps standard server logs for roughly 24&nbsp;hours.</p>
          <p>Built with love for Caro &amp; Chris&rsquo;s people &mdash; not a commercial product. Please be kind with it.</p>
        </div>
        <button className="privacy-modal-close" onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}
