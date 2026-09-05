import { useState } from 'react'
import { CHECKS, SCORING_RULE, type Check } from '../data/checks'
import { PASS_THRESHOLD } from '../data/plan'
import { fmtDateYear } from '../dates'
import type { AppState, CheckResult } from '../storage'
import { ErrorLog } from './ErrorLog'

interface ChecksPageProps {
  state: AppState
  onSaveResult: (id: string, score: number, note: string) => void
  onClearResult: (id: string) => void
  onAddError: (topic: string, text: string, date: string) => void
  onToggleRepeat: (id: string, index: 0 | 1) => void
  onDeleteError: (id: string) => void
}

export function ChecksPage({ state, onSaveResult, onClearResult, onAddError, onToggleRepeat, onDeleteError }: ChecksPageProps) {
  return (
    <main className="checks-page">
      <header className="page-head">
        <p className="eyebrow">Суббота — тест самому себе · порог {PASS_THRESHOLD} %</p>
        <h1 className="page-head__title">Тесты недели и рубежи</h1>
        <p className="page-head__lead">
          Каждую субботу — без новой грамматики: повтор недели и небольшой тест самому себе вслух, лучше на диктофон. Баллы 0–100 ставите сами. Раз в
          четыре недели — рубеж блока. Ниже {PASS_THRESHOLD} % — темы недели повторяются на следующей, а фразы уходят в журнал.
        </p>
      </header>
      <section className="page-section" aria-labelledby="checks-title">
        <h2 id="checks-title" className="visually-hidden">
          Список проверок
        </h2>
        <ol className="check-list">
          {CHECKS.map((check) => {
            const result = state.checks[check.id]
            // Ключ зависит от наличия результата: после «удалить результат» форма пересоздаётся пустой
            return (
              <CheckCard
                key={`${check.id}-${result ? 'filled' : 'empty'}`}
                check={check}
                result={result}
                onSaveResult={onSaveResult}
                onClearResult={onClearResult}
              />
            )
          })}
        </ol>
      </section>
      <ErrorLog state={state} onAddError={onAddError} onToggleRepeat={onToggleRepeat} onDeleteError={onDeleteError} />
    </main>
  )
}

interface CheckCardProps {
  check: Check
  result: CheckResult | undefined
  onSaveResult: (id: string, score: number, note: string) => void
  onClearResult: (id: string) => void
}

function CheckCard({ check, result, onSaveResult, onClearResult }: CheckCardProps) {
  const passed = result && result.score >= check.threshold
  const status = result ? (passed ? 'сдано' : 'не сдано') : 'не проводилась'
  const statusModifier = result ? (passed ? 'badge--passed' : 'badge--failed') : 'badge--pending'
  const [score, setScore] = useState(result ? String(result.score) : '')
  const [note, setNote] = useState(result?.note ?? '')
  const scoreId = `${check.id}-score`
  const noteId = `${check.id}-noteinput`

  const submit = () => {
    const parsed = Number(score.replace(',', '.'))
    if (!Number.isFinite(parsed)) return
    onSaveResult(check.id, Math.min(100, Math.max(0, parsed)), note.trim())
  }

  return (
    <li className={`check-card${passed ? ' check-card--passed' : ''}`}>
      <p className="check-card__date">
        {fmtDateYear(check.date)} · {check.format}
      </p>
      <h3 className="check-card__title">
        {check.title}
        <span className={`badge ${statusModifier}`}>{status}</span>
      </h3>
      <p className="check-card__scope">{check.scope}</p>
      {result && (
        <p className="check-card__result">
          <span className="check-card__score">
            {String(result.score).replace('.', ',')} % · порог {check.threshold} %
          </span>
          {result.note && <span className="check-card__note">{result.note}</span>}
        </p>
      )}
      <details className="check-card__form-fold">
        <summary className="check-card__form-summary">{result ? 'Изменить результат' : 'Записать результат'}</summary>
        <form
          className="check-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <div className="check-form__field">
            <label className="check-form__label" htmlFor={scoreId}>
              Баллы, 0–100
            </label>
            <input
              className="check-form__input"
              id={scoreId}
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.5}
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>
          <div className="check-form__field check-form__field--grow">
            <label className="check-form__label" htmlFor={noteId}>
              Что не получилось
            </label>
            <textarea className="check-form__input" id={noteId} rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <div className="check-form__actions">
            <button type="submit" className="button" disabled={score.trim() === ''}>
              Сохранить
            </button>
            {result && (
              <button type="button" className="link-button" onClick={() => onClearResult(check.id)}>
                удалить результат
              </button>
            )}
          </div>
          <p className="check-form__rule">{SCORING_RULE}</p>
        </form>
      </details>
    </li>
  )
}
