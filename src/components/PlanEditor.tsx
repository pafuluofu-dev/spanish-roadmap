import { useState } from 'react'
import { BLOCKS, type BlockId, type Session, type SessionKind, type Week } from '../data/plan'
import type { FolderFields, NodeFields } from '../planEdits'

/* Режим редактирования плана: панель, инструменты у недели и занятия, формы.
   Состояние режима живёт на странице плана (PlanPage) и приходит сюда объектом Editor;
   сами правки — чистые операции над state.planEdits, страница их применяет и сохраняет. */

/** Какая форма сейчас раскрыта: правка занятия/недели или новое занятие/неделя */
export type EditorForm =
  | { kind: 'node'; id: string }
  | { kind: 'new-node'; folderId: string }
  | { kind: 'folder'; id: string }
  | { kind: 'new-folder'; block: BlockId }

export interface Editor {
  form: EditorForm | null
  setForm: (form: EditorForm | null) => void
  /** Первый узел обмена; пока выбран, клик по «⇄» другого занятия меняет их местами */
  swapFrom: string | null
  setSwapFrom: (id: string | null) => void
  moveFolder: (id: string, delta: number) => void
  deleteFolder: (id: string) => void
  /** id === null — новая неделя блока block */
  saveFolder: (id: string | null, block: BlockId, fields: FolderFields) => void
  moveNode: (id: string, delta: number) => void
  swapNodes: (idA: string, idB: string) => void
  deleteNode: (id: string) => void
  /** id === null — новое занятие в конце папки folderId */
  saveNode: (id: string | null, folderId: string, fields: NodeFields) => void
}

interface PlanEditorPanelProps {
  editing: boolean
  hasEdits: boolean
  swapping: boolean
  onToggle: () => void
  onReset: () => void
  onCancelSwap: () => void
}

/** Панель над блоками: переключатель режима, подсказка, «Вернуть исходный план», состояние обмена */
export function PlanEditorPanel({ editing, hasEdits, swapping, onToggle, onReset, onCancelSwap }: PlanEditorPanelProps) {
  return (
    <div className="plan-editor">
      <button type="button" className={`button${editing ? ' button--active' : ''}`} aria-pressed={editing} onClick={onToggle}>
        {editing ? 'Готово' : 'Редактировать план'}
      </button>
      {editing && swapping && (
        <>
          <span className="plan-editor__hint" role="status">
            Выберите второй элемент для обмена
          </span>
          <button type="button" className="link-button" onClick={onCancelSwap}>
            Отменить
          </button>
        </>
      )}
      {editing && !swapping && <span className="plan-editor__hint">Правки хранятся в этом браузере и попадают в экспорт</span>}
      {editing && hasEdits && (
        <button type="button" className="link-button" onClick={onReset}>
          Вернуть исходный план
        </button>
      )}
    </div>
  )
}

interface FolderToolsProps {
  week: Week
  weeks: Week[]
  editor: Editor
}

/** Инструменты недели: изменить, выше/ниже (только внутри своего блока), добавить занятие, удалить */
export function FolderTools({ week, weeks, editor }: FolderToolsProps) {
  const index = weeks.findIndex((item) => item.id === week.id)
  const previous = weeks[index - 1]
  const next = weeks[index + 1]
  const canUp = !!previous && previous.block === week.block
  const canDown = !!next && next.block === week.block
  return (
    <div className="edit-tools edit-tools--folder" role="group" aria-label={`Инструменты недели ${week.n}`}>
      <button type="button" className="edit-tools__button" onClick={() => editor.setForm({ kind: 'folder', id: week.id })}>
        ✎ Изменить
      </button>
      <button type="button" className="edit-tools__button" aria-label="Переместить неделю выше" disabled={!canUp} onClick={() => editor.moveFolder(week.id, -1)}>
        ↑
      </button>
      <button type="button" className="edit-tools__button" aria-label="Переместить неделю ниже" disabled={!canDown} onClick={() => editor.moveFolder(week.id, 1)}>
        ↓
      </button>
      <button type="button" className="edit-tools__button" onClick={() => editor.setForm({ kind: 'new-node', folderId: week.id })}>
        + Добавить занятие
      </button>
      <button type="button" className="edit-tools__button" onClick={() => editor.deleteFolder(week.id)}>
        × Удалить
      </button>
    </div>
  )
}

interface NodeToolsProps {
  session: Session
  week: Week
  editor: Editor
}

