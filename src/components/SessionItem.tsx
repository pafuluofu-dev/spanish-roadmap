import type { ReactNode } from 'react'
import type { SessionKind, SessionLink } from '../data/plan'
import type { SessionProgram } from '../data/program'
import { fmtDate, fmtWeekday } from '../dates'

export interface SessionItemProps {
  id: string
  date: string
  kind: SessionKind | 'custom'
  title: string
  minutes: number
  notes?: string
  links?: SessionLink[]
  program?: SessionProgram
  checked: boolean
  missed: boolean
  onToggle: (id: string) => void
  /** Только у занятий «второго круга» */
  onDelete?: (id: string) => void
  /** Ряд инструментов редактора плана — только в режиме редактирования */
  tools?: ReactNode
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

/** «Что разбираем» — лекции курса Udemy A1 на этот день, списком под названием, как в программе курса */
export function SessionProgramList({ program }: { program?: SessionProgram }) {
  if (!program || program.lectures.length === 0) return null
  return (
    <div className="session__program">
      <p className="session__program-topics">
        Udemy A1 · {program.sections.length === 1 ? 'раздел' : 'разделы'} {program.sections.join(', ')} · что разбираем
      </p>
      <ul className="session__questions">
        {program.lectures.map((lecture) => (
          <li className="session__question" key={lecture.id}>
            {lecture.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SessionItem({ id, date, kind, title, minutes, notes, links, program, checked, missed, onToggle, onDelete, tools }: SessionItemProps) {
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
        {tools}
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
      <SessionProgramList program={program} />
      <SessionLinks links={links} />
      <p className="session__hours">
        <span className="session__hours-value">{checked ? 'сделано' : `${minutes} мин`}</span>
        {onDelete && !checked && (
          <button type="button" className="link-button session__delete" onClick={() => onDelete(id)}>
            удалить
          </button>
        )}
      </p>
      {tools}
    </li>
  )
}
