import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider.jsx'
import { Login } from './components/login.jsx'
import { Registro } from './components/registro.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AdminRoute } from './components/AdminRoute.jsx'
import { FormularioCDT } from './components/FormularioCDT.jsx'
import { DetalleCDT } from './components/DetalleCDT.jsx'
import { EditarCDT } from './components/editarCDT.jsx'
import { AdminDashboard } from './components/AdminDashboard.jsx'
import { AdminDetalleCDT } from './components/AdminDetalleCDT.jsx'
import { AdminEditarCDT } from './components/AdminEditarCDT.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Cliente */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crear-cdt"
            element={
              <ProtectedRoute>
                <FormularioCDT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cdt/:id"
            element={
              <ProtectedRoute>
                <DetalleCDT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editar/:id"
            element={
              <ProtectedRoute>
                <EditarCDT />
              </ProtectedRoute>
            }
          />

          {/* Admin - RUTAS CORREGIDAS CON userId Y solicitudId */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/detalle/:userId/:solicitudId"
            element={
              <AdminRoute>
                <AdminDetalleCDT />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/editar/:userId/:solicitudId"
            element={
              <AdminRoute>
                <AdminEditarCDT />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </Provider>
)