export type TheorySource = 'self' | 'daily' | 'talk'

export interface TheoryQuestion {
  id: string
  group: string
  text: string
  source: TheorySource
}

export interface TheoryGroup {
  source: TheorySource
  title: string
  /** Плашка «предположительно» — здесь не используется, оставлено для совместимости компонента */
  tentative?: boolean
}

export const THEORY_GROUPS: TheoryGroup[] = [
  { source: 'self', title: 'О себе' },
  { source: 'daily', title: 'Быт' },
  { source: 'talk', title: 'Простые разговоры' },
]

const SELF = [
  'Кто я: имя, откуда, чем занимаюсь',
  'Сколько мне лет',
  'Где я живу: город, дом, с кем',
  'Где и кем работаю, что делаю на работе',
  'Что люблю и что не люблю (gustar)',
  'Что делаю каждый день — мой обычный день по часам',
]

const DAILY = [
  'Заказать еду и попросить счёт',
  'Спросить цену и понять ответ',
  'Спросить дорогу и понять объяснение',
  'Купить билет: куда, когда, сколько',
  'Объяснить, что мне нужно, когда не знаю точного слова',
  'Рассказать о семье: кто есть, сколько лет, чем занимаются',
  'Договориться о времени встречи и перенести её',
]

const TALK = [
  '¿Qué haces hoy? — рассказать план на день: «Hoy trabajo hasta las seis y después voy al gimnasio»',
  '¿Qué te gusta hacer? — три-четыре занятия с gustar: «Me gusta jugar videojuegos, conducir y viajar»',
  '¿De dónde eres? ¿Dónde vives? — ответить и задать тот же вопрос в ответ',
  'Понять простой вопрос с первого раза и переспросить, если не понял: «¿Puedes repetir?»',
]

function group(source: TheorySource, texts: string[], prefix: string): TheoryQuestion[] {
  const title = THEORY_GROUPS.find((item) => item.source === source)?.title ?? ''
  return texts.map((text, index) => ({ id: `${prefix}-${index + 1}`, group: title, text, source }))
}

export const THEORY_QUESTIONS: TheoryQuestion[] = [...group('self', SELF, 'self'), ...group('daily', DAILY, 'daily'), ...group('talk', TALK, 'talk')]

/** 0 — не могу, 1 — с подсказкой, 2 — свободно */
export type TheoryState = 0 | 1 | 2

/** Подписи трёх положений тумблера, индекс = значение */
export const THEORY_STATES = ['не могу', 'с подсказкой', 'свободно'] as const
