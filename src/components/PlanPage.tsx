import { useState } from 'react'
import { baseWeekNumber, BLOCKS, PASS_THRESHOLD, type Block, type BlockId, type Week } from '../data/plan'
import { RESOURCES } from '../data/resources'
import { fmtRange, fmtWeeks, todayISO } from '../dates'
import {
  addFolder,
  addNode,
  deleteFolder,
  deleteNode,
  hasEdits,
  layoutOf,
  moveFolder,
  moveFolderAfter,
  moveNode,
  moveNodeToFolder,
  resetEdits,
  swapNodes,
  updateFolder,
  updateNode,
  type PlanEdits,
} from '../planEdits'
import { blockProgress, customOf, isMissed, percentOf, planOf, weekProgress, weeksOfBlock } from '../progress'
import type { AppState } from '../storage'
import { ROUTE_META } from '../router'
import { FolderEditor, FolderTools, NodeEditor, NodeTools, PlanEditorPanel, type Editor, type EditorForm } from './PlanEditor'
import { ProgressRing } from './ProgressRing'
import { SessionItem } from './SessionItem'
import { Timeline } from './Timeline'

interface PlanPageProps {
  state: AppState
  onToggleSession: (id: string) => void
  onAddCustom: (week: number, date: string, title: string) => void
  onDeleteCustom: (id: string) => void
  onSetPlanEdits: (edits: PlanEdits) => void
}

const BLOCK_COLOR: Record<Block['id'], string> = {
  A: 'var(--color-block-a)',
  B: 'var(--color-block-b)',
  C: 'var(--color-text-muted)',
}

/** За какой неделей встаёт неделя блока: за последней своего блока, иначе за последней из предыдущих блоков, иначе в начало (null) */
function anchorForBlock(weeks: Week[], block: BlockId, excludeId?: string): string | null {
  const order = BLOCKS.map((item) => item.id)
  const before = weeks.filter((week) => week.id !== excludeId && order.indexOf(week.block) <= order.indexOf(block))
  return before.length > 0 ? before[before.length - 1].id : null
}

