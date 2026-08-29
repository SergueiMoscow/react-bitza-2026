import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import { NAV_ITEMS } from '../nav'
import { VoiceCommandModal } from './VoiceCommandModal'

export function Layout() {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">Bitza</div>
        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button
            className="icon-button menu-toggle"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label="Меню"
          >
            ☰
          </button>
          <span className="topbar-title">Bitza</span>
          <div className="topbar-actions">
            <button className="icon-button" onClick={() => setVoiceOpen(true)} aria-label="Голосовая команда">
              🎤
            </button>
            <button className="icon-button" onClick={toggleTheme} aria-label="Переключить тему">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="logout-button" onClick={logout}>
              Выйти
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {voiceOpen && <VoiceCommandModal onClose={() => setVoiceOpen(false)} />}
    </div>
  )
}
