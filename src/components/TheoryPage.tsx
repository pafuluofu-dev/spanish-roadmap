import { THEORY_GROUPS, THEORY_QUESTIONS, THEORY_STATES, type TheoryState } from '../data/theory'
import type { AppState } from '../storage'

interface TheoryPageProps {
  state: AppState
  onSetTheory: (id: string, value: TheoryState) => void
}

export function TheoryPage({ state, onSetTheory }: TheoryPageProps) {
  const explained = THEORY_QUESTIONS.filter((question) => state.theory[question.id] === 2).length

  return (
    <main className="theory-page">
      <header className="page-head">
        <p className="eyebrow">Чек-лист A1 · к концу 12-й недели</p>
        <h1 className="page-head__title">Умею сказать</h1>
        <p className="page-head__counter">
          свободно: <strong>{explained}</strong> из {THEORY_QUESTIONS.length}
        </p>
      </header>
      {THEORY_GROUPS.map((group) => {
        const questions = THEORY_QUESTIONS.filter((question) => question.source === group.source)
        const start = THEORY_QUESTIONS.indexOf(questions[0]) + 1
        const titleId = `theory-group-${group.source}`
        return (
          <section className="page-section" aria-labelledby={titleId} key={group.source}>
            <div className="page-section__header">
              <h2 id={titleId}>{group.title}</h2>
            </div>
            <ol className="theory-list" start={start}>
              {questions.map((question, index) => {
                const value = state.theory[question.id] ?? 0
                return (
                  <li className="theory-item" key={question.id}>
                    <p className="theory-item__text">
                      <span className="theory-item__number">{start + index}.</span>
                      {question.text}
                    </p>
                    <fieldset className="theory-item__control">
                      <legend className="visually-hidden">{question.text}</legend>
                      {THEORY_STATES.map((label, index) => (
                        <label className="theory-item__option" key={label}>
                          <input
                            className="theory-item__radio"
                            type="radio"
                            name={question.id}
                            value={index}
                            checked={value === index}
                            onChange={() => onSetTheory(question.id, index as TheoryState)}
                          />
                          <span className="theory-item__option-label">{label}</span>
                        </label>
                      ))}
                    </fieldset>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </main>
  )
}
