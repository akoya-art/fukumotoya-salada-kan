import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, Inbox, Loader2, Sparkles, Store } from 'lucide-react'
import { useApp } from '@/lib/store'
import { STORES } from '@/data/seed'
import type { Page } from '@/components/Layout'
import { Button, Card, EmptyState } from '@/components/ui'
import { RequestCard } from '@/components/RequestCard'
import { cn } from '@/lib/utils'

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function StatTile({ icon, label, value, tone, index }: {
  icon: React.ReactNode; label: string; value: number; tone: 'todo' | 'processing' | 'done'; index: number
}) {
  const display = useCountUp(value)
  const toneStyle = {
    todo: 'text-warning-fg bg-warning-soft',
    processing: 'text-info-fg bg-info-soft',
    done: 'text-success-fg bg-success-soft',
  }[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Card className="p-4">
        <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl', toneStyle)}>{icon}</span>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink tnum">{display}</p>
        <p className="text-sm font-medium text-muted">{label}</p>
      </Card>
    </motion.div>
  )
}

function StoreMini({ value, label, tone }: { value: number; label: string; tone: 'todo' | 'processing' | 'done' }) {
  const toneText = { todo: 'text-warning-fg', processing: 'text-info-fg', done: 'text-success-fg' }[tone]
  return (
    <div>
      <p className={cn('text-xl font-extrabold tnum', value > 0 ? toneText : 'text-subtle')}>{value}</p>
      <p className="text-[11px] font-medium text-muted">{label}</p>
    </div>
  )
}

function StoreBreakdown({ requests, currentStoreId }: {
  requests: ReturnType<typeof useApp>['requests']; currentStoreId: ReturnType<typeof useApp>['currentStoreId']
}) {
  // Count by the store responsible for fulfilling each request (依頼先).
  const rows = useMemo(() => {
    const order = STORES.filter((s) => s.id === currentStoreId).concat(STORES.filter((s) => s.id !== currentStoreId))
    return order.map((store) => {
      const mine = requests.filter((r) => r.toStoreId === store.id)
      return {
        store,
        isMine: store.id === currentStoreId,
        todo: mine.filter((r) => r.status === 'todo').length,
        processing: mine.filter((r) => r.status === 'processing').length,
        done: mine.filter((r) => r.status === 'done').length,
      }
    })
  }, [requests, currentStoreId])

  return (
    <section className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <Store className="h-[18px] w-[18px] text-accent" aria-hidden /> 店舗別の状況
        </h2>
        <p className="mt-0.5 text-sm text-muted">各店舗が対応する依頼（依頼先ごと）の件数です。</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map(({ store, isMine, todo, processing, done }, i) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.28 }}
          >
            <Card className={cn('p-4', isMine && 'ring-1 ring-primary/40')}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-ink">{store.name}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {isMine && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">自店</span>}
                  {store.isHead && !isMine && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-subtle">本店</span>}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <StoreMini value={todo} label="未処理" tone="todo" />
                <StoreMini value={processing} label="処理中" tone="processing" />
                <StoreMini value={done} label="完了" tone="done" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { requests, currentStoreId } = useApp()
  const counts = {
    todo: requests.filter((r) => r.status === 'todo').length,
    processing: requests.filter((r) => r.status === 'processing').length,
    done: requests.filter((r) => r.status === 'done').length,
  }
  const latest = [...requests].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Hero status */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {counts.todo > 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#d12b38] to-[#a01824] p-5 text-white shadow-lift">
            <Sparkles aria-hidden className="absolute -right-4 -top-4 h-28 w-28 text-white/10" />
            <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="text-[17px] font-bold leading-snug sm:text-lg">未処理の依頼が <span className="tnum">{counts.todo}</span> 件あります</p>
                <p className="mt-0.5 text-sm text-white/85">各店舗からの依頼を確認し、対応をお願いします。</p>
              </div>
              <Button
                onClick={() => onNavigate('list')}
                className="shrink-0 bg-white/15 text-white backdrop-blur hover:bg-white/25"
                size="sm"
              >
                一覧へ <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Card className="flex items-center gap-3 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success-fg"><CheckCircle2 className="h-6 w-6" /></span>
            <div>
              <p className="font-bold text-ink">未処理の依頼はありません</p>
              <p className="text-sm text-muted">すべての依頼に対応済みです。お疲れさまです。</p>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Stats */}
      <section aria-label="ステータス集計" className="grid grid-cols-3 gap-3">
        <StatTile index={0} tone="todo" label="未処理" value={counts.todo} icon={<Clock className="h-5 w-5" />} />
        <StatTile index={1} tone="processing" label="処理中" value={counts.processing} icon={<Loader2 className="h-5 w-5" />} />
        <StatTile index={2} tone="done" label="完了" value={counts.done} icon={<CheckCircle2 className="h-5 w-5" />} />
      </section>

      {/* Per-store breakdown */}
      <StoreBreakdown requests={requests} currentStoreId={currentStoreId} />

      {/* Latest */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">最新の依頼</h2>
          <button onClick={() => onNavigate('list')} className="focus-ring inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-sm font-semibold text-accent hover:underline">
            すべて見る <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {latest.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="依頼はまだありません"
            description="「新規依頼」から最初の依頼を作成しましょう。"
            action={<Button onClick={() => onNavigate('new')}>新規依頼を作成</Button>}
          />
        ) : (
          <div className="space-y-3">
            {latest.map((r, i) => <RequestCard key={r.id} req={r} index={i} />)}
          </div>
        )}
      </section>
    </div>
  )
}
