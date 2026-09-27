/**
 * Excel export of everything Broke? has stored on this device.
 * One workbook, one sheet per data category, downloaded as .xlsx.
 *
 * We only ever WRITE our own data here (never parse untrusted workbooks),
 * so SheetJS' read-path advisories don't apply to this usage.
 */
import * as XLSX from 'xlsx'
import { exportAllData } from './storage'

/** A scalar object → [{ Field, Value }] rows so it reads cleanly in a sheet. */
function keyValueRows(obj: unknown): Array<{ Field: string; Value: unknown }> {
  if (obj == null || typeof obj !== 'object') return []
  return Object.entries(obj as Record<string, unknown>).map(([Field, Value]) => ({
    Field,
    Value: Value == null ? '' : Value,
  }))
}

/** Coerce a possibly-null stored array into a safe array of records. */
function rows(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : []
}

/** Append a sheet only if it has content; keeps empty categories out of the book. */
function appendSheet(wb: XLSX.WorkBook, name: string, data: Array<Record<string, unknown>>): void {
  if (data.length === 0) return
  const ws = XLSX.utils.json_to_sheet(data)
  // Sheet names are capped at 31 chars by the format.
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
}

/**
 * Build the workbook and trigger a browser download.
 * Throws on failure so the caller can surface a friendly message.
 */
export function exportDataToExcel(): void {
  const data = exportAllData()
  const wb = XLSX.utils.book_new()

  // Summary — app meta + flags that don't warrant their own sheet.
  appendSheet(wb, 'Summary', [
    { Field: 'App', Value: String(data.app ?? 'Broke?') },
    { Field: 'Exported at', Value: String(data.exportedAt ?? new Date().toISOString()) },
    { Field: 'Pro', Value: data['broke.isPro'] === true ? 'Yes' : 'No' },
  ])

  appendSheet(wb, 'Profile', keyValueRows(data['broke.profile']))
  appendSheet(wb, 'Settings', keyValueRows(data['broke.settings']))
  appendSheet(wb, 'Streak', keyValueRows(data['broke.streak']))

  appendSheet(wb, 'Debts', rows(data['broke.debts']))

  // History carries an epoch-ms `at`; add a human-readable date alongside it.
  appendSheet(
    wb,
    'History',
    rows(data['broke.history']).map((h) => ({
      ...h,
      at: typeof h.at === 'number' ? new Date(h.at).toISOString() : h.at,
    })),
  )

  appendSheet(wb, 'Check-ins', rows(data['broke.checkins']))

  // If nothing was stored yet, still give a valid one-sheet file.
  if (wb.SheetNames.length === 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Field: 'No data yet', Value: '' }]), 'Summary')
  }

  const filename = `broke-data-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}
