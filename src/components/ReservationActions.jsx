import { useState } from 'react'
import EditReservationModal from './EditReservationModal'
import CancelReservationModal from './CancelReservationModal'

const ReservationActions = ({ reservation, onUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const isFutureReservation = () => {
    const now = new Date()
    const reservationStart = new Date(`${reservation.date}T${reservation.startTime}:00`)
    return now < reservationStart
  }

  const canEdit = reservation.status === 'active' && isFutureReservation()
  const canCancel = reservation.status === 'active' && isFutureReservation()

  if (!canEdit && !canCancel) {
    return (
      <span className="text-gray-400 text-sm">
        No hay acciones disponibles
      </span>
    )
  }

  return (
    <>
      <div className="flex space-x-4">
        {canEdit && (
          <button
            onClick={() => setShowEditModal(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
          >
            Editar
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>

      <EditReservationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        reservation={reservation}
        onUpdate={onUpdate}
      />

      <CancelReservationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        reservation={reservation}
        onUpdate={onUpdate}
      />
    </>
  )
}

export default ReservationActions
