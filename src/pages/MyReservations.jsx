import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import { roomsService, reservationsService } from '../services/api'

function MyReservations() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState('')
  const [reservations, setReservations] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalReservations: 0,
    mostReservedRoom: 'Ninguna'
  })

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)

  // Estados para el formulario de edición
  const [editFormData, setEditFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    // Configurar fecha actual
    const today = new Date()
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    setCurrentDate(today.toLocaleDateString('es-ES', options))

    // Cargar datos
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Cargar salas y reservas en paralelo
      const [roomsData, reservationsData] = await Promise.all([
        roomsService.getRooms(),
        reservationsService.getReservations()
      ])

      // Asegurar que los datos sean arrays
      const validRoomsData = Array.isArray(roomsData) ? roomsData : []
      const validReservationsData = Array.isArray(reservationsData) ? reservationsData : []

      setRooms(validRoomsData)
      setReservations(validReservationsData)

      // Calcular estadísticas
      calculateStats(validRoomsData, validReservationsData)

    } catch (err) {
      setError(err.message)
      console.error('Error loading data:', err)
      // Establecer arrays vacíos en caso de error
      setRooms([])
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (roomsData, reservationsData) => {
    // Asegurar que reservationsData sea un array
    const validReservations = Array.isArray(reservationsData) ? reservationsData : []
    const validRooms = Array.isArray(roomsData) ? roomsData : []
    
    const activeReservations = validReservations.filter(res => res.status !== 'cancelled')
    
    // Contar reservas por sala
    const roomCounts = {}
    activeReservations.forEach(res => {
      roomCounts[res.roomId] = (roomCounts[res.roomId] || 0) + 1
    })

    // Encontrar la sala más reservada
    let mostReservedRoom = 'Ninguna'
    if (Object.keys(roomCounts).length > 0) {
      const mostReservedRoomId = Object.keys(roomCounts).reduce((a, b) =>
        roomCounts[a] > roomCounts[b] ? a : b
      )
      const room = validRooms.find(r => r.id === mostReservedRoomId)
      mostReservedRoom = room ? room.name : 'Sala C'
    }

    setStats({
      totalReservations: activeReservations.length,
      mostReservedRoom
    })
  }

  const handleEditClick = (reservation) => {
    setSelectedReservation(reservation)
    setEditFormData({
      roomId: reservation.roomId,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime
    })
    setShowEditModal(true)
  }

  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation)
    setShowCancelModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Aquí iría la lógica para actualizar la reserva
      // await reservationsService.updateReservation(selectedReservation.id, editFormData)
      
      alert('Reserva actualizada exitosamente')
      setShowEditModal(false)
      await loadData()
      
    } catch (err) {
      alert(`Error al actualizar la reserva: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async () => {
    try {
      setLoading(true)
      
      // Aquí iría la lógica para cancelar la reserva
      // await reservationsService.cancelReservation(selectedReservation.id)
      
      alert('Reserva cancelada exitosamente')
      setShowCancelModal(false)
      await loadData()
      
    } catch (err) {
      alert(`Error al cancelar la reserva: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return date.toLocaleDateString('es-ES', options)
  }

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? room.name : 'Sala C'
  }

  const getRoomCapacity = (roomId) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? room.capacity : 6
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // Redirigir al login después del logout exitoso
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      alert('Error al cerrar sesión. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="bg-orange-500 text-white p-4">
          <h1 className="text-lg font-bold">Sistema de Reservas</h1>
        </div>

        <nav className="mt-4">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span className="mr-3">📅</span>
            Inicio
          </Link>
          <Link
            to="/reservations"
            className="flex items-center px-4 py-3 text-gray-700 bg-orange-100 border-r-4 border-orange-500"
          >
            <span className="mr-3">🔒</span>
            Mis Reservas
          </Link>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              Y
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">yop</p>
              <p className="text-xs text-gray-500">adrianagesp@outlook.com</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
          >
            <span className="mr-2">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">MIS RESERVAS</h2>
          <p className="text-gray-600">{currentDate}</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                <p className="text-gray-600">Cantidad de Salones Reservados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.mostReservedRoom}</p>
                <p className="text-gray-600">Salón más reservado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        )}

        {/* Reservations Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mis Reservas</h3>
                <p className="text-sm text-gray-600">Tienes {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Nueva Reserva
              </button>
            </div>
          </div>

          {/* Table */}
          {reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SALÓN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      FECHA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HORARIO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ESTADO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getRoomName(reservation.roomId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(reservation.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.startTime} - {reservation.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🟢 Programada
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEditClick(reservation)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleCancelClick(reservation)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tienes reservas actualmente</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">EDITAR RESERVA</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedReservation && (
              <form onSubmit={handleEditSubmit}>
                {/* Reserva actual */}
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-sm font-medium text-orange-800">Reserva actual:</p>
                  <p className="text-sm text-orange-700">
                    {getRoomName(selectedReservation.roomId)} - {selectedReservation.date} de {selectedReservation.startTime} a {selectedReservation.endTime}
                  </p>
                </div>

                {/* Room No */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room No
                  </label>
                  <select
                    value={editFormData.roomId}
                    onChange={(e) => setEditFormData({...editFormData, roomId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} - Capacidad: {room.capacity} personas
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date, From Time, To Time */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Time
                    </label>
                    <select
                      value={editFormData.startTime}
                      onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Time
                    </label>
                    <select
                      value={editFormData.endTime}
                      onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancelar Reserva</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-700 mb-4">¿Estás seguro de que deseas cancelar esta reserva?</p>
              
              <div className="text-left bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Detalles de la reserva:</p>
                <p className="text-sm text-gray-600">
                  <strong>Salón:</strong> {getRoomName(selectedReservation.roomId)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {formatDate(selectedReservation.date)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Horario:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}
                </p>
              </div>

              <p className="text-red-600 text-sm mt-4">Esta acción no se puede deshacer.</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
              >
                No, mantener reserva
              </button>
              <button
                onClick={handleCancelReservation}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
              >
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyReservations

