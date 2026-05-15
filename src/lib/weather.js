import { useEffect, useState } from 'react'

// Open-Meteo is a free, no-key weather API. Great for the concierge use case.
// We fetch current weather for Sifnos (centroid coords) and cache for 30 min.

const SIFNOS_LAT = 36.97
const SIFNOS_LNG = 24.71
const CACHE_KEY = 'sifnos_weather_v1'
const CACHE_TTL_MS = 30 * 60 * 1000  // 30 minutes

const WMO_CODES = {
  0: { label: 'Clear', icon: 'sun' },
  1: { label: 'Mainly clear', icon: 'sun' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Foggy', icon: 'cloud' },
  48: { label: 'Foggy', icon: 'cloud' },
  51: { label: 'Light drizzle', icon: 'rain' },
  53: { label: 'Drizzle', icon: 'rain' },
  55: { label: 'Heavy drizzle', icon: 'rain' },
  61: { label: 'Light rain', icon: 'rain' },
  63: { label: 'Rain', icon: 'rain' },
  65: { label: 'Heavy rain', icon: 'rain' },
  80: { label: 'Light showers', icon: 'rain' },
  81: { label: 'Showers', icon: 'rain' },
  82: { label: 'Heavy showers', icon: 'rain' },
  95: { label: 'Thunderstorm', icon: 'storm' },
}

function loadCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function saveCached(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

export function useWeather() {
  const [weather, setWeather] = useState(() => loadCached())
  const [loading, setLoading] = useState(!weather)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (weather) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${SIFNOS_LAT}&longitude=${SIFNOS_LNG}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunset,sunrise,uv_index_max&timezone=Europe%2FAthens`
        const resp = await fetch(url)
        if (!resp.ok) throw new Error('Weather fetch failed')
        const data = await resp.json()
        const current = data.current || {}
        const daily = data.daily || {}

        const code = current.weather_code
        const wmo = WMO_CODES[code] || { label: 'Mild', icon: 'sun' }

        // The Cyclades meltemi is a northerly wind — we surface direction
        // so guests know if a windward beach (e.g. Vroulidia) is realistic.
        const windDir = current.wind_direction_10m
        const compass = compassDirection(windDir)

        const processed = {
          tempC: Math.round(current.temperature_2m),
          tempF: Math.round(current.temperature_2m * 9/5 + 32),
          condition: wmo.label,
          icon: wmo.icon,
          windKmh: Math.round(current.wind_speed_10m),
          windDirection: compass,
          windDirectionDeg: windDir,
          isMeltemi: ['N', 'NNE', 'NE'].includes(compass) && current.wind_speed_10m > 20,
          maxTempC: Math.round(daily.temperature_2m_max?.[0]),
          minTempC: Math.round(daily.temperature_2m_min?.[0]),
          sunsetIso: daily.sunset?.[0],
          sunriseIso: daily.sunrise?.[0],
          uvIndex: daily.uv_index_max?.[0],
        }

        if (cancelled) return
        setWeather(processed)
        saveCached(processed)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [weather])

  return { weather, loading, error }
}

function compassDirection(deg) {
  if (deg == null) return '—'
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}
