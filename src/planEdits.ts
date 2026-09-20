import type { BlockId, SessionKind, SessionLink } from './data/plan'

/* Правки плана владельца — наложение поверх src/data/plan.ts. Сам исходный план не меняется:
   всё, что здесь, применяется при чтении (applyEdits), а «Вернуть исходный план» просто стирает наложение.
   Id встроенных недель и занятий от позиции не зависят, поэтому галочки и результаты переживают любые перестановки. */

/** Поля недели, которые правит владелец. split — раскладка минут, она же подпись будних занятий без своего пояснения */
export interface FolderFields {
  block: BlockId
  focus: string
  note?: string
  split?: string
}

/** Поля занятия, которые правит владелец. Дата — от позиции, поэтому её здесь нет */
export interface NodeFields {
  kind: SessionKind
  title: string
  minutes: number
  notes?: string
  links?: SessionLink[]
}

export interface PlanLayout {
  /** Полный порядок папок и их узлов. null — исходный порядок */
  folders: { id: string; nodes: string[] }[]
}

export interface PlanEdits {
  layout: PlanLayout | null
  /** Правки встроенных папок по id: только изменённые поля */
  folders: Record<string, Partial<FolderFields>>
  /** Правки встроенных узлов по id: только изменённые поля */
  nodes: Record<string, Partial<NodeFields>>
  /** Свои папки и узлы целиком */
  addedFolders: Record<string, FolderFields & { id: string }>
  addedNodes: Record<string, NodeFields & { id: string }>
  /** Удалённые встроенные папки/узлы */
  deleted: string[]
}

export const EMPTY_EDITS: PlanEdits = { layout: null, folders: {}, nodes: {}, addedFolders: {}, addedNodes: {}, deleted: [] }

/** Есть ли что стирать кнопкой «Вернуть исходный план» */
export function hasEdits(edits: PlanEdits): boolean {
  return (
    edits.layout !== null ||
    Object.keys(edits.folders).length > 0 ||
    Object.keys(edits.nodes).length > 0 ||
    Object.keys(edits.addedFolders).length > 0 ||
    Object.keys(edits.addedNodes).length > 0 ||
    edits.deleted.length > 0
  )
}

/* ---------- Итоговый план ---------- */

export interface BaseNode {
  id: string
  fields: NodeFields
}

export interface BaseFolder {
  id: string
  fields: FolderFields
  nodes: BaseNode[]
}

export interface MergedNode {
  id: string
  fields: NodeFields
  /** Своё занятие владельца, не из src/data */
  added: boolean
}

export interface MergedFolder {
  id: string
  fields: FolderFields
  nodes: MergedNode[]
  added: boolean
}

/** Порядок папок и узлов итогового плана — то, от чего отталкиваются операции редактора */
export function layoutOf(folders: { id: string; nodes: { id: string }[] }[]): PlanLayout {
  return { folders: folders.map((folder) => ({ id: folder.id, nodes: folder.nodes.map((node) => node.id) })) }
}

/** Итоговый план: исходные папки и узлы под наложением. Чистая функция, план от дат не зависит — даты считает вызывающий по позициям */
export function applyEdits(base: BaseFolder[], edits: PlanEdits): MergedFolder[] {
  const deleted = new Set(edits.deleted)
  const baseFolders = new Map(base.map((folder) => [folder.id, folder]))
  const baseNodes = new Map(base.flatMap((folder) => folder.nodes.map((node) => [node.id, node] as const)))

  const patchedNode = (node: BaseNode): MergedNode => ({ id: node.id, fields: { ...node.fields, ...edits.nodes[node.id] }, added: false })
  const resolveNode = (id: string): MergedNode | undefined => {
    if (deleted.has(id)) return undefined
    const own = baseNodes.get(id)
    if (own) return patchedNode(own)
    const added = edits.addedNodes[id]
    return added ? { id, fields: added, added: true } : undefined
  }
  const resolveFolder = (id: string, nodes: MergedNode[]): MergedFolder | undefined => {
    if (deleted.has(id)) return undefined
    const own = baseFolders.get(id)
    if (own) return { id, fields: { ...own.fields, ...edits.folders[id] }, nodes, added: false }
    const added = edits.addedFolders[id]
    return added ? { id, fields: added, nodes, added: true } : undefined
  }

  const result: MergedFolder[] = []
  // Папка и занятие встают в план ровно один раз: в раскладке из чужого файла id может повториться,
  // и тогда вышли бы два элемента с одним id — одинаковые ключи React и один DOM id на два чекбокса
  const placed = new Set<string>()
  if (edits.layout) {
    for (const entry of edits.layout.folders) {
      if (placed.has(entry.id)) continue
      const nodes: MergedNode[] = []
      for (const id of entry.nodes) {
        if (placed.has(id) || nodes.some((node) => node.id === id)) continue
        const node = resolveNode(id)
        if (node) nodes.push(node)
      }
      const folder = resolveFolder(entry.id, nodes)
      if (!folder) continue
      placed.add(entry.id)
      for (const node of nodes) placed.add(node.id)
      result.push(folder)
    }
  } else {
    for (const folder of base) {
      const merged = resolveFolder(folder.id, [])
      if (merged) result.push(merged)
    }
    for (const added of Object.values(edits.addedFolders)) {
      if (!deleted.has(added.id) && !result.some((folder) => folder.id === added.id)) result.push({ id: added.id, fields: added, nodes: [], added: true })
    }
  }

  // Слияние с обновлённым src/data: папки и занятия, о которых наложение не знает, не теряются —
  // папки идут в конец, занятия — в конец своей исходной папки (или последней папки, если своей уже нет)
  const placedFolders = new Set(result.map((folder) => folder.id))
  for (const folder of base) {
    if (placedFolders.has(folder.id) || deleted.has(folder.id)) continue
    result.push({ id: folder.id, fields: { ...folder.fields, ...edits.folders[folder.id] }, nodes: [], added: false })
  }
  const placedNodes = new Set(result.flatMap((folder) => folder.nodes.map((node) => node.id)))
  for (const folder of base) {
    for (const node of folder.nodes) {
      if (placedNodes.has(node.id) || deleted.has(node.id)) continue
      const target = result.find((item) => item.id === folder.id) ?? result[result.length - 1]
      if (target) target.nodes.push(patchedNode(node))
    }
  }
  return result
}

