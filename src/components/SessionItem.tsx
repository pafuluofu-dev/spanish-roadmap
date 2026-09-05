import type { SessionKind, SessionLink } from '../data/plan'
import { fmtDate, fmtWeekday } from '../dates'

export interface SessionItemProps {
  id: string
  date: string
  kind: SessionKind | 'custom'
  title: string
  minutes: number
  notes?: string
  links?: SessionLink[]
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

/** Ссылки на материалы занятия — вне label, чтобы клик по ссылке не переключал галочку */
export function SessionLinks({ links }: { links?: SessionLink[] }) {
  if (!links || links.length === 0) return null
  return (
    <ul className="session__links" aria-label="Материалы занятия">
      {links.map((link) => (
        <li key={link.url + link.label}>
          <a className="session__link" href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
            <span aria-hidden="true"> ↗</span>
            <span className="visually-hidden"> (откроется в новой вкладке)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function SessionItem({ id, date, kind, title, minutes, notes, links, checked, missed, onToggle, onDelete }: SessionItemProps) {
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
      <SessionLinks links={links} />
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
