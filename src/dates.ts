export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function todayISO(): string {
  return toISO(new Date())
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** Полных дней от сегодня до даты (по местному календарю), не меньше нуля */
export function daysUntil(iso: string): number {
  const ms = parseISO(iso).getTime() - parseISO(todayISO()).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

const MONTHS_GEN = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
/** Именительный падеж — для подписей месяцев на шкале календаря */
export const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function fmtDate(iso: string): string {
  const d = parseISO(iso)
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`
}

export function fmtDateYear(iso: string): string {
  const d = parseISO(iso)
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`
}

export function fmtWeekday(iso: string): string {
  return WEEKDAYS_SHORT[parseISO(iso).getDay()]
}

/** «31.08–06.09» для заголовка недели */
export function fmtRange(fromISO: string, toISOStr: string): string {
  const pad = (iso: string) => {
    const d = parseISO(iso)
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  return `${pad(fromISO)}–${pad(toISOStr)}`
}

/** «12 недель», «21 неделя», «22 недели» — недель в плане стало переменное число, склонение считаем */
export function fmtWeeks(n: number): string {
  const last = n % 10
  const tens = n % 100
  if (last === 1 && tens !== 11) return `${n} неделя`
  if (last >= 2 && last <= 4 && (tens < 12 || tens > 14)) return `${n} недели`
  return `${n} недель`
}

/** «12,5» — часы с запятой, без хвоста «,0» */
export function fmtHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10
  return String(rounded).replace('.', ',')
}