/** Инструменты занятия: выше, ниже, поменять местами, изменить, удалить */
export function NodeTools({ session, week, editor }: NodeToolsProps) {
  const index = week.sessions.findIndex((item) => item.id === session.id)
  const swapping = editor.swapFrom === session.id
  const onSwap = () => {
    if (editor.swapFrom === null) editor.setSwapFrom(session.id)
    else if (swapping) editor.setSwapFrom(null)
    else editor.swapNodes(editor.swapFrom, session.id)
  }
  return (
    <div
      className={`edit-tools edit-tools--node${session.kind === 'rest' ? ' edit-tools--rest' : ''}`}
      role="group"
      aria-label={`Инструменты занятия «${session.title}»`}
    >
      <button type="button" className="edit-tools__button" aria-label="Переместить занятие выше" disabled={index <= 0} onClick={() => editor.moveNode(session.id, -1)}>
        ↑
      </button>
      <button
        type="button"
        className="edit-tools__button"
        aria-label="Переместить занятие ниже"
        disabled={index >= week.sessions.length - 1}
        onClick={() => editor.moveNode(session.id, 1)}
      >
        ↓
      </button>
      <button
        type="button"
        className={`edit-tools__button${swapping ? ' edit-tools__button--active' : ''}`}
        aria-label="Поменять местами"
        aria-pressed={swapping}
        onClick={onSwap}
      >
        ⇄
      </button>
      <button type="button" className="edit-tools__button" aria-label="Изменить" onClick={() => editor.setForm({ kind: 'node', id: session.id })}>
        ✎
      </button>
      <button type="button" className="edit-tools__button" aria-label="Удалить" onClick={() => editor.deleteNode(session.id)}>
        ×
      </button>
    </div>
  )
}

const KIND_OPTIONS: { value: SessionKind; label: string }[] = [
  { value: 'study', label: 'занятие' },
  { value: 'check', label: 'тест недели' },
  { value: 'exam', label: 'рубеж' },
  { value: 'rest', label: 'отдых' },
]

/** Ссылки в форме — по одной в строке «подпись | url»; строка без черты — просто адрес */
function parseLinks(raw: string): NodeFields['links'] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bar = line.indexOf('|')
      if (bar < 0) return { label: line, url: line }
      return { label: line.slice(0, bar).trim() || line.slice(bar + 1).trim(), url: line.slice(bar + 1).trim() }
    })
    .filter((link) => link.url)
}

function formatLinks(links: NodeFields['links']): string {
  return (links ?? []).map((link) => `${link.label} | ${link.url}`).join('\n')
}

interface NodeEditorProps {
  /** Занятие для правки; undefined — новое */
  session?: Session
  folderId: string
  weeks: Week[]
  editor: Editor
}