/* ---------- Операции редактора ----------
   Все чистые: берут правки и текущий порядок итогового плана (layoutOf), возвращают новые правки.
   Порядок берётся из итогового плана, а не из edits.layout, — так он материализуется, пока правок ещё нет,
   и подхватывает занятия, добавленные в src/data после сохранения раскладки. */

function freshId(prefix: 'u' | 'f', taken: (id: string) => boolean): string {
  const stamp = Date.now().toString(36)
  let id = `${prefix}-${stamp}`
  // Два добавления в одну миллисекунду — маловероятно, но id обязан быть уникальным
  for (let n = 2; taken(id); n += 1) id = `${prefix}-${stamp}-${n}`
  return id
}

function isTaken(edits: PlanEdits, current: PlanLayout, id: string): boolean {
  return (
    id in edits.addedFolders ||
    id in edits.addedNodes ||
    current.folders.some((folder) => folder.id === id || folder.nodes.includes(id))
  )
}

function cloneLayout(current: PlanLayout): PlanLayout {
  return { folders: current.folders.map((folder) => ({ id: folder.id, nodes: [...folder.nodes] })) }
}

function swapAt<T>(list: T[], a: number, b: number): void {
  const tmp = list[a]
  list[a] = list[b]
  list[b] = tmp
}

/** Добавить папку: после afterFolderId, в начало (null) или в конец (undefined) */
export function addFolder(edits: PlanEdits, current: PlanLayout, fields: FolderFields, afterFolderId?: string | null): PlanEdits {
  const id = freshId('f', (candidate) => isTaken(edits, current, candidate))
  const layout = cloneLayout(current)
  let at = layout.folders.length
  if (afterFolderId === null) at = 0
  else if (afterFolderId !== undefined) {
    const index = layout.folders.findIndex((folder) => folder.id === afterFolderId)
    if (index >= 0) at = index + 1
  }
  layout.folders.splice(at, 0, { id, nodes: [] })
  return { ...edits, layout, addedFolders: { ...edits.addedFolders, [id]: { ...fields, id } } }
}

export function updateFolder(edits: PlanEdits, id: string, patch: Partial<FolderFields>): PlanEdits {
  const added = edits.addedFolders[id]
  if (added) return { ...edits, addedFolders: { ...edits.addedFolders, [id]: { ...added, ...patch, id } } }
  return { ...edits, folders: { ...edits.folders, [id]: { ...edits.folders[id], ...patch } } }
}

/** Сдвинуть папку на delta позиций (−1 выше, +1 ниже); за края не выходит */
export function moveFolder(edits: PlanEdits, current: PlanLayout, id: string, delta: number): PlanEdits {
  const layout = cloneLayout(current)
  const from = layout.folders.findIndex((folder) => folder.id === id)
  const to = from + delta
  if (from < 0 || to < 0 || to >= layout.folders.length) return edits
  const [folder] = layout.folders.splice(from, 1)
  layout.folders.splice(to, 0, folder)
  return { ...edits, layout }
}

