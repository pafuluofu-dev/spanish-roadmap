import { fmtDate } from '../dates'
import { dueRepeats } from '../progress'
import type { AppState } from '../storage'

interface RepeatListProps {
  state: AppState
  onToggleRepeat: (id: string, index: 0 | 1) => void
}

/** «К повтору сегодня»: наступившие повторы из журнала ошибок */
export function RepeatList({ state, onToggleRepeat }: RepeatListProps) {
  const due = dueRepeats(state.errors)

  return (
    <section className="page-section" aria-labelledby="repeat-title">
      <div className="page-section__header">
        <h2 id="repeat-title">К повтору сегодня</h2>
        <p className="section-lead">Записи журнала ошибок повторяются через 3 и через 14 дней. Сам журнал — на странице проверок.</p>
      </div>
      {due.length === 0 ? (
        <p className="repeat-list__empty">Повторов на сегодня нет.</p>
      ) : (
        <ul className="repeat-list">
          {due.map(({ entry, index }) => {
            const controlId = `repeat-${entry.id}-${index}`
            return (
              <li className="repeat-list__item" key={controlId}>
                <input className="checkbox" type="checkbox" id={controlId} checked={false} onChange={() => onToggleRepeat(entry.id, index)} />
                <label className="repeat-list__label" htmlFor={controlId}>
                  <span className="repeat-list__topic">{entry.topic}</span>
                  {entry.text}
                  <span className="repeat-list__date">
                    повтор {index === 0 ? '+3 дня' : '+14 дней'} · был назначен на {fmtDate(entry.repeatAt[index])}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
