import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
import amplifyconfig from './amplifyconfiguration.json'
import { useState } from 'react'
import { signIn, signUp, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth'
import './index.css'
import './App.css'

// Importar componentes de páginas
import Dashboard from './pages/Dashboard'
import MyReservations from './pages/MyReservations'

Amplify.configure(amplifyconfig)

// Componente Login con funcionalidad real
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn({
        username: formData.email,
        password: formData.password
      })
      // Redirigir al dashboard después del login exitoso
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setError(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reserva de Salón
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800">
              Iniciar Sesión
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <a href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 cursor-pointer">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600 text-sm">¿No tienes una cuenta? </span>
              <a href="/register" className="text-orange-500 hover:text-orange-600 text-sm font-medium cursor-pointer">
                Regístrate
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Orange circle design */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-orange-100 to-orange-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Main orange circle */}
            <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shadow-2xl"></div>
            {/* Smaller accent circle */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-70"></div>
            {/* Bottom accent circle */}
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente Register con funcionalidad real
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signUp({
        username: formData.email,
        password: formData.password,
        attributes: {
          email: formData.email,
          name: formData.name
        }
      })
      setSuccess('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.')
      // Opcional: redirigir a página de verificación
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } catch (error) {
      console.error('Error al registrarse:', error)
      setError(error.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reserva de Salón
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800">
              Crear Cuenta
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                'Registrarse'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600 text-sm">¿Ya tienes una cuenta? </span>
              <a href="/login" className="text-orange-500 hover:text-orange-600 text-sm font-medium cursor-pointer">
                Inicia sesión
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Orange circle design */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-orange-100 to-orange-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Main orange circle */}
            <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shadow-2xl"></div>
            {/* Smaller accent circle */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-70"></div>
            {/* Bottom accent circle */}
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente ForgotPassword simplificado
const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos un código de recuperación.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Enviar Código
            </button>

            <div className="text-center">
              <a href="/login" className="text-orange-500 hover:text-orange-600 text-sm font-medium cursor-pointer">
                Volver al inicio de sesión
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Orange circle design */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-orange-100 to-orange-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Main orange circle */}
            <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shadow-2xl"></div>
            {/* Smaller accent circle */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-70"></div>
            {/* Bottom accent circle */}
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  )
}



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reservations" element={<MyReservations />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App