/** Переставить папку сразу после afterFolderId (null — в начало) — нужно, когда у недели сменили блок */
export function moveFolderAfter(edits: PlanEdits, current: PlanLayout, id: string, afterFolderId: string | null): PlanEdits {
  const layout = cloneLayout(current)
  const from = layout.folders.findIndex((folder) => folder.id === id)
  if (from < 0) return edits
  const [folder] = layout.folders.splice(from, 1)
  const at = afterFolderId === null ? 0 : layout.folders.findIndex((item) => item.id === afterFolderId) + 1
  layout.folders.splice(at, 0, folder)
  return { ...edits, layout }
}

/** Удалить папку вместе с узлами: встроенные — в deleted, свои — из added* */
export function deleteFolder(edits: PlanEdits, current: PlanLayout, id: string): PlanEdits {
  const entry = current.folders.find((folder) => folder.id === id)
  if (!entry) return edits
  const layout = cloneLayout(current)
  layout.folders = layout.folders.filter((folder) => folder.id !== id)
  const addedFolders = { ...edits.addedFolders }
  const addedNodes = { ...edits.addedNodes }
  const deleted = [...edits.deleted]
  const drop = (itemId: string, own: Record<string, unknown>) => {
    if (itemId in own) delete own[itemId]
    else if (!deleted.includes(itemId)) deleted.push(itemId)
  }
  drop(id, addedFolders)
  for (const nodeId of entry.nodes) drop(nodeId, addedNodes)
  return { ...edits, layout, addedFolders, addedNodes, deleted }
}

/** Добавить узел в папку: на позицию index или в конец */
export function addNode(edits: PlanEdits, current: PlanLayout, folderId: string, fields: NodeFields, index?: number): PlanEdits {
  const layout = cloneLayout(current)
  const folder = layout.folders.find((item) => item.id === folderId)
  if (!folder) return edits
  const id = freshId('u', (candidate) => isTaken(edits, current, candidate))
  folder.nodes.splice(index === undefined ? folder.nodes.length : Math.min(index, folder.nodes.length), 0, id)
  return { ...edits, layout, addedNodes: { ...edits.addedNodes, [id]: { ...fields, id } } }
}

export function updateNode(edits: PlanEdits, id: string, patch: Partial<NodeFields>): PlanEdits {
  const added = edits.addedNodes[id]
  if (added) return { ...edits, addedNodes: { ...edits.addedNodes, [id]: { ...added, ...patch, id } } }
  return { ...edits, nodes: { ...edits.nodes, [id]: { ...edits.nodes[id], ...patch } } }
}

/** Сдвинуть узел внутри папки на delta позиций; за края папки не выходит */
export function moveNode(edits: PlanEdits, current: PlanLayout, id: string, delta: number): PlanEdits {
  const layout = cloneLayout(current)
  const folder = layout.folders.find((item) => item.nodes.includes(id))
  if (!folder) return edits
  const from = folder.nodes.indexOf(id)
  const to = from + delta
  if (to < 0 || to >= folder.nodes.length) return edits
  const [node] = folder.nodes.splice(from, 1)
  folder.nodes.splice(to, 0, node)
  return { ...edits, layout }
}

/** Перенести узел в другую папку: на позицию index или в конец */
export function moveNodeToFolder(edits: PlanEdits, current: PlanLayout, id: string, folderId: string, index?: number): PlanEdits {
  const layout = cloneLayout(current)
  const target = layout.folders.find((item) => item.id === folderId)
  const source = layout.folders.find((item) => item.nodes.includes(id))
  if (!target || !source) return edits
  source.nodes.splice(source.nodes.indexOf(id), 1)
  target.nodes.splice(index === undefined ? target.nodes.length : Math.min(index, target.nodes.length), 0, id)
  return { ...edits, layout }
}

/** Обменять два узла позициями, в том числе между папками. Даты — от позиции, так что они меняются сами */
export function swapNodes(edits: PlanEdits, current: PlanLayout, idA: string, idB: string): PlanEdits {
  if (idA === idB) return edits
  const layout = cloneLayout(current)
  const folderA = layout.folders.find((item) => item.nodes.includes(idA))
  const folderB = layout.folders.find((item) => item.nodes.includes(idB))
  if (!folderA || !folderB) return edits
  const indexA = folderA.nodes.indexOf(idA)
  const indexB = folderB.nodes.indexOf(idB)
  if (folderA === folderB) swapAt(folderA.nodes, indexA, indexB)
  else {
    folderA.nodes[indexA] = idB
    folderB.nodes[indexB] = idA
  }
  return { ...edits, layout }
}

