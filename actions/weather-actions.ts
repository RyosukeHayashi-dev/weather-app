"use server"

import { generateMockWeather } from "../utils/mock-weather"
import { saveWeatherData, type WeatherRecord } from "../lib/supabase"
import { calculateSunriseSunset, calculateUVIndex, calculateAdvancedUVIndex, JAPAN_CITIES, type JapanCityName } from "../utils/timezone"

interface OpenWeatherResponse {
  name: string
  sys: {
    country: string
  }
  main: {
    temp: number
    humidity: number
    feels_like: number
    pressure: number
    temp_max: number
    temp_min: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  visibility: number
  clouds?: {
    all: number // 雲量（0-100%）
  }
}

// 5日間予報のレスポンス型を追加
interface ForecastItem {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
  }
  dt_txt: string
}

interface ForecastResponse {
  list: ForecastItem[]
  city: {
    name: string
    country: string
    coord: {
      lat: number
      lon: number
    }
  }
}

// 5日間予報データの型
export interface ForecastData {
  date: string
  dayOfWeek: string
  icon: string
  description: string
  maxTemp: number
  minTemp: number
  humidity: number
  windSpeed: number
  uvIndex?: number
  hourlyForecasts: Array<{
    time: string
    temp: number
    icon: string
    description: string
    humidity: number
    windSpeed: number
  }>
}

export interface WeatherData {
  city: string
  country: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
  description: string
  feelsLike: number
  pressure?: number
  visibility?: number
  uvIndex?: number
  windDirection?: number
  sunrise?: string
  sunset?: string
  timezone?: string
  maxTemp?: number
  minTemp?: number
}

const CITIES = [
  { name: "Tokyo", country: "JP" },
  { name: "New York", country: "US" },
  { name: "London", country: "GB" },
  { name: "Paris", country: "FR" },
  { name: "Berlin", country: "DE" },
  { name: "Sydney", country: "AU" },
  { name: "Seoul", country: "KR" },
  { name: "Beijing", country: "CN" },
  { name: "Mumbai", country: "IN" },
  { name: "Sao Paulo", country: "BR" },
  { name: "Dubai", country: "AE" },
  { name: "Cairo", country: "EG" },
  { name: "Lagos", country: "NG" },
  { name: "Mexico City", country: "MX" },
  { name: "Bangkok", country: "TH" },
]

// 天気データをSupabase用のレコード形式に変換
function convertToWeatherRecord(weatherData: WeatherData, recordedAt?: Date): WeatherRecord {
  return {
    city: weatherData.city,
    country: weatherData.country,
    temperature: weatherData.temperature,
    feels_like: weatherData.feelsLike,
    humidity: weatherData.humidity,
    pressure: weatherData.pressure || 1013.25, // デフォルト値
    visibility: weatherData.visibility || 10000, // デフォルト値（10km）
    uv_index: weatherData.uvIndex || 0, // デフォルト値
    wind_speed: weatherData.windSpeed,
    wind_direction: weatherData.windDirection || 0, // デフォルト値
    weather_description: weatherData.description,
    weather_icon: weatherData.icon,
    sunrise: weatherData.sunrise || '06:00',
    sunset: weatherData.sunset || '18:00',
    timezone: weatherData.timezone || 'UTC',
    recorded_at: (recordedAt || new Date()).toISOString(),
  }
}

