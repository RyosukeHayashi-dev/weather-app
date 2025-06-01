import type { WeatherData } from "../actions/weather-actions"
import { calculateSunriseSunset, calculateUVIndex } from "./timezone"

const weatherConditions = [
  { condition: "Clear", description: "快晴", icon: "01d" },
  { condition: "Clouds", description: "曇り", icon: "03d" },
  { condition: "Rain", description: "雨", icon: "10d" },
  { condition: "Snow", description: "雪", icon: "13d" },
]

export function generateMockWeather(cityName: string, countryCode: string): WeatherData {
  const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
  const baseTemp = Math.floor(Math.random() * 35) - 5 // -5°C to 30°C

  // 正確な日の出・日の入り時刻を計算
  const { sunrise, sunset } = calculateSunriseSunset(cityName)
  
  // 正確なUV指数を計算
  const uvIndex = calculateUVIndex(cityName)

  return {
    city: cityName,
    country: countryCode,
    temperature: baseTemp,
    condition: randomCondition.condition,
    humidity: Math.floor(Math.random() * 40) + 40, // 40% to 80%
    windSpeed: Math.floor(Math.random() * 15) + 1, // 1 to 15 m/s
    icon: randomCondition.icon,
    description: randomCondition.description,
    feelsLike: baseTemp + Math.floor(Math.random() * 6) - 3, // baseTemp ± 3°C
    maxTemp: baseTemp + Math.floor(Math.random() * 8) + 2, // baseTemp + 2-10°C
    minTemp: baseTemp - Math.floor(Math.random() * 8) - 2, // baseTemp - 2-10°C
    uvIndex: uvIndex,
    pressure: Math.floor(Math.random() * 50) + 980, // 980-1030 hPa
    visibility: Math.floor(Math.random() * 20) + 5, // 5-25 km
    windDirection: Math.floor(Math.random() * 360), // 0-360°
    sunrise: sunrise,
    sunset: sunset,
    timezone: 'UTC',
  }
}
