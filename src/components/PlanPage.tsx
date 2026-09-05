import { useState } from 'react'
import { CHECKS } from '../data/checks'
import { BLOCKS, PASS_THRESHOLD, WEEKS, type Block, type Week } from '../data/plan'
import { RESOURCES } from '../data/resources'
import { fmtRange, todayISO } from '../dates'
import { blockProgress, isMissed, percentOf, weekProgress } from '../progress'
import type { AppState } from '../storage'
import { ROUTE_META } from '../router'
import { ProgressRing } from './ProgressRing'
import { SessionItem } from './SessionItem'
import { Timeline } from './Timeline'

interface PlanPageProps {
  state: AppState
  onToggleSession: (id: string) => void
  onAddCustom: (week: number, date: string, title: string) => void
  onDeleteCustom: (id: string) => void
}

const BLOCK_COLOR: Record<Block['id'], string> = {
  A: 'var(--color-block-a)',
  B: 'var(--color-block-b)',
  C: 'var(--color-text-muted)',
}

export function PlanPage({ state, onToggleSession, onAddCustom, onDeleteCustom }: PlanPageProps) {
  return (
    <main className="plan-page">
      <h1 className="visually-hidden">План на двенадцать недель</h1>
      <p className="plan-page__context">
        Ритм: <strong>пн–пт — занятие 60–90 минут</strong> (раскладка минут под каждым днём), суббота — повтор недели и тест самому себе, воскресенье — отдых.
        Двенадцать недель: 07.09 → 29.11. Неделя сворачивается, когда все её занятия отмечены. <a href={ROUTE_META.home.hash}>Прогресс и «Сегодня» — на обзоре</a>.
      </p>
      <Timeline state={state} />
      {BLOCKS.map((block) => (
        <BlockSection
          key={block.id}
          block={block}
          state={state}
          onToggleSession={onToggleSession}
          onAddCustom={onAddCustom}
          onDeleteCustom={onDeleteCustom}
        />
      ))}
      <ResourcesSection />
    </main>
  )
}

interface BlockSectionProps {
  block: Block
  state: AppState
  onToggleSession: (id: string) => void
  onAddCustom: (week: number, date: string, title: string) => void
  onDeleteCustom: (id: string) => void
}

function BlockSection({ block, state, onToggleSession, onAddCustom, onDeleteCustom }: BlockSectionProps) {
  const progress = blockProgress(block.id, state)
  const percent = percentOf(progress)
  const weeks = WEEKS.filter((week) => block.weeks.includes(week.n))
  const titleId = `block-${block.id.toLowerCase()}-title`
  const weakTopics =
    block.id === 'C'
      ? CHECKS.filter((check) => {
          const result = state.checks[check.id]
          return result && result.score < check.threshold
        })
      : []

  return (
    <section className={`plan-block plan-block--${block.id.toLowerCase()}`} aria-labelledby={titleId}>
      <header className="plan-block__header">
        <div className="plan-block__header-main">
          <p className="eyebrow">
            Блок {block.id} · недели {block.weeks[0]}–{block.weeks[block.weeks.length - 1]} · ≈{block.hours} ч
          </p>
          <h2 id={titleId} className="plan-block__title">
            {block.title}
          </h2>
          <p className="plan-block__meta">
            <span>
              {progress.done} / {progress.total} занятий · {percent} %
            </span>
          </p>
        </div>
        <ProgressRing percent={percent} color={BLOCK_COLOR[block.id]} label={`Прогресс блока ${block.id}: ${percent} %`} />
      </header>
      {weakTopics.length > 0 && (
        <p className="plan-block__hint">
          Подсказка для второго круга — проверки ниже {PASS_THRESHOLD} %: {weakTopics.map((check) => `${check.title} (${check.scope})`).join(', ')}.
        </p>
      )}
      <div className="weeks">
        {weeks.map((week) => (
          <WeekCard
            key={week.n}
            week={week}
            state={state}
            onToggleSession={onToggleSession}
            onAddCustom={onAddCustom}
            onDeleteCustom={onDeleteCustom}
          />
        ))}
      </div>
    </section>
  )
}

