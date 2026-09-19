import { useState } from 'react'
import { DEFAULT_START } from '../data/plan'
import { fmtDateYear, fmtWeekday, parseISO, toISO } from '../dates'

interface PlanStartSectionProps {
  start: string
  goal: string
  onChange: (start: string) => void
}

/** Дата начала плана: от неё считаются все занятия, тесты и календарь; галочки привязаны к id занятий и не теряются */
export function PlanStartSection({ start, goal, onChange }: PlanStartSectionProps) {
  const [value, setValue] = useState(start)
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) && toISO(parseISO(value)) === value
  const notMonday = parseISO(start).getDay() !== 1

  return (
    <section className="page-section" aria-labelledby="plan-start-title">
      <details className="section-fold">
        <summary className="section-fold__summary">
          <h2 id="plan-start-title">Дата начала плана</h2>
          <span className="section-fold__hint" aria-hidden="true" />
        </summary>
        <p className="section-lead section-fold__lead">
          Двенадцать недель считаются от понедельника первой недели. Поменяйте дату — сдвинутся все занятия, тесты, рубежи и календарь; галочки и
          результаты останутся на своих занятиях.
        </p>
        <form
          className="plan-start"
          onSubmit={(event) => {
            event.preventDefault()
            if (valid) onChange(value)
          }}
        >
          <div className="plan-start__field">
            <label className="plan-start__label" htmlFor="plan-start">
              Понедельник первой недели
            </label>
            <input className="plan-start__input" id="plan-start" type="date" value={value} onChange={(event) => setValue(event.target.value)} />
          </div>
          <button type="submit" className="button" disabled={!valid || value === start}>
            Применить
          </button>
          {start !== DEFAULT_START && (
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setValue(DEFAULT_START)
                onChange(DEFAULT_START)
              }}
            >
              вернуть {fmtDateYear(DEFAULT_START)}
            </button>
          )}
        </form>
        <p className="plan-start__current" role="status">
          Сейчас план: {fmtDateYear(start)} — {fmtDateYear(goal)}.
          {notMonday && ` Начало — ${fmtWeekday(start)}, не понедельник: занятия, тест и отдых сдвинутся по дням недели вместе с датой.`}
        </p>
      </details>
    </section>
  )
}
