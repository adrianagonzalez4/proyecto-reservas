import { useState, useEffect } from 'react'
import { useApi, useFetch } from '../hooks/useApi'

const ReservationForm = ({ onReservationCreated }) => {
  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { makeRequest } = useApi()
  
  // Salas hardcodeadas (temporal hasta crear endpoint /rooms)
  const rooms = [
    { id: 'sala-a', name: 'Sala A', capacity: 10 },
    { id: 'sala-b', name: 'Sala B', capacity: 15 },
    { id: 'sala-c', name: 'Sala C', capacity: 20 },
    { id: 'sala-d', name: 'Sala D', capacity: 25 },
    { id: 'sala-e', name: 'Sala E', capacity: 30 }
  ]
  
  const roomsLoading = false

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, date: today }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')

    if (name === 'startTime') {
      const idx = timeSlots.indexOf(value)
      if (idx !== -1 && idx < timeSlots.length - 1) {
        setFormData(prev => ({ ...prev, endTime: timeSlots[idx + 1] }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { roomId, date, startTime, endTime } = formData

    if (!roomId || !date || !startTime || !endTime) {
      setError('Todos los campos son obligatorios')
      setLoading(false)
      return
    }

    if (startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la de fin')
      setLoading(false)
      return
    }

    try {
      await makeRequest('/reservations', {
        method: 'POST',
        body: formData
      })

      setSuccess('Reserva creada exitosamente')
      setFormData({
        roomId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: ''
      })

      if (onReservationCreated) onReservationCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableEndTimes = () => {
    const idx = timeSlots.indexOf(formData.startTime)
    return idx !== -1 ? timeSlots.slice(idx + 1) : []
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">Nueva Reserva</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Salón */}
        <div>
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1 text-left">Salón</label>
          <select
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            disabled={roomsLoading}
          >
            <option value="">Selecciona un salón</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name} - Capacidad: {room.capacity}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 text-left">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
          />
        </div>

        {/* Horas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inicio */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1 text-left">Hora de inicio</label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            >
              <option value="">Selecciona hora</option>
              {timeSlots.slice(0, -1).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Fin */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1 text-left">Hora de fin</label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              disabled={!formData.startTime}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            >
              <option value="">Selecciona hora</option>
              {getAvailableEndTimes().map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Feedback */}
        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</div>}
        {success && <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded p-3">{success}</div>}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creando reserva...
            </div>
          ) : 'Crear Reserva'}
        </button>
      </form>
    </div>
  )
}

export default ReservationForm
