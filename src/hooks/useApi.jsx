import { useState, useEffect } from 'react'
import { get, post, put, del } from 'aws-amplify/api'

export const useApi = () => {
  const makeRequest = async (path, options = {}) => {
    const { method = 'GET', body } = options
    const init = {
      body: body || {},
      headers: { 'Content-Type': 'application/json' }
    }

    try {
      let operation
      switch (method.toLowerCase()) {
        case 'get':
          operation = get({ apiName: 'api', path, options: init })
          break
        case 'post':
          operation = post({ apiName: 'api', path, options: init })
          break
        case 'put':
          operation = put({ apiName: 'api', path, options: init })
          break
        case 'delete':
          operation = del({ apiName: 'api', path, options: init })
          break
        default:
          operation = get({ apiName: 'api', path, options: init })
      }
      const { response } = await operation
      return response.body
    } catch (error) {
      throw new Error(error.message || 'Error en la solicitud')
    }
  }

  return { makeRequest }
}

export const useFetch = (path) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { response } = await get({ apiName: 'api', path })
        setData(response.body)
      } catch (err) {
        setError(err.message || 'Error al obtener datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [path])

  return { data, loading, error }
}