export async function fetchWeatherData(): Promise<{ data: WeatherData[]; isUsingMockData: boolean }> {
  const API_KEY = process.env.OPENWEATHERMAP_API_KEY

  // デバッグ用ログ（本番環境でも環境変数をチェック）
  console.log("🔍 Environment Variables Check:")
  console.log("OPENWEATHERMAP_API_KEY:", API_KEY ? "✅ Configured" : "❌ Missing")
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Configured" : "❌ Missing")
  console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "✅ Configured" : "❌ Missing")

  // APIキーが設定されていない場合はモックデータを使用
  if (!API_KEY || API_KEY.trim() === "") {
    console.warn("OpenWeatherMap API key is not configured. Using mock data.")
    const mockData = CITIES.map((city) => generateMockWeather(city.name, city.country))
    return { data: mockData, isUsingMockData: true }
  }

  try {
    // テスト用のAPIキー検証
    const testCity = "London"
    const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=${testCity}&appid=${API_KEY}&units=metric`

    console.log("Testing API key with London...")
    const testResponse = await fetch(testUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "WeatherApp/1.0",
      },
    })

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error("API key validation failed:", testResponse.status, errorText)
      console.log("Falling back to mock data...")
      const mockData = CITIES.map((city) => generateMockWeather(city.name, city.country))
      return { data: mockData, isUsingMockData: true }
    }

    console.log("API key validation successful! Fetching real weather data...")

    // APIキーが有効な場合は実際のデータを取得
    const weatherPromises = CITIES.map(async (city, index) => {
      try {
        console.log(`Fetching weather for ${city.name} (${index + 1}/${CITIES.length})...`)

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.name)},${city.country}&appid=${API_KEY}&units=metric&lang=ja`

        const response = await fetch(url, {
          next: { revalidate: 600 }, // 10分間キャッシュ
          headers: {
            "User-Agent": "WeatherApp/1.0",
          },
        })

        if (!response.ok) {
          console.warn(`API Error for ${city.name}: ${response.status}`)
          return generateMockWeather(city.name, city.country)
        }

        const data: OpenWeatherResponse = await response.json()
        console.log(`✓ Successfully fetched weather for ${city.name}`)

        // 日の出・日の入り時刻を計算
        const { sunrise, sunset } = calculateSunriseSunset(city.name)
        
        // UV指数を正確に計算（雲量を考慮）
        const cloudCoverage = data.clouds?.all || 50 // デフォルト50%
        const uvIndex = calculateAdvancedUVIndex(city.name, cloudCoverage)

        return {
          city: data.name,
          country: data.sys.country,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 10) / 10,
          icon: data.weather[0].icon,
          description: data.weather[0].description || data.weather[0].main,
          feelsLike: Math.round(data.main.feels_like),
          pressure: data.main.pressure,
          visibility: data.visibility ? data.visibility / 1000 : 10, // mをkmに変換
          windDirection: data.wind?.deg || 0,
          maxTemp: Math.round(data.main.temp_max),
          minTemp: Math.round(data.main.temp_min),
          uvIndex: uvIndex,
          sunrise: sunrise,
          sunset: sunset,
          timezone: 'UTC',
        }
      } catch (error) {
        console.warn(`Error fetching weather for ${city.name}:`, error)
        // エラーの場合はモックデータを使用
        return generateMockWeather(city.name, city.country)
      }
    })

    const results = await Promise.all(weatherPromises)
    return { data: results, isUsingMockData: false }
  } catch (error) {
    console.error("Failed to fetch weather data:", error)
    // 全体的なエラーの場合はモックデータを使用
    const mockData = CITIES.map((city) => generateMockWeather(city.name, city.country))
    return { data: mockData, isUsingMockData: true }
  }
}

// 天気データを取得してSupabaseに保存する新しい関数
export async function fetchAndSaveWeatherData(): Promise<{ 
  data: WeatherData[]; 
  isUsingMockData: boolean; 
  savedToDatabase: boolean;
  saveError?: any;
}> {
  try {
    // 天気データを取得
    const { data, isUsingMockData } = await fetchWeatherData()
    
    // Supabaseに保存を試行
    const recordedAt = new Date()
    const weatherRecords = data.map(weather => convertToWeatherRecord(weather, recordedAt))
    
    const saveResult = await saveWeatherData(weatherRecords)
    
    return {
      data,
      isUsingMockData,
      savedToDatabase: saveResult.success,
      saveError: saveResult.success ? undefined : saveResult.error
    }
  } catch (error) {
    console.error("Error in fetchAndSaveWeatherData:", error)
    // エラーの場合でも天気データは返す
    const { data, isUsingMockData } = await fetchWeatherData()
    return {
      data,
      isUsingMockData,
      savedToDatabase: false,
      saveError: error
    }
  }
}

