import { useState, useEffect, useRef, useCallback } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import { postChat } from '../lib/api.js'
import { useT } from '../i18n/index.jsx'

export default function AskTab({ rsvpCode, seedContext, clearSeed }) {
  const t = useT()
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [throttled, setThrottled] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)
  const throttleTimer = useRef(null)

  useEffect(() => () => clearTimeout(throttleTimer.current), [])

  // First-time greeting
  useEffect(() => {
    if (!hasGreeted && history.length === 0) {
      setHasGreeted(true)
      sendGreeting()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle seeded prompts from other tabs
  useEffect(() => {
    if (!seedContext) return
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

    // Build the new history immediately (so the user message renders)
    const newHistory = [...history, { role: 'user', content: text.trim() }]
    setHistory(newHistory)
    setInput('')
    setSending(true)

    try {
      const res = await postChat(rsvpCode, newHistory, context)
      if (res.ok) {
        setHistory([...newHistory, { role: 'assistant', content: res.reply }])
      } else if (res.status === 401) {
        setHistory([...newHistory, { role: 'assistant', content: t('ask.accessExpired') }])
      } else {
        setHistory([...newHistory, { role: 'assistant', content: res.error || t('ask.snag', { error: 'unknown' }) }])
      }
    } catch (err) {
      setHistory([...newHistory, { role: 'assistant', content: t('ask.noConnection') }])
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

  const reset = () => {
    if (history.length > 1 && !confirm(t('ask.confirmReset'))) return
    setHistory([])
    setHasGreeted(false)
  }

  const showStarters = history.length <= 1

  const starters = t('ask.starters') || []

  return (
    <div className="page page-ask">
      <PageHeader
        eyebrow={t('ask.eyebrow')}
        title={`<span>${t('ask.title1')}</span> <em>${t('ask.title2')}</em>`}
        subtitle={t('ask.subtitle')}
      >
        <button className="reset-btn" onClick={reset} aria-label={t('ask.startOver')} title={t('ask.startFresh')}>
          <Icon name="ask" size={14} /> {t('ask.startOver')}
        </button>
      </PageHeader>

      <div className="messages" role="log" aria-live="polite">
        {history.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} t={t} />
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

function MessageBubble({ role, content, t }) {
  return (
    <div className={`bubble ${role === 'user' ? 'from-user' : 'from-bot'}`}>
      <span className="sender">{role === 'user' ? t('ask.you') : t('ask.concierge')}</span>
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

function TypingIndicator() {
  return (
    <div className="typing" aria-label="Concierge is thinking">
      <span></span><span></span><span></span>
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
