import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { FamilyOfficeList } from '@/pages/FamilyOfficeList'
import { FamilyOfficeDetail } from '@/pages/FamilyOfficeDetail'
import { Settings } from '@/pages/Settings'
import { FundList } from '@/pages/FundList'
import { FundDetail } from '@/pages/FundDetail'

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<FamilyOfficeList />} />
          <Route path="/fo/:id" element={<FamilyOfficeDetail />} />
          <Route path="/funds" element={<FundList />} />
          <Route path="/funds/:id" element={<FundDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
