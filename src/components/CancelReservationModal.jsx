import { useState } from 'react'
import Modal from './Modal'

const CancelReservationModal = ({ isOpen, onClose, reservation, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = async () => {
    setLoading(true)
    setError('')

    try {
      // 👇 Aquí debes conectar con tu backend en AWS (por ahora usamos fetch como placeholder)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reservations/${reservation.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al cancelar la reserva')
      }

      if (onUpdate) {
        onUpdate()
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRoomName = (roomId) => {
    const roomNames = {
      'SALA_A': 'Sala A',
      'SALA_B': 'Sala B',
      'SALA_C': 'Sala C',
      'SALA_H': 'Sala H',
      'SALA_CONFERENCIAS': 'Sala de Conferencias',
      'SALA_CREATIVA': 'Sala Creativa'
    }
    return roomNames[roomId] || roomId
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancelar Reserva">
      <div className="space-y-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            ¿Estás seguro de que deseas cancelar esta reserva?
          </p>

          {reservation && (
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles de la reserva:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Salón:</span> {getRoomName(reservation.roomId)}</p>
                <p><span className="font-medium">Fecha:</span> {formatDate(reservation.date)}</p>
                <p><span className="font-medium">Horario:</span> {reservation.startTime} - {reservation.endTime}</p>
              </div>
            </div>
          )}

          <p className="text-sm text-red-600 mt-4">Esta acción no se puede deshacer.</p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
            disabled={loading}
          >
            No, mantener reserva
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelando...
              </div>
            ) : (
              'Sí, cancelar reserva'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CancelReservationModal
