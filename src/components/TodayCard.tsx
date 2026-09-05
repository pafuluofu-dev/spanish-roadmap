import { fmtDate, fmtDateYear, fmtWeekday, todayISO } from '../dates'
import { todayView } from '../progress'
import type { AppState } from '../storage'
import { SessionLinks } from './SessionItem'

interface TodayCardProps {
  state: AppState
  onToggleSession: (id: string) => void
}

const KIND_LABEL: Record<string, string> = {
  diagnostic: 'диагностика',
  check: 'тест недели',
  exam: 'рубеж',
  study: 'занятие',
  custom: 'своё занятие',
}

export function TodayCard({ state, onToggleSession }: TodayCardProps) {
  const view = todayView(state)
  const today = todayISO()

  return (
    <section className="today-card" aria-labelledby="today-title">
      <p className="eyebrow">Сегодня · {fmtDateYear(today)}</p>
      {view.todayDone ? (
        <>
          <h2 id="today-title" className="today-card__title">
            На сегодня всё.
          </h2>
          {view.session && (
            <p className="today-card__next">
              Следующее — {fmtDate(view.session.date)}: {view.session.title}
            </p>
          )}
        </>
      ) : view.session ? (
        <>
          <h2 id="today-title" className="today-card__title">
            {view.session.title}
          </h2>
          <p className="today-card__meta">
            {view.isToday ? (
              <span>
                {KIND_LABEL[view.session.kind] ?? 'занятие'} · {view.session.minutes} мин
              </span>
            ) : (
              <span>
                ближайшее неотмеченное · {fmtWeekday(view.session.date)} {fmtDate(view.session.date)} · {view.session.minutes} мин
              </span>
            )}
          </p>
          {view.session.notes && <p className="today-card__note">{view.session.notes}</p>}
          <SessionLinks links={view.session.links} />
          <div className="today-card__action">
            <input
              className="checkbox"
              type="checkbox"
              id={`today-${view.session.id}`}
              checked={false}
              onChange={() => onToggleSession(view.session!.id)}
            />
            <label htmlFor={`today-${view.session.id}`}>Отметить сделанным</label>
          </div>
        </>
      ) : (
        <h2 id="today-title" className="today-card__title">
          Все занятия плана отмечены.
        </h2>
      )}
    </section>
  )
}
