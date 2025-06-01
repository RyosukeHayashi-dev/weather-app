export interface WeatherData {
  city: string
  country: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
  description: string
}

export interface WeatherCardProps {
  weather: WeatherData
  onRemove: (city: string) => void
}
