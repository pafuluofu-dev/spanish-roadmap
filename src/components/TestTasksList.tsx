import type { TestItem } from '../data/testBank'
import type { TaskMark } from '../storage'

/** Ключ отметки: id заданий уникальны внутри банка, но пара с тестом надёжнее при будущих правках данных */
export const taskMarkKey = (checkId: string, itemId: string) => `${checkId}:${itemId}`

/** Отметка задания и её вес в балле: «?» — половина, как и в правиле оценивания теста */
const MARKS: { value: TaskMark; label: string; title: string }[] = [
  { value: 'ok', label: 'получилось', title: 'Сказано без подсказки и долгих пауз — балл' },
  { value: 'half', label: '?', title: 'Наполовину: с подсказкой, с паузой или с ошибкой в окончании — полбалла' },
  { value: 'fail', label: 'не получилось', title: 'Не сказано — ноль' },
]

const POINTS: Record<TaskMark, number> = { ok: 1, half: 0.5, fail: 0 }

/** «2,5» — балл с запятой, без хвоста «,0» */
const fmtPoints = (points: number) => String(Math.round(points * 10) / 10).replace('.', ',')

interface TestTasksListProps {
  checkId: string
  items: TestItem[]
  marks: Record<string, TaskMark>
  /** null — снять отметку: повторный клик по активной кнопке */
  onMark: (key: string, mark: TaskMark | null) => void
  /** Порог теста, % — чтобы сразу видеть, дотягивает ли счёт */
  threshold: number
  /** Перенести посчитанный процент в форму результата */
  onApplyScore: (percent: number) => void
}

/** Задания теста под карточкой: свёрнуты по умолчанию, ответ или образец — под своей кнопкой у каждого */
export function TestTasksList({ checkId, items, marks, onMark, threshold, onApplyScore }: TestTasksListProps) {
  return (
    <>
      <ol className="test-list">
        {items.map((item) => {
          const key = taskMarkKey(checkId, item.id)
          const current = marks[key]
          return (
            <li className={`test-item${item.kind === 'speak' ? ' test-item--speak' : ''}`} key={item.id}>
              <p className="test-item__head">
                <span className="test-item__id">{item.id}</span>
                <span className="test-item__title">{item.title}</span>
                {item.kind === 'speak' && <span className="test-item__kind">вслух</span>}
              </p>
              <p className="test-item__prompt">{item.prompt}</p>
              <details className="test-item__answer-fold">
                <summary className="test-item__answer-summary">{item.kind === 'speak' ? 'Показать, что должно прозвучать' : 'Показать ответ'}</summary>
                <p className="test-item__answer">{item.answer}</p>
              </details>
              <p className="test-marks" role="group" aria-label={`Задание ${item.id}: как получилось`}>
                {MARKS.map((mark) => (
                  <button
                    type="button"
                    key={mark.value}
                    className={`test-mark test-mark--${mark.value}${current === mark.value ? ' test-mark--active' : ''}`}
                    aria-pressed={current === mark.value}
                    title={mark.title}
                    onClick={() => onMark(key, current === mark.value ? null : mark.value)}
                  >
                    {mark.label}
                  </button>
                ))}
              </p>
            </li>
          )
        })}
      </ol>
      <TestScore checkId={checkId} items={items} marks={marks} threshold={threshold} onApplyScore={onApplyScore} />
    </>
  )
}

interface TestScoreProps {
  checkId: string
  items: TestItem[]
  marks: Record<string, TaskMark>
  threshold: number
  onApplyScore: (percent: number) => void
}

/* Балл считается только по отмеченным заданиям: заданий в банке больше, чем берут на один тест,
   и неотмеченное задание — это «не брал», а не «не смог». Не сказанное отмечается кнопкой «не получилось». */
function TestScore({ checkId, items, marks, threshold, onApplyScore }: TestScoreProps) {
  const marked = items.filter((item) => marks[taskMarkKey(checkId, item.id)])
  const points = marked.reduce((sum, item) => sum + POINTS[marks[taskMarkKey(checkId, item.id)]], 0)
  const percent = marked.length > 0 ? Math.round((points / marked.length) * 100) : 0
  const passed = percent >= threshold

  if (marked.length === 0) {
    return <p className="test-score test-score--empty">Отметьте задания кнопками выше — балл посчитается сам.</p>
  }

  return (
    <p className={`test-score${passed ? ' test-score--passed' : ''}`} role="status">
      <span className="test-score__value">{percent} %</span>
      <span className="test-score__detail">
        {fmtPoints(points)} из {marked.length} · отмечено {marked.length} из {items.length} · порог {threshold} %
      </span>
      <button type="button" className="button" onClick={() => onApplyScore(percent)}>
        Записать {percent} % в результат
      </button>
    </p>
  )
}
