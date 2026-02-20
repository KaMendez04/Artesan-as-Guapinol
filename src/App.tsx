import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import AppLayout from '@/shared/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Placeholders for other routes */}
          <Route path="ventas" element={<div className="p-4">Ventas Page (Coming Soon)</div>} />
          <Route path="catalogo" element={<div className="p-4">Catalogo Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
