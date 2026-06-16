import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { useApp, type Toast } from '@/lib/store'
import { cn } from '@/lib/utils'

/* ----------------------------- Modal ----------------------------- */
export function Modal({ open, onClose, title, children, labelledBy = 'modal-title' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; labelledBy?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // focus the dialog for screen readers / keyboard users
    requestAnimationFrame(() => ref.current?.focus())
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}
            className={cn(
              'focus:outline-none relative w-full max-w-md rounded-t-3xl bg-surface p-5 shadow-pop sm:rounded-3xl sm:p-6',
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={labelledBy} className="text-lg font-bold text-ink">{title}</h2>
              <button onClick={onClose} aria-label="閉じる" className="focus-ring -mr-1 -mt-1 rounded-lg p-1.5 text-subtle hover:bg-surface-2 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ----------------------------- Confirm dialog ----------------------------- */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = '削除する', tone = 'danger' }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string
  confirmLabel?: string; tone?: 'danger' | 'primary'
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} labelledBy="confirm-title">
      <div className="flex gap-3.5">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
          tone === 'danger' ? 'bg-primary-soft text-accent' : 'bg-info-soft text-info-fg')}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="pt-1.5 text-sm leading-relaxed text-muted">{message}</p>
      </div>
      <div className="mt-6 flex gap-2.5">
        <Button variant="secondary" block onClick={onClose}>キャンセル</Button>
        <Button variant="primary" block onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

/* ----------------------------- Toaster ----------------------------- */
const toastIcon: Record<Toast['tone'], ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  info: <Info className="h-5 w-5 text-info" />,
  error: <XCircle className="h-5 w-5 text-accent" />,
}

export function Toaster() {
  const { toasts, dismissToast } = useApp()
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-pop"
            role="status"
          >
            {toastIcon[t.tone]}
            <span className="flex-1 text-sm font-medium text-ink">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} aria-label="閉じる" className="focus-ring rounded-md p-1 text-subtle hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
