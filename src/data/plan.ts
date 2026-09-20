import { addDays } from '../dates'
import { applyEdits, EMPTY_EDITS, type BaseFolder, type BaseNode, type PlanEdits } from '../planEdits'
import { bebrisLessonUrl } from './bebris'
import { LINK_A1, LINK_DIALOGUES, LINK_EIGHT_WEEKS, LINK_FROM_ZERO, LINK_KHUKALENKO } from './materials'
import { programFor, type SessionProgram } from './program'

export type SessionKind = 'study' | 'check' | 'exam' | 'diagnostic' | 'rest'

/** Ссылка на материал занятия: конкретный урок Бебриса, страница курса Udemy */
export interface SessionLink {
  label: string
  url: string
}

export interface Session {
  id: string
  /** ISO-дата занятия */
  date: string
  kind: SessionKind
  title: string
  /** Минуты: 75 обычное занятие (середина коридора 60–90), 45 субботний тест, 60 рубеж */
  minutes: number
  /** Одна строка пояснения, выводится серым под названием: своё или раскладка минут недели */
  notes?: string
  /** Только своё пояснение занятия, без подстановки раскладки — его показывает форма редактора */
  ownNotes?: string
  /** Что открыть на этом занятии */
  links?: SessionLink[]
  /** Лекции Udemy A1 на этот день — «что разбираем» под названием */
  program?: SessionProgram
}

export type BlockId = 'A' | 'B' | 'C'

export interface Week {
  /** `week-${n}` у встроенных недель, `f-…` у своих; от позиции не зависит */
  id: string
  /** Позиционный номер в итоговом плане — от него считаются даты */
  n: number
  from: string
  to: string
  block: BlockId
  focus: string
  sessions: Session[]
  /** Пометка на карточке недели */
  note?: string
  /** Раскладка минут — подпись будних занятий без своего пояснения; нужна форме редактора */
  split?: string
}

export interface Block {
  id: BlockId
  title: string
  /** Плановые часы блока (для подписи; фактические суммы считаются из занятий) */
  hours: number
  weeks: number[]
}

/** Понедельник первой недели по умолчанию; свою дату владелец задаёт на обзоре, она хранится в состоянии */
export const DEFAULT_START = '2026-09-07'
/** Недель в плане; конец последней — цель: крепкая база A1 */
export const PLAN_WEEKS = 12

/** Воскресенье последней недели для заданной даты начала; недель в итоговом плане может быть не двенадцать */
export function goalOf(start: string, weeks = PLAN_WEEKS): string {
  return addDays(start, weeks * 7 - 1)
}

/** Исходный номер встроенной недели по id (`week-3` → 3); у своих недель его нет */
export function baseWeekNumber(id: string): number | undefined {
  const match = /^week-(\d+)$/.exec(id)
  return match ? Number(match[1]) : undefined
}
/** Порог сдачи любой проверки, % */
export const PASS_THRESHOLD = 80
/** 12 недель × (5 × 75 мин + 45 мин субботы) ≈ 84 ч */
export const PLANNED_HOURS = 84

export const BLOCKS: Block[] = [
  { id: 'A', title: 'Фундамент — звуки, ser/estar, настоящее время', hours: 28, weeks: [1, 2, 3, 4] },
  { id: 'B', title: 'Бытовой испанский — семья, еда, город, gustar', hours: 28, weeks: [5, 6, 7, 8] },
  { id: 'C', title: 'Живой испанский — слух, речь, итог A1', hours: 28, weeks: [9, 10, 11, 12] },
]

/** Раскладка минут по фазам плана — подпись под каждым будним занятием */
const SPLIT: Record<BlockId | 'A2' | 'B2' | 'C2', string> = {
  A: 'Бебрис 35 · Udemy A1 25 · слова 10 · повторение вслух 5',
  A2: 'Бебрис 30 · Udemy A1 20 · диалоги 15 · слова 10',
  B: 'Бебрис 30 · Udemy A1 20 · диалоги 15 · слова 10 · монолог о себе 2–3 мин',
  B2: 'Бебрис 30 · Udemy A1 20 · короткий Udemy 10 · диалоги 15 · Anki 10',
  C: 'Бебрис 30 · Udemy 15 · аудирование 25 · слова 10',
  C2: 'Бебрис 25 · аудирование 25 · говорение 15 · Anki 10',
}

interface WeekSpec {
  n: number
  block: BlockId
  focus: string
  split: keyof typeof SPLIT
  /** Пн–Пт */
  days: [string, string, string, string, string]
  /** Суббота: тест недели или рубеж блока */
  saturday: { kind: 'check' | 'exam'; title: string; notes: string }
  note?: string
}