/** Форма занятия на месте узла (или пустая в конце недели): название, тип, минуты, пояснение, ссылки, неделя */
export function NodeEditor({ session, folderId, weeks, editor }: NodeEditorProps) {
  const [title, setTitle] = useState(session?.title ?? '')
  const [kind, setKind] = useState<SessionKind>(session?.kind ?? 'study')
  const [minutes, setMinutes] = useState(String(session?.minutes ?? 75))
  // Именно ownNotes: в notes у буднего занятия лежит раскладка минут недели, и форма пришила бы её к занятию
  const [notes, setNotes] = useState(session?.ownNotes ?? '')
  const [links, setLinks] = useState(formatLinks(session?.links))
  const [week, setWeek] = useState(folderId)
  const prefix = session ? `edit-${session.id}` : `new-${folderId}`
  const ready = title.trim().length > 0

  const submit = () => {
    if (!ready) return
    const parsedMinutes = Number(minutes.replace(',', '.'))
    editor.saveNode(session?.id ?? null, week, {
      kind,
      title: title.trim(),
      minutes: Number.isFinite(parsedMinutes) && parsedMinutes >= 0 ? parsedMinutes : 0,
      // Пустая строка, а не undefined: ключ с undefined выпадает при сохранении, и очистка поля не переживала бы перезагрузку
      notes: notes.trim(),
      links: parseLinks(links),
    })
  }

  return (
    <li className="node-editor">
      <form
        className="node-editor__form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <p className="node-editor__title">{session ? 'Изменить занятие' : 'Новое занятие'}</p>
        <div className="node-editor__field">
          <label className="node-editor__label" htmlFor={`${prefix}-title`}>
            Название
          </label>
          <input className="node-editor__input" id={`${prefix}-title`} type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="node-editor__row">
          <div className="node-editor__field">
            <label className="node-editor__label" htmlFor={`${prefix}-kind`}>
              Тип
            </label>
            <select className="node-editor__input" id={`${prefix}-kind`} value={kind} onChange={(event) => setKind(event.target.value as SessionKind)}>
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="node-editor__field">
            <label className="node-editor__label" htmlFor={`${prefix}-minutes`}>
              Минуты
            </label>
            <input
              className="node-editor__input"
              id={`${prefix}-minutes`}
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div className="node-editor__field">
            <label className="node-editor__label" htmlFor={`${prefix}-week`}>
              Неделя
            </label>
            <select className="node-editor__input" id={`${prefix}-week`} value={week} onChange={(event) => setWeek(event.target.value)}>
              {weeks.map((item) => (
                <option key={item.id} value={item.id}>
                  Неделя {item.n} · {item.focus}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="node-editor__field">
          <label className="node-editor__label" htmlFor={`${prefix}-notes`}>
            Пояснение
          </label>
          <textarea
            className="node-editor__input"
            id={`${prefix}-notes`}
            rows={2}
            value={notes}
            placeholder="Пусто — у буднего занятия покажется раскладка минут недели"
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div className="node-editor__field">
          <label className="node-editor__label" htmlFor={`${prefix}-links`}>
            Ссылки
          </label>
          <textarea className="node-editor__input" id={`${prefix}-links`} rows={3} value={links} onChange={(event) => setLinks(event.target.value)} />
          <p className="node-editor__hint">По одной в строке: подпись | адрес</p>
        </div>
        <div className="node-editor__actions">
          <button type="submit" className="button" disabled={!ready}>
            Сохранить
          </button>
          <button type="button" className="link-button" onClick={() => editor.setForm(null)}>
            Отменить
          </button>
          {session && week !== folderId && <span className="node-editor__hint">Занятие перенесётся в конец выбранной недели</span>}
        </div>
      </form>
    </li>
  )
}

interface FolderEditorProps {
  /** Неделя для правки; undefined — новая в блоке block */
  week?: Week
  block: BlockId
  editor: Editor
}

/** Форма недели: блок, фокус, пометка, раскладка минут. Новая неделя встаёт в конец своего блока */
export function FolderEditor({ week, block, editor }: FolderEditorProps) {
  const [blockId, setBlockId] = useState<BlockId>(block)
  const [focus, setFocus] = useState(week?.focus ?? '')
  const [note, setNote] = useState(week?.note ?? '')
  const [splitValue, setSplitValue] = useState(week?.split ?? '')
  const prefix = week ? `edit-${week.id}` : `new-week-${block}`
  const ready = focus.trim().length > 0

  const submit = () => {
    if (!ready) return
    editor.saveFolder(week?.id ?? null, blockId, {
      block: blockId,
      focus: focus.trim(),
      // Пустая строка = поле очищено, см. NodeEditor
      note: note.trim(),
      split: splitValue.trim(),
    })
  }

  return (
    <form
      className={`folder-editor${week ? '' : ' folder-editor--card'}`}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <p className="folder-editor__title">{week ? `Изменить неделю ${week.n}` : 'Новая неделя'}</p>
      <div className="folder-editor__row">
        <div className="folder-editor__field">
          <label className="folder-editor__label" htmlFor={`${prefix}-block`}>
            Блок
          </label>
          <select className="folder-editor__input" id={`${prefix}-block`} value={blockId} onChange={(event) => setBlockId(event.target.value as BlockId)}>
            {BLOCKS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="folder-editor__field">
          <label className="folder-editor__label" htmlFor={`${prefix}-focus`}>
            Фокус недели
          </label>
          <input className="folder-editor__input" id={`${prefix}-focus`} type="text" value={focus} onChange={(event) => setFocus(event.target.value)} />
        </div>
      </div>
      <div className="folder-editor__field">
        <label className="folder-editor__label" htmlFor={`${prefix}-note`}>
          Пометка
        </label>
        <input className="folder-editor__input" id={`${prefix}-note`} type="text" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <div className="folder-editor__field">
        <label className="folder-editor__label" htmlFor={`${prefix}-split`}>
          Раскладка минут
        </label>
        <input
          className="folder-editor__input"
          id={`${prefix}-split`}
          type="text"
          value={splitValue}
          placeholder="Например: Бебрис 30 · Udemy 20 · слова 10"
          onChange={(event) => setSplitValue(event.target.value)}
        />
        <p className="folder-editor__hint">Показывается под будними занятиями без своего пояснения; необязательно</p>
      </div>
      <div className="folder-editor__actions">
        <button type="submit" className="button" disabled={!ready}>
          Сохранить
        </button>
        <button type="button" className="link-button" onClick={() => editor.setForm(null)}>
          Отменить
        </button>
        {week && blockId !== week.block && <span className="folder-editor__hint">Неделя перейдёт в конец выбранного блока</span>}
      </div>
    </form>
  )
}
