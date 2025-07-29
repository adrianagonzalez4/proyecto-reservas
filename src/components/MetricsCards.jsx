import { useEffect, useState } from 'react'

const MetricsCards = ({ refreshKey }) => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://vcth1ds413.execute-api.us-west-2.amazonaws.com/prod/metrics`)
        if (!response.ok) throw new Error('Error al cargar métricas')

        const data = await response.json()
        setMetrics(data.metrics || {})
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [refreshKey]) // 🔁 Se vuelve a ejecutar cada vez que se cambia el refreshKey

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error al cargar métricas: {error}</p>
      </div>
    )
  }

  const cards = [
    {
      title: 'Espacios Disponibles Hoy',
      value: metrics?.availableSpaces || 0,
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-500'
    },
    {
      title: 'Espacios Reservados Hoy',
      value: metrics?.reservedSpaces || 0,
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      bgColor: 'bg-orange-500'
    },
    {
      title: 'Hora Más Reservada',
      value: metrics?.mostReservedTime || '--:--',
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-yellow-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 ${card.bgColor} rounded-md flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <div className="ml-4 w-0 flex-1">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {card.title}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MetricsCards
