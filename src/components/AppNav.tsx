import { overallProgress, percentOf } from '../progress'
import type { AppState, Theme } from '../storage'
import { ROUTE_META, type Route } from '../router'
import { MoonIcon, SunIcon } from './icons'

interface AppNavProps {
  route: Route
  state: AppState
  theme: Theme
  onToggleTheme: () => void
}

export function AppNav({ route, state, theme, onToggleTheme }: AppNavProps) {
  const percent = percentOf(overallProgress(state))

  const links: { route: Route; label: string; percent?: number }[] = [
    { route: 'home', label: 'Обзор' },
    { route: 'plan', label: 'План', percent },
    { route: 'checks', label: 'Проверки' },
    { route: 'theory', label: 'Теория' },
  ]

  return (
    <nav className="app-nav" aria-label="Разделы плана">
      <ul className="app-nav__list">
        {links.map((link) => (
          <li key={link.route}>
            <a className="app-nav__link" aria-current={route === link.route ? 'page' : undefined} href={ROUTE_META[link.route].hash}>
              {link.label}
              {link.percent !== undefined && <span className="app-nav__percent">{link.percent} %</span>}
            </a>
          </li>
        ))}
        <li className="app-nav__theme-item">
          <button
            type="button"
            className="app-nav__link app-nav__theme"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </li>
      </ul>
    </nav>
  )
}
