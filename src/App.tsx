import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import { Toaster } from 'sileo'
import AppLayout from '@/shared/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import CatalogPage from '@/features/catalog/pages/CatalogPage'
import PublicCatalogPage from '@/features/catalog/pages/PublicCatalogPage'
import CategoryProductsPage from '@/features/catalog/pages/CategoryProductsPage'
import SalesPage from './features/sales/pages/SalesPage'
import SaleDetailPage from './features/sales/pages/SaleDetailPage'

function App() {

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        import SaleDetailPage from "./features/sales/pages/SaleDetailPage"

      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="ventas" element={<SalesPage />} />
        <Route path="ventas/:idSale" element={<SaleDetailPage />} />  {/* ✅ AQUI */}
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="catalogo/:id/productos" element={<CategoryProductsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

        {/* Public Routes */}
        <Route path="/v/:token" element={<PublicCatalogPage />} />
        <Route path="/v/:token/:id" element={<PublicCatalogPage />} />
      </Routes>
    </Router>
  )
}

export default App
