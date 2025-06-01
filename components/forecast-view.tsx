"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  ArrowLeft, 
  Calendar,
  Droplets,
  Wind,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import type { ForecastData } from "../actions/weather-actions"

const getWeatherIcon = (iconCode: string) => {
  const iconClass = "h-12 w-12"

  if (iconCode.includes("01")) return <Sun className={`${iconClass} text-yellow-400`} />
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04"))
    return <Cloud className={`${iconClass} text-gray-200`} />
  if (iconCode.includes("09") || iconCode.includes("10") || iconCode.includes("11"))
    return <CloudRain className={`${iconClass} text-blue-400`} />
  if (iconCode.includes("13")) return <CloudSnow className={`${iconClass} text-blue-200`} />

  return <Sun className={`${iconClass} text-yellow-400`} />
}

const getSmallWeatherIcon = (iconCode: string) => {
  const iconClass = "h-6 w-6"

  if (iconCode.includes("01")) return <Sun className={`${iconClass} text-yellow-400`} />
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04"))
    return <Cloud className={`${iconClass} text-gray-200`} />
  if (iconCode.includes("09") || iconCode.includes("10") || iconCode.includes("11"))
    return <CloudRain className={`${iconClass} text-blue-400`} />
  if (iconCode.includes("13")) return <CloudSnow className={`${iconClass} text-blue-200`} />

  return <Sun className={`${iconClass} text-yellow-400`} />
}

interface ForecastViewProps {
  forecastData: ForecastData[]
  onBack: () => void
  isUsingMockData: boolean
}

