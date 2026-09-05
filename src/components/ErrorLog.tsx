import { useState } from 'react'
import { ALL_SESSIONS } from '../data/plan'
import { fmtDate, todayISO } from '../dates'
import type { AppState, ErrorEntry } from '../storage'

interface ErrorLogProps {
  state: AppState
  onAddError: (topic: string, text: string, date: string) => void
  onToggleRepeat: (id: string, index: 0 | 1) => void
  onDeleteError: (id: string) => void
}

const OTHER = 'другое'

/** Плоский список тем: названия всех занятий плана без повторов */
const TOPIC_OPTIONS = [...new Set(ALL_SESSIONS.filter((session) => session.kind !== 'rest').map((session) => session.title))]

export function ErrorLog({ state, onAddError, onToggleRepeat, onDeleteError }: ErrorLogProps) {
  const open = state.errors.filter((entry) => !entry.done.every(Boolean))
  const closed = state.errors.filter((entry) => entry.done.every(Boolean))

  return (
    <section className="page-section" aria-labelledby="errors-title">
      <div className="page-section__header">
        <h2 id="errors-title">Журнал ошибок</h2>
        <p className="section-lead">
          Каждая запись возвращается дважды: через 3 дня и через 14. Наступившие повторы видны на обзоре в «К повтору сегодня».
        </p>
      </div>
      <ErrorForm onAddError={onAddError} />
      {open.length === 0 && closed.length === 0 ? (
        <p className="error-log__empty">Записей пока нет.</p>
      ) : (
        <>
          <GroupedEntries entries={open} onToggleRepeat={onToggleRepeat} onDeleteError={onDeleteError} />
          {closed.length > 0 && (
            <details className="error-log__closed">
              <summary className="error-log__closed-summary">Закрыто · {closed.length}</summary>
              <GroupedEntries entries={closed} onToggleRepeat={onToggleRepeat} onDeleteError={onDeleteError} />
            </details>
          )}
        </>
      )}
    </section>
  )
}

interface ErrorFormProps {
  onAddError: (topic: string, text: string, date: string) => void
}

function ErrorForm({ onAddError }: ErrorFormProps) {
  const [topic, setTopic] = useState(OTHER)
  const [customTopic, setCustomTopic] = useState('')
  const [text, setText] = useState('')
  const [date, setDate] = useState(todayISO())

  const resolvedTopic = topic === OTHER ? customTopic.trim() : topic
  const ready = !!resolvedTopic && !!text.trim() && !!date

  const submit = () => {
    if (!ready) return
    onAddError(resolvedTopic, text.trim(), date)
    setText('')
    setCustomTopic('')
    setDate(todayISO())
  }

  return (
    <form
      className="error-form"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div className="error-form__field error-form__field--grow">
        <label className="error-form__label" htmlFor="error-topic">
          Тема
        </label>
        <select className="error-form__input" id="error-topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
          <option value={OTHER}>{OTHER}</option>
          {TOPIC_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {topic === OTHER && (
        <div className="error-form__field error-form__field--grow">
          <label className="error-form__label" htmlFor="error-topic-custom">
            Своя тема
          </label>
          <input
            className="error-form__input"
            id="error-topic-custom"
            type="text"
            value={customTopic}
            placeholder="Например: знаки при раскрытии определителя"
            onChange={(event) => setCustomTopic(event.target.value)}
          />
        </div>
      )}
      <div className="error-form__field error-form__field--grow">
        <label className="error-form__label" htmlFor="error-text">
          Что пошло не так
        </label>
        <textarea className="error-form__input" id="error-text" rows={2} value={text} onChange={(event) => setText(event.target.value)} />
      </div>
      <div className="error-form__field">
        <label className="error-form__label" htmlFor="error-date">
          Дата
        </label>
        <input className="error-form__input" id="error-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </div>
      <button type="submit" className="button" disabled={!ready}>
        Записать ошибку
      </button>
    </form>
  )
}

interface GroupedEntriesProps {
  entries: ErrorEntry[]
  onToggleRepeat: (id: string, index: 0 | 1) => void
  onDeleteError: (id: string) => void
}

function GroupedEntries({ entries, onToggleRepeat, onDeleteError }: GroupedEntriesProps) {
  const groups = new Map<string, ErrorEntry[]>()
  for (const entry of entries) {
    const list = groups.get(entry.topic) ?? []
    list.push(entry)
    groups.set(entry.topic, list)
  }

  return (
    <div className="error-log__groups">
      {[...groups.entries()].map(([topic, groupEntries]) => (
        <section className="error-log__group" key={topic}>
          <h3 className="error-log__topic">{topic}</h3>
          <ul className="error-log__list">
            {groupEntries.map((entry) => (
              <li className="error-log__item" key={entry.id}>
                <p className="error-log__text">{entry.text}</p>
                <p className="error-log__meta">записано {fmtDate(entry.createdAt)}</p>
                <div className="error-log__repeats">
                  {([0, 1] as const).map((index) => {
                    const controlId = `${entry.id}-repeat-${index}`
                    return (
                      <span className="error-log__repeat" key={controlId}>
                        <input
                          className="checkbox"
                          type="checkbox"
                          id={controlId}
                          checked={entry.done[index]}
                          onChange={() => onToggleRepeat(entry.id, index)}
                        />
                        <label htmlFor={controlId}>
                          {index === 0 ? '+3 дня' : '+14 дней'} · {fmtDate(entry.repeatAt[index])}
                        </label>
                      </span>
                    )
                  })}
                  <button type="button" className="link-button" onClick={() => onDeleteError(entry.id)}>
                    удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
