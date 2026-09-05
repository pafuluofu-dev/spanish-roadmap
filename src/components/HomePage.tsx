import type { AppState } from '../storage'
import { BackupSection } from './BackupSection'
import { BlockCards } from './BlockCards'
import { DifferenceSection } from './DifferenceSection'
import { FormatCard } from './FormatCard'
import { Hero } from './Hero'
import { RepeatList } from './RepeatList'
import { Timeline } from './Timeline'
import { TodayCard } from './TodayCard'

interface HomePageProps {
  state: AppState
  onToggleSession: (id: string) => void
  onToggleRepeat: (id: string, index: 0 | 1) => void
  onExport: () => string
  onImport: (raw: string) => boolean
}

export function HomePage({ state, onToggleSession, onToggleRepeat, onExport, onImport }: HomePageProps) {
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
        <BackupSection onExport={onExport} onImport={onImport} />
      </main>
    </>
  )
}
