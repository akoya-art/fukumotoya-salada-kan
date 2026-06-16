import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RequestItem, RequestStatus, RequestType, StoreId } from '@/types'
import { STORES } from '@/data/seed'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function storeName(id: StoreId): string {
  return STORES.find((s) => s.id === id)?.name ?? id
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.floor(performance.now() * 1000).toString(36)}-${(globalThis.crypto?.getRandomValues(new Uint32Array(1))[0] ?? 0).toString(36)}`
}

const JP_DATE = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
const JP_DATE_SHORT = new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' })
const JP_DATETIME = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
})

export function formatDate(iso: string): string {
  const d = parseISO(iso)
  return d ? JP_DATE.format(d) : iso
}

export function formatDateTime(ts: number): string {
  return JP_DATETIME.format(new Date(ts))
}

export function formatDateShort(iso: string): string {
  const d = parseISO(iso)
  return d ? JP_DATE_SHORT.format(d) : iso
}

function parseISO(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** Days until due relative to `now`. Negative = overdue. */
export function daysUntil(iso: string, now: number): number | null {
  const d = parseISO(iso)
  if (!d) return null
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

export function dueLabel(iso: string, now: number): { text: string; tone: 'overdue' | 'soon' | 'normal' } {
  const n = daysUntil(iso, now)
  if (n === null) return { text: iso, tone: 'normal' }
  if (n < 0) return { text: `${Math.abs(n)}日超過`, tone: 'overdue' }
  if (n === 0) return { text: '本日必着', tone: 'soon' }
  if (n === 1) return { text: '明日必着', tone: 'soon' }
  if (n <= 3) return { text: `あと${n}日`, tone: 'soon' }
  return { text: `あと${n}日`, tone: 'normal' }
}

export function relativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'たった今'
  if (min < 60) return `${min}分前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}時間前`
  const day = Math.floor(hr / 24)
  return `${day}日前`
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  todo: '未処理',
  processing: '処理中',
  done: '完了',
}

export const TYPE_LABEL: Record<RequestType, string> = {
  transfer: '店舗間在庫移動',
  external: '外部注文依頼',
}

const CSV_HEADER = [
  '種別', 'ステータス', '品名', '品番', '色番', '数量', '必着日',
  '依頼元', '依頼先', '依頼者', '担当者', '備考', '作成日時',
] as const

/** Build an Excel-friendly CSV string (UTF-8 BOM, CRLF, quoted fields). */
export function requestsToCsv(requests: RequestItem[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const rows = [CSV_HEADER.map(esc).join(',')]
  for (const r of requests) {
    rows.push([
      TYPE_LABEL[r.type], STATUS_LABEL[r.status], r.itemName, r.itemCode, r.colorCode ?? '',
      String(r.quantity), r.dueDate, storeName(r.fromStoreId), storeName(r.toStoreId),
      r.requesterName, r.handlerName ?? '', r.note ?? '', formatDateTime(r.createdAt),
    ].map(esc).join(','))
  }
  return '\uFEFF' + rows.join('\r\n')
}

/** Trigger a client-side download of a text file. */
export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** yyyymmdd stamp for filenames. */
export function dateStamp(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}
