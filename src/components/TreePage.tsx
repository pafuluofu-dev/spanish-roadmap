import { useMemo, useState } from 'react'
import { todayISO } from '../dates'
import type { AppState } from '../storage'
import { buildTree, hideDoneIn, type TreeNode } from '../tree'
import { treeToSvg } from '../treeSvg'

interface TreePageProps {
  state: AppState
}

/** Символ строки: значок рисуем, статус читаем вслух — значку экранный диктор не поверит */
const MARKS: Record<NonNullable<TreeNode['status']>, { symbol: string; label: string }> = {
  done: { symbol: '✓', label: 'сделано' },
  current: { symbol: '◐', label: 'идёт сейчас' },
  muted: { symbol: '○', label: 'без отметки' },
}

function rowClass(node: TreeNode): string {
  return `tree__row${node.status ? ` tree__row--${node.status}` : ''}${node.branch ? ` tree__row--branch-${node.branch}` : ''}`
}

/** Цвет ветки задаётся на пункте списка: от него он достаётся и линиям-соединителям, и маркеру строки */
function itemClass(node: TreeNode, depth: number): string {
  const leaf = node.folder ? '' : ' tree__item--leaf'
  const branch = node.branch ? ` tree__item--branch-${node.branch}` : ''
  return `tree__item${leaf}${branch}${depth === 0 ? ' tree__item--root' : ''}`
}

/** Весь план одной картой: блоки → недели → занятия. Ничего не сохраняет — фильтр и свёрнутость живут только на странице */
export function TreePage({ state }: TreePageProps) {
  const root = useMemo(() => buildTree(state), [state])
  const [hideDone, setHideDone] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  // Смена номера пересоздаёт все details: иначе кнопка «Развернуть всё» не откроет ветку, свёрнутую руками
  const [generation, setGeneration] = useState(0)
  const [message, setMessage] = useState('')

  const shown = useMemo(() => (hideDone ? hideDoneIn(root) : root), [root, hideDone])

  const download = () => {
    const blob = new Blob([treeToSvg(root, { hideDone })], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `spanish-roadmap-tree-${todayISO()}.svg`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Файл скачан. Его можно распечатать или вставить в заметки.')
  }

  const toggleAll = () => {
    setCollapsed((previous) => !previous)
    setGeneration((previous) => previous + 1)
  }

  return (
    <main className="tree-page">
      <header className="page-head">
        <p className="eyebrow">Дерево плана · строится из данных</p>
        <h1 className="page-head__title">Дерево</h1>
        <p className="page-head__lead">
          Весь план одной картой: блоки, недели и занятия с отметками. Свернуть ветку — щёлкнуть по заголовку. Кнопка ниже скачивает дерево файлом SVG — его можно
          распечатать или вставить в заметки.
        </p>
      </header>

      <div className="tree-tools">
        <button type="button" className="button" onClick={download}>
          Скачать SVG
        </button>
        <button type="button" className="button" onClick={toggleAll}>
          {collapsed ? 'Развернуть всё' : 'Свернуть всё'}
        </button>
        <label className="tree-tools__filter">
          <input className="checkbox" type="checkbox" checked={hideDone} onChange={(event) => setHideDone(event.target.checked)} />
          Скрыть сделанное
        </label>
      </div>
      {message && (
        <p className="tree-tools__message" role="status">
          {message}
        </p>
      )}

      <ul className="tree">
        <TreeBranch node={shown} depth={0} collapsed={collapsed} generation={generation} />
      </ul>
      {hideDone && shown.children.length === 0 && <p className="tree__empty">Сделано всё, что есть в плане — скрывать больше нечего.</p>}
    </main>
  )
}

interface TreeBranchProps {
  node: TreeNode
  /** 0 — корень: у него нет родителя, а значит и черты слева */
  depth: number
  collapsed: boolean
  generation: number
}

function TreeBranch({ node, depth, collapsed, generation }: TreeBranchProps) {
  const mark = node.status ? MARKS[node.status] : undefined

  const row = (
    <>
      <span className="tree__marker" aria-hidden="true">
        {mark ? mark.symbol : '●'}
      </span>
      {mark && <span className="visually-hidden">{mark.label}: </span>}
      <span className="tree__label">{node.label}</span>
      {node.meta && <span className="tree__meta">{node.meta}</span>}
    </>
  )

  if (!node.folder) {
    return (
      <li className={itemClass(node, depth)}>
        <span className={rowClass(node)}>{row}</span>
      </li>
    )
  }

  return (
    <li className={itemClass(node, depth)}>
      <details className="tree__folder" key={generation} open={!collapsed}>
        <summary className="tree__summary">
          <span className={rowClass(node)}>{row}</span>
        </summary>
        <ul className="tree__list">
          {node.children.map((child) => (
            <TreeBranch key={child.id} node={child} depth={depth + 1} collapsed={collapsed} generation={generation} />
          ))}
        </ul>
      </details>
    </li>
  )
}
