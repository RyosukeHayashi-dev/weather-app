"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Thermometer, 
  Clock, 
  Eye, 
  Gauge 
} from "lucide-react"
import type { WeatherData } from "../actions/weather-actions"
import { getCityTime, getTimezoneOffset, isDaytime, getTimeOfDay, getTimeOfDayInfo, type TimeOfDay } from "../utils/timezone"

const getWeatherIcon = (condition: string, iconCode: string, isDay: boolean) => {
  const iconClass = "h-32 w-32 md:h-36 md:w-36"

  if (iconCode.includes("01")) return <Sun className={`${iconClass} text-yellow-400 drop-shadow-lg`} />
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04"))
    return <Cloud className={`${iconClass} ${isDay ? 'text-gray-200' : 'text-gray-400'} drop-shadow-lg`} />
  if (iconCode.includes("09") || iconCode.includes("10") || iconCode.includes("11"))
    return <CloudRain className={`${iconClass} text-blue-400 drop-shadow-lg`} />
  if (iconCode.includes("13")) return <CloudSnow className={`${iconClass} text-blue-200 drop-shadow-lg`} />

  return <Sun className={`${iconClass} text-yellow-400 drop-shadow-lg`} />
}

// 日本版：シンプルな天気アイコン（世界ビューと同じサイズ）
const getJapanWeatherIcon = (condition: string, iconCode: string) => {
  const iconClass = "h-32 w-32 md:h-36 md:w-36"

  if (iconCode.includes("01")) return <Sun className={`${iconClass} text-yellow-400 drop-shadow-lg`} />
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04"))
    return <Cloud className={`${iconClass} text-gray-200 drop-shadow-lg`} />
  if (iconCode.includes("09") || iconCode.includes("10") || iconCode.includes("11"))
    return <CloudRain className={`${iconClass} text-blue-400 drop-shadow-lg`} />
  if (iconCode.includes("13")) return <CloudSnow className={`${iconClass} text-blue-200 drop-shadow-lg`} />

  return <Sun className={`${iconClass} text-yellow-400 drop-shadow-lg`} />
}

// 国旗絵文字マッピング
const getCountryFlag = (countryCode: string) => {
  const flags: Record<string, string> = {
    JP: "🇯🇵", // 日本
    US: "🇺🇸", // アメリカ
    GB: "🇬🇧", // イギリス
    FR: "🇫🇷", // フランス
    DE: "🇩🇪", // ドイツ
    AU: "🇦🇺", // オーストラリア
    KR: "🇰🇷", // 韓国
    CN: "🇨🇳", // 中国
    IN: "🇮🇳", // インド
    BR: "🇧🇷", // ブラジル
    AE: "🇦🇪", // UAE
    EG: "🇪🇬", // エジプト
    NG: "🇳🇬", // ナイジェリア
    MX: "🇲🇽", // メキシコ
    TH: "🇹🇭", // タイ
  }
  return flags[countryCode] || "🌍"
}

interface WeatherCardProps {
  weather: WeatherData
  onClick?: () => void // クリック機能を追加
}

// 日本の都市用のシンプルな天気カード
interface JapanWeatherCardProps {
  weather: WeatherData
  onClick?: () => void // クリック機能を追加
}

