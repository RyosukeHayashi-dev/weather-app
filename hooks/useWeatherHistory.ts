import { useState, useEffect } from 'react'
import { getWeatherHistory, type WeatherRecord } from '../lib/supabase'

interface UseWeatherHistoryProps {
  city?: string
  hours?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useWeatherHistory({
  city,
  hours = 24,
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000 // 5分
}: UseWeatherHistoryProps = {}) {
  const [data, setData] = useState<WeatherRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchHistory = async () => {
    try {
      setError(null)
      const result = await getWeatherHistory(city, hours)
      
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error)
        setData([])
      }
    } catch (err) {
      setError(err)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()

    if (autoRefresh) {
      const interval = setInterval(fetchHistory, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [city, hours, autoRefresh, refreshInterval])

  const refetch = () => {
    setIsLoading(true)
    fetchHistory()
  }

  return {
    data,
    isLoading,
    error,
    refetch
  }
} 