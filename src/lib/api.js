// Thin wrapper around the /api/chat endpoint.

export async function postChat(code, messages, context = null) {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rsvp_code: code, messages, context }),
  })
  const data = await resp.json().catch(() => ({}))
  return {
    ok: resp.ok,
    status: resp.status,
    reply: data.reply,
    error: data.error,
  }
}
