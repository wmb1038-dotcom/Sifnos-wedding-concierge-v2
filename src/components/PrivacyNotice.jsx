const CONTACT_DISPLAY = 'wmb1038 [at] gmail.com'
const CONTACT_HREF = 'mailto:wmb1038@gmail.com?subject=Sifnos%20Concierge%20%E2%80%94%20Privacy%20Request'
const DELETION_HREF =
  'mailto:wmb1038@gmail.com' +
  '?subject=Sifnos%20Concierge%20%E2%80%94%20Data%20Request' +
  '&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20deletion%20of%20any%20data%20associated%20with%20my%20use%20of%20the%20Sifnos%20Wedding%20Concierge.%0A%0A%5BYour%20name%20and%20any%20detail%20that%20may%20help%20identify%20your%20data.%5D%0A%0AThank%20you.'

export default function PrivacyNotice({ onClose }) {
  return (
    <div className="gdpr-backdrop" onClick={onClose} aria-modal="true" role="dialog" aria-label="Privacy Notice">
      <div className="gdpr-notice" onClick={(e) => e.stopPropagation()}>

        <div className="gdpr-notice-header">
          <h2 className="gdpr-title">Privacy Notice</h2>
          <p className="gdpr-subtitle">Sifnos Wedding Concierge &mdash; Caro &amp; Chris, 4 September 2026</p>
        </div>

        <div className="gdpr-body">

          <h3 className="gdpr-section-title">1. Who runs this app</h3>
          <p>
            This app is a personal project by Woodrow Bell &mdash; a friend of the couple, not a business
            or organisation. It was built to help Caro &amp; Chris&rsquo;s guests enjoy Sifnos. It is not
            a commercial product.
          </p>
          <p>
            For any privacy question or data request:{' '}
            <a href={CONTACT_HREF}>{CONTACT_DISPLAY}</a>
          </p>

          <h3 className="gdpr-section-title">2. What is processed</h3>
          <ul>
            <li><strong>Static tabs</strong> (Today, Wedding, Sifnos, Travel) &mdash; no personal data. Content is pre-loaded; nothing is sent anywhere.</li>
            <li><strong>Ask tab (concierge)</strong> &mdash; the text of your questions and conversation so far is sent to Google&rsquo;s Gemini API to generate a reply. No name, email address, or account is attached to these messages.</li>
            <li><strong>Server logs</strong> &mdash; Vercel, our hosting provider, keeps standard infrastructure logs (IP address, timestamp, response code) for approximately 24&nbsp;hours as part of normal operations.</li>
            <li><strong>Weather</strong> &mdash; current conditions are fetched from an open weather service using only island-level location. No user data is transmitted.</li>
            <li><strong>Session storage</strong> &mdash; your RSVP code and active tab are stored in your browser&rsquo;s sessionStorage only. This data never leaves your device.</li>
          </ul>

          <h3 className="gdpr-section-title">3. Lawful basis</h3>
          <p>
            Processing of your Ask-tab messages is based on your consent (Article&nbsp;6(1)(a) GDPR),
            given when you tick the box on the entry screen. You may withdraw consent at any time by
            closing the app and clearing your browser session.
          </p>

          <h3 className="gdpr-section-title">4. Who we share data with</h3>
          <ul>
            <li>
              <strong>Google LLC</strong> &mdash; Ask-tab messages are processed by Google&rsquo;s Gemini API.
              Google is based in the United States and processes data under Standard Contractual Clauses
              (SCCs). See{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.
            </li>
            <li>
              <strong>Vercel Inc.</strong> &mdash; hosts this app. Standard server logs pass through
              Vercel&rsquo;s infrastructure. Vercel is based in the United States and operates under SCCs.
            </li>
          </ul>
          <p>No other third parties receive your data.</p>

          <h3 className="gdpr-section-title">5. Retention</h3>
          <p>
            We hold nothing on our own servers. Vercel&rsquo;s infrastructure logs are retained for
            approximately 24&nbsp;hours. Google may retain API inputs per its own policy &mdash; see
            Google&rsquo;s privacy notice for details.
          </p>

          <h3 className="gdpr-section-title">6. Your rights</h3>
          <p>
            Under GDPR you have the right to access, rectify, or erase data we hold about you; to object
            to or restrict processing; and to lodge a complaint with your national supervisory authority.
            Since we hold no persistent data ourselves, most requests are straightforward to honour.
          </p>
          <p>
            Write to <a href={CONTACT_HREF}>{CONTACT_DISPLAY}</a> and we&rsquo;ll respond promptly.
            To request deletion of any associated data, you can also use this{' '}
            <a href={DELETION_HREF}>pre-filled email template</a>.
          </p>

          <h3 className="gdpr-section-title">7. International transfers</h3>
          <p>
            Both Google and Vercel are US-based. Data is transferred to the United States under Standard
            Contractual Clauses as provided for under Article&nbsp;46 GDPR.
          </p>

          <h3 className="gdpr-section-title">8. Changes to this notice</h3>
          <p>
            If the way we process data changes materially, we&rsquo;ll update this notice and prompt you
            to re-consent the next time you open the app.
          </p>

        </div>

        <div className="gdpr-notice-footer">
          <button className="gdpr-close" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  )
}
