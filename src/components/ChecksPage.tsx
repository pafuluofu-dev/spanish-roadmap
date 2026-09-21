import { useState } from 'react'
import { SCORING_RULE, type Check } from '../data/checks'
import { PASS_THRESHOLD } from '../data/plan'
import { testsFor } from '../data/testBank'
import { fmtDateYear } from '../dates'
import { planOf } from '../progress'
import type { AppState, CheckResult, TaskMark } from '../storage'
import { ErrorLog } from './ErrorLog'
import { PrintSheet } from './PrintSheet'
import { TestTasksList } from './TestTasksList'

interface ChecksPageProps {
  state: AppState
  onSaveResult: (id: string, score: number, note: string) => void
  onClearResult: (id: string) => void
  onMarkTask: (key: string, mark: TaskMark | null) => void
  onAddError: (topic: string, text: string, date: string) => void
  onToggleRepeat: (id: string, index: 0 | 1) => void
  onDeleteError: (id: string) => void
}

export function ChecksPage({ state, onSaveResult, onClearResult, onMarkTask, onAddError, onToggleRepeat, onDeleteError }: ChecksPageProps) {
  const plan = planOf(state)
  return (
    <main className="checks-page">
      <header className="page-head">
        <p className="eyebrow">Суббота — тест самому себе · порог {PASS_THRESHOLD} %</p>
        <h1 className="page-head__title">Тесты недели и рубежи</h1>
        <p className="page-head__lead">
          Каждую субботу — без новой грамматики: повтор недели и небольшой тест самому себе вслух, лучше на диктофон. Каждое задание отмечаете кнопкой — получилось, наполовину или нет, — и балл теста складывается сам. Раз в
          четыре недели — рубеж блока. Ниже {PASS_THRESHOLD} % — темы недели повторяются на следующей, а фразы уходят в журнал. Под каждым тестом —
          задания с ответами; их можно распечатать листом без ответов, в PDF или на принтер.
        </p>
      </header>
      <section className="page-section" aria-labelledby="checks-title">
        <h2 id="checks-title" className="visually-hidden">
          Список проверок
        </h2>
        <ol className="check-list">
          {plan.checks.map((check) => {
            const result = state.checks[check.id]
            // Ключ зависит от наличия результата: после «удалить результат» форма пересоздаётся пустой
            return (
              <CheckCard
                key={`${check.id}-${result ? 'filled' : 'empty'}`}
                check={check}
                result={result}
                marks={state.taskMarks}
                onSaveResult={onSaveResult}
                onClearResult={onClearResult}
                onMarkTask={onMarkTask}
              />
            )
          })}
        </ol>
      </section>
      <ErrorLog state={state} onAddError={onAddError} onToggleRepeat={onToggleRepeat} onDeleteError={onDeleteError} />
    </main>
  )
}

interface TestTasksProps {
  checkId: string
  threshold: number
  marks: Record<string, TaskMark>
  onMarkTask: (key: string, mark: TaskMark | null) => void
  onApplyScore: (percent: number) => void
}

/* Задания шире формата: в check.format записано, как проводить сам тест (45 минут вслух),
   а здесь лежат все задания по теме недели — с ответами, для тренировки. Свёрнуты, ответ у каждого
   под своей кнопкой. Сохраняются только отметки заданий — из них складывается балл. */
function TestTasks({ checkId, threshold, marks, onMarkTask, onApplyScore }: TestTasksProps) {
  const items = testsFor(checkId)
  if (items.length === 0) return null
  const tasks = items.filter((item) => item.kind === 'task').length
  const speak = items.length - tasks

  return (
    <details className="check-card__tasks-fold">
      <summary className="check-card__form-summary">
        Открыть задания · {tasks}
        {speak > 0 && ` + ${speak} вслух`}
      </summary>
      <TestTasksList checkId={checkId} items={items} marks={marks} onMark={onMarkTask} threshold={threshold} onApplyScore={onApplyScore} />
    </details>
  )
}

interface CheckCardProps {
  check: Check
  result: CheckResult | undefined
  marks: Record<string, TaskMark>
  onSaveResult: (id: string, score: number, note: string) => void
  onClearResult: (id: string) => void
  onMarkTask: (key: string, mark: TaskMark | null) => void
}

function CheckCard({ check, result, marks, onSaveResult, onClearResult, onMarkTask }: CheckCardProps) {
  const passed = result && result.score >= check.threshold
  const status = result ? (passed ? 'сдано' : 'не сдано') : 'не проводилась'
  const statusModifier = result ? (passed ? 'badge--passed' : 'badge--failed') : 'badge--pending'
  const [score, setScore] = useState(result ? String(result.score) : '')
  const [note, setNote] = useState(result?.note ?? '')
  // Пока лист в DOM, кнопка заблокирована: второй клик во время открытого диалога печати ни к чему
  const [printing, setPrinting] = useState(false)
  // Раскрывается сама, когда балл переносят из подсчёта: иначе непонятно, куда он уехал
  const [formOpen, setFormOpen] = useState(false)
  const items = testsFor(check.id)
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
      <TestTasks
        checkId={check.id}
        threshold={check.threshold}
        marks={marks}
        onMarkTask={onMarkTask}
        onApplyScore={(percent) => {
          setScore(String(percent))
          setFormOpen(true)
        }}
      />
      {items.length > 0 && (
        <p className="check-card__actions">
          <button type="button" className="button" disabled={printing} onClick={() => setPrinting(true)}>
            {printing ? 'Готовлю лист…' : 'Распечатать задания'}
          </button>
          <span className="check-card__actions-hint">без ответов, в PDF или на принтер</span>
        </p>
      )}
      {printing && <PrintSheet check={check} items={items} onDone={() => setPrinting(false)} />}
      {result && (
        <p className="check-card__result">
          <span className="check-card__score">
            {String(result.score).replace('.', ',')} % · порог {check.threshold} %
          </span>
          {result.note && <span className="check-card__note">{result.note}</span>}
        </p>
      )}
      <details className="check-card__form-fold" open={formOpen} onToggle={(event) => setFormOpen(event.currentTarget.open)}>
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
