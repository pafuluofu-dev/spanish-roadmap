import type { TestItem } from '../data/testBank'
import type { TaskMark } from '../storage'

/** Ключ отметки: id заданий уникальны внутри банка, но пара с тестом надёжнее при будущих правках данных */
export const taskMarkKey = (checkId: string, itemId: string) => `${checkId}:${itemId}`

/** Отметка по умолчанию: пока задание не сделано, оно «не получилось» — балл растёт от нуля вверх */
const DEFAULT_MARK: TaskMark = 'fail'

/** Отметка задания и её вес в балле: «?» — половина, как и в правиле оценивания теста */
const MARKS: { value: TaskMark; label: string; title: string }[] = [
  { value: 'ok', label: 'получилось', title: 'Сказано без подсказки и долгих пауз — балл' },
  { value: 'half', label: '?', title: 'Наполовину: с подсказкой, с паузой или с ошибкой в окончании — полбалла' },
  { value: 'fail', label: 'не получилось', title: 'Не сказано — ноль. Так считается и то, что вы ещё не отмечали' },
]

const POINTS: Record<TaskMark, number> = { ok: 1, half: 0.5, fail: 0 }

/** «2,5» — балл с запятой, без хвоста «,0» */
const fmtPoints = (points: number) => String(Math.round(points * 10) / 10).replace('.', ',')

interface TestTasksListProps {
  checkId: string
  items: TestItem[]
  marks: Record<string, TaskMark>
  /** null — вернуть задание к отметке по умолчанию («не получилось») */
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
          const current = marks[key] ?? DEFAULT_MARK
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
                    /* «Не получилось» — отметка по умолчанию, поэтому она просто стирает запись; повторный клик по «получилось» или «?» — туда же */
                    onClick={() => onMark(key, mark.value === DEFAULT_MARK || current === mark.value ? null : mark.value)}
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

/* Балл считается по всему списку: неотмеченное задание — это «не получилось», а не «не в счёт»,
   поэтому процент растёт от нуля по мере того, как задания отмечаются сделанными. */
function TestScore({ checkId, items, marks, threshold, onApplyScore }: TestScoreProps) {
  const counts: Record<TaskMark, number> = { ok: 0, half: 0, fail: 0 }
  let touched = 0
  for (const item of items) {
    const mark = marks[taskMarkKey(checkId, item.id)]
    if (mark) touched += 1
    counts[mark ?? DEFAULT_MARK] += 1
  }
  const points = counts.ok * POINTS.ok + counts.half * POINTS.half
  const percent = items.length > 0 ? Math.round((points / items.length) * 100) : 0
  const passed = percent >= threshold

  return (
    <p className={`test-score${passed ? ' test-score--passed' : ''}`} role="status">
      <span className="test-score__value">{percent} %</span>
      <span className="test-score__detail">
        {fmtPoints(points)} из {items.length} ·{' '}
        {touched === 0
          ? 'пока ничего не отмечено — всё считается как «не получилось»'
          : `получилось ${counts.ok}, наполовину ${counts.half}, не получилось ${counts.fail}`}{' '}
        · порог {threshold} %
      </span>
      <button type="button" className="button" onClick={() => onApplyScore(percent)}>
        Записать {percent} % в результат
      </button>
    </p>
  )
}
