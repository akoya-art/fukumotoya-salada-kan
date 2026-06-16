import type { Store, Employee, RequestItem, AppNotification, PersistedState } from '@/types'

export const STORES: Store[] = [
  { id: 'yakage', name: '矢掛本店', isHead: true },
  { id: 'kurashiki', name: '倉敷店' },
  { id: 'soja', name: '総社店' },
  { id: 'ibara', name: '井原店' },
]

export const HEAD_STORE_ID = 'yakage'

const HOUR = 1000 * 60 * 60

// `now` is injected so the build stays deterministic and seed times are relative.
export function buildSeed(now: number): PersistedState {
  const employees: Employee[] = [
    { id: 'e1', name: '田中 一郎', storeId: 'yakage' },
    { id: 'e2', name: '佐藤 花子', storeId: 'yakage' },
    { id: 'e3', name: '渡辺 さやか', storeId: 'ibara' },
    { id: 'e4', name: '鈴木 健太', storeId: 'kurashiki' },
    { id: 'e5', name: '高橋 美咲', storeId: 'kurashiki' },
    { id: 'e6', name: '伊藤 大輔', storeId: 'soja' },
  ]

  const requests: RequestItem[] = [
    {
      id: 'r1', type: 'transfer', status: 'todo',
      itemName: 'シーザーサラダ用ドレッシング', itemCode: 'DRS-1024', colorCode: '',
      quantity: 12, dueDate: '2026-06-17',
      fromStoreId: 'kurashiki', toStoreId: 'soja',
      requesterName: '鈴木 健太', note: '週末フェア分。午前着希望。',
      createdAt: now - 3 * HOUR,
    },
    {
      id: 'r2', type: 'external', status: 'todo',
      itemName: '保冷ボックス（中）', itemCode: 'BOX-M-08', colorCode: 'WH-01',
      quantity: 5, dueDate: '2026-06-20',
      fromStoreId: 'ibara', toStoreId: 'yakage',
      requesterName: '渡辺 さやか', note: '配送用に追加で必要。',
      createdAt: now - 6 * HOUR,
    },
    {
      id: 'r3', type: 'transfer', status: 'processing',
      itemName: 'サラダ容器 角型', itemCode: 'CUP-SQ-300', colorCode: 'CL-透明',
      quantity: 200, dueDate: '2026-06-16',
      fromStoreId: 'soja', toStoreId: 'kurashiki',
      requesterName: '伊藤 大輔', handlerName: '高橋 美咲', note: '在庫薄のため至急。',
      createdAt: now - 26 * HOUR,
    },
    {
      id: 'r4', type: 'external', status: 'processing',
      itemName: 'ロゴ入り紙袋 L', itemCode: 'BAG-L-RED', colorCode: 'RD-赤',
      quantity: 500, dueDate: '2026-06-22',
      fromStoreId: 'kurashiki', toStoreId: 'yakage',
      requesterName: '高橋 美咲', handlerName: '田中 一郎',
      createdAt: now - 30 * HOUR,
    },
    {
      id: 'r5', type: 'transfer', status: 'done',
      itemName: 'カット野菜ミックス', itemCode: 'VEG-MIX-500', colorCode: '',
      quantity: 30, dueDate: '2026-06-14',
      fromStoreId: 'ibara', toStoreId: 'soja',
      requesterName: '渡辺 さやか', handlerName: '伊藤 大輔', note: '受け渡し完了。',
      createdAt: now - 50 * HOUR,
    },
    {
      id: 'r6', type: 'external', status: 'done',
      itemName: '割り箸（業務用）', itemCode: 'CHO-2000', colorCode: '',
      quantity: 10, dueDate: '2026-06-12',
      fromStoreId: 'soja', toStoreId: 'yakage',
      requesterName: '伊藤 大輔', handlerName: '佐藤 花子', note: '納品済み。',
      createdAt: now - 74 * HOUR,
    },
  ]

  const notifications: AppNotification[] = [
    { id: 'n1', message: '倉敷店から在庫移動依頼が届きました（シーザーサラダ用ドレッシング）', createdAt: now - 3 * HOUR, read: false },
    { id: 'n2', message: '井原店から外部注文依頼が届きました（保冷ボックス（中））', createdAt: now - 6 * HOUR, read: false },
  ]

  return { employees, requests, notifications }
}
