import { useState, useEffect, useRef, useCallback } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import PrivacyNotice from '../components/PrivacyNotice.jsx'
import CleoAvatar from '../components/CleoAvatar.jsx'
import { postChat } from '../lib/api.js'
import { useT } from '../i18n/index.jsx'

const CONSENT_KEY = 'sifnos_consent_ts'

export default function AskTab({ rsvpCode, seedContext, clearSeed }) {
  const t = useT()
  const [hasConsented, setHasConsented] = useState(() => !!sessionStorage.getItem(CONSENT_KEY))
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [throttled, setThrottled] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [cleoOpen, setCleoOpen] = useState(false)
  const cleoTriggerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)
  const throttleTimer = useRef(null)
  const lastSentText = useRef('')

  useEffect(() => () => clearTimeout(throttleTimer.current), [])

  useEffect(() => {
    if (!cleoOpen) return
    const close = (e) => {
      if (!cleoTriggerRef.current?.contains(e.target)) setCleoOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [cleoOpen])

  // First-time greeting (fires once consent is given)
  useEffect(() => {
    if (!hasConsented) return
    if (!hasGreeted && history.length === 0) {
      setHasGreeted(true)
      sendGreeting()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasConsented])

  // Handle seeded prompts from other tabs
  useEffect(() => {
    if (!seedContext) return
    if (!hasConsented) { clearSeed(); return }
    if (seedContext.prompt) {
      submitMessage(seedContext.prompt, seedContext.context)
    }
    clearSeed()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedContext])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  // Autoresize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }, [input])

  const handleRetry = useCallback(() => {
    setHistory(h => h.slice(0, -2))
    setInput(lastSentText.current)
  }, [])

  const sendGreeting = useCallback(async () => {
    setSending(true)
    try {
      const res = await postChat(rsvpCode, [{ role: 'user', content: 'hi' }])
      if (res.ok) {
        setHistory([{ role: 'assistant', content: res.reply }])
      } else {
        setHistory([{ role: 'assistant', content: t('ask.fallbackGreeting') }])
      }
    } catch (err) {
      setHistory([{ role: 'assistant', content: t('ask.fallbackGreeting') }])
    } finally {
      setSending(false)
    }
  }, [rsvpCode, t])

  const submitMessage = useCallback(async (text, context = null) => {
    if (!text.trim() || sending || throttled) return

    const trimmed = text.trim()
    lastSentText.current = trimmed

    const newHistory = [...history, { role: 'user', content: trimmed }]
    setHistory(newHistory)
    setInput('')
    setSending(true)

    try {
      const res = await postChat(rsvpCode, newHistory, context)
      if (res.ok) {
        setHistory([...newHistory, { role: 'assistant', content: res.reply }])
      } else if (res.status === 401) {
        setHistory([...newHistory, { role: 'assistant', content: t('ask.accessExpired') }])
      } else if (res.status === 429) {
        setHistory([...newHistory, { role: 'assistant', content: t('ask.errRateLimit'), errorType: 'ratelimit' }])
      } else {
        setHistory([...newHistory, { role: 'assistant', content: res.error || t('ask.errServer'), errorType: 'server' }])
      }
    } catch (err) {
      const isTimeout = err.name === 'AbortError'
      if (isTimeout) {
        setHistory([...newHistory, { role: 'assistant', content: t('ask.errServer'), errorType: 'timeout' }])
      } else {
        setHistory([...newHistory, { role: 'assistant', content: t('ask.errOffline'), errorType: 'offline' }])
      }
    } finally {
      setSending(false)
      setThrottled(true)
      clearTimeout(throttleTimer.current)
      throttleTimer.current = setTimeout(() => setThrottled(false), 2000)
    }
  }, [history, rsvpCode, sending, throttled, t])

  const handleSubmit = (e) => {
    e.preventDefault()
    submitMessage(input)
  }

  const handleKeyDown = (e) => {
    const isDesktop = window.matchMedia('(min-width: 700px)').matches
    if (e.key === 'Enter' && !e.shiftKey && isDesktop) {
      e.preventDefault()
      submitMessage(input)
    }
  }

  const handleConsent = useCallback(() => {
    sessionStorage.setItem(CONSENT_KEY, new Date().toISOString())
    setHasConsented(true)
  }, [])

  const reset = () => {
    if (history.length > 1 && !confirm(t('ask.confirmReset'))) return
    setHistory([])
    setHasGreeted(false)
  }

  const showStarters = history.length <= 1

  const starters = t('ask.starters') || []

  if (!hasConsented) {
    return (
      <div className="page page-ask">
        <PageHeader
          eyebrow={t('ask.eyebrow')}
          title={`<span>${t('ask.title1')}</span> <em>${t('ask.title2')}</em>`}
          subtitle={t('ask.subtitle')}
        />
        <AskConsentGate
          onConsent={handleConsent}
          onOpenPrivacy={() => setPrivacyOpen(true)}
          cleo={<CleoAvatar size="lg" />}
        />
        {privacyOpen && <PrivacyNotice onClose={() => setPrivacyOpen(false)} />}
      </div>
    )
  }

  return (
    <div className="page page-ask">
      <PageHeader
        eyebrow={t('ask.eyebrow')}
        title={`<span>${t('ask.title1')}</span> <em>${t('ask.title2')}</em>`}
        subtitle={t('ask.subtitle')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            ref={cleoTriggerRef}
            className={`cleo-avatar-trigger${cleoOpen ? ' open' : ''}`}
            onClick={() => setCleoOpen(o => !o)}
            role="button"
            tabIndex={0}
            aria-label="Meet Cleo"
            onKeyDown={(e) => e.key === 'Enter' && setCleoOpen(o => !o)}
          >
            <CleoAvatar size="sm" />
            <div className="cleo-popover" aria-hidden={!cleoOpen}>
              <CleoAvatar size="lg" />
              <p className="cleo-popover-name">Cleo</p>
              <p className="cleo-popover-tag">Wedding Concierge</p>
            </div>
          </div>
          <button className="reset-btn" onClick={reset} aria-label={t('ask.startOver')} title={t('ask.startFresh')}>
            <Icon name="ask" size={14} /> {t('ask.startOver')}
          </button>
        </div>
      </PageHeader>

      <div className="messages" role="log" aria-live="polite">
        {history.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            errorType={msg.errorType}
            onRetry={msg.errorType ? handleRetry : null}
            t={t}
          />
        ))}
        {sending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {showStarters && (
        <div className="suggestions">
          {starters.map(s => (
            <button
              key={s.q}
              className="chip"
              onClick={() => submitMessage(s.q)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <form className="chat-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-input"
            rows={1}
            placeholder={t('ask.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={t('ask.placeholder')}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!input.trim() || sending || throttled}
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12 L20 4 L13 20 L11 13 Z" />
            </svg>
          </button>
        </div>
        <FinePrint t={t} />
      </form>
    </div>
  )
}

function MessageBubble({ role, content, errorType, onRetry, t }) {
  if (role !== 'user') {
    return (
      <div className="bubble-row">
        <CleoAvatar size="sm" />
        <div className={`bubble from-bot${errorType ? ' bubble-error' : ''}`}>
          <span className="sender">{t('ask.concierge')}</span>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          {errorType && onRetry && (
            <button type="button" className="retry-btn" onClick={onRetry}>
              {t('ask.tryAgain')}
            </button>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="bubble from-user">
      <span className="sender">{t('ask.you')}</span>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    </div>
  )
}

function FinePrint({ t }) {
  const text = t('ask.fineprint') || ''
  const parts = text.split('caroychris.com')
  if (parts.length < 2) return <p className="chat-fineprint">{text}</p>
  return (
    <p className="chat-fineprint">
      {parts[0]}<a href="https://www.caroychris.com" target="_blank" rel="noopener noreferrer">caroychris.com</a>{parts[1]}
    </p>
  )
}

function AskConsentGate({ onConsent, onOpenPrivacy, cleo }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="ask-consent-gate">
      <div className="ask-consent-card">
        {cleo}
        <p className="card-eyebrow">Before we chat</p>
        <h2 className="card-title">A note on privacy</h2>
        <p className="ask-consent-body">
          Cleo uses Google&rsquo;s Gemini AI to generate replies.
          Nothing is stored on our servers &mdash; your words go in and an answer comes back.
          The other tabs (Today, Wedding, Sifnos, Travel) work without this.
        </p>
        <div className="ask-consent-check">
          <input
            id="ask-consent-cb"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="ask-consent-cb">
            I&rsquo;ve read the{' '}
            <button type="button" className="ask-consent-link" onClick={onOpenPrivacy}>privacy notice</button>
            {' '}and agree my messages may be sent to Google&rsquo;s Gemini API.
            I can withdraw consent any time by closing the app.
          </label>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={!checked}
          onClick={onConsent}
          style={{ width: '100%', justifyContent: 'center', opacity: checked ? 1 : 0.5 }}
        >
          Open chat
        </button>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="bubble-row">
      <CleoAvatar size="sm" />
      <div className="typing" aria-label="Cleo is thinking">
        <span></span><span></span><span></span>
      </div>
    </div>
  )
}

// Light Markdown → HTML renderer
function renderMarkdown(src) {
  const esc = (s) => s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
  let s = esc(src || '')
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  const blocks = s.split(/\n{2,}/).map(block => {
    const lines = block.split(/\n/)
    const isBullet = lines.every(l => /^\s*[-•]\s+/.test(l))
    const isNumbered = lines.every(l => /^\s*\d+[.)]\s+/.test(l))
    if (isBullet) return '<ul>' + lines.map(l => '<li>' + l.replace(/^\s*[-•]\s+/, '') + '</li>').join('') + '</ul>'
    if (isNumbered) return '<ol>' + lines.map(l => '<li>' + l.replace(/^\s*\d+[.)]\s+/, '') + '</li>').join('') + '</ol>'
    return '<p>' + lines.join('<br/>') + '</p>'
  })
  return blocks.join('')
}