export function JapanWeatherCard({ weather, onClick }: JapanWeatherCardProps) {
  // 名古屋（愛知県）の場合はクリック可能（より広範囲の判定）
  const isClickable = weather.city === "愛知" || weather.city === "名古屋" || weather.city === "愛知県" || weather.city.includes("愛知") || weather.city.includes("名古屋")
  const clickableClass = isClickable ? "cursor-pointer hover:border-orange-400/60" : ""

  // デバッグ情報
  console.log(`🏙️ JapanWeatherCard: city="${weather.city}", isClickable=${isClickable}, hasOnClick=${!!onClick}`)

  return (
    <Card 
      className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:min-w-[800px] lg:max-w-[900px] bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border border-cyan-400/30 text-white flex-shrink-0 hover:scale-105 transition-all duration-300 shadow-lg ${clickableClass}`}
      onClick={isClickable && onClick ? () => {
        console.log(`🚀 JapanWeatherCard clicked: ${weather.city}`)
        onClick()
      } : undefined}
    >
      <CardContent className="p-4 sm:p-6 md:p-8 lg:p-14">
        {/* ヘッダー：都市名のみ */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg">{weather.city}</h3>
        </div>

        {/* 天気アイコンと温度 */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-12 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          {/* 天気アイコン */}
          <div className="flex justify-center">
            <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 xl:h-36 xl:w-36 flex items-center justify-center">
              {getJapanWeatherIcon(weather.condition, weather.icon)}
            </div>
          </div>
          
          {/* 温度と説明 */}
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white mb-1 sm:mb-2 md:mb-3 drop-shadow-2xl">
              {weather.temperature}°C
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 capitalize font-medium drop-shadow-lg">
              {weather.description}
            </p>
          </div>
        </div>

        {/* 詳細情報グリッド - PC以下では2列、PC以上では4列 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* UV指数 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-orange-600/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">UV</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">UV指数</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
              {weather.uvIndex || '--'}
            </div>
          </div>

          {/* 湿度 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-blue-500/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <Droplets className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-400" />
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">湿度</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">{weather.humidity}%</div>
          </div>

          {/* 風速 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-gray-500/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <Wind className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-gray-400" />
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">風速</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">{weather.windSpeed}m/s</div>
          </div>

          {/* 気圧 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-green-500/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <Gauge className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-green-400" />
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">気圧</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
              {weather.pressure ? `${Math.round(weather.pressure)}hPa` : '--'}
            </div>
          </div>
        </div>

        {/* 最高・最低気温 - 中央寄せ */}
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-6 border border-orange-500/20 w-full max-w-sm lg:max-w-md">
            <div className="text-center mb-2 sm:mb-3 md:mb-4">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-400" />
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1 sm:mb-2 md:mb-3">最高/最低</div>
            </div>
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-orange-300">{weather.maxTemp || '--'}°</div>
              </div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-400">/</div>
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-300">{weather.minTemp || '--'}°</div>
              </div>
            </div>
          </div>
        </div>

        {/* 名古屋クリック案内 */}
        {isClickable && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 md:px-6 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-4 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/30 text-xs sm:text-sm md:text-base lg:text-lg">
              <span>🌤️</span>
              <span>クリックで1週間の天気予報を表示</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function WeatherCard({ weather, onClick }: WeatherCardProps) {
  const [currentTime, setCurrentTime] = useState<{
    time: string
    date: string
    timezone: string
  }>({ time: "", date: "", timezone: "" })

  const [timezoneOffset, setTimezoneOffset] = useState<string>("")
  const [isDay, setIsDay] = useState(true)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day')

  // 1分ごとに時刻を更新
  useEffect(() => {
    const updateTime = () => {
      const cityTime = getCityTime(weather.city)
      const offset = getTimezoneOffset(weather.city)
      const dayTime = isDaytime(weather.city)
      const currentTimeOfDay = getTimeOfDay(weather.city)
      
      setCurrentTime(cityTime)
      setTimezoneOffset(offset)
      setIsDay(dayTime)
      setTimeOfDay(currentTimeOfDay)
    }

    updateTime() // 初回実行
    const interval = setInterval(updateTime, 60000) // 1分ごと

    return () => clearInterval(interval)
  }, [weather.city])

  // 昼夜に応じた背景グラデーション
  const backgroundGradient = isDay
    ? "from-black/70 via-gray-900/50 to-black/70"
    : "from-black/80 via-gray-900/60 to-black/80"

  const borderColor = isDay ? "border-cyan-400/40" : "border-purple-400/40"
  const glowColor = isDay ? "shadow-cyan-400/20" : "shadow-purple-400/20"

  // 東京都の場合はクリック可能（より広範囲の判定）
  const isClickable = weather.city === "Tokyo" || weather.city === "東京都" || weather.city === "東京" || weather.city.includes("Tokyo") || weather.city.includes("東京")
  const clickableClass = isClickable ? "cursor-pointer hover:border-yellow-400/60" : ""

  // 時間帯情報を取得
  const timeOfDayInfo = getTimeOfDayInfo(timeOfDay)

  // デバッグ情報
  console.log(`🏙️ WeatherCard: city="${weather.city}", isClickable=${isClickable}, hasOnClick=${!!onClick}`)

  return (
    <Card 
      className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:min-w-[800px] lg:max-w-[900px] bg-gradient-to-br ${backgroundGradient} backdrop-blur-xl border-2 ${borderColor} text-white flex-shrink-0 hover:scale-105 transition-all duration-500 shadow-2xl ${glowColor} hover:${glowColor.replace('/20', '/30')} ${clickableClass}`}
      onClick={isClickable && onClick ? () => {
        console.log(`🚀 WeatherCard clicked: ${weather.city}`)
        onClick()
      } : undefined}
    >
      <CardContent className="p-4 sm:p-6 md:p-8 lg:p-14">
        {/* ヘッダー：都市名と現在時刻 */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 mb-2 sm:mb-3 md:mb-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg">{weather.city}</h3>
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">{getCountryFlag(weather.country)}</span>
          </div>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6">{weather.country}</p>
          
          {/* 現在時刻表示 */}
          <div className="bg-black/40 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 mb-2 sm:mb-3 md:mb-4 border border-cyan-500/30">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 mb-1 sm:mb-2 md:mb-3">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-cyan-400" />
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-mono font-bold text-cyan-200 drop-shadow-lg">
                {currentTime.time}
              </span>
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300">
              {currentTime.date} • {timezoneOffset}
            </div>
          </div>
        </div>

        {/* 天気アイコンと温度を横並びに */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-12 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          {/* 天気アイコン */}
          <div className="flex justify-center">
            {getWeatherIcon(weather.condition, weather.icon, isDay)}
          </div>
          
          {/* 温度と説明 */}
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white mb-1 sm:mb-2 md:mb-3 drop-shadow-2xl">
              {weather.temperature}°C
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 capitalize font-medium drop-shadow-lg">
              {weather.description}
            </p>
          </div>
        </div>

        {/* 詳細情報グリッド - PC以下では2列、PC以上では4列 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* UV指数 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-orange-600/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">UV</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">UV指数</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
              {weather.uvIndex || '--'}
            </div>
          </div>

          {/* 湿度 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-blue-500/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <Droplets className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-400" />
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">湿度</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">{weather.humidity}%</div>
          </div>

          {/* 風速 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-gray-500/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <Wind className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-gray-400" />
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">風速</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">{weather.windSpeed}m/s</div>
          </div>

          {/* 気圧 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 text-center border border-green-500/20">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
              <Gauge className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-green-400" />
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1">気圧</div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
              {weather.pressure ? `${weather.pressure}hPa` : '--'}
            </div>
          </div>
        </div>

        {/* 追加情報：日の出・日の入り、最高・最低気温 - PC以上では3列、それ以下では2列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* 日の出・日の入り */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-yellow-500/20">
            <div className="text-center mb-2 sm:mb-3 md:mb-4">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Sun className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-400" />
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1 sm:mb-2 md:mb-3">日の出/日の入り</div>
            </div>
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-yellow-300">
                  {weather.sunrise || '--:--'}
                </div>
              </div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">/</div>
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-orange-300">
                  {weather.sunset || '--:--'}
                </div>
              </div>
            </div>
          </div>

          {/* 最高・最低気温 */}
          <div className="bg-black/30 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-orange-500/20">
            <div className="text-center mb-2 sm:mb-3 md:mb-4">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-400" />
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 mb-1 sm:mb-2 md:mb-3">最高/最低</div>
            </div>
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-orange-300">{weather.maxTemp || '--'}°</div>
              </div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">/</div>
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-300">{weather.minTemp || '--'}°</div>
              </div>
            </div>
          </div>

          {/* 空のスペース（PC版バランス調整用） */}
          <div className="hidden lg:block"></div>
        </div>

        {/* 時間帯インジケーター（朝・昼・夜・深夜） */}
        <div className="text-center mb-4 sm:mb-6">
          <div className={`inline-flex items-center space-x-2 sm:space-x-3 md:space-x-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-full text-sm sm:text-base md:text-lg ${timeOfDayInfo.color}`}>
            <span className="text-lg sm:text-xl md:text-2xl">{timeOfDayInfo.emoji}</span>
            <span>{timeOfDayInfo.name}</span>
          </div>
        </div>

        {/* 東京都クリック案内 */}
        {isClickable && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-full bg-yellow-500/20 text-yellow-200 border border-yellow-500/30 text-xs sm:text-sm md:text-lg">
              <span>🇯🇵</span>
              <span>クリックで日本の主要都市を表示</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

