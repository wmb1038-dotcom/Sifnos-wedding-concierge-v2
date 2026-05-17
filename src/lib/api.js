// Thin wrapper around the /api/chat endpoint.

const TIMEOUT_MS = 30_000

function getLocale() {
  try { return localStorage.getItem('sifnos_locale') || 'en' } catch { return 'en' }
}

export async function postChat(code, messages, context = null) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rsvp_code: code, messages, context, locale: getLocale() }),
      signal: controller.signal,
    })
    const data = await resp.json().catch(() => ({}))
    return {
      ok: resp.ok,
      status: resp.status,
      reply: data.reply,
      error: data.error,
    }
  } finally {
    clearTimeout(timer)
  }
}
