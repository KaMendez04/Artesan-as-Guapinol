import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import AppLayout from '@/shared/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import CatalogPage from '@/features/catalog/pages/CatalogPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ventas" element={<div className="p-4">Ventas Page (Coming Soon)</div>} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
