import { COURSES, type Course, type CourseSection } from '../data/courses'
import type { AppState } from '../storage'
import { ProgressRing } from './ProgressRing'

interface CoursesPageProps {
  state: AppState
  onToggleLecture: (id: string) => void
}

function doneCount(section: CourseSection, state: AppState): number {
  return section.lectures.filter((lecture) => state.lectures[lecture.id]).length
}

export function CoursesPage({ state, onToggleLecture }: CoursesPageProps) {
  return (
    <main className="courses-page">
      <header className="page-head">
        <p className="eyebrow">Программы курсов · отмечать лекции</p>
        <h1 className="page-head__title">Курсы</h1>
        <p className="page-head__lead">
          Учебная программа снята со страницы курса на Udemy — раздел за разделом, лекция за лекцией. Галочка — «лекция пройдена»; раздел сворачивается, когда
          закрыт целиком. Прогресс хранится здесь же, в браузере, и уезжает вместе с экспортом.
        </p>
      </header>
      {COURSES.map((course) => (
        <CourseSectionList key={course.id} course={course} state={state} onToggleLecture={onToggleLecture} />
      ))}
    </main>
  )
}

interface CourseProps {
  course: Course
  state: AppState
  onToggleLecture: (id: string) => void
}

function CourseSectionList({ course, state, onToggleLecture }: CourseProps) {
  const total = course.sections.reduce((sum, section) => sum + section.lectures.length, 0)
  const done = course.sections.reduce((sum, section) => sum + doneCount(section, state), 0)
  const percent = total ? Math.round((done / total) * 100) : 0
  const titleId = `course-${course.id}-title`

  return (
    <section className="course" aria-labelledby={titleId}>
      <header className="course__header">
        <div className="course__header-main">
          <p className="eyebrow">
            {course.author} · {course.sections.length} разделов · {total} лекций · {course.hours} ч видео
          </p>
          <h2 id={titleId} className="course__title">
            {course.title}
          </h2>
          <p className="course__meta">
            <span>
              {done} / {total} лекций · {percent} %
            </span>
            <a className="course__link" href={course.url} target="_blank" rel="noopener noreferrer">
              Открыть на Udemy<span aria-hidden="true"> ↗</span>
              <span className="visually-hidden"> (откроется в новой вкладке)</span>
            </a>
          </p>
        </div>
        <ProgressRing percent={percent} color="var(--color-block-b)" label={`Прогресс курса: ${percent} %`} />
      </header>
      <div className="course__sections">
        {course.sections.map((section, index) => {
          const sectionDone = doneCount(section, state)
          const complete = section.lectures.length > 0 && sectionDone === section.lectures.length
          return (
            <details className="course-section" key={section.id} open={!complete}>
              <summary className="course-section__summary">
                <span className="course-section__name">
                  <span className="course-section__number">{index + 1}</span>
                  {section.title}
                </span>
                <span className="course-section__progress">
                  {sectionDone}/{section.lectures.length}
                </span>
              </summary>
              <ol className="course-section__lectures">
                {section.lectures.map((lecture) => {
                  const checked = Boolean(state.lectures[lecture.id])
                  return (
                    <li className={`lecture${checked ? ' lecture--done' : ''}`} key={lecture.id}>
                      <input className="lecture__checkbox" type="checkbox" id={lecture.id} checked={checked} onChange={() => onToggleLecture(lecture.id)} />
                      <label className="lecture__title" htmlFor={lecture.id}>
                        {lecture.title}
                        {lecture.preview && <span className="badge badge--free">превью</span>}
                      </label>
                    </li>
                  )
                })}
              </ol>
            </details>
          )
        })}
      </div>
    </section>
  )
}
