import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell, CheckCheck, Home, ListChecks, LogOut, Moon, PlusCircle, Salad, Sun, Users,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { STORES } from '@/data/seed'
import { cn, relativeTime } from '@/lib/utils'
import { IconButton } from '@/components/ui'

export type Page = 'home' | 'new' | 'list' | 'employees'

const NAV: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'ホーム', icon: Home },
  { id: 'new', label: '新規依頼', icon: PlusCircle },
  { id: 'list', label: '依頼一覧', icon: ListChecks },
  { id: 'employees', label: '従業員', icon: Users },
]

const PAGE_TITLE: Record<Page, string> = {
  home: 'ホーム', new: '新規依頼の作成', list: '依頼一覧', employees: '従業員管理',
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#e8434e] to-[#c01f2c] text-white shadow-sm">
        <Salad className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="text-[15px] font-extrabold tracking-tight text-ink">福本屋サラダ館</span>
      )}
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  return (
    <IconButton label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'} onClick={toggleTheme}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </IconButton>
  )
}

function NotificationBell() {
  const { notifications, markAllNotificationsRead, now } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <IconButton label={`通知${unread ? `（未読${unread}件）` : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg tnum">
            {unread}
          </span>
        )}
      </IconButton>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-bold text-ink"><Bell className="h-4 w-4 text-accent" />通知</span>
              {unread > 0 && (
                <button onClick={markAllNotificationsRead} className="focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-accent hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" />すべて既読
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && <li className="px-4 py-8 text-center text-sm text-subtle">通知はありません</li>}
              {notifications.map((n) => (
                <li key={n.id} className={cn('flex gap-2.5 border-b border-line px-4 py-3 last:border-0', !n.read && 'bg-primary-soft/40')}>
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-ink">{n.message}</p>
                    <p className="mt-0.5 text-xs text-subtle">{relativeTime(n.createdAt, now)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StoreTag({ id }: { id: typeof STORES[number]['id'] }) {
  const store = STORES.find((s) => s.id === id)
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="font-semibold text-ink">{store?.name}</span>
      {store?.isHead && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">本店</span>}
    </span>
  )
}

export function Layout({ page, onNavigate, children }: { page: Page; onNavigate: (p: Page) => void; children: ReactNode }) {
  const { currentStoreId, logout } = useApp()

  return (
    <div className="min-h-dvh bg-bg">
      <a href="#main" className="skip-link">本文へスキップ</a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/80 px-4 py-5 backdrop-blur lg:flex print:!hidden">
        <div className="px-2"><Brand /></div>
        <nav className="mt-7 flex flex-1 flex-col gap-1" aria-label="メインナビゲーション">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'focus-ring relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  active ? 'text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink',
                )}
              >
                {active && (
                  <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-xl bg-primary-soft"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <Icon className="h-[18px] w-[18px]" />{label}
              </button>
            )
          })}
        </nav>
        <div className="space-y-3 border-t border-line pt-4">
          {currentStoreId && (
            <div className="rounded-xl bg-surface-2 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">ログイン中の店舗</p>
              <div className="mt-0.5"><StoreTag id={currentStoreId} /></div>
            </div>
          )}
          <button onClick={logout} className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink">
            <LogOut className="h-[18px] w-[18px]" />店舗を切り替える
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64 print:!pl-0">
        <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-lg print:hidden">
          <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden"><Brand compact /></div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-ink sm:text-lg">{PAGE_TITLE[page]}</h1>
                {currentStoreId && <div className="lg:hidden"><StoreTag id={currentStoreId} /></div>}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <ThemeToggle />
              <NotificationBell />
              <IconButton label="店舗を切り替える" onClick={logout} className="lg:hidden"><LogOut className="h-5 w-5" /></IconButton>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12 print:max-w-none print:px-0 print:pb-0 print:pt-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur-lg lg:hidden print:hidden" aria-label="メインナビゲーション" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={cn('focus-ring relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                  active ? 'text-accent' : 'text-subtle')}
              >
                {active && (
                  <motion.span layoutId="nav-active-m" className="absolute -top-px h-0.5 w-8 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <Icon className={cn('h-5 w-5', active && 'scale-110 transition-transform')} />{label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
