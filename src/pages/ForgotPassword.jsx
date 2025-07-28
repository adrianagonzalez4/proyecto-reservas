import { Auth } from 'aws-amplify'

// dentro del componente...
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  if (!email) {
    setError('El correo electrónico es requerido')
    setLoading(false)
    return
  }

  try {
    await Auth.forgotPassword(email)
    setSuccess(true)

    // Redirigir a la página de verificación después de 3 segundos
    setTimeout(() => {
      navigate('/verify-code', { state: { email } })
    }, 3000)
  } catch (error) {
    console.error('Error al enviar código:', error)
    setError(error.message || 'Error al enviar código de verificación')
  } finally {
    setLoading(false)
  }
}
