import { useState, useEffect, useRef, useCallback } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import { postChat } from '../lib/api.js'

const STARTER_PROMPTS = [
  { q: "What's the schedule for the wedding day?", label: 'Wedding schedule' },
  { q: 'Where is the venue and how do I get there?', label: 'Venue &amp; directions' },
  { q: "What's the dress code?", label: 'Dress code' },
  { q: 'How do I get from Athens to Sifnos?', label: 'Getting to Sifnos' },
  { q: 'Where do Caro and Chris recommend eating?', label: "Caro &amp; Chris's food picks" },
  { q: 'Which beaches should I visit?', label: 'Best beaches' },
  { q: 'What should I pack for early September on Sifnos?', label: 'What to pack' },
  { q: 'Where should I stay on the island?', label: 'Where to stay' },
]

export default function AskTab({ rsvpCode, seedContext, clearSeed }) {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)

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
        setHistory([{ role: 'assistant', content: 'Hi! Ask me anything about the wedding or about Sifnos.' }])
      }
    } catch (err) {
      setHistory([{ role: 'assistant', content: 'Hi! Ask me anything about the wedding or about Sifnos.' }])
    } finally {
      setSending(false)
    }
  }, [rsvpCode])

  const submitMessage = useCallback(async (text, context = null) => {
    if (!text.trim() || sending) return

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
        setHistory([...newHistory, { role: 'assistant', content: 'My access expired — refresh and re-enter your RSVP code.' }])
      } else {
        setHistory([...newHistory, { role: 'assistant', content: `Sorry — I hit a snag (${res.error || 'unknown'}). Try once more?` }])
      }
    } catch (err) {
      setHistory([...newHistory, { role: 'assistant', content: "Couldn't reach the concierge — check your connection." }])
    } finally {
      setSending(false)
    }
  }, [history, rsvpCode, sending])

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
    if (history.length > 1 && !confirm('Start a fresh conversation?')) return
    setHistory([])
    setHasGreeted(false)
  }

  const showStarters = history.length <= 1

  return (
    <div className="page page-ask">
      <PageHeader
        eyebrow="A small AI helper"
        title="<span>Ask the</span> <em>concierge</em>"
        subtitle="Wedding logistics, the island, restaurants, anything in between — type away."
      >
        <button className="reset-btn" onClick={reset} aria-label="Start over" title="Start fresh">
          <Icon name="ask" size={14} /> Start over
        </button>
      </PageHeader>

      <div className="messages" role="log" aria-live="polite">
        {history.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {sending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {showStarters && (
        <div className="suggestions">
          {STARTER_PROMPTS.map(s => (
            <button
              key={s.q}
              className="chip"
              onClick={() => submitMessage(s.q)}
              dangerouslySetInnerHTML={{ __html: s.label }}
            />
          ))}
        </div>
      )}

      <form className="chat-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-input"
            rows={1}
            placeholder="Ask anything — the schedule, beaches, food…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Type your question"
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!input.trim() || sending}
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12 L20 4 L13 20 L11 13 Z" />
            </svg>
          </button>
        </div>
        <p className="chat-fineprint">
          AI can be wrong — for canonical info, check{' '}
          <a href="https://www.caroychris.com" target="_blank" rel="noopener noreferrer">caroychris.com</a>.
        </p>
      </form>
    </div>
  )
}

function MessageBubble({ role, content }) {
  return (
    <div className={`bubble ${role === 'user' ? 'from-user' : 'from-bot'}`}>
      <span className="sender">{role === 'user' ? 'you' : 'concierge'}</span>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    </div>
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
