import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarClock, Package, Pencil, Trash2, Truck, Undo2, User, UserCheck } from 'lucide-react'
import type { RequestItem, RequestStatus } from '@/types'
import { Button, Card, IconButton, StatusBadge, TypeBadge } from '@/components/ui'
import { ConfirmDialog, Modal } from '@/components/overlays'
import { RequestForm } from '@/components/RequestForm'
import { cn, dueLabel, formatDate, STATUS_LABEL, storeName } from '@/lib/utils'
import { useApp } from '@/lib/store'

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">{label}</dt>
      <dd className={cn('truncate text-sm font-semibold text-ink', mono && 'tnum font-mono text-[13px]')}>{value || '—'}</dd>
    </div>
  )
}

// One step back along todo → processing → done.
const PREV_STATUS: Partial<Record<RequestStatus, RequestStatus>> = { processing: 'todo', done: 'processing' }

export const RequestCard = forwardRef<HTMLDivElement, { req: RequestItem; index?: number }>(function RequestCard(
  { req, index = 0 },
  ref,
) {
  const { now, setRequestStatus, updateRequest, deleteRequest, toast } = useApp()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const due = dueLabel(req.dueDate, now)
  const TypeIcon = req.type === 'transfer' ? Truck : Package
  const prevStatus = PREV_STATUS[req.status]

  const advance = () => {
    if (req.status === 'todo') { setRequestStatus(req.id, 'processing'); toast('依頼の処理を開始しました', 'info') }
    else if (req.status === 'processing') { setRequestStatus(req.id, 'done'); toast('依頼を完了にしました', 'success') }
  }

  const revert = () => {
    if (!prevStatus) return
    setRequestStatus(req.id, prevStatus)
    toast(`ステータスを「${STATUS_LABEL[prevStatus]}」に戻しました`, 'info')
  }

  return (
    <Card
      ref={ref}
      interactive
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <TypeBadge type={req.type} icon={<TypeIcon className="h-3.5 w-3.5" />} />
        <StatusBadge status={req.status} />
      </div>

      <h3 className="text-[17px] font-bold leading-snug text-ink">{req.itemName}</h3>

      <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <DetailItem label="品番" value={req.itemCode} mono />
        <DetailItem label="色番" value={req.colorCode || '—'} mono />
        <DetailItem label="数量" value={String(req.quantity)} mono />
        <div className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">必着日</dt>
          <dd className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-ink">{formatDate(req.dueDate)}</span>
            {req.status !== 'done' && (
              <span className={cn(
                'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                due.tone === 'overdue' && 'bg-primary-soft text-accent',
                due.tone === 'soon' && 'bg-warning-soft text-warning-fg',
                due.tone === 'normal' && 'bg-surface-2 text-muted',
              )}>
                {due.text}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
        <CalendarClock className="hidden h-4 w-4 text-subtle sm:block" aria-hidden />
        <span className="font-semibold text-ink">{storeName(req.fromStoreId)}</span>
        <ArrowRight className="h-4 w-4 text-subtle" aria-hidden />
        <span className="font-semibold text-ink">{storeName(req.toStoreId)}</span>
        {req.type === 'external' && <span className="text-xs text-muted">（本店へ外部注文）</span>}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <User className="h-4 w-4 text-subtle" aria-hidden />
          依頼者：<span className="font-medium text-ink">{req.requesterName}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-subtle" aria-hidden />
          担当者：<span className="font-medium text-ink">{req.handlerName || '未定'}</span>
        </span>
      </div>

      {req.note && <p className="mt-3 rounded-lg border-l-2 border-line bg-surface-2/60 px-3 py-2 text-sm text-muted">{req.note}</p>}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-0.5">
          <IconButton label="この依頼を編集" onClick={() => setEditing(true)}>
            <Pencil className="h-[18px] w-[18px]" />
          </IconButton>
          {prevStatus && (
            <IconButton label={`ステータスを「${STATUS_LABEL[prevStatus]}」に戻す`} onClick={revert}>
              <Undo2 className="h-[18px] w-[18px]" />
            </IconButton>
          )}
          <IconButton label="この依頼を取り消す（削除）" onClick={() => setConfirmDelete(true)} className="hover:bg-primary-soft hover:text-accent">
            <Trash2 className="h-[18px] w-[18px]" />
          </IconButton>
        </div>

        {req.status !== 'done' && (
          <motion.div whileTap={{ scale: 0.99 }}>
            <Button
              variant={req.status === 'todo' ? 'primary' : 'success'}
              size="sm"
              onClick={advance}
            >
              {req.status === 'todo' ? '処理を開始' : '完了にする'}
            </Button>
          </motion.div>
        )}
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="依頼を編集" labelledBy="edit-request-title">
        <div className="-mx-1 max-h-[72vh] overflow-y-auto px-1">
          <RequestForm
            fromStoreId={req.fromStoreId}
            initial={req}
            submitLabel="変更を保存"
            submitIcon={<Pencil className="h-4 w-4" />}
            onCancel={() => setEditing(false)}
            onSubmit={(values) => {
              updateRequest(req.id, values)
              toast('依頼を更新しました', 'success')
              setEditing(false)
            }}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { deleteRequest(req.id); toast('依頼を取り消しました', 'info') }}
        title="依頼を取り消しますか？"
        message={`「${req.itemName}」の依頼を削除します。この操作は取り消せません。`}
        confirmLabel="取り消す"
      />
    </Card>
  )
})
