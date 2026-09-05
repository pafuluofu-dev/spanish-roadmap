import { fmtHours } from '../dates'
import { overallProgress, percentOf } from '../progress'
import { ROUTE_META } from '../router'
import type { AppState } from '../storage'
import { ProgressRing } from './ProgressRing'

interface OverallProgressProps {
  state: AppState
}

/** Плавающее кольцо общего прогресса. Ведёт на обзор, поэтому на самом обзоре не рендерится */
export function OverallProgress({ state }: OverallProgressProps) {
  const progress = overallProgress(state)
  const percent = percentOf(progress)

  return (
    <a className="overall-progress" href={ROUTE_META.home.hash}>
      <ProgressRing
        percent={percent}
        color="var(--color-block-a)"
        label={`Общий прогресс ${percent} % — ${progress.done} из ${progress.total} занятий, ${fmtHours(progress.doneMinutes / 60)} ч. Открыть обзор`}
        size={52}
      />
    </a>
  )
}
