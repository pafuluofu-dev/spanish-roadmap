import { planOf } from '../progress'
import type { AppState } from '../storage'
import { BackupSection } from './BackupSection'
import { BlockCards } from './BlockCards'
import { DifferenceSection } from './DifferenceSection'
import { FormatCard } from './FormatCard'
import { Hero } from './Hero'
import { PlanStartSection } from './PlanStartSection'
import { RepeatList } from './RepeatList'
import { Timeline } from './Timeline'
import { TodayCard } from './TodayCard'

interface HomePageProps {
  state: AppState
  onToggleSession: (id: string) => void
  onToggleRepeat: (id: string, index: 0 | 1) => void
  onSetPlanStart: (start: string) => void
  onExport: () => string
  onImport: (raw: string) => boolean
}

export function HomePage({ state, onToggleSession, onToggleRepeat, onSetPlanStart, onExport, onImport }: HomePageProps) {
  const plan = planOf(state)
  return (
    <>
      <Hero state={state} />
      <main>
        <TodayCard state={state} onToggleSession={onToggleSession} />
        <RepeatList state={state} onToggleRepeat={onToggleRepeat} />
        <BlockCards state={state} />
        <Timeline state={state} />
        <DifferenceSection />
        <FormatCard />
        <PlanStartSection start={plan.start} goal={plan.goal} onChange={onSetPlanStart} />
        <BackupSection onExport={onExport} onImport={onImport} />
      </main>
    </>
  )
}
