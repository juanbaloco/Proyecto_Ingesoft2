// src/main.jsx
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
import { FormularioCDT } from './components/FormularioCDT.jsx'
import { DetalleCDT } from './components/DetalleCDT.jsx'
import { EditarCDT } from './components/editarCDT.jsx' // <-- agregar

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cdt/nuevo"
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
            path="/cdt/:id/editar"
            element={
              <ProtectedRoute>
                <EditarCDT />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </Provider>
)
