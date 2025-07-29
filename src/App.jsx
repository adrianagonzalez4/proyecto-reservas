import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
import amplifyconfig from './amplifyconfiguration.json'
import './index.css'
import './App.css'

// Importar componentes
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Importar páginas
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import MyReservations from './pages/MyReservations'

Amplify.configure(amplifyconfig)

// App principal con sistema de autenticación



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/reservations" element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          } />
          
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