export function PlanPage({ state, onToggleSession, onAddCustom, onDeleteCustom, onSetPlanEdits }: PlanPageProps) {
  const plan = planOf(state)
  // Состояние режима — только на странице: вкл/выкл, раскрытая форма, первый узел обмена
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditorForm | null>(null)
  const [swapFrom, setSwapFrom] = useState<string | null>(null)
  const edits = state.planEdits
  // Операции отталкиваются от порядка итогового плана — так раскладка материализуется при первой же правке
  const current = layoutOf(plan.weeks.map((week) => ({ id: week.id, nodes: week.sessions })))

  const leaveMode = () => {
    setForm(null)
    setSwapFrom(null)
  }

  const editor: Editor = {
    form,
    setForm,
    swapFrom,
    setSwapFrom,
    moveFolder: (id, delta) => onSetPlanEdits(moveFolder(edits, current, id, delta)),
    deleteFolder: (id) => {
      const week = plan.weeks.find((item) => item.id === id)
      if (!week) return
      if (!window.confirm(`Удалить неделю ${week.n} «${week.focus}» вместе с занятиями (${week.sessions.length})? Галочки останутся в хранилище.`)) return
      leaveMode()
      onSetPlanEdits(deleteFolder(edits, current, id))
    },
    saveFolder: (id, block, fields) => {
      if (id === null) onSetPlanEdits(addFolder(edits, current, fields, anchorForBlock(plan.weeks, block)))
      else {
        let next = updateFolder(edits, id, fields)
        // Сменили блок — неделя уезжает в конец нового блока, чтобы блоки оставались сплошными
        const week = plan.weeks.find((item) => item.id === id)
        if (week && week.block !== block) next = moveFolderAfter(next, current, id, anchorForBlock(plan.weeks, block, id))
        onSetPlanEdits(next)
      }
      setForm(null)
    },
    moveNode: (id, delta) => onSetPlanEdits(moveNode(edits, current, id, delta)),
    swapNodes: (idA, idB) => {
      onSetPlanEdits(swapNodes(edits, current, idA, idB))
      setSwapFrom(null)
    },
    deleteNode: (id) => {
      const session = plan.sessions.find((item) => item.id === id)
      if (!session || !window.confirm(`Удалить занятие «${session.title}»?`)) return
      if (swapFrom === id) setSwapFrom(null)
      onSetPlanEdits(deleteNode(edits, current, id))
    },
    saveNode: (id, folderId, fields) => {
      if (id === null) onSetPlanEdits(addNode(edits, current, folderId, fields))
      else {
        let next = updateNode(edits, id, fields)
        const week = plan.weeks.find((item) => item.sessions.some((session) => session.id === id))
        if (week && week.id !== folderId) next = moveNodeToFolder(next, current, id, folderId)
        onSetPlanEdits(next)
      }
      setForm(null)
    },
  }

  return (
    <main className="plan-page">
      <h1 className="visually-hidden">План на {fmtWeeks(plan.weeks.length)}</h1>
      <p className="plan-page__context">
        Ритм: <strong>пн–пт — занятие 60–90 минут</strong> (раскладка минут под каждым днём), суббота — повтор недели и тест самому себе, воскресенье — отдых.
        {' '}{fmtWeeks(plan.weeks.length)}: {fmtRange(plan.start, plan.goal)}. Неделя сворачивается, когда все её занятия отмечены. <a href={ROUTE_META.home.hash}>Прогресс и «Сегодня» — на обзоре</a>.
      </p>
      <PlanEditorPanel
        editing={editing}
        hasEdits={hasEdits(edits)}
        swapping={swapFrom !== null}
        onToggle={() => {
          setEditing((previous) => !previous)
          leaveMode()
        }}
        onReset={() => {
          if (!window.confirm('Вернуть исходный план? Все правки будут стёрты, галочки и результаты останутся.')) return
          leaveMode()
          onSetPlanEdits(resetEdits())
        }}
        onCancelSwap={() => setSwapFrom(null)}
      />
      <Timeline state={state} />
      {BLOCKS.map((block) => (
        <BlockSection
          key={block.id}
          block={block}
          state={state}
          editor={editing ? editor : undefined}
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
  /** Есть только в режиме редактирования */
  editor?: Editor
  onToggleSession: (id: string) => void
  onAddCustom: (week: number, date: string, title: string) => void
  onDeleteCustom: (id: string) => void
}

function BlockSection({ block, state, editor, onToggleSession, onAddCustom, onDeleteCustom }: BlockSectionProps) {
  const progress = blockProgress(block.id, state)
  const percent = percentOf(progress)
  const plan = planOf(state)
  const weeks = weeksOfBlock(block.id, state)
  const titleId = `block-${block.id.toLowerCase()}-title`
  const weakTopics =
    block.id === 'C'
      ? plan.checks.filter((check) => {
          const result = state.checks[check.id]
          return result && result.score < check.threshold
        })
      : []
  const newFolderHere = editor?.form?.kind === 'new-folder' && editor.form.block === block.id

  return (
    <section className={`plan-block plan-block--${block.id.toLowerCase()}`} aria-labelledby={titleId}>
      <header className="plan-block__header">
        <div className="plan-block__header-main">
          <p className="eyebrow">
            Блок {block.id} · недели {weeks.length > 0 ? `${weeks[0].n}–${weeks[weeks.length - 1].n}` : '—'} · ≈{block.hours} ч
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
            key={week.id}
            week={week}
            weeks={plan.weeks}
            state={state}
            editor={editor}
            onToggleSession={onToggleSession}
            onAddCustom={onAddCustom}
            onDeleteCustom={onDeleteCustom}
          />
        ))}
        {editor &&
          (newFolderHere ? (
            <FolderEditor block={block.id} editor={editor} />
          ) : (
            <button type="button" className="button weeks__add" onClick={() => editor.setForm({ kind: 'new-folder', block: block.id })}>
              + Добавить неделю
            </button>
          ))}
      </div>
    </section>
  )
}

interface WeekCardProps {
  week: Week
  /** Все недели плана — для селекта «Неделя» в форме и соседей при перемещении */
  weeks: Week[]
  state: AppState
  editor?: Editor
  onToggleSession: (id: string) => void
  onAddCustom: (week: number, date: string, title: string) => void
  onDeleteCustom: (id: string) => void
}

function WeekCard({ week, weeks, state, editor, onToggleSession, onAddCustom, onDeleteCustom }: WeekCardProps) {
  const today = todayISO()
  const isCurrent = week.from <= today && today <= week.to
  const progress = weekProgress(week, state)
  const allDone = progress.total > 0 && progress.done === progress.total
  const custom = customOf(week, state.custom).sort((a, b) => a.date.localeCompare(b.date))
  // Второй круг привязан к исходному номеру встроенной недели; у своих недель его нет
  const baseNumber = baseWeekNumber(week.id)
  const form = editor?.form
  const folderFormHere = form?.kind === 'folder' && form.id === week.id
  const newNodeHere = form?.kind === 'new-node' && form.folderId === week.id

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
      {editor && (folderFormHere ? <FolderEditor week={week} block={week.block} editor={editor} /> : <FolderTools week={week} weeks={weeks} editor={editor} />)}
      {week.note && <p className="week__note">{week.note}</p>}
      {week.sessions.length + custom.length > 0 || newNodeHere ? (
        <ol className="week__sessions">
          {week.sessions.map((session) =>
            editor && form?.kind === 'node' && form.id === session.id ? (
              <NodeEditor key={session.id} session={session} folderId={week.id} weeks={weeks} editor={editor} />
            ) : (
              <SessionItem
                key={session.id}
                id={session.id}
                date={session.date}
                kind={session.kind}
                title={session.title}
                minutes={session.minutes}
                notes={session.notes}
                links={session.links}
                program={session.program}
                checked={!!state.sessions[session.id]}
                missed={isMissed(session, state)}
                onToggle={onToggleSession}
                tools={editor ? <NodeTools session={session} week={week} editor={editor} /> : undefined}
              />
            ),
          )}
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
          {editor && newNodeHere && <NodeEditor key={`new-${week.id}`} folderId={week.id} weeks={weeks} editor={editor} />}
        </ol>
      ) : (
        <p className="week__empty">Пока пусто — добавь занятия второго круга.</p>
      )}
      {week.block === 'C' && baseNumber !== undefined && <ReserveForm week={week} weekNumber={baseNumber} onAddCustom={onAddCustom} />}
    </details>
  )
}

interface ReserveFormProps {
  week: Week
  /** Исходный номер встроенной недели — к нему привязано занятие второго круга */
  weekNumber: number
  onAddCustom: (week: number, date: string, title: string) => void
}

/** «Второй круг»: добавить своё занятие в резервную неделю */
function ReserveForm({ week, weekNumber, onAddCustom }: ReserveFormProps) {
  const today = todayISO()
  const defaultDate = week.from <= today && today <= week.to ? today : week.from
  const [date, setDate] = useState(defaultDate)
  const [title, setTitle] = useState('')
  const dateId = `custom-date-${week.n}`
  const titleId = `custom-title-${week.n}`

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed || !date) return
    onAddCustom(weekNumber, date, trimmed)
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
