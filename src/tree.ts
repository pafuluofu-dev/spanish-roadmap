import { BLOCKS, type BlockId, type Session, type SessionKind } from './data/plan'
import { fmtRange, parseISO } from './dates'
import { blockProgress, currentWeek, customOf, isCountable, overallProgress, percentOf, weekProgress, weeksOfBlock } from './progress'
import type { AppState, CustomSession } from './storage'

export interface TreeNode {
  id: string
  label: string
  /** Серая подпись справа: даты, часы, счётчик */
  meta?: string
  /** done — сделано; current — идёт сейчас; muted — отдых / отложено / по желанию; иначе обычный */
  status?: 'done' | 'current' | 'muted'
  /** Цветовая ветка: 'a' | 'b' | 'c' (блок или трек) */
  branch?: 'a' | 'b' | 'c'
  /** Папка: ветку можно свернуть, даже когда внутри пусто — узел без детей пустой папкой не становится */
  folder?: boolean
  children: TreeNode[]
}

export type Branch = 'a' | 'b' | 'c'

const BRANCH_OF: Record<BlockId, Branch> = { A: 'a', B: 'b', C: 'c' }

/** Тип занятия словами — в дереве он заменяет значки карточки: у строки есть только подпись */
const KIND_LABEL: Record<SessionKind, string> = {
  study: 'занятие',
  check: 'тест недели',
  exam: 'рубеж',
  diagnostic: 'диагностика',
  rest: 'отдых',
}

/** «07.09» — в узкой строке дерева цифры читаются быстрее, чем «7 сен» */
function shortDate(iso: string): string {
  const date = parseISO(iso)
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

function joinMeta(parts: (string | undefined)[]): string {
  return parts.filter((part) => part && part.length > 0).join(' · ')
}

function sessionNode(session: Session, state: AppState, branch: Branch): TreeNode {
  const done = !!state.sessions[session.id]
  return {
    id: session.id,
    label: session.title,
    meta: joinMeta([shortDate(session.date), KIND_LABEL[session.kind], session.minutes > 0 ? `${session.minutes} мин` : undefined]),
    // Отдых галочки не имеет и в прогресс не входит — в дереве он приглушён, а не «не сделан»
    status: !isCountable(session) ? 'muted' : done ? 'done' : undefined,
    branch,
    children: [],
  }
}

function customNode(session: CustomSession, state: AppState, branch: Branch): TreeNode {
  return {
    id: session.id,
    label: session.title,
    meta: joinMeta([shortDate(session.date), 'второй круг', `${session.minutes} мин`]),
    status: state.sessions[session.id] ? 'done' : undefined,
    branch,
    children: [],
  }
}

/** Дерево плана: корень → блоки A/B/C → недели → занятия. Источник — итоговый план после правок владельца и его галочки */
export function buildTree(state: AppState): TreeNode {
  const overall = overallProgress(state)
  const today = currentWeek(state)

  const blocks = BLOCKS.map((block) => {
    const branch = BRANCH_OF[block.id]
    const weeks = weeksOfBlock(block.id, state)
    const progress = blockProgress(block.id, state)

    const weekNodes = weeks.map((week) => {
      const weekDone = weekProgress(week, state)
      const custom = customOf(week, state.custom).sort((a, b) => a.date.localeCompare(b.date))
      const allDone = weekDone.total > 0 && weekDone.done === weekDone.total
      return {
        id: week.id,
        label: `Неделя ${week.n} · ${week.focus}`,
        meta: joinMeta([fmtRange(week.from, week.to), `${weekDone.done}/${weekDone.total}`]),
        // Сделанная неделя остаётся сделанной, даже если сегодня она же текущая — так фильтр «Скрыть сделанное» её убирает
        status: allDone ? ('done' as const) : today && today.id === week.id ? ('current' as const) : undefined,
        branch,
        folder: true,
        children: [...week.sessions.map((session) => sessionNode(session, state, branch)), ...custom.map((session) => customNode(session, state, branch))],
      }
    })

    return {
      id: `block-${block.id}`,
      label: `Блок ${block.id} · ${block.title}`,
      meta: joinMeta([
        weeks.length > 0 ? `недели ${weeks[0].n}–${weeks[weeks.length - 1].n}` : 'недель нет',
        `${progress.done} / ${progress.total} занятий`,
      ]),
      status: progress.total > 0 && progress.done === progress.total ? ('done' as const) : undefined,
      branch,
      folder: true,
      children: weekNodes,
    }
  })

  return {
    id: 'root',
    label: 'Маршрут: испанский',
    meta: `${percentOf(overall)} % · сделано ${overall.done} из ${overall.total}`,
    folder: true,
    children: blocks,
  }
}

/** Фильтр «Скрыть сделанное»: узел со статусом done уходит целиком — у недели и блока этот статус стоит, когда сделано всё */
export function pruneDone(node: TreeNode): TreeNode | null {
  if (node.status === 'done') return null
  const children = node.children.map(pruneDone).filter((child): child is TreeNode => child !== null)
  return { ...node, children }
}

/** Корень остаётся всегда: прячем только сделанные ветки под ним */
export function hideDoneIn(root: TreeNode): TreeNode {
  return { ...root, children: root.children.map(pruneDone).filter((child): child is TreeNode => child !== null) }
}
