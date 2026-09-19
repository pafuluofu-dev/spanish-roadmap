import type { TestItem } from '../data/testBank'

/** Задания теста под карточкой: свёрнуты по умолчанию, ответ или образец — под своей кнопкой у каждого */
export function TestTasksList({ items }: { items: TestItem[] }) {
  return (
    <ol className="test-list">
      {items.map((item) => (
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
        </li>
      ))}
    </ol>
  )
}
