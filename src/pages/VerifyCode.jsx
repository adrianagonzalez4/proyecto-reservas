import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const VerifyCode = () => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!code || code.length !== 6) {
      setError('Por favor ingresa un código válido de 6 dígitos')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3005/api/auth/verify-recovery-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (response.ok) {
        // Redirigir a la página de reset con el token
        navigate('/reset-password', { 
          state: { 
            resetToken: data.resetToken,
            email 
          } 
        })
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    setError('')
  }

  const handleResendCode = async () => {
    try {
      await fetch('http://localhost:3005/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      alert('Nuevo código enviado')
    } catch (error) {
      alert('Error al reenviar código')
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verificar Código
            </h1>
            <p className="text-gray-600">
              Ingresa el código de 6 dígitos que enviamos a <span className="font-medium">{email}</span>
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Código de Verificación
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                value={code}
                onChange={handleCodeChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                El código expira en 10 minutos
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                'Verificar Código'
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Reenviar código
              </button>
              <div>
                <Link
                  to="/forgot-password"
                  className="text-gray-500 hover:text-gray-600 text-sm"
                >
                  Cambiar correo electrónico
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Orange circle design */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-orange-100 to-orange-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shadow-2xl"></div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-70"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyCode
