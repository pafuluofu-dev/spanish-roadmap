import { hideDoneIn, type TreeNode } from './tree'

/** Вёрстка детерминированная: строка фиксированной высоты, уровень — сдвигом вправо. Печатный лист А4 в ширину — 960 px */
const ROW_HEIGHT = 26
const INDENT = 26
const WIDTH = 960
const PADDING = 24
/** Длинные названия занятий обрезаем: строка одна, переносов в SVG нет */
const MAX_LABEL = 90

/** Цвета печатные и фиксированные — светлая тема сайта: файл открывают и печатают вне браузера, где переменных нет */
const COLORS = {
  background: '#fefbf6',
  text: '#1f1714',
  muted: '#5f544c',
  line: '#d8cbba',
  done: '#2f6b0a',
  a: '#b33a34',
  b: '#8a6508',
  c: '#5f544c',
}

interface Row {
  node: TreeNode
  depth: number
  /** Индекс строки родителя; -1 у корня */
  parent: number
}

function flatten(node: TreeNode, depth: number, parent: number, rows: Row[]): void {
  const index = rows.length
  rows.push({ node, depth, parent })
  for (const child of node.children) flatten(child, depth + 1, index, rows)
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function cut(label: string): string {
  return label.length > MAX_LABEL ? `${label.slice(0, MAX_LABEL - 1)}…` : label
}

/** Соединители идут цветом ветки; у корня ветки нет — там нейтральная линия */
function lineColor(node: TreeNode): string {
  return node.branch ? COLORS[node.branch] : COLORS.line
}

/** Цвет маркера: сделанное — зелёным, приглушённое — серым, остальное — цветом своей ветки, а корень — цветом текста */
function markerColor(node: TreeNode): string {
  if (node.status === 'done') return COLORS.done
  if (node.status === 'muted') return COLORS.muted
  return node.branch ? COLORS[node.branch] : COLORS.text
}

function marker(node: TreeNode, x: number, y: number): string {
  const color = markerColor(node)
  // Папка — ромб, занятие — круг: уровень видно даже на чёрно-белой печати
  if (node.folder) return `<path d="M ${x} ${y - 5} L ${x + 5} ${y} L ${x} ${y + 5} L ${x - 5} ${y} Z" fill="${color}"/>`
  if (node.status === 'muted') return `<circle cx="${x}" cy="${y}" r="4" fill="${COLORS.background}" stroke="${color}"/>`
  return `<circle cx="${x}" cy="${y}" r="4" fill="${color}"/>`
}

/**
 * Дерево плана одним файлом SVG: корень сверху, каждый уровень — отступом вправо, соединители по левому краю.
 * hideDone — то же, что галочка «Скрыть сделанное» на странице: сделанные ветки в файл не попадают.
 */
export function treeToSvg(root: TreeNode, options?: { hideDone?: boolean }): string {
  const visible = options?.hideDone ? hideDoneIn(root) : root
  const rows: Row[] = []
  flatten(visible, 0, -1, rows)

  const height = rows.length * ROW_HEIGHT + PADDING * 2
  const xOf = (depth: number) => PADDING + depth * INDENT
  const yOf = (index: number) => PADDING + index * ROW_HEIGHT + ROW_HEIGHT / 2

  const parts: string[] = []
  parts.push('<?xml version="1.0" encoding="UTF-8"?>')
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" width="${WIDTH}" height="${height}" font-family="-apple-system, Segoe UI, Roboto, sans-serif">`,
  )
  parts.push(`<title>${escapeXml(visible.label)} — дерево плана</title>`)
  parts.push(`<rect width="${WIDTH}" height="${height}" fill="${COLORS.background}"/>`)

  rows.forEach((row, index) => {
    const x = xOf(row.depth)
    const y = yOf(index)
    if (row.parent >= 0) {
      const px = xOf(rows[row.parent].depth)
      const py = yOf(row.parent)
      // Вертикаль по колонке родителя до своей строки, дальше горизонталь к маркеру
      parts.push(`<path d="M ${px} ${py} L ${px} ${y} L ${x - 7} ${y}" fill="none" stroke="${lineColor(row.node)}" stroke-width="1"/>`)
    }
    parts.push(marker(row.node, x, y))

    const isFolder = !!row.node.folder
    const fill = row.node.status === 'done' || row.node.status === 'muted' ? COLORS.muted : COLORS.text
    const weight = isFolder ? ' font-weight="600"' : ''
    const meta = row.node.meta ? `<tspan fill="${COLORS.muted}" font-size="11"> · ${escapeXml(row.node.meta)}</tspan>` : ''
    parts.push(`<text x="${x + 10}" y="${y + 4}" font-size="13" fill="${fill}"${weight}>${escapeXml(cut(row.node.label))}${meta}</text>`)
  })

  parts.push('</svg>')
  return parts.join('\n')
}
