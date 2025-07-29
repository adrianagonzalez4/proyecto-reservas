import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import { roomsService, reservationsService } from '../services/api'

function Dashboard() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState('')
  const [showNewReservation, setShowNewReservation] = useState(false)
  const [reservations, setReservations] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    availableSpaces: 0,
    reservedSpaces: 0,
    mostReservedTime: '12:00'
  })

  // Estados para el formulario de reserva
  const [formData, setFormData] = useState({
    roomId: '',
    date: new Date().toISOString().split('T')[0],
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

    // Cargar datos de la API
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('🔄 CARGANDO DATOS...')
      console.log('🔗 API_BASE_URL:', 'https://vctlnlds413.execute-api.us-west-2.amazonaws.com/dev')
      console.log('🔍 roomsService:', roomsService)
      console.log('🔍 reservationsService:', reservationsService)
      
      // Test individual de cada servicio
      console.log('📋 Probando roomsService.getRooms()...')
      try {
        const testRooms = await roomsService.getRooms()
        console.log('📋 Test Rooms Result:', testRooms)
      } catch (testError) {
        console.error('❌ Test Rooms Error:', testError)
      }
      
      console.log('📅 Probando reservationsService.getReservations()...')
      try {
        const testReservations = await reservationsService.getReservations()
        console.log('📅 Test Reservations Result:', testReservations)
      } catch (testError) {
        console.error('❌ Test Reservations Error:', testError)
      }

      // Cargar salas y reservas en paralelo
      const [roomsData, reservationsData] = await Promise.all([
        roomsService.getRooms(),
        reservationsService.getReservations()
      ])

      console.log('🏢 Salas cargadas:', roomsData.length)
      console.log('📅 Reservas cargadas:', reservationsData.length)
      console.log('📅 Reservas detalle:', reservationsData)

      setRooms(roomsData)
      setReservations(reservationsData)

      // Calcular estadísticas
      calculateStats(roomsData, reservationsData)

      console.log('✅ DATOS ACTUALIZADOS')

    } catch (err) {
      setError(err.message)
      console.error('❌ Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (roomsData, reservationsData) => {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const todayReservations = reservationsData.filter(res =>
      res.date === today && res.status !== 'cancelled'
    )

    // 🕐 ESPACIOS DISPONIBLES EN TIEMPO REAL
    // Contar salas que están ocupadas AHORA MISMO
    const currentlyOccupied = todayReservations.filter(res => {
      const startMinutes = timeToMinutes(res.startTime)
      const endMinutes = timeToMinutes(res.endTime)
      const nowMinutes = timeToMinutes(currentTime)
      
      return nowMinutes >= startMinutes && nowMinutes < endMinutes
    })

    const occupiedRoomIds = new Set(currentlyOccupied.map(res => res.roomId))
    const availableSpaces = Math.max(0, roomsData.length - occupiedRoomIds.size)

    console.log('📊 ESTADÍSTICAS EN TIEMPO REAL:')
    console.log('🏢 Total salas:', roomsData.length)
    console.log('🕐 Hora actual:', currentTime)
    console.log('📅 Reservas hoy:', todayReservations.length)
    console.log('🔴 Ocupadas AHORA:', occupiedRoomIds.size)
    console.log('✅ Disponibles AHORA:', availableSpaces)

    setStats({
      availableSpaces: availableSpaces,
      reservedSpaces: todayReservations.length,
      mostReservedTime: getMostReservedTime(todayReservations)
    })
  }

  const getMostReservedTime = (reservations) => {
    if (reservations.length === 0) return '12:00'

    const timeCount = {}
    reservations.forEach(res => {
      timeCount[res.startTime] = (timeCount[res.startTime] || 0) + 1
    })

    return Object.keys(timeCount).reduce((a, b) =>
      timeCount[a] > timeCount[b] ? a : b
    ) || '12:00'
  }

  // 🚨 FUNCIÓN DE VALIDACIÓN DE CONFLICTOS
  const checkTimeConflict = (roomId, date, startTime, endTime, existingReservations) => {
    console.log('🔍 Verificando conflictos para:', { roomId, date, startTime, endTime })
    
    const conflicts = existingReservations.filter(reservation => {
      // Misma sala y mismo día
      if (reservation.roomId !== roomId || reservation.date !== date) {
        return false
      }

      // Convertir horarios a minutos para comparar
      const newStart = timeToMinutes(startTime)
      const newEnd = timeToMinutes(endTime)
      const existingStart = timeToMinutes(reservation.startTime)
      const existingEnd = timeToMinutes(reservation.endTime)

      // Verificar solapamiento
      const hasOverlap = (newStart < existingEnd && newEnd > existingStart)
      
      if (hasOverlap) {
        console.log('❌ CONFLICTO encontrado:', reservation)
      }
      
      return hasOverlap
    })

    console.log('🔍 Conflictos encontrados:', conflicts.length)
    return conflicts.length > 0
  }

  // Función auxiliar para convertir tiempo a minutos
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

const handleCreateReservation = async (e) => {
  e.preventDefault();

  // Validar formulario
  if (!formData.roomId || !formData.date || !formData.startTime || !formData.endTime) {
    alert('Por favor completa todos los campos');
    return;
  }

  const startMinutes = convertTimeToMinutes(formData.startTime);
  const endMinutes = convertTimeToMinutes(formData.endTime);
  if (startMinutes >= endMinutes) {
    alert('La hora de fin debe ser posterior a la hora de inicio');
    return;
  }

  if (endMinutes - startMinutes < 30) {
    alert('La reserva debe tener una duración mínima de 30 minutos');
    return;
  }

  try {
    setLoading(true);

    // Verificar conflicto
    const hasConflict = checkTimeConflict(
      formData.roomId,
      formData.date,
      formData.startTime,
      formData.endTime,
      reservations
    );

    if (hasConflict) {
      alert('⚠️ CONFLICTO: Ya existe una reserva en esa sala para ese horario');
      return;
    }

    // Crear reserva sin autenticación
    const reservationData = {
      roomId: formData.roomId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      userName: 'invitado',
      status: 'scheduled'
    };

    console.log('Enviando reserva no autenticada:', reservationData);
    const result = await reservationsService.createReservation(reservationData);
    console.log('Reserva creada:', result);

    setFormData({
      roomId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: ''
    });

    await loadData();
    alert('Reserva creada exitosamente');

  } catch (err) {
    console.error('Error al crear la reserva:', err);
    alert(`Error al crear la reserva: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
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
            className="flex items-center px-4 py-3 text-gray-700 bg-orange-100 border-r-4 border-orange-500"
          >
            <span className="mr-3">📅</span>
            Inicio
          </Link>
          <Link
            to="/reservations"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
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
              <p className="text-sm font-medium text-gray-900">Adriana González</p>
              <p className="text-xs text-gray-500">snoopydigitaldiary@gmail.com</p>
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
          <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido, yop!</h2>
          <p className="text-gray-600">{currentDate}</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.availableSpaces}</p>
                <p className="text-gray-600">Espacios Disponibles Hoy</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">🗓️</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.reservedSpaces}</p>
                <p className="text-gray-600">Espacios Reservados Hoy</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.mostReservedTime}</p>
                <p className="text-gray-600">Hora Más Reservada</p>
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

        {/* New Reservation Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Reserva</h3>

          <form onSubmit={handleCreateReservation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salón
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
              >
                <option value="">Selecciona un salón</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} - Capacidad: {room.capacity} personas
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de inicio
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                >
                  <option value="">Selecciona hora de inicio</option>
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
                  Hora de fin
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                >
                  <option value="">Selecciona hora de fin</option>
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



            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

