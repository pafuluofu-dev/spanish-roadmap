import type { SessionKind } from '../data/plan'
import { fmtDate, fmtWeekday } from '../dates'

export interface SessionItemProps {
  id: string
  date: string
  kind: SessionKind | 'custom'
  title: string
  minutes: number
  notes?: string
  checked: boolean
  missed: boolean
  onToggle: (id: string) => void
  /** Только у занятий «второго круга» */
  onDelete?: (id: string) => void
}

const KIND_LABEL: Partial<Record<SessionKind | 'custom', string>> = {
  diagnostic: 'диагностика',
  check: 'тест недели',
  exam: 'рубеж',
  custom: 'своё занятие',
}

export function SessionItem({ id, date, kind, title, minutes, notes, checked, missed, onToggle, onDelete }: SessionItemProps) {
  const noteId = notes ? `${id}-note` : undefined

  if (kind === 'rest') {
    return (
      <li className="session session--rest">
        <span className="session__date">
          {fmtWeekday(date)} · {fmtDate(date)}
        </span>
        <p className="session__title session__title--plain">
          {title}
          <span className="badge badge--rest">отдых</span>
        </p>
        {notes && <p className="session__note">{notes}</p>}
      </li>
    )
  }

  const kindLabel = KIND_LABEL[kind]
  const className = ['session', checked ? 'session--done' : ''].filter(Boolean).join(' ')

  return (
    <li className={className}>
      <input className="checkbox" type="checkbox" id={id} checked={checked} aria-describedby={noteId} onChange={() => onToggle(id)} />
      <label className="session__title" htmlFor={id}>
        <span className="session__date">
          {fmtWeekday(date)} · {fmtDate(date)}
        </span>
        {title}
        {kindLabel && <span className={`badge badge--${kind}`}>{kindLabel}</span>}
        {missed && !checked && <span className="badge badge--missed">пропущено</span>}
      </label>
      {notes && (
        <p className="session__note" id={noteId}>
          {notes}
        </p>
      )}
      <p className="session__hours">
        <span className="session__hours-value">{checked ? 'сделано' : `${minutes} мин`}</span>
        {onDelete && !checked && (
          <button type="button" className="link-button session__delete" onClick={() => onDelete(id)}>
            удалить
          </button>
        )}
      </p>
    </li>
  )
}
