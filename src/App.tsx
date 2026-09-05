import { useEffect, useRef, useState } from 'react'
import { addDays, todayISO } from './dates'
import {
  EMPTY_STATE,
  loadState,
  loadTheme,
  sanitizeState,
  saveState,
  saveTheme,
  type AppState,
  type CheckResult,
  type Theme,
} from './storage'
import type { TheoryState } from './data/theory'
import { AppNav } from './components/AppNav'
import { OverallProgress } from './components/OverallProgress'
import { HomePage } from './components/HomePage'
import { PlanPage } from './components/PlanPage'
import { ChecksPage } from './components/ChecksPage'
import { TheoryPage } from './components/TheoryPage'
import { CoursesPage } from './components/CoursesPage'
import { ROUTE_META, useRoute } from './router'

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const route = useRoute()
  const pageRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => saveState(state), [state])

  useEffect(() => {
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light')
    else document.documentElement.removeAttribute('data-theme')
    saveTheme(theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f7fafc' : '#081028')
  }, [theme])

  useEffect(() => {
    document.title = ROUTE_META[route].title
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    pageRef.current?.focus({ preventScroll: true })
  }, [route])

  const toggleSession = (id: string) =>
    setState((previous) => {
      const sessions = { ...previous.sessions }
      if (sessions[id]) delete sessions[id]
      else sessions[id] = todayISO()
      return { ...previous, sessions }
    })

  const toggleLecture = (id: string) =>
    setState((previous) => {
      const lectures = { ...previous.lectures }
      if (lectures[id]) delete lectures[id]
      else lectures[id] = todayISO()
      return { ...previous, lectures }
    })

  const saveCheckResult = (id: string, score: number, note: string) =>
    setState((previous) => {
      const result: CheckResult = { score, note, at: todayISO() }
      return { ...previous, checks: { ...previous.checks, [id]: result } }
    })

  const clearCheckResult = (id: string) =>
    setState((previous) => {
      const checks = { ...previous.checks }
      delete checks[id]
      return { ...previous, checks }
    })

  const setTheory = (id: string, value: TheoryState) =>
    setState((previous) => ({ ...previous, theory: { ...previous.theory, [id]: value } }))

  const addError = (topic: string, text: string, date: string) =>
    setState((previous) => ({
      ...previous,
      errors: [
        ...previous.errors,
        {
          id: `err-${Date.now().toString(36)}`,
          createdAt: date,
          topic,
          text,
          repeatAt: [addDays(date, 3), addDays(date, 14)],
          done: [false, false],
        },
      ],
    }))

  const toggleRepeat = (id: string, index: 0 | 1) =>
    setState((previous) => ({
      ...previous,
      errors: previous.errors.map((entry) => {
        if (entry.id !== id) return entry
        const done: [boolean, boolean] = [...entry.done]
        done[index] = !done[index]
        return { ...entry, done }
      }),
    }))

  const deleteError = (id: string) =>
    setState((previous) => ({ ...previous, errors: previous.errors.filter((entry) => entry.id !== id) }))

  const addCustom = (week: number, date: string, title: string) =>
    setState((previous) => ({
      ...previous,
      custom: [...previous.custom, { id: `custom-${Date.now().toString(36)}`, week, date, title, minutes: 60 }],
    }))

  const deleteCustom = (id: string) =>
    setState((previous) => {
      const sessions = { ...previous.sessions }
      delete sessions[id]
      return { ...previous, sessions, custom: previous.custom.filter((entry) => entry.id !== id) }
    })

  const exportState = () => JSON.stringify({ v: 1, ...state }, null, 2)

  const importState = (raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return false
      const next = sanitizeState(parsed)
      // Пустой объект после очистки при непустом файле — это не копия, а мусор
      const meaningful =
        Object.keys(next.sessions).length +
          Object.keys(next.checks).length +
          Object.keys(next.theory).length +
          next.errors.length +
          next.custom.length >
        0
      if (!meaningful && JSON.stringify(next) === JSON.stringify(EMPTY_STATE) && JSON.stringify(parsed) !== JSON.stringify({ v: 1, ...EMPTY_STATE })) {
        return false
      }
      setState(next)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="container">
      <AppNav
        route={route}
        state={state}
        theme={theme}
        onToggleTheme={() => setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'))}
      />
      <div className="page" ref={pageRef} tabIndex={-1}>
        {route === 'home' && (
          <HomePage state={state} onToggleSession={toggleSession} onToggleRepeat={toggleRepeat} onExport={exportState} onImport={importState} />
        )}
        {route === 'plan' && (
          <PlanPage state={state} onToggleSession={toggleSession} onAddCustom={addCustom} onDeleteCustom={deleteCustom} />
        )}
        {route === 'checks' && (
          <ChecksPage
            state={state}
            onSaveResult={saveCheckResult}
            onClearResult={clearCheckResult}
            onAddError={addError}
            onToggleRepeat={toggleRepeat}
            onDeleteError={deleteError}
          />
        )}
        {route === 'theory' && <TheoryPage state={state} onSetTheory={setTheory} />}
        {route === 'courses' && <CoursesPage state={state} onToggleLecture={toggleLecture} />}
      </div>
      {route !== 'home' && <OverallProgress state={state} />}
      <footer className="site-footer">
        <p>
          План — испанский с нуля до базы A1 за двенадцать недель (7 сентября — 29 ноября 2026): Бебрис, Udemy A1 для русскоговорящих, 800 диалогов, Anki.
          Порог любого теста — 80 %.
        </p>
        <p>Галочки, результаты тестов и журнал ошибок хранятся в этом браузере (localStorage). Для переноса между телефоном и ноутбуком — экспорт и импорт на обзоре.</p>
      </footer>
    </div>
  )
}
