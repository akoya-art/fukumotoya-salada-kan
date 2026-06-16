import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from '@/lib/store'
import { Layout, type Page } from '@/components/Layout'
import { Toaster } from '@/components/overlays'
import { Login } from '@/screens/Login'
import { Home } from '@/screens/Home'
import { NewRequest } from '@/screens/NewRequest'
import { RequestList } from '@/screens/RequestList'
import { Employees } from '@/screens/Employees'

function Shell() {
  const { currentStoreId } = useApp()
  const [page, setPage] = useState<Page>('home')

  if (!currentStoreId) return (<><Login /><Toaster /></>)

  return (
    <>
      <Layout page={page} onNavigate={setPage}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {page === 'home' && <Home onNavigate={setPage} />}
            {page === 'new' && <NewRequest onNavigate={setPage} />}
            {page === 'list' && <RequestList onNavigate={setPage} />}
            {page === 'employees' && <Employees />}
          </motion.div>
        </AnimatePresence>
      </Layout>
      <Toaster />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
