"use client"

import { useState, useEffect } from "react"
import { WeatherCard, JapanWeatherCard } from "./components/weather-card"
import { ForecastView } from "./components/forecast-view"
import { fetchAndSaveWeatherData, fetchJapanWeatherData, fetchNagoyaForecast, type WeatherData, type ForecastData } from "./actions/weather-actions"
import { Globe, RefreshCw, Clock, AlertCircle, AlertTriangle, Database, CheckCircle, XCircle, ArrowLeft } from "lucide-react"

export default function WeatherApp() {
  const [weatherList, setWeatherList] = useState<WeatherData[]>([])
  const [japanWeatherList, setJapanWeatherList] = useState<WeatherData[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingJapan, setIsLoadingJapan] = useState(false)
  const [isLoadingForecast, setIsLoadingForecast] = useState(false)
  const [showJapanView, setShowJapanView] = useState(false)
  const [showForecastView, setShowForecastView] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [isForecastMockData, setIsForecastMockData] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [dbSaveStatus, setDbSaveStatus] = useState<{
    saved: boolean;
    error?: any;
    lastSaved?: Date;
  }>({ saved: false })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const loadWeatherData = async () => {
    try {
      setError(null)
      console.log("🌍 Loading weather data...")
      const { data, isUsingMockData, savedToDatabase, saveError } = await fetchAndSaveWeatherData()

      if (data.length === 0) {
        setError("天気データを取得できませんでした。しばらく後にお試しください。")
      } else {
        setWeatherList(data)
        setLastUpdated(new Date())
        setIsUsingMockData(isUsingMockData)

        setDbSaveStatus({
          saved: savedToDatabase,
          error: saveError,
          lastSaved: savedToDatabase ? new Date() : dbSaveStatus.lastSaved
        })

        if (isUsingMockData) {
          console.log(`📊 Loaded ${data.length} cities with mock data`)
        } else {
          console.log(`🌤️ Successfully loaded real weather data for ${data.length} cities!`)
        }

        if (savedToDatabase) {
          console.log(`💾 Weather data saved to database successfully`)
        } else if (saveError) {
          console.warn(`⚠️ Failed to save weather data to database:`, saveError)
        }
      }
    } catch (err) {
      console.error("Weather fetch error:", err)
      setError("天気データの取得に失敗しました。")
      setIsUsingMockData(true)
      setDbSaveStatus({ saved: false, error: err })
    } finally {
      setIsLoading(false)
    }
  }

  // 日本の都市データを読み込む関数
  const loadJapanWeatherData = async () => {
    try {
      setIsLoadingJapan(true)
      console.log("🇯🇵 Loading Japan weather data...")
      const { data, isUsingMockData } = await fetchJapanWeatherData()

      if (data.length === 0) {
        setError("日本の天気データを取得できませんでした。")
      } else {
        setJapanWeatherList(data)
        console.log(`🌸 Successfully loaded weather data for ${data.length} Japan cities!`)
      }
    } catch (err) {
      console.error("Japan weather fetch error:", err)
      setError("日本の天気データの取得に失敗しました。")
    } finally {
      setIsLoadingJapan(false)
    }
  }

  // 名古屋の予報データを読み込む関数
  const loadNagoyaForecast = async () => {
    try {
      setIsLoadingForecast(true)
      console.log("🌤️ Loading Nagoya forecast data...")
      const { data, isUsingMockData } = await fetchNagoyaForecast()

      if (data.length === 0) {
        setError("名古屋の予報データを取得できませんでした。")
      } else {
        setForecastData(data)
        setIsForecastMockData(isUsingMockData)
        console.log(`📅 Successfully loaded forecast data for Nagoya!`)
      }
    } catch (err) {
      console.error("Nagoya forecast fetch error:", err)
      setError("名古屋の予報データの取得に失敗しました。")
    } finally {
      setIsLoadingForecast(false)
    }
  }

  // 東京カードクリック時の処理
  const handleTokyoClick = () => {
    if (!showJapanView && japanWeatherList.length === 0) {
      loadJapanWeatherData()
    }
    setShowJapanView(true)
    setShowForecastView(false)
  }

  // 名古屋カードクリック時の処理
  const handleNagoyaClick = () => {
    if (forecastData.length === 0) {
      loadNagoyaForecast()
    }
    setShowForecastView(true)
  }

  // 世界ビューに戻る
  const handleBackToWorld = () => {
    setShowJapanView(false)
    setShowForecastView(false)
  }

  // 日本ビューに戻る
  const handleBackToJapan = () => {
    setShowForecastView(false)
    setShowJapanView(true)
  }

  useEffect(() => {
    // 初回読み込み
    loadWeatherData()

    // 10分おきに更新
    const interval = setInterval(
      () => {
        console.log("Auto-updating weather data...")
        loadWeatherData()
      },
      10 * 60 * 1000,
    ) // 10分 = 600,000ms

    return () => clearInterval(interval)
  }, [])

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleManualRefresh = () => {
    setIsLoading(true)
    loadWeatherData()
  }

  // 予報ビュー表示
  if (showForecastView) {
    if (isLoadingForecast && forecastData.length === 0) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-24 w-24 mx-auto mb-8 text-orange-400 animate-spin" />
            <p className="text-3xl font-semibold">名古屋の天気予報を読み込み中...</p>
          </div>
        </div>
      )
    }

    return (
      <ForecastView 
        forecastData={forecastData}
        onBack={handleBackToJapan}
        isUsingMockData={isForecastMockData}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 動的背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-900/10 via-transparent to-indigo-900/10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-bounce delay-500"></div>
      </div>

      {/* グリッドパターンオーバーレイ */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 px-6 py-8 max-w-none w-full">
        <header className="mb-12">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Globe className="h-14 w-14 text-cyan-400 animate-spin-slow" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"></div>
              </div>
              <div>
                <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                  世界天気ダッシュボード
                </h1>
                <p className="text-gray-300 text-lg xl:text-xl mt-2">リアルタイム天気情報 - 10分おきに自動更新・DB保存</p>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row items-center space-y-6 xl:space-y-0 xl:space-x-8">
              {/* 現在時刻表示 */}
              <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-lg rounded-2xl px-6 py-4 border border-cyan-500/20">
                <Clock className="h-8 w-8 text-cyan-400" />
                <span className="text-xl xl:text-2xl font-mono font-bold text-cyan-300">
                  {formatCurrentTime(currentTime)}
                </span>
              </div>

              <div className="flex items-center space-x-6">
                {lastUpdated && (
                  <div className="flex items-center space-x-3 text-gray-300 bg-black/30 rounded-lg px-4 py-2">
                    <RefreshCw className="h-5 w-5" />
                    <span>最終更新: {formatLastUpdated(lastUpdated)}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5" />
                  {dbSaveStatus.saved ? (
                    <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 rounded-lg px-3 py-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>DB保存済み</span>
                      {dbSaveStatus.lastSaved && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({formatLastUpdated(dbSaveStatus.lastSaved)})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 rounded-lg px-3 py-1">
                      <XCircle className="h-4 w-4" />
                      <span>DB保存失敗</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl transition-all duration-300 font-medium text-lg shadow-lg shadow-cyan-500/25"
                >
                  <RefreshCw className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`} />
                  <span>更新</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-red-900/30 backdrop-blur-lg border border-red-500/30 rounded-2xl flex items-center space-x-4">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-lg">{error}</p>
          </div>
        )}

        {dbSaveStatus.error && !dbSaveStatus.saved && (
          <div className="mb-8 p-6 bg-yellow-900/20 backdrop-blur-lg border border-yellow-500/30 rounded-2xl flex items-center space-x-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 text-lg">データベースへの保存に失敗しました。</p>
              <p className="text-yellow-400/70 text-base mt-1">
                Supabaseの設定を確認してください。天気データの表示は継続されます。
              </p>
            </div>
          </div>
        )}

        {isUsingMockData && !error && (
          <div className="mb-8 p-6 bg-yellow-900/20 backdrop-blur-lg border border-yellow-500/30 rounded-2xl flex items-center space-x-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 text-lg">模擬データを表示中です。</p>
              <p className="text-yellow-400/70 text-base mt-1">
                APIキーの確認中、またはAPI制限に達している可能性があります。
              </p>
            </div>
          </div>
        )}

        {isLoading && weatherList.length === 0 ? (
          <div className="text-center text-gray-300 mt-32">
            <RefreshCw className="h-24 w-24 mx-auto mb-8 text-cyan-400 animate-spin" />
            <p className="text-3xl font-semibold">天気データを読み込み中...</p>
            <p className="text-xl mt-4 text-gray-400">初回読み込みには少し時間がかかる場合があります</p>
          </div>
        ) : weatherList.length === 0 ? (
          <div className="text-center text-gray-300 mt-32">
            <Globe className="h-24 w-24 mx-auto mb-8 text-gray-500" />
            <p className="text-3xl font-semibold">天気データがありません</p>
            <p className="text-xl mt-4 text-gray-400">更新ボタンを押して再試行してください</p>
          </div>
        ) : (
          <>
            {/* ビュー切り替えヘッダー */}
            {showJapanView && (
              <div className="mb-8 flex items-center justify-between">
                <button
                  onClick={handleBackToWorld}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl transition-all duration-300 font-medium text-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>世界ビューに戻る</span>
                </button>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                    🇯🇵 日本の主要都市
                  </h2>
                  <p className="text-gray-300 mt-2">9都市の天気情報</p>
                </div>
                <div></div> {/* スペーサー */}
              </div>
            )}

            <div className="mb-8 text-center">
              <p className="text-gray-300 text-xl">
                {showJapanView 
                  ? `${japanWeatherList.length}都市の日本天気情報を表示中`
                  : `${weatherList.length}都市の世界天気情報を表示中`
                }
                {(isLoading || isLoadingJapan) && <span className="ml-3 text-cyan-400">（更新中...）</span>}
              </p>
            </div>
            
            {/* 横スクロールレイアウト */}
            <div className="relative">
              <div className="overflow-x-auto pb-8 scrollbar-hide">
                {showJapanView ? (
                  <div className="flex space-x-8 min-w-max px-8">
                    {isLoadingJapan ? (
                      <div className="text-center text-gray-300 w-full">
                        <RefreshCw className="h-16 w-16 mx-auto mb-4 text-cyan-400 animate-spin" />
                        <p className="text-xl font-semibold">日本の天気データを読み込み中...</p>
                      </div>
                    ) : (
                      japanWeatherList.map((weather) => (
                        <JapanWeatherCard 
                          key={`japan-${weather.city}`} 
                          weather={weather}
                          onClick={weather.city === "愛知" || weather.city === "名古屋" ? handleNagoyaClick : undefined}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <div className="flex space-x-12 min-w-max px-8">
                    {weatherList.map((weather) => (
                      <WeatherCard 
                        key={`${weather.city}-${weather.country}`} 
                        weather={weather} 
                        onClick={weather.city === "Tokyo" || weather.city === "東京都" || weather.city === "東京" ? handleTokyoClick : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* スクロールヒント */}
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-3 text-gray-400 text-lg bg-black/30 rounded-full px-6 py-3">
                  <span>←</span>
                  <span>横スクロールで他の都市を表示</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </>
        )}

        <footer className="mt-16 text-center text-gray-400">
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/30">
            <p className="text-xl mb-4 text-gray-300">
              {isUsingMockData
                ? "模擬データを使用中 | 自動更新・DB保存間隔: 10分"
                : "データ提供: OpenWeatherMap | 自動更新・DB保存間隔: 10分"}
            </p>
            <p className="mb-6 text-lg">
              データベース: Supabase {dbSaveStatus.saved ? "✅" : "❌"}
            </p>
            <div className="text-sm text-gray-500 space-y-2">
              <p>各都市の現在時刻は1分ごとに更新されます</p>
              <p>天気データは10分ごとに自動更新され、Supabaseデータベースに保存されます</p>
              <p>🌤️ 名古屋をクリックすると5日間の詳細天気予報が表示されます</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