const WEEK_SPECS: WeekSpec[] = [
  {
    n: 1,
    block: 'A',
    focus: 'Звучание и первые фразы',
    split: 'A',
    days: [
      'Алфавит и произношение, правила чтения — Бебрис урок 1, вводные уроки Udemy A1',
      'Ударения; приветствия и прощания — каждую фразу проговорить самому',
      'Знакомство: как тебя зовут, откуда ты; личные местоимения',
      'Глагол ser: спряжение, «кто ты» — менять лица вслух: yo soy → tú eres → él es',
      'Числа 0–100; страны и национальности',
    ],
    saturday: { kind: 'check', title: 'Тест недели 1: представиться, поздороваться, посчитать до 100', notes: 'Без подсказок, вслух. Что не получилось — в журнал.' },
  },
  {
    n: 2,
    block: 'A',
    focus: 'ser и estar, простые вопросы',
    split: 'A',
    days: [
      'Глагол estar: где ты, как дела; разница ser и estar',
      'Простые вопросы: qué, quién, dónde, cómo, cuántos — задать и ответить',
      'Базовые существительные: предметы вокруг, люди, места',
      'Диалог знакомства целиком: вопрос–ответ вслух, менять слова',
      'Повтор недель 1–2: ser/estar, числа, местоимения; первые карточки Anki выражениями',
    ],
    saturday: { kind: 'check', title: 'Тест недели 2: ser/estar, пять вопросов о собеседнике, 30 базовых слов', notes: 'Тест самому себе: сказать, не узнать.' },
  },
  {
    n: 3,
    block: 'A',
    focus: 'Настоящее время: правильные глаголы',
    split: 'A2',
    days: [
      'Настоящее время, глаголы на -ar: hablar, trabajar — спряжение и примеры о себе',
      'Глаголы на -er и -ir: comer, vivir; где живу, что ем',
      'tener и querer; первый из «800 диалогов»: слушать без текста → понять → перевод → повторить вслух',
      'Вопросы и отрицания в настоящем времени — проговаривать со сменой лиц',
      'Артикли el/la/los/las, un/una; род существительных + один диалог + Anki',
    ],
    saturday: { kind: 'check', title: 'Тест недели 3: проспрягать пять глаголов, задать пять вопросов, ответить с отрицанием', notes: 'Один диалог из «800» понять со второго прослушивания.' },
  },
  {
    n: 4,
    block: 'A',
    focus: 'Строим предложения',
    split: 'A2',
    days: [
      'Подлежащее + глагол + дополнение; предлоги a, de, en — десять своих предложений',
      'Множественное число; согласование артикля и существительного',
      'Два коротких диалога «800» о работе и учёбе — повторять реплики с интонацией',
      'Рассказ о своём дне в настоящем времени — вслух, одна минута без опоры',
      'Повтор блока A: tener, querer, vivir, hablar, comer, trabajar + Anki',
    ],
    saturday: { kind: 'exam', title: 'Рубеж 1 — фундамент: представиться и рассказать о себе в настоящем времени', notes: '10 минут подготовки, 3 минуты речи, потом ответить на пять вопросов. Записать себя на диктофон.' },
  },
  {
    n: 5,
    block: 'B',
    focus: 'Семья, работа, дом',
    split: 'B',
    days: [
      'Семья: члены семьи, притяжательные mi/tu/su — описать свою семью',
      'Работа и профессии; глагол hacer; «¿Qué haces?» — ответить о себе',
      'Дом и квартира; указательные este/ese/aquel + диалог о доме',
      'gustar: me gusta / me gustan — что мне нравится; с этого дня монолог 2–3 минуты ежедневно',
      'Описание человека: прилагательные, согласование по роду и числу + Anki',
    ],
    saturday: { kind: 'check', title: 'Тест недели 5: рассказать о семье и работе, десять фраз с gustar', notes: 'Монолог на диктофон, послушать себя.' },
  },
  {
    n: 6,
    block: 'B',
    focus: 'Еда, время, повседневность',
    split: 'B',
    days: [
      'Еда и ресторан: заказать, попросить счёт; глагол poder — «¿Puedo…?»',
      'Магазин и цены: «¿Cuánto cuesta?»; числа до 1000',
      'Время и дни недели: «¿Qué hora es?», расписание + диалог о встрече',
      'Повседневные действия и возвратные глаголы: levantarse, ducharse — мой день по часам',
      'Неправильные глаголы ir и venir: «voy a…», планы на неделю + Anki',
    ],
    saturday: { kind: 'check', title: 'Тест недели 6: заказать еду, назвать время, рассказать свой день', notes: 'Три сценки вслух без подготовки.' },
  },
  {
    n: 7,
    block: 'B',
    focus: 'Закрепление A1, первый круг',
    split: 'B2',
    days: [
      'Короткий курс Udemy (Julia Khukalenko) как проверка: ser/estar/tener/hacer/ir — смотреть быстро, останавливаться только на непонятном',
      'Повтор gustar и возвратных глаголов; диалоги «800» с записью своих ответов',
      'Аудирование: три диалога подряд без текста, пересказ по-русски, потом по-испански',
      'Разговор вслух: ответить на десять вопросов о себе без подготовки',
      'Слова: разобрать карточки Anki за шесть недель, выкинуть лишнее + короткий курс дальше',
    ],
    saturday: { kind: 'check', title: 'Тест недели 7: десять вопросов о себе — ответить без пауз', notes: 'Если тема из короткого курса уже ясна — пропускать, не досматривать из принципа.' },
  },
  {
    n: 8,
    block: 'B',
    focus: 'Закрепление A1, второй круг',
    split: 'B2',
    days: [
      'Погода, месяцы, времена суток; «¿Qué tiempo hace?»',
      'Спросить дорогу и объяснить, где что: направления, a la derecha / a la izquierda',
      'Купить билет, договориться о встрече — диалоги «800» по ситуациям',
      'Короткий курс Udemy до конца; выписать темы, где ещё спотыкаешься',
      'Сквозной повтор блока B: быт, gustar, неправильные глаголы + Anki',
    ],
    saturday: { kind: 'exam', title: 'Рубеж 2 — быт: заказать, спросить цену и дорогу, рассказать о своём дне', notes: 'Четыре сценки подряд на диктофон, 10 минут.' },
  },
  {
    n: 9,
    block: 'C',
    focus: 'Меньше теории, больше слуха',
    split: 'C',
    days: [
      'Бебрис по плану + аудирование 25 минут: диалоги и простые видео для начинающих',
      'Udemy A1: оставшиеся темы + аудирование — угадывать значение из контекста, не переводить каждое слово',
      'Короткие истории уровня A1: прочитать, послушать, пересказать тремя фразами',
      'Монолог 3 минуты о вчерашнем дне и планах: настоящее время + ir a + инфинитив',
      'Аудирование 30 минут + Anki: карточки только из услышанного',
    ],
    saturday: { kind: 'check', title: 'Тест недели 9: понять новый диалог без текста с первого раза и ответить на вопросы', notes: 'Диалог, которого ещё не слушал.' },
  },
  {
    n: 10,
    block: 'C',
    focus: 'Настоящий испанский',
    split: 'C2',
    days: [
      'Бебрис + видео на испанском без субтитров 15 минут',
      'Udemy A1: последние темы + аудирование',
      'Диалоги «800»: три подряд, повторение реплик с интонацией говорящего',
      'Разговор: описать комнату, картинку, человека — вслух две минуты',
      'Истории A1 + Anki: выражения, не отдельные слова',
    ],
    saturday: { kind: 'check', title: 'Тест недели 10: пересказать историю A1 своими словами', notes: 'Сначала без подготовки, потом ещё раз после прослушивания.' },
  },
  {
    n: 11,
    block: 'C',
    focus: 'Что я умею сказать',
    split: 'C2',
    days: [
      'О себе: кто, сколько лет, где живу и работаю, что люблю — монолог без опоры, записать',
      'Быт: заказать еду, спросить цену и дорогу — три сценки вслух',
      'Быт: купить билет, объяснить, что нужно, рассказать о семье — сценки + диалоги',
      'Простые разговоры: «¿Qué haces hoy?», «¿Qué te gusta hacer?» — ответить развёрнуто',
      'Пройтись по чек-листу «Что умею сказать», отметить слабое + Anki',
    ],
    saturday: { kind: 'check', title: 'Тест недели 11: пять сценок из чек-листа без подготовки', notes: 'Сценки берутся из раздела «Умею сказать».' },
  },
  {
    n: 12,
    block: 'C',
    focus: 'Итог A1',
    split: 'C2',
    days: [
      'Слабые темы по чек-листу — вернуться к Бебрису точечно',
      'Повтор грамматики A1: ser/estar, настоящее время, gustar, возвратные, ir a + инфинитив',
      'Большое аудирование: 30 минут диалогов и видео, конспект услышанного по-испански',
      'Договориться о времени встречи, объяснить проблему — сценки',
      'Разбор ошибок за 12 недель по журналу; набросок плана на A2',
    ],
    saturday: { kind: 'exam', title: 'Рубеж 3 — итог A1: рассказать о себе и быте, ответить на вопросы без подготовки', notes: 'Три части по 3 минуты: о себе, сценка из быта, вопросы. Ниже 80 % — недели 13–14 на повтор, дальше A2.' },
    note: 'После недели 12 баланс меняется: Бебрис 25 %, курс A2 25 %, испанский контент 30 %, разговор и словарь 20 %.',
  },
]

const STUDY_MINUTES = 75

/** Какие курсы Udemy открывать в будний день — по фазе плана */
function udemyLinks(spec: WeekSpec, dayIndex: number): SessionLink[] {
  const links: SessionLink[] = [LINK_A1]
  // «800 диалогов» начинаются с недели 3
  if (spec.n >= 3) links.push(LINK_DIALOGUES)
  // Короткие курсы-повторения: неделя 7 — Khukalenko, неделя 8 — «A1 за 8 недель»
  if (spec.n === 7) links.push(LINK_KHUKALENKO)
  if (spec.n === 8) links.push(LINK_EIGHT_WEEKS)
  // «Испанский с нуля» — один раз, в пятницу второй недели («посмотреть быстро после первых недель»)
  if (spec.n === 2 && dayIndex === 4) links.push(LINK_FROM_ZERO)
  return links
}

/** Встроенная неделя как папка наложения: без дат — они считаются от позиции в итоговом плане.
    Ссылки на уроки Бебриса и Udemy привязаны к исходному номеру недели и остаются за занятием при любых перестановках */
function baseFolder(spec: WeekSpec): BaseFolder {
  const id = (day: number) => `w${String(spec.n).padStart(2, '0')}-d${day}`
  const nodes: BaseNode[] = spec.days.map((title, index) => {
    // Урок Бебриса в день: сквозной номер буднего дня = номер урока
    const lesson = (spec.n - 1) * 5 + index + 1
    const bebris = bebrisLessonUrl(lesson)
    return {
      id: id(index + 1),
      fields: {
        kind: 'study',
        title,
        minutes: STUDY_MINUTES,
        links: [...(bebris ? [{ label: `Бебрис · урок ${lesson}`, url: bebris }] : []), ...udemyLinks(spec, index)],
      },
    }
  })
  const saturday = spec.saturday
  nodes.push({
    id: saturday.kind === 'exam' ? `exam-${Math.ceil(spec.n / 4)}` : `check-${String(spec.n).padStart(2, '0')}`,
    fields: {
      kind: saturday.kind,
      title: saturday.title,
      minutes: saturday.kind === 'exam' ? 60 : 45,
      notes: saturday.notes,
      links: spec.n >= 3 ? [LINK_DIALOGUES] : [],
    },
  })
  return { id: `week-${spec.n}`, fields: { block: spec.block, focus: spec.focus, note: spec.note, split: SPLIT[spec.split] }, nodes }
}

