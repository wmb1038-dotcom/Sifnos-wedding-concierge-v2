import { useState, useEffect, useCallback } from 'react'
import LockScreen from './components/LockScreen.jsx'
import TabBar from './components/TabBar.jsx'
import TodayTab from './tabs/TodayTab.jsx'
import WeddingTab from './tabs/WeddingTab.jsx'
import SifnosTab from './tabs/SifnosTab.jsx'
import TravelTab from './tabs/TravelTab.jsx'
import AskTab from './tabs/AskTab.jsx'
import { postChat } from './lib/api.js'

const LS_RSVP = 'sifnos_rsvp_code'
const LS_TAB = 'sifnos_active_tab'
const LS_CONSENT = 'sifnos_consent_ts'
const CONSENT_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

function consentIsValid() {
  const ts = sessionStorage.getItem(LS_CONSENT)
  if (!ts) return false
  return Date.now() - new Date(ts).getTime() < CONSENT_MAX_AGE_MS
}

export default function App() {
  // RSVP gate state
  const [rsvpCode, setRsvpCode] = useState(() => {
    if (!consentIsValid()) {
      sessionStorage.removeItem(LS_RSVP)
      sessionStorage.removeItem(LS_CONSENT)
      return null
    }
    return sessionStorage.getItem(LS_RSVP)
  })
  const [unlocking, setUnlocking] = useState(false)
  const [lockError, setLockError] = useState('')

  // Tab state
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem(LS_TAB) || 'today')

  // The "context" passed to the concierge — tells the AI which tab the
  // guest came from when they tap "Ask the concierge" from somewhere.
  const [askContext, setAskContext] = useState(null)

  useEffect(() => {
    sessionStorage.setItem(LS_TAB, activeTab)
  }, [activeTab])

  const handleUnlock = useCallback(async (code) => {
    setUnlocking(true)
    setLockError('')
    try {
      // Validate the code via a cheap test message
      const res = await postChat(code, [{ role: 'user', content: 'hi' }])
      if (res.ok) {
        sessionStorage.setItem(LS_RSVP, code)
        setRsvpCode(code)
        return true
      } else if (res.status === 401) {
        setLockError("That code didn't work — check your invitation?")
      } else {
        setLockError(res.error || 'Something went sideways. Try again?')
      }
    } catch (err) {
      setLockError("Couldn't reach the concierge. Check your connection?")
    } finally {
      setUnlocking(false)
    }
    return false
  }, [])

  // Helper for any tab to jump to Ask with a seed prompt
  const goToAskWith = useCallback((prompt, context) => {
    setAskContext({ prompt, context, ts: Date.now() })
    setActiveTab('ask')
  }, [])

  if (!rsvpCode) {
    return (
      <LockScreen
        onUnlock={handleUnlock}
        unlocking={unlocking}
        error={lockError}
      />
    )
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {activeTab === 'today'   && <TodayTab   onAsk={goToAskWith} setTab={setActiveTab} />}
        {activeTab === 'wedding' && <WeddingTab onAsk={goToAskWith} />}
        {activeTab === 'sifnos'  && <SifnosTab  onAsk={goToAskWith} />}
        {activeTab === 'travel'  && <TravelTab  onAsk={goToAskWith} />}
        {activeTab === 'ask'     && <AskTab     rsvpCode={rsvpCode} seedContext={askContext} clearSeed={() => setAskContext(null)} />}
      </main>
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