interface WeekCardProps {
  week: Week
  state: AppState
  onToggleSession: (id: string) => void
  onAddCustom: (week: number, date: string, title: string) => void
  onDeleteCustom: (id: string) => void
}

function WeekCard({ week, state, onToggleSession, onAddCustom, onDeleteCustom }: WeekCardProps) {
  const today = todayISO()
  const isCurrent = week.from <= today && today <= week.to
  const progress = weekProgress(week, state)
  const allDone = progress.total > 0 && progress.done === progress.total
  const custom = state.custom.filter((entry) => entry.week === week.n).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <details className={`week${isCurrent ? ' week--current' : ''}`} open={!allDone || isCurrent}>
      <summary className="week__summary">
        <span className="week__name">
          Неделя {week.n} · {fmtRange(week.from, week.to)} · {week.focus}
          {isCurrent && <span className="badge badge--current">текущая</span>}
        </span>
        <span className="week__progress">
          {progress.done}/{progress.total}
        </span>
      </summary>
      {week.note && <p className="week__note">{week.note}</p>}
      {week.sessions.length + custom.length > 0 ? (
        <ol className="week__sessions">
          {week.sessions.map((session) => (
            <SessionItem
              key={session.id}
              id={session.id}
              date={session.date}
              kind={session.kind}
              title={session.title}
              minutes={session.minutes}
              notes={session.notes}
              checked={!!state.sessions[session.id]}
              missed={isMissed(session, state)}
              onToggle={onToggleSession}
            />
          ))}
          {custom.map((session) => (
            <SessionItem
              key={session.id}
              id={session.id}
              date={session.date}
              kind="custom"
              title={session.title}
              minutes={session.minutes}
              checked={!!state.sessions[session.id]}
              missed={session.date < today && !state.sessions[session.id]}
              onToggle={onToggleSession}
              onDelete={onDeleteCustom}
            />
          ))}
        </ol>
      ) : (
        <p className="week__empty">Пока пусто — добавь занятия второго круга.</p>
      )}
      {week.block === 'C' && <ReserveForm week={week} onAddCustom={onAddCustom} />}
    </details>
  )
}

interface ReserveFormProps {
  week: Week
  onAddCustom: (week: number, date: string, title: string) => void
}

/** «Второй круг»: добавить своё занятие в резервную неделю */
function ReserveForm({ week, onAddCustom }: ReserveFormProps) {
  const today = todayISO()
  const defaultDate = week.from <= today && today <= week.to ? today : week.from
  const [date, setDate] = useState(defaultDate)
  const [title, setTitle] = useState('')
  const dateId = `custom-date-${week.n}`
  const titleId = `custom-title-${week.n}`

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed || !date) return
    onAddCustom(week.n, date, trimmed)
    setTitle('')
  }

  return (
    <form
      className="reserve-form"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div className="reserve-form__field">
        <label className="reserve-form__label" htmlFor={dateId}>
          Дата
        </label>
        <input
          className="reserve-form__input"
          id={dateId}
          type="date"
          value={date}
          min={week.from}
          max={week.to}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>
      <div className="reserve-form__field reserve-form__field--grow">
        <label className="reserve-form__label" htmlFor={titleId}>
          Тема занятия
        </label>
        <input
          className="reserve-form__input"
          id={titleId}
          type="text"
          value={title}
          placeholder="Например: определители 4-го порядка ещё раз"
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <button type="submit" className="button" disabled={!title.trim()}>
        Добавить занятие
      </button>
    </form>
  )
}

function ResourcesSection() {
  return (
    <section className="page-section" aria-labelledby="resources-title">
      <div className="page-section__header">
        <h2 id="resources-title">Материалы</h2>
      </div>
      <ul className="resources">
        {RESOURCES.map((resource) => (
          <li className="resources__item" key={resource.title}>
            {resource.url ? <a href={resource.url}>{resource.title}</a> : <span>{resource.title}</span>}
            <span className="resources__note"> — {resource.note}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