export function ForecastView({ forecastData, onBack, isUsingMockData }: ForecastViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-900/10 via-transparent to-red-900/10 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-900/10 via-transparent to-orange-900/10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 px-6 py-8 max-w-none w-full">
        {/* ヘッダー */}
        <header className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 sm:space-x-3 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl transition-all duration-300 font-medium text-base sm:text-lg"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">日本ビューに戻る</span>
            </button>

            <div className="text-center w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-white bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent truncate break-words">
                🌤️ 名古屋 5日間天気予報
              </h1>
              {isUsingMockData && (
                <p className="text-yellow-400 text-base sm:text-lg mt-1 sm:mt-2">※ 模擬データを表示中</p>
              )}
            </div>

            <div className="hidden sm:block w-24"></div> {/* スペーサー */}
          </div>
        </header>

        {/* 5日間予報カード */}
        <div className="mb-8 sm:mb-12">
          {/* PC版（lg:以上）：元の構成 */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-8">
            {forecastData.map((day, index) => (
              <Card 
                key={index}
                className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border border-orange-400/30 text-white hover:scale-105 transition-all duration-300 cursor-pointer min-h-[400px]"
                onClick={() => setSelectedDay(selectedDay === index ? null : index)}
              >
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-orange-300 mb-2">{day.date}</div>
                    <div className="text-lg text-gray-300">{day.dayOfWeek}</div>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="h-20 w-20">
                      {getWeatherIcon(day.icon)}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-lg text-gray-300 mb-3">{day.description}</div>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-3xl font-bold text-orange-300">{day.maxTemp}°</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-3xl font-bold text-blue-300">{day.minTemp}°</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-3">
                        <Droplets className="h-6 w-6 text-blue-400" />
                        <span>{day.humidity}%</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Wind className="h-6 w-6 text-gray-400" />
                        <span>{day.windSpeed}m/s</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <div className="flex items-center justify-center space-x-2 text-lg text-gray-400">
                      {selectedDay === index ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                      <span>詳細表示</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* スマホ版（lg未満）：新しい構成 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:hidden">
            {forecastData.map((day, index) => (
              <>
                <Card 
                  key={index}
                  className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-lg border border-orange-400/30 text-white hover:scale-105 transition-all duration-300 cursor-pointer min-h-[300px] sm:min-h-[350px]"
                  onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-lg sm:text-xl font-bold text-orange-300 mb-1 sm:mb-2">{day.date}</div>
                      <div className="text-base sm:text-lg text-gray-300">{day.dayOfWeek}</div>
                    </div>

                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className="h-14 w-14 sm:h-20 sm:w-20">
                        {getWeatherIcon(day.icon)}
                      </div>
                    </div>

                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-base sm:text-lg text-gray-300 mb-1 sm:mb-3">{day.description}</div>
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        <span className="text-2xl sm:text-3xl font-bold text-orange-300">{day.maxTemp}°</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-2xl sm:text-3xl font-bold text-blue-300">{day.minTemp}°</span>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-4">
                      <div className="flex items-center justify-between text-base sm:text-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Wind className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                          <span>{day.windSpeed}m/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4 sm:mt-6">
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-base sm:text-lg text-gray-400">
                        {selectedDay === index ? <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" /> : <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />}
                        <span>詳細表示</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* スマホ版のみ：詳細を開いた日だけ、その直後に詳細カードを挿入 */}
                {selectedDay === index && (
                  <Card className="bg-gradient-to-br from-black/70 via-gray-900/50 to-black/70 backdrop-blur-xl border border-orange-400/40 text-white mb-6 sm:mb-8 col-span-1 sm:col-span-2">
                    <CardContent className="p-4 sm:p-8">
                      <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-4 sm:mb-6">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left">
                          {forecastData[selectedDay].date} ({forecastData[selectedDay].dayOfWeek}) の詳細予報
                        </h2>
                      </div>

                      {/* 3時間ごとの予報 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {forecastData[selectedDay].hourlyForecasts.map((hourly, hourIndex) => (
                          <div 
                            key={hourIndex}
                            className="bg-black/40 backdrop-blur-lg rounded-xl p-3 sm:p-6 text-center border border-gray-600/30 min-h-[120px] sm:min-h-[160px]"
                          >
                            <div className="text-base sm:text-lg font-bold text-orange-300 mb-2 sm:mb-4">{hourly.time}</div>
                            
                            <div className="flex justify-center mb-2 sm:mb-4">
                              <div className="h-8 w-8 sm:h-12 sm:w-12">
                                {getSmallWeatherIcon(hourly.icon)}
                              </div>
                            </div>

                            <div className="space-y-1 sm:space-y-3">
                              <div className="text-lg sm:text-2xl font-bold text-white">{hourly.temp}°</div>
                              <div className="text-xs sm:text-sm text-gray-300">{hourly.description}</div>
                              
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                                  <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                  <span>{hourly.humidity}%</span>
                                </div>
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                                  <Wind className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                  <span>{hourly.windSpeed}m/s</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ))}
          </div>
        </div>

        {/* PC版のみ：選択された日の詳細表示（元の位置） */}
        {selectedDay !== null && (
          <Card className="bg-gradient-to-br from-black/70 via-gray-900/50 to-black/70 backdrop-blur-xl border border-orange-400/40 text-white mb-8 hidden lg:block">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <Calendar className="h-8 w-8 text-orange-400" />
                <h2 className="text-3xl font-bold text-white">
                  {forecastData[selectedDay].date} ({forecastData[selectedDay].dayOfWeek}) の詳細予報
                </h2>
              </div>

              {/* 3時間ごとの予報 */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {forecastData[selectedDay].hourlyForecasts.map((hourly, hourIndex) => (
                  <div 
                    key={hourIndex}
                    className="bg-black/40 backdrop-blur-lg rounded-xl p-6 text-center border border-gray-600/30 min-h-[200px]"
                  >
                    <div className="text-lg font-bold text-orange-300 mb-4">{hourly.time}</div>
                    
                    <div className="flex justify-center mb-4">
                      <div className="h-12 w-12">
                        {getSmallWeatherIcon(hourly.icon)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-white">{hourly.temp}°</div>
                      <div className="text-sm text-gray-300">{hourly.description}</div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <Droplets className="h-4 w-4 text-blue-400" />
                          <span>{hourly.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <Wind className="h-4 w-4 text-gray-400" />
                          <span>{hourly.windSpeed}m/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <footer className="text-center text-gray-400">
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/30">
            <p className="text-lg">
              データ提供: OpenWeatherMap | 3時間ごとの予報データ
            </p>
            <p className="text-sm mt-2">
              各日をクリックすると3時間ごとの詳細予報が表示されます
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
} 