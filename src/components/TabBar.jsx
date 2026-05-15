import Icon from './Icon.jsx'
import { useT } from '../i18n/index.jsx'

const TAB_IDS = [
  { id: 'today',   icon: 'calendar' },
  { id: 'wedding', icon: 'heart' },
  { id: 'sifnos',  icon: 'map' },
  { id: 'travel',  icon: 'bag' },
  { id: 'ask',     icon: 'chat' },
]

export default function TabBar({ activeTab, onChange }) {
  const t = useT()
  return (
    <nav className="tab-bar" role="tablist" aria-label="Main navigation">
      {TAB_IDS.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          <Icon name={tab.icon} size={22} />
          <span className="tab-label">{t(`tabs.${tab.id}`)}</span>
        </button>
      ))}
    </nav>
  )
}
