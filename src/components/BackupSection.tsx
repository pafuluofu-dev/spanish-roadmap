import { useRef, useState } from 'react'
import { todayISO } from '../dates'

interface BackupSectionProps {
  onExport: () => string
  onImport: (raw: string) => boolean
}

/** Экспорт скачивает состояние файлом JSON, импорт читает файл и заменяет состояние */
export function BackupSection({ onExport, onImport }: BackupSectionProps) {
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const doExport = () => {
    const blob = new Blob([onExport()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `spanish-roadmap-${todayISO()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Файл скачан. Перешли его себе и импортируй на другом устройстве.')
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    if (!window.confirm('Импортировать копию? Текущие галочки, результаты проверок, теория и журнал ошибок будут заменены.')) {
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    const raw = await file.text()
    setMessage(
      onImport(raw)
        ? 'Готово: галочки, результаты проверок, теория и журнал ошибок применены.'
        : 'Не получилось разобрать файл — проверь, что это полный экспорт из этого раздела.',
    )
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="page-section" aria-labelledby="backup-title">
      <details className="section-fold">
        <summary className="section-fold__summary">
          <h2 id="backup-title">Перенос между устройствами</h2>
          <span className="section-fold__hint" aria-hidden="true" />
        </summary>
        <p className="section-lead section-fold__lead">
          Прогресс хранится в localStorage конкретного браузера. Экспорт скачивает всё (галочки, результаты проверок, теорию, журнал ошибок, второй круг) одним
          файлом JSON — импорт на другом устройстве заменяет им текущее состояние.
        </p>
        <div className="backup__actions">
          <button type="button" className="button" onClick={doExport}>
            Экспорт
          </button>
          <label className="button backup__import">
            Импорт
            <input
              ref={fileRef}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void doImport(event.target.files?.[0])}
            />
          </label>
        </div>
        {message && (
          <p className="backup__message" role="status">
            {message}
          </p>
        )}
      </details>
    </section>
  )
}
