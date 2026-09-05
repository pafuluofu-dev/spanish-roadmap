import { ALL_SESSIONS, PASS_THRESHOLD, WEEKS } from './plan'

export interface Check {
  id: string
  date: string
  title: string
  /** Что проверяется */
  scope: string
  /** Формат: сколько минут, как проводить */
  format: string
  /** Порог сдачи, % */
  threshold: number
}

/** Что должно получаться к концу каждой недели — под карточкой субботнего теста */
const SCOPE_BY_WEEK: Record<number, string> = {
  1: 'поздороваться, представиться, назвать числа до 100',
  2: 'ser и estar, вопросы qué/quién/dónde/cómo, 30 базовых слов',
  3: 'настоящее время правильных глаголов, tener/querer, вопрос и отрицание',
  4: 'рассказ о себе в настоящем времени — рубеж блока A',
  5: 'семья, работа, дом, gustar, описание человека',
  6: 'еда, цены, время, мой день, ir/venir',
  7: 'десять вопросов о себе без пауз',
  8: 'заказать, спросить цену и дорогу, рассказать о дне — рубеж блока B',
  9: 'понять незнакомый диалог на слух',
  10: 'пересказать историю A1 своими словами',
  11: 'пять сценок из чек-листа без подготовки',
  12: 'о себе, быт, вопросы без подготовки — итог A1',
}

/** Проверки — субботние занятия плана: тест недели или рубеж блока */
export const CHECKS: Check[] = ALL_SESSIONS.filter((session) => session.kind === 'check' || session.kind === 'exam').map((session) => {
  const week = WEEKS.find((item) => item.sessions.includes(session))
  const n = week?.n ?? 0
  return {
    id: session.id,
    date: session.date,
    title: session.kind === 'exam' ? `Рубеж ${Math.ceil(n / 4)}` : `Тест недели ${n}`,
    scope: SCOPE_BY_WEEK[n] ?? session.title,
    format: session.kind === 'exam' ? 'три части по 3 минуты на диктофон, 60 мин с разбором' : 'повтор недели + тест самому себе, 45 мин',
    threshold: PASS_THRESHOLD,
  }
})

/** Правило оценивания, показывается под формой результата */
export const SCORING_RULE = 'Считай долю фраз, которые сказал без подсказки и без долгих пауз. Ошибка в окончании — полбалла, не ноль.'
