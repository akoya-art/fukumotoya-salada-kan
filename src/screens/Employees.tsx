import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, UserPlus } from 'lucide-react'
import { useApp } from '@/lib/store'
import { STORES } from '@/data/seed'
import type { Employee, StoreId } from '@/types'
import { Avatar, Button, Card, IconButton, Input } from '@/components/ui'
import { ConfirmDialog } from '@/components/overlays'
import { cn } from '@/lib/utils'

export function Employees() {
  const { currentStoreId, employees, addEmployee, deleteEmployee, toast } = useApp()
  const myStore = currentStoreId as StoreId
  const [name, setName] = useState('')
  const [pending, setPending] = useState<Employee | null>(null)

  const grouped = useMemo(() => {
    // own store first
    const order = [myStore, ...STORES.map((s) => s.id).filter((id) => id !== myStore)]
    return order.map((id) => ({
      store: STORES.find((s) => s.id === id)!,
      isMine: id === myStore,
      members: employees.filter((e) => e.storeId === id),
    }))
  }, [employees, myStore])

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addEmployee(trimmed, myStore)
    toast(`${trimmed} さんを追加しました`, 'success')
    setName('')
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">追加した従業員は、新規依頼の「依頼者」「処理担当者」で選べます。</p>

      {/* Add (own store only) */}
      <Card className="p-4 sm:p-5">
        <label htmlFor="emp-name" className="mb-2 block text-sm font-semibold text-ink">
          {STORES.find((s) => s.id === myStore)?.name} に従業員を追加
        </label>
        <form onSubmit={submitAdd} className="flex gap-2.5">
          <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：山田 太郎" />
          <Button type="submit" disabled={!name.trim()} className="shrink-0"><Plus className="h-4 w-4" /> 追加</Button>
        </form>
      </Card>

      {/* Groups */}
      <div className="space-y-5">
        {grouped.map(({ store, isMine, members }) => (
          <section key={store.id}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <h2 className="text-sm font-bold text-ink">{store.name}</h2>
              {isMine && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">自店</span>}
              {store.isHead && !isMine && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-subtle">本店</span>}
              <span className="text-xs text-subtle tnum">{members.length}名</span>
            </div>

            {members.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-4 text-sm text-subtle">従業員がいません</p>
            ) : (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {members.map((emp) => (
                    <motion.li
                      key={emp.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
                    >
                      <div className={cn(
                        'flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3',
                        !isMine && 'opacity-95',
                      )}>
                        <Avatar name={emp.name} />
                        <span className="flex-1 font-semibold text-ink">{emp.name}</span>
                        {isMine ? (
                          <IconButton label={`${emp.name} を削除`} onClick={() => setPending(emp)} className="hover:bg-primary-soft hover:text-accent">
                            <Trash2 className="h-[18px] w-[18px]" />
                          </IconButton>
                        ) : (
                          <span className="pr-1 text-xs text-subtle">他店</span>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        ))}
      </div>

      {grouped.every((g) => g.members.length === 0) && (
        <div className="flex flex-col items-center py-8 text-center text-subtle">
          <UserPlus className="mb-2 h-8 w-8" />
          <p className="text-sm">まだ従業員が登録されていません</p>
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) { deleteEmployee(pending.id); toast(`${pending.name} さんを削除しました`, 'info') }
        }}
        title="従業員を削除しますか？"
        message={pending ? `「${pending.name}」を従業員一覧から削除します。この操作は取り消せません。なお、過去の依頼に記録された担当者名はそのまま残ります。` : ''}
        confirmLabel="削除する"
      />
    </div>
  )
}
