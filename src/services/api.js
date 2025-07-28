import { useState } from 'react';

// Configuración de la API de AWS
const API_BASE_URL = 'https://vcth1ds413.execute-api.us-west-2.amazonaws.com/prod';

// Función helper para hacer peticiones HTTP
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
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
      const data = await makeRequest('/reservations');
      console.log('Raw reservations data:', data); // Debug log
      
      // Normalizar la respuesta
      let reservations = [];
      
      if (data && data.success && Array.isArray(data.result)) {
        reservations = data.result;
      } else if (Array.isArray(data)) {
        reservations = data;
      } else if (data && Array.isArray(data.result)) {
        reservations = data.result;
      } else {
        console.warn('Reservations data is not in expected format:', data);
        reservations = [];
      }
      
      console.log('Processed reservations:', reservations); // Debug log
      return reservations;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return []; // Devolver array vacío en lugar de lanzar error
    }
  },

  // Crear una nueva reserva
  createReservation: async (reservationData) => {
    try {
      const data = await makeRequest('/reservations', {
        method: 'POST',
        body: reservationData
      });
      // Normalizar la respuesta
      if (data.success) {
        return data.result || data;
      }
      return data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw new Error('No se pudo crear la reserva');
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
