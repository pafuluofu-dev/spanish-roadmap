// Статический план для ИИ-ассистентов и краулеров: сайт — SPA, сервер отдаёт пустой index.html,
// и без этого файла содержимое снаружи не прочитать. Собирает public/plan.md из src/data/*;
// запускается перед vite build (npm run plan), сам файл в git не хранится — он всегда свежий на деплое.
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://pafuluofu-dev.github.io/spanish-roadmap/'

// Vite сам читает TypeScript данных — отдельный компилятор не нужен
const vite = await createServer({ root, server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'error' })
let planData, checksData, theory, courses, resources, bank
try {
  planData = await vite.ssrLoadModule('/src/data/plan.ts')
  checksData = await vite.ssrLoadModule('/src/data/checks.ts')
  theory = await vite.ssrLoadModule('/src/data/theory.ts')
  courses = await vite.ssrLoadModule('/src/data/courses.ts')
  resources = await vite.ssrLoadModule('/src/data/resources.ts')
  bank = await vite.ssrLoadModule('/src/data/testBank.ts')
} finally {
  await vite.close()
}
const { BLOCKS, DEFAULT_START, PLAN_WEEKS, PASS_THRESHOLD, PLANNED_HOURS } = planData
// Даты — от старта по умолчанию: свою дату владелец задаёт на сайте, она живёт в его браузере
const plan = planData.buildPlan(DEFAULT_START)
const checks = checksData.buildChecks(plan.sessions, plan.weeks)

const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ')
const table = (head, rows) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`)].join('\n')
const links = (list) => (list && list.length ? list.map((item) => `[${item.label}](${item.url})`).join('; ') : '—')
const program = (item) => (item ? `разд. ${item.sections.join(', ')}: ${item.lectures.map((lecture) => lecture.title).join('; ')}` : '—')
const KIND = { study: 'занятие', check: 'тест недели', exam: 'рубеж', diagnostic: 'диагностика', rest: 'отдых' }

const lines = []
lines.push('# Маршрут: испанский — база A1 за двенадцать недель', '')
lines.push(
  `> Статический слепок плана с сайта ${SITE} — сайт одностраничный, и без этого файла его содержимое снаружи не прочитать. Собирается при каждой сборке из src/data. Галочки, результаты тестов и журнал ошибок хранятся только в браузере владельца и здесь не отражены.`,
  '',
)
lines.push(`- Сгенерировано: ${new Date().toISOString().slice(0, 10)}`)
lines.push(`- Даты ниже — от старта по умолчанию ${plan.start} до ${plan.goal} (${PLAN_WEEKS} недель); на сайте дату начала можно сдвинуть, тогда сдвигаются все даты`)
lines.push(`- Ритм: пн–пт — занятие 75 минут, суббота — повтор недели и тест самому себе, воскресенье — отдых`)
lines.push(`- Порог любого теста: ${PASS_THRESHOLD} %; плановый объём: ≈${PLANNED_HOURS} ч`)
lines.push('')

lines.push('## Блоки', '', table(['Блок', 'Название', 'Недели', '≈ часов'], BLOCKS.map((block) => [block.id, block.title, `${block.weeks[0]}–${block.weeks[block.weeks.length - 1]}`, block.hours])), '')

lines.push('## Недели и занятия', '')
for (const week of plan.weeks) {
  lines.push(`### Неделя ${week.n} · ${week.from} — ${week.to} · ${week.focus} · блок ${week.block}`, '')
  if (week.note) lines.push(week.note, '')
  lines.push(
    table(
      ['Дата', 'Тип', 'Занятие', 'Мин', 'Раскладка минут / пояснение', 'Udemy A1 — что разбираем', 'Материалы'],
      week.sessions.map((session) => [session.date, KIND[session.kind] ?? session.kind, session.title, session.minutes, session.notes ?? '—', program(session.program), links(session.links)]),
    ),
    '',
  )
}

lines.push(
  '## Тесты недели и рубежи',
  '',
  table(
    ['Дата', 'Тест', 'Что должно получаться', 'Формат', 'Порог, %', 'Заданий'],
    checks.map((check) => [check.date, check.title, check.scope, check.format, check.threshold, bank.testsFor(check.id).length]),
  ),
  '',
  `Правило оценивания: ${checksData.SCORING_RULE}`,
  '',
)

lines.push('## Умею сказать — чек-лист', '')
for (const group of theory.THEORY_GROUPS) {
  lines.push(`### ${group.title}`, '')
  for (const question of theory.THEORY_QUESTIONS.filter((item) => item.source === group.source)) lines.push(`- ${question.text}`)
  lines.push('')
}

lines.push('## Курсы Udemy — программы', '')
for (const course of courses.COURSES) {
  lines.push(`### ${course.title}`, '', `${course.author} · ${course.hours} ч видео · ${course.url}`, '')
  course.sections.forEach((section, index) => lines.push(`- ${index + 1}. ${section.title} — ${section.lectures.length} лекций`))
  lines.push('')
}

lines.push('## Материалы', '')
for (const resource of resources.RESOURCES) {
  lines.push(`- ${resource.url ? `[${resource.title}](${resource.url})` : resource.title}${resource.note ? ` — ${resource.note}` : ''}`)
}
lines.push('')

writeFileSync(resolve(root, 'public/plan.md'), lines.join('\n') + '\n')
console.log(`plan.md: ${plan.weeks.length} недель, ${plan.sessions.length} занятий, ${checks.length} тестов`)
