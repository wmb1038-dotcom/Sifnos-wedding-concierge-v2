import { createContext, useCallback, useContext, useState } from 'react'
import en from './en.js'
import el from './el.js'
import it from './it.js'
import es from './es.js'

const STRINGS = { en, el, it, es }

export const LOCALES = [
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'it', label: 'Italiano',  flag: '🇮🇹' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
]

function detectLocale() {
  try {
    const stored = localStorage.getItem('sifnos_locale')
    if (stored && STRINGS[stored]) return stored
    const nav = (navigator.language || '').toLowerCase()
    if (nav.startsWith('el')) return 'el'
    if (nav.startsWith('it')) return 'it'
    if (nav.startsWith('es')) return 'es'
  } catch (_) { /* private browsing */ }
  return 'en'
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale)

  const setLocale = useCallback((code) => {
    if (!STRINGS[code]) return
    try { localStorage.setItem('sifnos_locale', code) } catch (_) {}
    setLocaleState(code)
  }, [])

  // t('some.key', { var: value }) — falls back to English, then to the key itself
  const t = useCallback((key, vars) => {
    const str =
      getPath(STRINGS[locale], key) ??
      getPath(STRINGS.en, key) ??
      key
    if (!vars || typeof str !== 'string') return str
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
  }, [locale])

  // localize({ en, el, it, es }) → picks the right string for current locale
  const localize = useCallback((field) => {
    if (typeof field === 'string') return field
    if (field && typeof field === 'object') {
      return field[locale] ?? field.en ?? Object.values(field)[0] ?? ''
    }
    return ''
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, localize }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function useT() {
  const ctx = useContext(LocaleContext)
  return ctx ? ctx.t : (k) => k
}
