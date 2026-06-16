import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Store } from 'lucide-react'
import { STORES } from '@/data/seed'
import type { StoreId } from '@/types'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export function Login() {
  const { login } = useApp()
  const [selected, setSelected] = useState<StoreId | null>(null)

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-bg px-4 py-10">
      {/* ambient brand glow */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-transfer/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-black/5"
          >
            <img src="/logo.png" alt="福本屋サラダ館 ロゴ" className="h-full w-full object-contain p-1" />
          </motion.span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">福本屋サラダ館</h1>
          <p className="mt-1 text-sm text-muted">店舗間在庫移動・外部注文依頼の管理</p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <p className="mb-3 text-sm font-semibold text-ink">ログインする店舗を選択</p>
          <div className="space-y-2.5" role="radiogroup" aria-label="ログインする店舗">
            {STORES.map((store, i) => {
              const active = selected === store.id
              return (
                <motion.button
                  key={store.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(store.id)}
                  onDoubleClick={() => login(store.id)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className={cn(
                    'focus-ring group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all',
                    active
                      ? 'border-primary bg-primary-soft ring-1 ring-primary/30'
                      : 'border-line bg-surface hover:border-subtle/50 hover:bg-surface-2',
                  )}
                >
                  <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                    active ? 'bg-primary text-primary-fg' : 'bg-surface-2 text-subtle group-hover:text-muted')}>
                    <Store className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-ink">{store.name}</span>
                      {store.isHead && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">本店</span>}
                    </span>
                  </span>
                  <ChevronRight className={cn('h-5 w-5 transition-transform', active ? 'translate-x-0.5 text-accent' : 'text-subtle')} />
                </motion.button>
              )
            })}
          </div>

          <Button
            block size="lg"
            className="mt-5"
            disabled={!selected}
            onClick={() => selected && login(selected)}
          >
            ログイン
          </Button>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted">
          ※ プロトタイプ版です。データはこの端末内（localStorage）に保存されます。
        </p>
        <p className="mt-2 text-center text-xs">
          <a
            href="/manual.html"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded font-semibold text-accent hover:underline"
          >
            使い方マニュアルを見る
          </a>
        </p>
      </motion.div>
    </main>
  )
}
