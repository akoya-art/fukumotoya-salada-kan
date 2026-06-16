export type StoreId = 'yakage' | 'kurashiki' | 'soja' | 'ibara'

export interface Store {
  id: StoreId
  name: string
  isHead?: boolean
}

export interface Employee {
  id: string
  name: string
  storeId: StoreId
}

export type RequestType = 'transfer' | 'external'
export type RequestStatus = 'todo' | 'processing' | 'done'

export interface RequestItem {
  id: string
  type: RequestType
  status: RequestStatus
  itemName: string
  itemCode: string
  colorCode?: string
  quantity: number
  dueDate: string // ISO yyyy-mm-dd
  fromStoreId: StoreId
  toStoreId: StoreId
  requesterName: string
  handlerName?: string
  note?: string
  createdAt: number
}

export interface AppNotification {
  id: string
  message: string
  createdAt: number
  read: boolean
}

export interface PersistedState {
  employees: Employee[]
  requests: RequestItem[]
  notifications: AppNotification[]
}
