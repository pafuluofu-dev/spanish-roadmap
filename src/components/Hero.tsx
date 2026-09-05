import { GOAL_DATE, PLANNED_HOURS } from '../data/plan'
import { daysUntil, fmtHours } from '../dates'
import { overallProgress, percentOf } from '../progress'
import type { AppState } from '../storage'
import { AnimatedNumber } from './AnimatedNumber'

interface HeroProps {
  state: AppState
}

export function Hero({ state }: HeroProps) {
  const progress = overallProgress(state)
  const percent = percentOf(progress)

  const stats: { value: number; format?: (value: number) => string; unit: string; label: string }[] = [
    { value: daysUntil(GOAL_DATE), unit: 'дн', label: 'до конца 12 недель · 29 ноября 2026' },
    {
      value: progress.doneMinutes,
      format: (minutes) => fmtHours(minutes / 60),
      unit: 'ч',
      label: `сделано из ≈${PLANNED_HOURS} ч по плану`,
    },
    { value: progress.done, unit: 'зан.', label: `сделано из ${progress.total} занятий` },
  ]

  return (
    <header className="hero">
      <p className="eyebrow">Испанский · A1 за 12 недель · Бебрис + Udemy</p>
      <h1>Маршрут: испанский</h1>
      <p className="hero__lead">
        База A1 с нуля за двенадцать недель. <strong>Блок A</strong> — звуки, ser/estar и настоящее время (недели 1–4), <strong>блок B</strong> — бытовой
        испанский и gustar (5–8), <strong>блок C</strong> — слух, речь и итог A1 (9–12). Ритм: пн–пт — занятие 60–90 минут, суббота — повтор недели и тест самому
        себе, воскресенье — отдых.
      </p>
      <ul className="hero__stats">
        {stats.map((stat) => (
          <li className="stat-card" key={stat.label}>
            <p className="stat-card__value">
              <AnimatedNumber value={stat.value} format={stat.format} />
              <span className="stat-card__unit">{stat.unit}</span>
            </p>
            <p className="stat-card__label">{stat.label}</p>
          </li>
        ))}
      </ul>
      <span className="progress-bar" role="progressbar" aria-label="Сделано занятий" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </span>
    </header>
  )
}
