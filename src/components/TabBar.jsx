import Icon from './Icon.jsx'

const TABS = [
  { id: 'today',   label: 'Today',   icon: 'calendar' },
  { id: 'wedding', label: 'Wedding', icon: 'heart' },
  { id: 'sifnos',  label: 'Sifnos',  icon: 'map' },
  { id: 'travel',  label: 'Travel',  icon: 'bag' },
  { id: 'ask',     label: 'Ask',     icon: 'chat' },
]

export default function TabBar({ activeTab, onChange }) {
  return (
    <nav className="tab-bar" role="tablist" aria-label="Main navigation">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          <Icon name={tab.icon} size={22} />
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
