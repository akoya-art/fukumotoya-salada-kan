import {
  createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode,
} from 'react'
import type {
  AppNotification, Employee, PersistedState, RequestItem, RequestStatus, StoreId,
} from '@/types'
import { buildSeed } from '@/data/seed'
import { uid } from '@/lib/utils'

const STATE_KEY = 'fsk.state.v2'
const SESSION_KEY = 'fsk.session.v2'
const THEME_KEY = 'fsk.theme'

type Theme = 'light' | 'dark'
export type Toast = { id: string; message: string; tone: 'success' | 'info' | 'error' }

function loadState(now: number): PersistedState {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) return JSON.parse(raw) as PersistedState
  } catch { /* ignore */ }
  return buildSeed(now)
}

interface AppContextValue {
  // session
  currentStoreId: StoreId | null
  login: (id: StoreId) => void
  logout: () => void
  // data
  employees: Employee[]
  requests: RequestItem[]
  notifications: AppNotification[]
  now: number
  // actions
  addRequest: (r: Omit<RequestItem, 'id' | 'createdAt' | 'status'>) => void
  updateRequest: (id: string, patch: Partial<Omit<RequestItem, 'id' | 'createdAt'>>) => void
  deleteRequest: (id: string) => void
  setRequestStatus: (id: string, status: RequestStatus) => void
  addEmployee: (name: string, storeId: StoreId) => void
  deleteEmployee: (id: string) => void
  markAllNotificationsRead: () => void
  // theme
  theme: Theme
  toggleTheme: () => void
  // toasts
  toasts: Toast[]
  toast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  // A single fixed timestamp per app load keeps relative times stable.
  const [now] = useState(() => Date.now())

  const [state, setState] = useState<PersistedState>(() => loadState(now))
  const [currentStoreId, setCurrentStoreId] = useState<StoreId | null>(() => {
    try { return (localStorage.getItem(SESSION_KEY) as StoreId | null) ?? null } catch { return null }
  })
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const [toasts, setToasts] = useState<Toast[]>([])

  // persist data
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  // persist + apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
  }, [theme])

  const login = useCallback((id: StoreId) => {
    setCurrentStoreId(id)
    try { localStorage.setItem(SESSION_KEY, id) } catch { /* ignore */ }
  }, [])

  const logout = useCallback(() => {
    setCurrentStoreId(null)
    try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }, [])

  const toast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = uid('t')
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addRequest = useCallback<AppContextValue['addRequest']>((r) => {
    setState((s) => ({
      ...s,
      requests: [{ ...r, id: uid('r'), createdAt: now, status: 'todo' }, ...s.requests],
    }))
  }, [now])

  const updateRequest = useCallback<AppContextValue['updateRequest']>((id, patch) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  }, [])

  const deleteRequest = useCallback((id: string) => {
    setState((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) }))
  }, [])

  const setRequestStatus = useCallback((id: string, status: RequestStatus) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)),
    }))
  }, [])

  const addEmployee = useCallback((name: string, storeId: StoreId) => {
    setState((s) => ({
      ...s,
      employees: [...s.employees, { id: uid('e'), name: name.trim(), storeId }],
    }))
  }, [])

  const deleteEmployee = useCallback((id: string) => {
    setState((s) => ({ ...s, employees: s.employees.filter((e) => e.id !== id) }))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }))
  }, [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const value = useMemo<AppContextValue>(() => ({
    currentStoreId, login, logout,
    employees: state.employees, requests: state.requests, notifications: state.notifications, now,
    addRequest, updateRequest, deleteRequest, setRequestStatus, addEmployee, deleteEmployee, markAllNotificationsRead,
    theme, toggleTheme,
    toasts, toast, dismissToast,
  }), [
    currentStoreId, login, logout, state, now,
    addRequest, updateRequest, deleteRequest, setRequestStatus, addEmployee, deleteEmployee, markAllNotificationsRead,
    theme, toggleTheme, toasts, toast, dismissToast,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
