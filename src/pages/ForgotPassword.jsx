import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ForgotPassword = () => {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!email) {
      setError('Por favor ingresa tu email')
      setLoading(false)
      return
    }

    try {
      const result = await forgotPassword(email)
      
      if (result.success) {
        setMessage(result.message)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error inesperado. Por favor, intenta nuevamente.')
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
              Recuperar Contraseña
            </h2>
            <p className="text-gray-600 mt-2">
              Ingresa tu email y te enviaremos un código para restablecer tu contraseña.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                  setMessage('')
                }}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                {message}
                <div className="mt-2">
                  <Link
                    to="/reset-password"
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Ir a restablecer contraseña →
                  </Link>
                </div>
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
                'Enviar Código'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-orange-500 hover:text-orange-600 text-sm font-medium cursor-pointer"
              >
                ← Volver al login
              </Link>
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

export default ForgotPassword