const BASE_FOLDERS: BaseFolder[] = WEEK_SPECS.map(baseFolder)

export interface PlanCore {
  start: string
  goal: string
  weeks: Week[]
  /** Плоский список всех занятий плана (без пользовательских) */
  sessions: Session[]
}

/** План от заданного понедельника под правками владельца. id занятий от даты и позиции не зависят,
    поэтому галочки и результаты переживают и сдвиг даты, и перестановки. Неделя на позиции N начинается
    через 7·(N−1) дней от старта, занятие на позиции i — в i-й день недели (не позже воскресенья) */
export function buildPlan(start: string, edits: PlanEdits = EMPTY_EDITS): PlanCore {
  const weeks: Week[] = applyEdits(BASE_FOLDERS, edits).map((folder, index) => {
    const monday = addDays(start, 7 * index)
    // Пустая строка в правке — это «поле очищено»: undefined не переживает JSON.stringify, а пустое
    // пояснение и пустая раскладка нам не нужны ни в подписи, ни в форме
    const text = (value?: string) => (value && value.trim() ? value : undefined)
    const split = text(folder.fields.split)
    const sessions: Session[] = folder.nodes.map((node, position) => {
      const ownNotes = text(node.fields.notes)
      return {
        id: node.id,
        date: addDays(monday, Math.min(position, 6)),
        ...node.fields,
        ownNotes,
        // Раскладка минут недели — подпись буднего занятия, пока у него нет своего пояснения
        notes: ownNotes ?? (node.fields.kind === 'study' ? split : undefined),
        program: node.added ? undefined : programFor(node.id),
      }
    })
    return {
      id: folder.id,
      n: index + 1,
      from: monday,
      to: addDays(monday, 6),
      block: folder.fields.block,
      focus: folder.fields.focus,
      sessions,
      note: text(folder.fields.note),
      split,
    }
  })
  return { start, goal: goalOf(start, weeks.length), weeks, sessions: weeks.flatMap((week) => week.sessions) }
}
