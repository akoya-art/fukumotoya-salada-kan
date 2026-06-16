import { useApp } from '@/lib/store'
import type { Page } from '@/components/Layout'
import type { StoreId } from '@/types'
import { RequestForm } from '@/components/RequestForm'

export function NewRequest({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { currentStoreId, addRequest, toast } = useApp()
  const fromStoreId = currentStoreId as StoreId

  return (
    <RequestForm
      fromStoreId={fromStoreId}
      sticky
      submitLabel="依頼を送信"
      onCancel={() => onNavigate('home')}
      onSubmit={(values) => {
        addRequest({ ...values, fromStoreId })
        toast('依頼を送信しました', 'success')
        onNavigate('list')
      }}
    />
  )
}
