import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, FilterX, Inbox, Printer, Search } from 'lucide-react'
import { useApp } from '@/lib/store'
import { STORES } from '@/data/seed'
import type { Page } from '@/components/Layout'
import type { RequestItem, RequestStatus, RequestType, StoreId } from '@/types'
import { RequestCard } from '@/components/RequestCard'
import { Button, EmptyState, Input, Select } from '@/components/ui'
import {
  cn, dateStamp, daysUntil, downloadTextFile, formatDate, formatDateTime,
  requestsToCsv, STATUS_LABEL, storeName, TYPE_LABEL,
} from '@/lib/utils'

type StatusFilter = 'all' | RequestStatus
type TypeFilter = 'all' | RequestType
type StoreFilter = 'all' | StoreId
type Sort = 'new' | 'due'

function FilterSelect({ label, value, onChange, children, className }: {
  label: string; value: string; onChange: (v: string) => void; children: ReactNode; className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>{children}</Select>
    </label>
  )
}

function PrintableList({ rows, now, storeLabel }: { rows: RequestItem[]; now: number; storeLabel: string }) {
  return (
    <div className="hidden print:block">
      <div className="mb-3">
        <h1 className="text-xl font-bold">福本屋サラダ館　依頼一覧</h1>
        <p className="mt-1 text-sm">
          店舗：{storeLabel}　／　出力日時：{formatDateTime(now)}　／　{rows.length}件
        </p>
      </div>
      <table className="print-table">
        <thead>
          <tr>
            {['種別', '状態', '品名', '品番', '色番', '数量', '必着日', '依頼元 → 依頼先', '依頼者', '担当者', '備考'].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{TYPE_LABEL[r.type]}</td>
              <td>{STATUS_LABEL[r.status]}</td>
              <td>{r.itemName}</td>
              <td>{r.itemCode}</td>
              <td>{r.colorCode || '—'}</td>
              <td>{r.quantity}</td>
              <td>{formatDate(r.dueDate)}</td>
              <td>{storeName(r.fromStoreId)} → {storeName(r.toStoreId)}</td>
              <td>{r.requesterName}</td>
              <td>{r.handlerName || '未定'}</td>
              <td>{r.note || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RequestList({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { requests, now, currentStoreId, toast } = useApp()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [storeFilter, setStoreFilter] = useState<StoreFilter>('all')
  const [sort, setSort] = useState<Sort>('new')

  const counts = useMemo(() => ({
    all: requests.length,
    todo: requests.filter((r) => r.status === 'todo').length,
    processing: requests.filter((r) => r.status === 'processing').length,
    done: requests.filter((r) => r.status === 'done').length,
  }), [requests])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = requests
      .filter((r) => status === 'all' || r.status === status)
      .filter((r) => typeFilter === 'all' || r.type === typeFilter)
      .filter((r) => storeFilter === 'all' || r.fromStoreId === storeFilter || r.toStoreId === storeFilter)
      .filter((r) => !q ||
        r.itemName.toLowerCase().includes(q) ||
        r.itemCode.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        storeName(r.fromStoreId).includes(q) ||
        storeName(r.toStoreId).includes(q))

    return list.sort((a, b) => {
      if (sort === 'due') {
        const da = daysUntil(a.dueDate, now)
        const db = daysUntil(b.dueDate, now)
        if (da === null) return 1
        if (db === null) return -1
        if (da !== db) return da - db // earliest / most overdue first
        return b.createdAt - a.createdAt
      }
      return b.createdAt - a.createdAt
    })
  }, [requests, status, typeFilter, storeFilter, query, sort, now])

  const chips: { id: StatusFilter; label: string; n: number }[] = [
    { id: 'all', label: '全件', n: counts.all },
    { id: 'todo', label: '未処理', n: counts.todo },
    { id: 'processing', label: '処理中', n: counts.processing },
    { id: 'done', label: '完了', n: counts.done },
  ]

  const hasActiveFilter = status !== 'all' || typeFilter !== 'all' || storeFilter !== 'all' || sort !== 'new' || !!query.trim()
  const storeLabel = currentStoreId ? storeName(currentStoreId) : '全店'

  const clearFilters = () => {
    setStatus('all'); setTypeFilter('all'); setStoreFilter('all'); setSort('new'); setQuery('')
  }

  const exportCsv = () => {
    if (!filtered.length) return
    downloadTextFile(`サラダ館_依頼一覧_${dateStamp(now)}.csv`, requestsToCsv(filtered))
    toast(`${filtered.length}件をCSVに出力しました`, 'success')
  }

  return (
    <>
      <div className="space-y-4 print:hidden">
        {/* Toolbar: result count + export actions */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink tnum">{filtered.length}</span> 件
            {filtered.length !== counts.all && <span className="text-subtle"> / 全{counts.all}件</span>}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!filtered.length}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()} disabled={!filtered.length}>
              <Printer className="h-4 w-4" /> 印刷
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="品名・品番・依頼者・店舗で検索" className="pl-10" aria-label="依頼を検索" />
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="ステータスで絞り込み">
          {chips.map((c) => {
            const active = status === c.id
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(c.id)}
                className={cn(
                  'focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
                  active ? 'border-primary bg-primary text-primary-fg' : 'border-line bg-surface text-muted hover:bg-surface-2 hover:text-ink',
                )}
              >
                {c.label}
                <span className={cn('tnum rounded-full px-1.5 text-xs', active ? 'bg-white/20' : 'bg-surface-2 text-muted')}>{c.n}</span>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <FilterSelect label="種別" value={typeFilter} onChange={(v) => setTypeFilter(v as TypeFilter)}>
            <option value="all">すべての種別</option>
            <option value="transfer">{TYPE_LABEL.transfer}</option>
            <option value="external">{TYPE_LABEL.external}</option>
          </FilterSelect>
          <FilterSelect label="店舗" value={storeFilter} onChange={(v) => setStoreFilter(v as StoreFilter)}>
            <option value="all">すべての店舗</option>
            {STORES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FilterSelect>
          <FilterSelect label="並び替え" value={sort} onChange={(v) => setSort(v as Sort)} className="col-span-2 sm:col-span-1">
            <option value="new">新しい順</option>
            <option value="due">必着日が近い順</option>
          </FilterSelect>
        </div>

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-accent hover:underline"
          >
            <FilterX className="h-4 w-4" /> 絞り込みをクリア
          </button>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={hasActiveFilter ? '該当する依頼がありません' : 'この条件の依頼はありません'}
            description={hasActiveFilter ? '検索条件や絞り込みを変えてお試しください。' : '新しい依頼を作成できます。'}
            action={hasActiveFilter
              ? <Button variant="secondary" onClick={clearFilters}><FilterX className="h-4 w-4" /> 絞り込みをクリア</Button>
              : <Button onClick={() => onNavigate('new')}>新規依頼を作成</Button>}
          />
        ) : (
          <motion.div layout className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((r, i) => <RequestCard key={r.id} req={r} index={i} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Print-only table (mirrors the current filter/sort) */}
      <PrintableList rows={filtered} now={now} storeLabel={storeLabel} />
    </>
  )
}
