import { SESSION_FORMAT } from '../data/difference'

/** Статичная карточка «Формат занятия» */
export function FormatCard() {
  return (
    <section className="page-section" aria-labelledby="format-title">
      <div className="page-section__header">
        <h2 id="format-title">Формат занятия</h2>
      </div>
      <p className="format-card">{SESSION_FORMAT}</p>
    </section>
  )
}
