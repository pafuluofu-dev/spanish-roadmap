import type { TheoryState } from './data/theory'

const STATE_KEY = 'spanish-roadmap:v1'
const THEME_KEY = 'spanish-roadmap:theme'

export type Theme = 'dark' | 'light'

/** Результат проверки или пробного экзамена */
export interface CheckResult {
  /** Баллы 0–100 */
  score: number
  /** «Что не получилось» — свободный текст */
  note: string
  /** Когда записан результат, ISO */
  at: string
}

/** Запись журнала ошибок с двумя датами повтора (+3 и +14 дней) */
export interface ErrorEntry {
  id: string
  createdAt: string
  topic: string
  text: string
  repeatAt: [string, string]
  done: [boolean, boolean]
}

/** Занятие «второго круга», добавленное владельцем в резервную неделю */
export interface CustomSession {
  id: string
  week: number
  date: string
  title: string
  minutes: number
}

export interface AppState {
  /** id занятия → дата отметки (ISO) */
  sessions: Record<string, string>
  /** id проверки → результат */
  checks: Record<string, CheckResult>
  /** id вопроса теории → 0 «не могу» / 1 «с подсказкой» / 2 «свободно» */
  theory: Record<string, TheoryState>
  errors: ErrorEntry[]
  custom: CustomSession[]
}

export const EMPTY_STATE: AppState = {
  sessions: {},
  checks: {},
  theory: {},
  errors: [],
  custom: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeSessions(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) return {}
  const out: Record<string, string> = {}
  for (const [id, doneAt] of Object.entries(raw)) if (typeof doneAt === 'string') out[id] = doneAt
  return out
}

function sanitizeChecks(raw: unknown): Record<string, CheckResult> {
  if (!isRecord(raw)) return {}
  const out: Record<string, CheckResult> = {}
  for (const [id, result] of Object.entries(raw)) {
    if (!isRecord(result)) continue
    const score = Number(result.score)
    if (!Number.isFinite(score)) continue
    out[id] = {
      score: Math.min(100, Math.max(0, score)),
      note: typeof result.note === 'string' ? result.note : '',
      at: typeof result.at === 'string' ? result.at : '',
    }
  }
  return out
}

function sanitizeTheory(raw: unknown): Record<string, TheoryState> {
  if (!isRecord(raw)) return {}
  const out: Record<string, TheoryState> = {}
  for (const [id, state] of Object.entries(raw)) if (state === 0 || state === 1 || state === 2) out[id] = state
  return out
}

function sanitizeErrors(raw: unknown): ErrorEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (entry): entry is ErrorEntry =>
      isRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.createdAt === 'string' &&
      typeof entry.topic === 'string' &&
      typeof entry.text === 'string' &&
      Array.isArray(entry.repeatAt) &&
      entry.repeatAt.length === 2 &&
      entry.repeatAt.every((d: unknown) => typeof d === 'string') &&
      Array.isArray(entry.done) &&
      entry.done.length === 2 &&
      entry.done.every((f: unknown) => typeof f === 'boolean'),
  )
}

function sanitizeCustom(raw: unknown): CustomSession[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (entry): entry is CustomSession =>
      isRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.week === 'number' &&
      typeof entry.date === 'string' &&
      typeof entry.title === 'string' &&
      typeof entry.minutes === 'number',
  )
}

export function sanitizeState(raw: unknown): AppState {
  if (!isRecord(raw)) return EMPTY_STATE
  return {
    sessions: sanitizeSessions(raw.sessions),
    checks: sanitizeChecks(raw.checks),
    theory: sanitizeTheory(raw.theory),
    errors: sanitizeErrors(raw.errors),
    custom: sanitizeCustom(raw.custom),
  }
}

/* При смене схемы: поднять номер в STATE_KEY, прочитать старый ключ,
   преобразовать и записать в новый — не стирать прогресс. */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return EMPTY_STATE
    return sanitizeState(JSON.parse(raw))
  } catch {
    return EMPTY_STATE
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    /* приватный режим или заблокированное хранилище — просто не сохраняем */
  }
}

/** Тот же ключ читает инлайн-скрипт в index.html до первой отрисовки */
export function loadTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* см. выше */
  }
}
