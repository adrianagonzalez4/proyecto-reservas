import { useState, useEffect } from 'react'
import Modal from './Modal'

const EditReservationModal = ({ isOpen, onClose, reservation, onUpdate }) => {
  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: ''
  })
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  // Obtener lista de salones al abrir modal
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`)
        const data = await res.json()
        setRooms(data.rooms || [])
      } catch (err) {
        console.error('Error al obtener salones:', err)
      }
    }

    if (isOpen) {
      fetchRooms()
    }
  }, [isOpen])

  // Inicializar formulario con datos de la reserva
  useEffect(() => {
    if (reservation && isOpen) {
      setFormData({
        roomId: reservation.roomId,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime
      })
      setError('')
    }
  }, [reservation, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')

    if (name === 'startTime' && value) {
      const startIndex = timeSlots.indexOf(value)
      if (startIndex !== -1 && startIndex < timeSlots.length - 1) {
        const nextSlot = timeSlots[startIndex + 1]
        setFormData(prev => ({ ...prev, endTime: nextSlot }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validaciones
    if (!formData.roomId || !formData.date || !formData.startTime || !formData.endTime) {
      setError('Todos los campos son obligatorios')
      setLoading(false)
      return
    }

    if (formData.startTime >= formData.endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin')
      setLoading(false)
      return
    }

    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError('No se puede programar una reserva para una fecha pasada')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('No se pudo actualizar la reserva')

      if (onUpdate) onUpdate()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableEndTimes = () => {
    if (!formData.startTime) return []
    const startIndex = timeSlots.indexOf(formData.startTime)
    return startIndex === -1 ? [] : timeSlots.slice(startIndex + 1)
  }

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? room.name : roomId
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="EDITAR RESERVA">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-orange-900 mb-2">Reserva actual:</h4>
          <p className="text-sm text-orange-700">
            {getRoomName(reservation?.roomId)} - {reservation?.date} de {reservation?.startTime} a {reservation?.endTime}
          </p>
        </div>

        <div>
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
            Room No
          </label>
          <select
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white cursor-pointer"
          >
            <option value="">Selecciona un salón</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name} - Capacidad: {room.capacity} personas
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              From Time
            </label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white cursor-pointer"
            >
              <option value="">12:00 PM</option>
              {timeSlots.slice(0, -1).map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
              To Time
            </label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white cursor-pointer"
              disabled={!formData.startTime}
            >
              <option value="">12:00 PM</option>
              {getAvailableEndTimes().map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="flex justify-center space-x-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 min-w-[120px] cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-3 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 min-w-[120px] cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditReservationModal
