import { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

// Configuración de la API de AWS
const API_BASE_URL = 'https://vcth1ds413.execute-api.us-west-2.amazonaws.com/prod';

// Función helper para hacer peticiones HTTP
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Obtener token de autenticación
  let authHeaders = {};
  try {
    const session = await fetchAuthSession();
    if (session.tokens?.idToken) {
      authHeaders['Authorization'] = `Bearer ${session.tokens.idToken}`;
    }
  } catch (error) {
    console.warn('No hay sesión autenticada:', error);
  }
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    console.warn('🚨 USING FALLBACK DATA due to API error');
    
    if (endpoint === '/rooms') {
      return {
        success: true,
        rooms: [
          { roomId: 'sala-a', name: 'Sala A', capacity: 10, description: 'Sala grande', isActive: true },
          { roomId: 'sala-b', name: 'Sala B', capacity: 8, description: 'Sala mediana', isActive: true },
          { roomId: 'sala-c', name: 'Sala C', capacity: 6, description: 'Sala pequeña', isActive: true }
        ]
      };
    }
    
    if (endpoint === '/reservations') {
      return {
        success: true,
        reservations: []
      };
    }
    
    throw error;
  }
};

// Servicios para Salas
export const roomsService = {
  // Obtener todas las salas
  getRooms: async () => {
    try {
      const data = await makeRequest('/rooms');
      console.log('Raw rooms data:', data); // Debug log
      
      // Normalizar la respuesta
      let rooms = [];
      
      if (data && data.success && Array.isArray(data.rooms)) {
        // Formato: {success: true, rooms: [...]}
        rooms = data.rooms.map(room => ({
          ...room,
          id: room.roomId || room.id
        }));
      } else if (data && data.success && Array.isArray(data.result)) {
        // Formato: {success: true, result: [...]}
        rooms = data.result.map(room => ({
          ...room,
          id: room.roomId || room.id
        }));
      } else if (Array.isArray(data)) {
        // Formato: [...]
        rooms = data.map(room => ({
          ...room,
          id: room.roomId || room.id
        }));
      } else if (data && Array.isArray(data.result)) {
        // Formato: {result: [...]}
        rooms = data.result.map(room => ({
          ...room,
          id: room.roomId || room.id
        }));
      } else if (data && data.success === true && data.rooms) {
        // Posible formato de respuesta de AWS
        const roomsArray = Array.isArray(data.rooms) ? data.rooms : [data.rooms];
        rooms = roomsArray.map(room => ({
          ...room,
          id: room.roomId || room.id
        }));
      } else {
        console.warn('Rooms data is not in expected format:', data);
        // Datos de ejemplo para pruebas
        rooms = [
          {
            id: 'sala-a',
            roomId: 'sala-a',
            name: 'Sala A',
            capacity: 10,
            description: 'Sala de reuniones grande',
            isActive: true
          },
          {
            id: 'sala-b', 
            roomId: 'sala-b',
            name: 'Sala B',
            capacity: 8,
            description: 'Sala de reuniones mediana',
            isActive: true
          },
          {
            id: 'sala-c',
            roomId: 'sala-c', 
            name: 'Sala C',
            capacity: 6,
            description: 'Sala de reuniones pequeña',
            isActive: true
          }
        ];
      }
      
      console.log('Processed rooms:', rooms); // Debug log
      return rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return []; // Devolver array vacío en lugar de lanzar error
    }
  }
};

// Servicios para Reservas
export const reservationsService = {
  // Obtener todas las reservas
  getReservations: async () => {
    try {
      console.log('🔄 Obteniendo reservas...');
      
      const response = await fetch(`${API_BASE_URL}/reservations`);
      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        console.warn(`⚠️ Response not OK: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      console.log('🔍 Raw reservations data:', data);
      
      // Múltiples formatos posibles de respuesta
      let reservations = [];
      
      if (data && data.success && Array.isArray(data.reservations)) {
        reservations = data.reservations;
        console.log('✅ Formato: data.reservations');
      } else if (data && data.success && Array.isArray(data.result)) {
        reservations = data.result;
        console.log('✅ Formato: data.result');
      } else if (data && Array.isArray(data.reservations)) {
        reservations = data.reservations;
        console.log('✅ Formato: data.reservations (sin success)');
      } else if (Array.isArray(data)) {
        reservations = data;
        console.log('✅ Formato: array directo');
      } else if (data && typeof data === 'object') {
        // Si es un objeto, intentar convertir a array
        console.log('🔄 Intentando convertir objeto a array...');
        reservations = Object.values(data).filter(item => 
          item && typeof item === 'object' && item.roomId
        );
        console.log('✅ Conversión completada:', reservations.length, 'reservas');
      } else {
        console.warn('⚠️ Formato no reconocido:', typeof data, data);
        reservations = [];
      }
      
      console.log('✅ Reservas procesadas:', reservations.length);
      console.log('📝 Detalle reservas:', reservations);
      
      return reservations;
    } catch (error) {
      console.error('❌ Error fetching reservations:', error);
      return [];
    }
  },

  // Crear una nueva reserva
  createReservation: async (reservationData) => {
    try {
      // Formato exacto que funciona (igual al test HTML)
      const payload = {
        roomId: reservationData.roomId,
        date: reservationData.date,
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
        userName: reservationData.userName
      };
      
      console.log('✅ Enviando:', payload);
      
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('✅ Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Respuesta:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  },

cancelReservation: async (reservationId) => {
  try {
    console.log('🗑️ Cancelando reserva:', reservationId);

    const result = await makeRequest(`/reservations/${reservationId}`, {
      method: 'DELETE'
    });

    console.log('✅ Reserva cancelada exitosamente:', result);
    return result;

  } catch (error) {
    console.error('❌ Error cancelando reserva:', error);
    throw error;
  }
},


  // ✏️ ACTUALIZAR UNA RESERVA  
  updateReservation: async (reservationId, updateData) => {
    try {
      console.log('✏️ Actualizando reserva:', reservationId, updateData);
      
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('🔍 Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Reserva actualizada:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error actualizando reserva:', error);
      throw error;
    }
  },

  // Obtener reservas por usuario (si se implementa en el futuro)
  getReservationsByUser: async (userId) => {
    try {
      const data = await makeRequest(`/reservations?userId=${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      throw new Error('No se pudieron cargar las reservas del usuario');
    }
  }
};

// Hook personalizado para manejar estados de carga
export const useApiCall = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};

// Exportar la URL base para uso directo si es necesario
export { API_BASE_URL };
