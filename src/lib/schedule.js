// All schedule times are in Europe/Athens (UTC+3 in September).
// We always compare against `new Date()` which is the user's local clock —
// that's fine; the ISO strings have the +03:00 offset baked in, so JS will
// correctly interpret them across timezones.

import { SCHEDULE } from '../data/wedding.js'

/** Returns a human-friendly countdown to the given ISO string, or null if past. */
export function timeUntil(targetIso, now = new Date()) {
  const target = new Date(targetIso)
  const ms = target - now
  if (ms <= 0) return null
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  return { days, hours, minutes, totalMs: ms }
}

/** Returns the currently-happening event from SCHEDULE, if any. */
export function currentEvent(now = new Date()) {
  return SCHEDULE.find(ev => {
    const s = new Date(ev.start)
    const e = new Date(ev.end)
    return now >= s && now < e
  }) || null
}

/** Returns the next event from SCHEDULE after `now`, or null if all past. */
export function nextEvent(now = new Date()) {
  return SCHEDULE.find(ev => new Date(ev.start) > now) || null
}

/** Has the wedding day fully ended? */
export function weddingIsOver(now = new Date()) {
  const last = SCHEDULE[SCHEDULE.length - 1]
  return new Date(last.end) <= now
}

/** Formats a time range like "6:00 – 6:30 pm" in the venue's local time. */
export function formatRange(startIso, endIso) {
  const fmt = (iso) => new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).toLowerCase().replace(' ', '')
  return `${fmt(startIso)} – ${fmt(endIso)}`
}

/** Convenience: phase of the trip, used for "Today" tab smart suggestions. */
export function tripPhase(now = new Date()) {
  const weddingStart = new Date(SCHEDULE[0].start)
  const weddingEnd = new Date(SCHEDULE[SCHEDULE.length - 1].end)
  const daysUntil = Math.floor((weddingStart - now) / (1000 * 60 * 60 * 24))

  if (now < weddingStart && daysUntil > 7) return { phase: 'pre-trip', daysUntil }
  if (now < weddingStart && daysUntil > 1) return { phase: 'on-island', daysUntil }
  if (now < weddingStart) return { phase: 'eve', daysUntil }
  if (now >= weddingStart && now < weddingEnd) return { phase: 'wedding-day', daysUntil: 0 }
  // Within ~3 days after
  const daysSince = Math.floor((now - weddingEnd) / (1000 * 60 * 60 * 24))
  if (daysSince <= 3) return { phase: 'morning-after', daysSince }
  return { phase: 'post-trip', daysSince }
}