export function deleteNode(edits: PlanEdits, current: PlanLayout, id: string): PlanEdits {
  const layout = cloneLayout(current)
  for (const folder of layout.folders) folder.nodes = folder.nodes.filter((nodeId) => nodeId !== id)
  if (id in edits.addedNodes) {
    const addedNodes = { ...edits.addedNodes }
    delete addedNodes[id]
    return { ...edits, layout, addedNodes }
  }
  return { ...edits, layout, deleted: edits.deleted.includes(id) ? edits.deleted : [...edits.deleted, id] }
}

export function resetEdits(): PlanEdits {
  return EMPTY_EDITS
}

/* ---------- Чтение из хранилища ---------- */

const BLOCK_IDS: BlockId[] = ['A', 'B', 'C']
const KINDS: SessionKind[] = ['study', 'check', 'exam', 'diagnostic', 'rest']

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeLinks(raw: unknown): SessionLink[] | undefined {
  if (!Array.isArray(raw)) return undefined
  return raw
    .filter((link): link is SessionLink => isRecord(link) && typeof link.label === 'string' && typeof link.url === 'string')
    .map((link) => ({ label: link.label, url: link.url }))
}

/** Патч папки: только валидные поля, остальное отбрасывается */
function sanitizeFolderPatch(raw: unknown): Partial<FolderFields> {
  if (!isRecord(raw)) return {}
  const out: Partial<FolderFields> = {}
  if (BLOCK_IDS.includes(raw.block as BlockId)) out.block = raw.block as BlockId
  if (typeof raw.focus === 'string') out.focus = raw.focus
  if (typeof raw.note === 'string') out.note = raw.note
  if (typeof raw.split === 'string') out.split = raw.split
  return out
}

function sanitizeNodePatch(raw: unknown): Partial<NodeFields> {
  if (!isRecord(raw)) return {}
  const out: Partial<NodeFields> = {}
  if (KINDS.includes(raw.kind as SessionKind)) out.kind = raw.kind as SessionKind
  if (typeof raw.title === 'string') out.title = raw.title
  const minutes = Number(raw.minutes)
  if (raw.minutes !== undefined && Number.isFinite(minutes) && minutes >= 0) out.minutes = minutes
  if (typeof raw.notes === 'string') out.notes = raw.notes
  const links = sanitizeLinks(raw.links)
  if (links) out.links = links
  return out
}

function sanitizePatches<T>(raw: unknown, sanitize: (item: unknown) => Partial<T>): Record<string, Partial<T>> {
  if (!isRecord(raw)) return {}
  const out: Record<string, Partial<T>> = {}
  for (const [id, patch] of Object.entries(raw)) {
    const clean = sanitize(patch)
    if (Object.keys(clean).length > 0) out[id] = clean
  }
  return out
}

function sanitizeLayout(raw: unknown): PlanLayout | null {
  if (!isRecord(raw) || !Array.isArray(raw.folders)) return null
  const folders = raw.folders
    .filter((entry): entry is { id: string; nodes: unknown[] } => isRecord(entry) && typeof entry.id === 'string' && Array.isArray(entry.nodes))
    .map((entry) => ({ id: entry.id, nodes: entry.nodes.filter((id): id is string => typeof id === 'string') }))
  return { folders }
}

/** Правок не было в первых копиях — всё, что не разбирается, читается как «правок нет» */
export function sanitizePlanEdits(raw: unknown): PlanEdits {
  if (!isRecord(raw)) return EMPTY_EDITS
  const addedFolders: PlanEdits['addedFolders'] = {}
  if (isRecord(raw.addedFolders)) {
    for (const [id, entry] of Object.entries(raw.addedFolders)) {
      const fields = sanitizeFolderPatch(entry)
      if (fields.block && typeof fields.focus === 'string') addedFolders[id] = { ...fields, block: fields.block, focus: fields.focus, id }
    }
  }
  const addedNodes: PlanEdits['addedNodes'] = {}
  if (isRecord(raw.addedNodes)) {
    for (const [id, entry] of Object.entries(raw.addedNodes)) {
      const fields = sanitizeNodePatch(entry)
      if (fields.kind && typeof fields.title === 'string' && typeof fields.minutes === 'number') {
        addedNodes[id] = { ...fields, kind: fields.kind, title: fields.title, minutes: fields.minutes, id }
      }
    }
  }
  return {
    layout: sanitizeLayout(raw.layout),
    folders: sanitizePatches<FolderFields>(raw.folders, sanitizeFolderPatch),
    nodes: sanitizePatches<NodeFields>(raw.nodes, sanitizeNodePatch),
    addedFolders,
    addedNodes,
    deleted: Array.isArray(raw.deleted) ? raw.deleted.filter((id): id is string => typeof id === 'string') : [],
  }
}
