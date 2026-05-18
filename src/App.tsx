import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { FamilyOfficeList } from '@/pages/FamilyOfficeList'
import { Loader2 } from 'lucide-react'

// Eagerly loaded: FamilyOfficeList is the default landing — no lazy for it.
// Everything else is split into separate chunks.
const FamilyOfficeDetail = lazy(() =>
  import('@/pages/FamilyOfficeDetail').then((m) => ({ default: m.FamilyOfficeDetail }))
)
const FundList = lazy(() =>
  import('@/pages/FundList').then((m) => ({ default: m.FundList }))
)
const FundDetail = lazy(() =>
  import('@/pages/FundDetail').then((m) => ({ default: m.FundDetail }))
)
const Tasks = lazy(() =>
  import('@/pages/Tasks').then((m) => ({ default: m.Tasks }))
)
const Settings = lazy(() =>
  import('@/pages/Settings').then((m) => ({ default: m.Settings }))
)

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<FamilyOfficeList />} />
            <Route path="/fo/:id" element={<FamilyOfficeDetail />} />
            <Route path="/funds" element={<FundList />} />
            <Route path="/funds/:id" element={<FundDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  )
}

export default App
