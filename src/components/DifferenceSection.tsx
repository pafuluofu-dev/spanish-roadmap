import { DIFFERENCE_FOOTNOTE, DIFFERENCE_ITEMS } from '../data/difference'

/** «Материалы и их роль»: каждому источнику своя функция и доля времени */
export function DifferenceSection() {
  return (
    <section className="page-section" aria-labelledby="difference-title">
      <div className="page-section__header">
        <h2 id="difference-title">Материалы и их роль</h2>
      </div>
      <ol className="difference">
        {DIFFERENCE_ITEMS.map((item) => (
          <li className="difference__item" key={item.text}>
            <span className="difference__text">{item.text}</span>
            <span className="difference__hours">{item.hours}</span>
          </li>
        ))}
      </ol>
      <p className="difference__footnote">{DIFFERENCE_FOOTNOTE}</p>
    </section>
  )
}
