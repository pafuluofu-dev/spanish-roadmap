import { BLOCKS, WEEKS, type Block } from '../data/plan'
import { fmtHours, fmtRange } from '../dates'
import { blockProgress, percentOf } from '../progress'
import type { AppState } from '../storage'
import { ROUTE_META } from '../router'

interface BlockCardsProps {
  state: AppState
}

const BLOCK_COLOR: Record<Block['id'], string> = {
  A: 'progress-bar__fill--block-a',
  B: 'progress-bar__fill--block-b',
  C: 'progress-bar__fill--block-c',
}

export function BlockCards({ state }: BlockCardsProps) {
  return (
    <section className="page-section" aria-labelledby="blocks-title">
      <div className="page-section__header">
        <h2 id="blocks-title">Блоки</h2>
        <p className="section-lead">Полный список недель и занятий с галочками — на странице плана.</p>
      </div>
      <div className="block-cards">
        {BLOCKS.map((block) => {
          const progress = blockProgress(block.id, state)
          const percent = percentOf(progress)
          const first = WEEKS.find((week) => week.n === block.weeks[0])
          const last = WEEKS.find((week) => week.n === block.weeks[block.weeks.length - 1])
          return (
            <article className={`block-card block-card--${block.id.toLowerCase()}`} key={block.id}>
              <p className="eyebrow">
                Блок {block.id} · недели {block.weeks[0]}–{block.weeks[block.weeks.length - 1]} · ≈{block.hours} ч
              </p>
              <h3 className="block-card__title">
                <a href={ROUTE_META.plan.hash}>{block.title}</a>
              </h3>
              <span
                className="progress-bar"
                role="progressbar"
                aria-label={`Прогресс блока ${block.id}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span className={`progress-bar__fill ${BLOCK_COLOR[block.id]}`} style={{ width: `${percent}%` }} />
              </span>
              <p className="block-card__meta">
                <span>
                  {progress.done} / {progress.total} занятий · {percent} %
                </span>
                <span>
                  {fmtHours(progress.doneMinutes / 60)} / {fmtHours(progress.totalMinutes / 60)} ч
                </span>
              </p>
              {first && last && (
                <p className="block-card__dates">
                  {fmtRange(first.from, last.to)}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
