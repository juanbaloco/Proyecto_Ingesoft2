import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Registro } from './components/registro.jsx'
import { Login } from './components/login.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { AuthProvider } from './components/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </Provider>
)
