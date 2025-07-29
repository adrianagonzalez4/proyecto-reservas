import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        // LOGIN REAL
        console.log('🔐 Intentando login con:', formData.email)
        const result = await login(formData.email, formData.password)
        
        if (result.success) {
          console.log('✅ Login exitoso!')
          setSuccess('¡Login exitoso! Redirigiendo...')
          setTimeout(() => {
            navigate('/') // Redirigir al dashboard
          }, 1000)
        } else {
          setError(result.message || 'Error en el login')
        }
      } else {
        // REGISTRO REAL
        console.log('📝 Intentando registro con:', formData.email)
        const result = await register(formData.email, formData.password, formData.name)
        
        if (result.success) {
          setSuccess('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.')
          setFormData({ email: '', password: '', name: '' })
        } else {
          setError(result.message || 'Error en el registro')
        }
      }
    } catch (error) {
      console.error('Error en autenticación:', error)
      setError(error.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
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
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                placeholder="Ingresa tu correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-orange-500 hover:text-orange-600 cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

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
                isLogin ? 'Iniciar Sesión' : 'Registrarse'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600 text-sm">
                {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setFormData({ email: '', password: '', name: '' })
                }}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium cursor-pointer"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
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

export default Login