// 日本の都市の天気データを取得する関数
export async function fetchJapanWeatherData(): Promise<{ data: WeatherData[]; isUsingMockData: boolean }> {
  const API_KEY = process.env.OPENWEATHERMAP_API_KEY

  // APIキーが設定されていない場合はモックデータを使用
  if (!API_KEY || API_KEY.trim() === "") {
    console.warn("OpenWeatherMap API key is not configured. Using mock data for Japan cities.")
    const mockData = Object.entries(JAPAN_CITIES).map(([prefecture, info]) => 
      generateMockWeather(prefecture, "JP")
    )
    return { data: mockData, isUsingMockData: true }
  }

  try {
    console.log("Fetching weather data for Japan cities...")

    // 日本の都市の天気データを取得
    const weatherPromises = Object.entries(JAPAN_CITIES).map(async ([prefecture, info], index) => {
      try {
        console.log(`Fetching weather for ${prefecture} (${info.name}) (${index + 1}/${Object.keys(JAPAN_CITIES).length})...`)

        // 緯度経度で天気を取得（より正確）
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${info.lat}&lon=${info.lon}&appid=${API_KEY}&units=metric&lang=ja`

        const response = await fetch(url, {
          next: { revalidate: 600 }, // 10分間キャッシュ
          headers: {
            "User-Agent": "WeatherApp/1.0",
          },
        })

        if (!response.ok) {
          console.warn(`API Error for ${prefecture}: ${response.status}`)
          return generateMockWeather(prefecture, "JP")
        }

        const data: OpenWeatherResponse = await response.json()
        console.log(`✓ Successfully fetched weather for ${prefecture}`)

        // UV指数を正確に計算（雲量を考慮）
        const cloudCoverage = data.clouds?.all || 50
        const uvIndex = calculateAdvancedUVIndex(prefecture, cloudCoverage)

        return {
          city: prefecture,
          country: "JP",
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 10) / 10,
          icon: data.weather[0].icon,
          description: data.weather[0].description || data.weather[0].main,
          feelsLike: Math.round(data.main.feels_like),
          pressure: data.main.pressure,
          visibility: data.visibility ? data.visibility / 1000 : 10,
          windDirection: data.wind?.deg || 0,
          maxTemp: Math.round(data.main.temp_max),
          minTemp: Math.round(data.main.temp_min),
          uvIndex: uvIndex,
          sunrise: '',
          sunset: '',
          timezone: 'Asia/Tokyo',
        }
      } catch (error) {
        console.warn(`Error fetching weather for ${prefecture}:`, error)
        return generateMockWeather(prefecture, "JP")
      }
    })

    const results = await Promise.all(weatherPromises)
    return { data: results, isUsingMockData: false }
  } catch (error) {
    console.error("Failed to fetch Japan weather data:", error)
    const mockData = Object.entries(JAPAN_CITIES).map(([prefecture, info]) => 
      generateMockWeather(prefecture, "JP")
    )
    return { data: mockData, isUsingMockData: true }
  }
}

// 名古屋の5日間天気予報を取得
export async function fetchNagoyaForecast(): Promise<{ data: ForecastData[]; isUsingMockData: boolean }> {
  const API_KEY = process.env.OPENWEATHERMAP_API_KEY
  const nagoyaInfo = JAPAN_CITIES["愛知"] // 名古屋の座標

  if (!API_KEY || API_KEY.trim() === "") {
    console.warn("OpenWeatherMap API key is not configured. Using mock forecast data.")
    return { data: generateMockForecast(), isUsingMockData: true }
  }

  try {
    console.log("Fetching 5-day forecast for Nagoya...")
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${nagoyaInfo.lat}&lon=${nagoyaInfo.lon}&appid=${API_KEY}&units=metric&lang=ja`

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 30分間キャッシュ
      headers: {
        "User-Agent": "WeatherApp/1.0",
      },
    })

    if (!response.ok) {
      console.warn(`Forecast API Error: ${response.status}`)
      return { data: generateMockForecast(), isUsingMockData: true }
    }

    const data: ForecastResponse = await response.json()
    console.log("✓ Successfully fetched Nagoya forecast")

    // データを日別にグループ化
    const dailyForecasts = groupForecastByDay(data.list)
    
    return { data: dailyForecasts, isUsingMockData: false }
  } catch (error) {
    console.error("Failed to fetch forecast:", error)
    return { data: generateMockForecast(), isUsingMockData: true }
  }
}

// 3時間ごとの予報データを日別にグループ化
function groupForecastByDay(forecastList: ForecastItem[]): ForecastData[] {
  const dailyGroups: { [date: string]: ForecastItem[] } = {}
  
  // 日付ごとにグループ化
  forecastList.forEach(item => {
    const date = item.dt_txt.split(' ')[0] // YYYY-MM-DD部分を取得
    if (!dailyGroups[date]) {
      dailyGroups[date] = []
    }
    dailyGroups[date].push(item)
  })

  // 各日のデータを集計
  return Object.entries(dailyGroups).map(([dateStr, items]) => {
    const date = new Date(dateStr)
    const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' })
    
    // その日の最高・最低気温を計算
    const temps = items.map(item => item.main.temp)
    const maxTemp = Math.round(Math.max(...temps))
    const minTemp = Math.round(Math.min(...temps))
    
    // 最も頻繁に現れる天気アイコンを使用
    const iconCounts: { [icon: string]: number } = {}
    items.forEach(item => {
      const icon = item.weather[0].icon
      iconCounts[icon] = (iconCounts[icon] || 0) + 1
    })
    const mostFrequentIcon = Object.entries(iconCounts)
      .sort(([,a], [,b]) => b - a)[0][0]
    
    // 代表的な天気説明
    const representativeWeather = items.find(item => item.weather[0].icon === mostFrequentIcon)?.weather[0]
    
    // 平均湿度と風速
    const avgHumidity = Math.round(items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length)
    const avgWindSpeed = Math.round((items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length) * 10) / 10
    
    // 3時間ごとの詳細予報
    const hourlyForecasts = items.map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon,
      description: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10
    }))

    return {
      date: date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
      dayOfWeek,
      icon: mostFrequentIcon,
      description: representativeWeather?.description || '不明',
      maxTemp,
      minTemp,
      humidity: avgHumidity,
      windSpeed: avgWindSpeed,
      hourlyForecasts
    }
  }).slice(0, 5) // 5日間分
}

// モック予報データ生成
function generateMockForecast(): ForecastData[] {
  const mockData: ForecastData[] = []
  const baseDate = new Date()
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + i)
    
    const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' })
    const maxTemp = Math.round(Math.random() * 15 + 15) // 15-30度
    const minTemp = maxTemp - Math.round(Math.random() * 10 + 5) // 5-15度差
    
    const mockHourly = []
    for (let h = 0; h < 8; h++) { // 3時間×8 = 24時間
      mockHourly.push({
        time: `${(h * 3).toString().padStart(2, '0')}:00`,
        temp: Math.round(minTemp + Math.random() * (maxTemp - minTemp)),
        icon: '01d',
        description: '晴れ',
        humidity: Math.round(Math.random() * 40 + 40),
        windSpeed: Math.round(Math.random() * 10 * 10) / 10
      })
    }
    
    mockData.push({
      date: date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
      dayOfWeek,
      icon: '01d',
      description: '晴れ',
      maxTemp,
      minTemp,
      humidity: Math.round(Math.random() * 40 + 40),
      windSpeed: Math.round(Math.random() * 10 * 10) / 10,
      hourlyForecasts: mockHourly
    })
  }
  
  return mockData
}
