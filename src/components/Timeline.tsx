import { Fragment, useRef, type CSSProperties } from 'react'
import { useScrollFade } from './useScrollFade'
import { BLOCKS, type BlockId, type Week } from '../data/plan'
import { fmtDate, fmtWeeks, MONTHS_SHORT, parseISO, todayISO } from '../dates'
import { blockProgress, percentOf, planOf } from '../progress'
import type { AppState } from '../storage'

interface TimelineProps {
  state: AppState
}

const BLOCK_MODIFIER: Record<BlockId, string> = { A: 'block-a', B: 'block-b', C: 'block-c' }

/** Границы блока по датам его недель; у блока без недель (владелец всё удалил) границ нет */
function blockRange(weeks: Week[], blockId: BlockId): { from: string; to: string } | undefined {
  const own = weeks.filter((week) => week.block === blockId)
  return own.length > 0 ? { from: own[0].from, to: own[own.length - 1].to } : undefined
}

/** Блок, в чью неделю попадает дата (нужно, чтобы поставить ромб рубежа в свою полосу) */
function blockOf(weeks: Week[], date: string): BlockId {
  return weeks.find((week) => week.from <= date && date <= week.to)?.block ?? 'C'
}

export function Timeline({ state }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const fade = useScrollFade(scrollRef)
  const viewportClass = ['timeline__viewport', fade.start ? 'timeline__viewport--fade-start' : '', fade.end ? 'timeline__viewport--fade-end' : '']
    .filter(Boolean)
    .join(' ')
  const plan = planOf(state)
  // Без единой недели шкале нечего показывать (хуки выше уже вызваны)
  if (plan.weeks.length === 0) return null
  const start = parseISO(plan.weeks[0].from)
  const end = parseISO(plan.goal)
  const span = end.getTime() - start.getTime()
  const positionOf = (iso: string) =>
    Math.min(100, Math.max(0, ((parseISO(iso).getTime() - start.getTime()) / span) * 100))

  const months: { label: string; x: number }[] = []
  const cursor = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  while (cursor <= end) {
    months.push({ label: MONTHS_SHORT[cursor.getMonth()], x: positionOf(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-01`) })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const exams = plan.checks
    .filter((check) => check.kind === 'exam')
    .map((check, index) => ({
      ...check,
      number: index + 1,
      block: blockOf(plan.weeks, check.date),
    }))

  const today = todayISO()
  const showToday = today >= plan.weeks[0].from && today <= plan.goal

  return (
    <figure className="timeline">
      <figcaption className="timeline__caption">
        <h2>Календарь</h2>
        <p className="section-lead">
          Полосы — сроки блоков, заливка внутри показывает сделанное; ромбы — рубежи блоков. Тесты недели идут каждую субботу и на шкалу не вынесены.
        </p>
      </figcaption>

      {/* График декоративен для скринридера — то же содержание словами */}
      <p className="visually-hidden">
        {BLOCKS.map((block) => {
          const range = blockRange(plan.weeks, block.id)
          if (!range) return ''
          return `Блок ${block.id}: ${fmtDate(range.from)} — ${fmtDate(range.to)}, сделано ${percentOf(blockProgress(block.id, state))} %. `
        }).join('')}
        {fmtWeeks(plan.weeks.length)} заканчиваются {fmtDate(plan.goal)}.
      </p>

      <div className={viewportClass}>
      <div className="timeline__scroll" ref={scrollRef}>
        <div className="timeline__chart" style={{ '--timeline-rows': BLOCKS.length } as CSSProperties} aria-hidden="true">
          <div className="timeline__months">
            {months.map((month) => (
              <span className="timeline__month" key={`${month.label}-${month.x}`} style={{ insetInlineStart: `${month.x}%` }}>
                {month.label}
              </span>
            ))}
            <span className="timeline__month timeline__month--end" style={{ insetInlineStart: `${positionOf(plan.goal)}%` }}>
              A1 · {fmtDate(plan.goal)}
            </span>
            {showToday && (
              <span className="timeline__month timeline__month--today" style={{ insetInlineStart: `${positionOf(today)}%` }}>
                сегодня
              </span>
            )}
          </div>

          {BLOCKS.map((block) => {
            const range = blockRange(plan.weeks, block.id)
            if (!range) return null
            const left = positionOf(range.from)
            const width = positionOf(range.to) - left
            const percent = percentOf(blockProgress(block.id, state))
            const modifier = BLOCK_MODIFIER[block.id]
            return (
              <Fragment key={block.id}>
                <span className="timeline__row-label">Блок {block.id}</span>
                <div className="timeline__row">
                  <span className={`timeline__bar timeline__bar--${modifier}`} style={{ insetInlineStart: `${left}%`, width: `${width}%` }}>
                    <span className={`timeline__fill timeline__fill--${modifier}`} style={{ width: `${percent}%` }} />
                  </span>
                  {exams
                    .filter((exam) => exam.block === block.id)
                    .map((exam) => (
                      <span className="timeline__milestone" key={exam.id} style={{ insetInlineStart: `${positionOf(exam.date)}%` }}>
                        <span className="timeline__milestone-marker" />
                        <span className="timeline__milestone-number">{exam.number}</span>
                      </span>
                    ))}
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
      </div>

      <ol className="milestone-legend">
        {exams.map((exam) => (
          <li className="milestone-legend__item" key={exam.id}>
            <span className={`milestone-legend__number milestone-legend__number--${BLOCK_MODIFIER[exam.block]}`}>{exam.number}</span>
            <span>
              {exam.title} · {exam.scope}
            </span>
            <time className="milestone-legend__date" dateTime={exam.date}>
              {fmtDate(exam.date)}
            </time>
          </li>
        ))}
      </ol>
    </figure>
  )
}
