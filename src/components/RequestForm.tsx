import { useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Package, Send, Truck } from 'lucide-react'
import { useApp } from '@/lib/store'
import { HEAD_STORE_ID, STORES } from '@/data/seed'
import type { RequestItem, RequestType, StoreId } from '@/types'
import { Button, Field, Input, Select, Textarea } from '@/components/ui'
import { cn, storeName } from '@/lib/utils'

/** The cleaned, validated values produced on submit. */
export type RequestFormValues = Pick<
  RequestItem,
  'type' | 'itemName' | 'itemCode' | 'colorCode' | 'quantity' | 'dueDate' | 'toStoreId' | 'requesterName' | 'handlerName' | 'note'
>

type Errors = Partial<Record<'requester' | 'toStore' | 'itemName' | 'itemCode' | 'quantity' | 'dueDate', string>>

interface RequestFormProps {
  /** Origin store of the request. Fixed (cannot be edited). */
  fromStoreId: StoreId
  /** Existing request when editing; omit when creating. */
  initial?: RequestItem
  submitLabel?: string
  submitIcon?: ReactNode
  /** When true the footer floats as a sticky action bar (full-screen create). */
  sticky?: boolean
  onSubmit: (values: RequestFormValues) => void
  onCancel: () => void
}

export function RequestForm({
  fromStoreId, initial, submitLabel = '依頼を送信', submitIcon = <Send className="h-4 w-4" />, sticky = false, onSubmit, onCancel,
}: RequestFormProps) {
  const { employees } = useApp()

  const [type, setType] = useState<RequestType>(initial?.type ?? 'transfer')
  const [requester, setRequester] = useState(initial?.requesterName ?? '')
  const [toStore, setToStore] = useState<StoreId | ''>(initial?.type === 'transfer' ? initial.toStoreId : '')
  const [handler, setHandler] = useState(initial?.handlerName ?? '')
  const [itemName, setItemName] = useState(initial?.itemName ?? '')
  const [itemCode, setItemCode] = useState(initial?.itemCode ?? '')
  const [colorCode, setColorCode] = useState(initial?.colorCode ?? '')
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : '')
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState<Errors>({})

  const refs = {
    requester: useRef<HTMLSelectElement>(null),
    toStore: useRef<HTMLSelectElement>(null),
    itemName: useRef<HTMLInputElement>(null),
    itemCode: useRef<HTMLInputElement>(null),
    quantity: useRef<HTMLInputElement>(null),
    dueDate: useRef<HTMLInputElement>(null),
  }

  // Requester = employees of the *requesting* store only.
  const requesterOptions = useMemo(() => {
    const list = employees.filter((e) => e.storeId === fromStoreId).map((e) => e.name)
    // Keep the saved requester selectable even if that employee was later removed.
    if (requester && !list.includes(requester)) return [requester, ...list]
    return list
  }, [employees, fromStoreId, requester])

  // Destination: external order always goes to head; transfer goes to any other store.
  const destStoreId: StoreId | '' = type === 'external' ? HEAD_STORE_ID : toStore
  const transferTargets = useMemo(() => STORES.filter((s) => s.id !== fromStoreId), [fromStoreId])
  // Handler = employees of the destination store (those who fulfill it).
  const handlerOptions = useMemo(() => {
    const list = destStoreId ? employees.filter((e) => e.storeId === destStoreId).map((e) => e.name) : []
    if (handler && !list.includes(handler)) return [handler, ...list]
    return list
  }, [employees, destStoreId, handler])

  const validate = (): Errors => {
    const e: Errors = {}
    if (!requester) e.requester = '依頼者を選択してください'
    if (type === 'transfer' && !toStore) e.toStore = '依頼先店舗を選択してください'
    if (!itemName.trim()) e.itemName = '品名を入力してください'
    if (!itemCode.trim()) e.itemCode = '品番を入力してください'
    if (!quantity.trim()) e.quantity = '数量を入力してください'
    else if (Number(quantity) <= 0 || !Number.isFinite(Number(quantity))) e.quantity = '1以上の数量を入力してください'
    if (!dueDate) e.dueDate = '必着日を選択してください'
    return e
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    const firstKey = (['requester', 'toStore', 'itemName', 'itemCode', 'quantity', 'dueDate'] as const).find((k) => e[k])
    if (firstKey) { refs[firstKey].current?.focus(); return }

    onSubmit({
      type,
      itemName: itemName.trim(),
      itemCode: itemCode.trim(),
      colorCode: colorCode.trim() || undefined,
      quantity: Number(quantity),
      dueDate,
      toStoreId: destStoreId as StoreId,
      requesterName: requester,
      handlerName: handler || undefined,
      note: note.trim() || undefined,
    })
  }

  const errorCount = Object.keys(errors).length

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-muted">必要事項を入力してください（<span className="font-semibold text-accent">*</span> は必須）</p>

      {/* Type selector */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">依頼種別 <span className="text-accent">*</span></legend>
        <div className="grid grid-cols-2 gap-2.5">
          {([
            { id: 'transfer', label: '店舗間在庫移動', desc: '他店舗へ在庫を移す', icon: Truck },
            { id: 'external', label: '外部注文依頼', desc: '本店へ発注を依頼', icon: Package },
          ] as const).map(({ id, label, desc, icon: Icon }) => {
            const active = type === id
            return (
              <button
                key={id} type="button"
                onClick={() => { setType(id); setHandler('') }}
                aria-pressed={active}
                className={cn(
                  'focus-ring relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all',
                  active ? 'border-primary bg-primary-soft ring-1 ring-primary/30' : 'border-line bg-surface hover:bg-surface-2',
                )}
              >
                <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  active ? 'bg-primary text-primary-fg' : 'bg-surface-2 text-subtle')}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{label}</span>
                  <span className="block text-xs text-muted">{desc}</span>
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
        <Field label="依頼元店舗">
          <div className="flex h-11 items-center rounded-xl bg-surface-2 px-3.5 text-[15px] font-semibold text-ink">
            {storeName(fromStoreId)}
          </div>
        </Field>

        <Field label="依頼者" required error={errors.requester} htmlFor="f-requester">
          <Select id="f-requester" ref={refs.requester} value={requester} invalid={!!errors.requester}
            onChange={(e) => { setRequester(e.target.value); setErrors((p) => ({ ...p, requester: undefined })) }}>
            <option value="">選択してください</option>
            {requesterOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
        </Field>

        {type === 'transfer' ? (
          <Field label="依頼先店舗" required error={errors.toStore} htmlFor="f-tostore">
            <Select id="f-tostore" ref={refs.toStore} value={toStore} invalid={!!errors.toStore}
              onChange={(e) => { setToStore(e.target.value as StoreId); setHandler(''); setErrors((p) => ({ ...p, toStore: undefined })) }}>
              <option value="">選択してください</option>
              {transferTargets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
        ) : (
          <Field label="依頼先店舗" hint="外部注文依頼は本店（矢掛本店）が受け付けます">
            <div className="flex h-11 items-center rounded-xl bg-surface-2 px-3.5 text-[15px] font-semibold text-ink">
              {storeName(HEAD_STORE_ID)}
            </div>
          </Field>
        )}

        <Field label="処理担当者" hint={destStoreId ? '依頼先店舗の従業員から選べます（任意）' : '先に依頼先店舗を選択してください'} htmlFor="f-handler">
          <Select id="f-handler" value={handler} disabled={!destStoreId} onChange={(e) => setHandler(e.target.value)}>
            <option value="">未定（後で割り当て）</option>
            {handlerOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
        </Field>

        <Field label="品名" required error={errors.itemName} htmlFor="f-itemname">
          <Input id="f-itemname" ref={refs.itemName} value={itemName} invalid={!!errors.itemName}
            placeholder="例：シーザーサラダ用ドレッシング"
            onChange={(e) => { setItemName(e.target.value); setErrors((p) => ({ ...p, itemName: undefined })) }} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="品番" required error={errors.itemCode} htmlFor="f-itemcode">
            <Input id="f-itemcode" ref={refs.itemCode} value={itemCode} invalid={!!errors.itemCode} placeholder="例：DRS-1024"
              onChange={(e) => { setItemCode(e.target.value); setErrors((p) => ({ ...p, itemCode: undefined })) }} />
          </Field>
          <Field label="色番" htmlFor="f-color">
            <Input id="f-color" value={colorCode} placeholder="例：RD-赤（任意）" onChange={(e) => setColorCode(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="数量" required error={errors.quantity} htmlFor="f-qty">
            <Input id="f-qty" ref={refs.quantity} value={quantity} invalid={!!errors.quantity} type="number" inputMode="numeric" min={1} placeholder="例：12"
              onChange={(e) => { setQuantity(e.target.value); setErrors((p) => ({ ...p, quantity: undefined })) }} />
          </Field>
          <Field label="必着日" required error={errors.dueDate} htmlFor="f-due">
            <Input id="f-due" ref={refs.dueDate} value={dueDate} invalid={!!errors.dueDate} type="date"
              onChange={(e) => { setDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: undefined })) }} />
          </Field>
        </div>

        <Field label="備考" htmlFor="f-note">
          <Textarea id="f-note" value={note} placeholder="納品時間の希望、用途など（任意）" onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>

      {/* aria-live error summary */}
      <div aria-live="polite" className="sr-only">{errorCount > 0 ? `${errorCount}件の入力エラーがあります` : ''}</div>

      <motion.div
        layout
        className={cn(
          'flex gap-2.5',
          sticky && 'sticky bottom-20 z-10 rounded-2xl border border-line bg-surface/90 p-2.5 shadow-lift backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none',
        )}
      >
        <Button type="button" variant="secondary" block size="lg" onClick={onCancel}>キャンセル</Button>
        <Button type="submit" block size="lg">{submitIcon} {submitLabel}</Button>
      </motion.div>
    </form>
  )
}
