import { useEffect, useState } from 'react'

// Open-Meteo is a free, no-key weather API. Great for the concierge use case.
// We fetch current + 5-day daily forecast for Sifnos in one combined call.

const SIFNOS_LAT = 36.97
const SIFNOS_LNG = 24.71
const CACHE_KEY = 'sifnos_weather_v3'  // v3: forecast days include feels-like, precip, gusts, per-day sunrise/sunset
const CACHE_TTL_MS = 30 * 60 * 1000  // 30 minutes

const WMO_CODES = {
  0:  { label: 'Clear',           icon: 'sun' },
  1:  { label: 'Mainly clear',    icon: 'sun' },
  2:  { label: 'Partly cloudy',   icon: 'cloud-sun' },
  3:  { label: 'Overcast',        icon: 'cloud' },
  45: { label: 'Foggy',           icon: 'fog' },
  48: { label: 'Foggy',           icon: 'fog' },
  51: { label: 'Light drizzle',   icon: 'rain' },
  53: { label: 'Drizzle',         icon: 'rain' },
  55: { label: 'Heavy drizzle',   icon: 'rain' },
  61: { label: 'Light rain',      icon: 'rain' },
  63: { label: 'Rain',            icon: 'rain' },
  65: { label: 'Heavy rain',      icon: 'rain' },
  66: { label: 'Freezing rain',   icon: 'rain' },
  67: { label: 'Freezing rain',   icon: 'rain' },
  71: { label: 'Light snow',      icon: 'snow' },
  73: { label: 'Snow',            icon: 'snow' },
  75: { label: 'Heavy snow',      icon: 'snow' },
  77: { label: 'Snow grains',     icon: 'snow' },
  80: { label: 'Light showers',   icon: 'rain' },
  81: { label: 'Showers',         icon: 'rain' },
  82: { label: 'Heavy showers',   icon: 'rain' },
  85: { label: 'Snow showers',    icon: 'snow' },
  86: { label: 'Heavy snow',      icon: 'snow' },
  95: { label: 'Thunderstorm',    icon: 'storm' },
  96: { label: 'Thunderstorm',    icon: 'storm' },
  99: { label: 'Thunderstorm',    icon: 'storm' },
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
        const url = [
          'https://api.open-meteo.com/v1/forecast',
          `?latitude=${SIFNOS_LAT}&longitude=${SIFNOS_LNG}`,
          '&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m',
          '&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max,wind_direction_10m_dominant,wind_gusts_10m_max,precipitation_probability_max,precipitation_sum,sunset,sunrise,uv_index_max',
          '&forecast_days=5',
          '&timezone=Europe%2FAthens',
        ].join('')

        const resp = await fetch(url)
        if (!resp.ok) throw new Error('Weather fetch failed')
        const data = await resp.json()
        const current = data.current || {}
        const daily = data.daily || {}

        const code = current.weather_code
        const wmo = WMO_CODES[code] || { label: 'Mild', icon: 'sun' }

        const windDir = current.wind_direction_10m
        const compass = compassDirection(windDir)

        const forecast = (daily.time || []).map((isoDate, i) => {
          const dayCode = daily.weather_code?.[i] ?? 0
          const dayWmo = WMO_CODES[dayCode] || { label: 'Mild', icon: 'sun' }
          return {
            date: isoDate,
            condition: dayWmo.label,
            icon: dayWmo.icon,
            maxTempC:    Math.round(daily.temperature_2m_max?.[i]),
            minTempC:    Math.round(daily.temperature_2m_min?.[i]),
            feelsMaxC:   Math.round(daily.apparent_temperature_max?.[i]),
            feelsMinC:   Math.round(daily.apparent_temperature_min?.[i]),
            windKmh:     Math.round(daily.wind_speed_10m_max?.[i]),
            windDir:     compassDirection(daily.wind_direction_10m_dominant?.[i]),
            windGustKmh: Math.round(daily.wind_gusts_10m_max?.[i]),
            precipPct:   daily.precipitation_probability_max?.[i] ?? null,
            precipMm:    daily.precipitation_sum?.[i] != null
              ? Math.round(daily.precipitation_sum[i] * 10) / 10
              : null,
            uvIndex:     daily.uv_index_max?.[i] != null
              ? Math.round(daily.uv_index_max[i])
              : null,
            sunriseIso:  daily.sunrise?.[i] ?? null,
            sunsetIso:   daily.sunset?.[i] ?? null,
          }
        })

        const processed = {
          tempC: Math.round(current.temperature_2m),
          tempF: Math.round(current.temperature_2m * 9 / 5 + 32),
          condition: wmo.label,
          icon: wmo.icon,
          windKmh: Math.round(current.wind_speed_10m),
          windDirection: compass,
          windDirectionDeg: windDir,
          isMeltemi: ['N', 'NNE', 'NE'].includes(compass) && current.wind_speed_10m > 20,
          maxTempC: Math.round(daily.temperature_2m_max?.[0]),
          minTempC:  Math.round(daily.temperature_2m_min?.[0]),
          sunsetIso: daily.sunset?.[0],
          sunriseIso: daily.sunrise?.[0],
          uvIndex: daily.uv_index_max?.[0],
          forecast,
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
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}
