import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { FamilyOfficeList } from '@/pages/FamilyOfficeList'
import { FamilyOfficeDetail } from '@/pages/FamilyOfficeDetail'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<FamilyOfficeList />} />
          <Route path="/fo/:id" element={<FamilyOfficeDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
