// 各都市のタイムゾーン情報（UTCからのオフセット時間）
export const CITY_TIMEZONES = {
  Tokyo: { name: "Tokyo", offset: 9 },
  "New York": { name: "New_York", offset: -5 }, // EST (冬時間)
  London: { name: "London", offset: 0 }, // GMT
  Paris: { name: "Paris", offset: 1 }, // CET
  Berlin: { name: "Berlin", offset: 1 }, // CET
  Sydney: { name: "Sydney", offset: 11 }, // AEDT (夏時間)
  Seoul: { name: "Seoul", offset: 9 },
  Beijing: { name: "Shanghai", offset: 8 },
  Mumbai: { name: "Kolkata", offset: 5.5 },
  "Sao Paulo": { name: "Sao_Paulo", offset: -3 }, // BRT
  Dubai: { name: "Dubai", offset: 4 },
  Cairo: { name: "Cairo", offset: 2 },
  Lagos: { name: "Lagos", offset: 1 },
  "Mexico City": { name: "Mexico_City", offset: -6 }, // CST
  Bangkok: { name: "Bangkok", offset: 7 },
} as const

// APIからの都市名をタイムゾーンキーにマッピング
const CITY_NAME_MAPPING: Record<string, keyof typeof CITY_TIMEZONES> = {
  // 日本語名
  "東京都": "Tokyo",
  "東京": "Tokyo",
  "ニューヨーク": "New York", 
  "ロンドン": "London",
  "パリ": "Paris",
  "ベルリン": "Berlin",
  "シドニー": "Sydney",
  "ソウル": "Seoul",
  "ソウル特別市": "Seoul",
  "北京": "Beijing",
  "北京市": "Beijing",
  "ムンバイ": "Mumbai",
  "サンパウロ": "Sao Paulo",
  "ドバイ": "Dubai",
  "カイロ": "Cairo",
  "ラゴス": "Lagos",
  "メキシコシティ": "Mexico City",
  "バンコク": "Bangkok",
  // 日本の都市名（県名→都市名）
  "愛知": "Tokyo", // 名古屋は東京時間と同じ（JST）
  "愛知県": "Tokyo",
  "名古屋": "Tokyo",
  "大阪": "Tokyo",
  "大阪府": "Tokyo",
  "広島": "Tokyo",
  "広島県": "Tokyo",
  "福岡": "Tokyo",
  "福岡県": "Tokyo",
  "石川": "Tokyo",
  "石川県": "Tokyo",
  "金沢": "Tokyo",
  "宮城": "Tokyo",
  "宮城県": "Tokyo",
  "仙台": "Tokyo",
  "北海道": "Tokyo",
  "札幌": "Tokyo",
  "沖縄": "Tokyo",
  "沖縄県": "Tokyo",
  "那覇": "Tokyo",
  // 英語名（そのまま）
  "Tokyo": "Tokyo",
  "New York": "New York",
  "London": "London", 
  "Paris": "Paris",
  "Berlin": "Berlin",
  "Sydney": "Sydney",
  "Seoul": "Seoul",
  "Beijing": "Beijing",
  "Mumbai": "Mumbai",
  "Sao Paulo": "Sao Paulo",
  "Dubai": "Dubai",
  "Cairo": "Cairo",
  "Lagos": "Lagos",
  "Mexico City": "Mexico City",
  "Bangkok": "Bangkok",
}

// 都市名を標準化する関数
function normalizeCityName(cityName: string): keyof typeof CITY_TIMEZONES | null {
  // 直接マッピングを確認
  if (CITY_NAME_MAPPING[cityName]) {
    return CITY_NAME_MAPPING[cityName]
  }
  
  // CITY_TIMEZONESに直接存在するかチェック
  if (cityName in CITY_TIMEZONES) {
    return cityName as keyof typeof CITY_TIMEZONES
  }
  
  // 部分マッチを試行
  const normalizedInput = cityName.toLowerCase().trim()
  for (const [key, value] of Object.entries(CITY_NAME_MAPPING)) {
    if (key.toLowerCase().includes(normalizedInput) || normalizedInput.includes(key.toLowerCase())) {
      return value
    }
  }
  
  console.warn(`🚨 Cannot normalize city name: "${cityName}"`)
  return null
}

export type CityName = keyof typeof CITY_TIMEZONES

// 指定された都市の現在時刻を取得（正確なUTC+オフセット方式）
export function getCityTime(cityName: string): {
  time: string
  date: string
  timezone: string
} {
  const normalizedName = normalizeCityName(cityName)
  const cityInfo = normalizedName ? CITY_TIMEZONES[normalizedName] : null
  
  if (!cityInfo) {
    console.warn(`❌ Unknown city: "${cityName}" (normalized: ${normalizedName})`)
    return { time: "--:--", date: "--/--", timezone: "UTC" }
  }
  
  try {
    // 現在のUTC時刻を取得（正確な方法）
    const now = new Date()
    
    // 都市の時刻を計算（UTCに都市のオフセットを追加）
    const cityTimeMs = now.getTime() + (cityInfo.offset * 3600000)
    const cityTime = new Date(cityTimeMs)
    
    // 時刻フォーマット（UTC時刻として扱う）
    const hours = cityTime.getUTCHours().toString().padStart(2, '0')
    const minutes = cityTime.getUTCMinutes().toString().padStart(2, '0')
    const timeString = `${hours}:${minutes}`
    
    // 日付フォーマット
    const dateString = cityTime.toLocaleDateString('ja-JP', {
      timeZone: 'UTC',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    })
    
    console.log(`🌍 ${cityName} → ${normalizedName}: UTC${cityInfo.offset >= 0 ? '+' : ''}${cityInfo.offset} = ${timeString}`)
    console.log(`📅 Debug: UTC=${now.toISOString()}, CityTime=${cityTime.toISOString()}`)
    
    return {
      time: timeString,
      date: dateString,
      timezone: cityInfo.name,
    }
  } catch (error) {
    console.error(`❌ Failed to get time for ${cityName}:`, error)
    return { time: "--:--", date: "--/--", timezone: "UTC" }
  }
}

// タイムゾーンオフセットを取得
export function getTimezoneOffset(cityName: string): string {
  const normalizedName = normalizeCityName(cityName)
  const cityInfo = normalizedName ? CITY_TIMEZONES[normalizedName] : null
  
  if (!cityInfo) {
    return "UTC+0"
  }
  
  const offset = cityInfo.offset
  return `UTC${offset >= 0 ? '+' : ''}${offset}`
}

// 昼夜判定（正確なUTC+オフセット方式）
export function isDaytime(cityName: string): boolean {
  const normalizedName = normalizeCityName(cityName)
  const cityInfo = normalizedName ? CITY_TIMEZONES[normalizedName] : null
  
  if (!cityInfo) {
    return true
  }
  
  try {
    // 現在のUTC時刻を取得
    const now = new Date()
    
    // 都市の時刻を計算
    const cityTimeMs = now.getTime() + (cityInfo.offset * 3600000)
    const cityTime = new Date(cityTimeMs)
    const hour = cityTime.getUTCHours()
    
    const isDayTime = hour >= 6 && hour < 18
    console.log(`🌅 ${cityName} → ${normalizedName}: hour=${hour}, isDaytime=${isDayTime}`)
    
    return isDayTime
  } catch (error) {
    console.warn(`Failed to determine day/night for ${cityName}:`, error)
    return true
  }
}

// 各都市の緯度経度情報（日の出・日の入り、UV計算用）
export const CITY_COORDINATES = {
  Tokyo: { lat: 35.6762, lon: 139.6503 },
  "New York": { lat: 40.7128, lon: -74.0060 },
  London: { lat: 51.5074, lon: -0.1278 },
  Paris: { lat: 48.8566, lon: 2.3522 },
  Berlin: { lat: 52.5200, lon: 13.4050 },
  Sydney: { lat: -33.8688, lon: 151.2093 },
  Seoul: { lat: 37.5665, lon: 126.9780 },
  Beijing: { lat: 39.9042, lon: 116.4074 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  "Sao Paulo": { lat: -23.5558, lon: -46.6396 },
  Dubai: { lat: 25.2048, lon: 55.2708 },
  Cairo: { lat: 30.0444, lon: 31.2357 },
  Lagos: { lat: 6.5244, lon: 3.3792 },
  "Mexico City": { lat: 19.4326, lon: -99.1332 },
  Bangkok: { lat: 13.7563, lon: 100.5018 },
} as const

// 日本の主要都市座標
export const JAPAN_CITIES = {
  "愛知": { lat: 35.1815, lon: 136.9066, name: "名古屋" }, // 名古屋
  "東京": { lat: 35.6762, lon: 139.6503, name: "東京" },
  "大阪": { lat: 34.6937, lon: 135.5023, name: "大阪" },
  "広島": { lat: 34.3853, lon: 132.4553, name: "広島" },
  "福岡": { lat: 33.5904, lon: 130.4017, name: "福岡" },
  "石川": { lat: 36.5944, lon: 136.6256, name: "金沢" }, // 金沢
  "宮城": { lat: 38.2682, lon: 140.8694, name: "仙台" }, // 仙台
  "北海道": { lat: 43.0642, lon: 141.3469, name: "札幌" }, // 札幌
  "沖縄": { lat: 26.2124, lon: 127.6792, name: "那覇" }, // 那覇
} as const

export type JapanCityName = keyof typeof JAPAN_CITIES

// 簡易的な日の出・日の入り時刻計算
export function calculateSunriseSunset(cityName: string): { sunrise: string, sunset: string } {
  const normalizedName = normalizeCityName(cityName)
  const coords = normalizedName ? CITY_COORDINATES[normalizedName] : null
  
  if (!coords) {
    return { sunrise: "06:00", sunset: "18:00" }
  }
  
  // 簡易的な計算（緯度に基づく）
  const lat = coords.lat
  const latRad = (lat * Math.PI) / 180
  
  // 年中の平均的な日の出・日の入り時刻を緯度から推定
  // 赤道付近：6:00-18:00、高緯度：変動大
  const baseHour = 6
  const latitudeEffect = Math.abs(lat) / 90 * 2 // 最大2時間の変動
  
  let sunriseHour = baseHour
  let sunsetHour = 18
  
  // 北半球と南半球で季節を逆転
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  
  // 夏至・冬至効果（簡易版）
  let seasonalEffect = 0
  if (month >= 3 && month <= 9) {
    // 春〜夏（北半球）
    seasonalEffect = lat > 0 ? latitudeEffect : -latitudeEffect
  } else {
    // 秋〜冬（北半球）
    seasonalEffect = lat > 0 ? -latitudeEffect : latitudeEffect
  }
  
  sunriseHour = Math.max(4, Math.min(8, baseHour - seasonalEffect))
  sunsetHour = Math.max(16, Math.min(20, 18 + seasonalEffect))
  
  const sunrise = `${Math.floor(sunriseHour).toString().padStart(2, '0')}:${Math.floor((sunriseHour % 1) * 60).toString().padStart(2, '0')}`
  const sunset = `${Math.floor(sunsetHour).toString().padStart(2, '0')}:${Math.floor((sunsetHour % 1) * 60).toString().padStart(2, '0')}`
  
  return { sunrise, sunset }
}

// 高度なUV指数計算（太陽高度、オゾン、雲量などを考慮）
export function calculateAdvancedUVIndex(cityName: string, cloudCoverage?: number): number {
  const normalizedName = normalizeCityName(cityName)
  let coords: { lat: number; lon: number } | null = normalizedName ? CITY_COORDINATES[normalizedName] : null
  
  // CITY_COORDINATESにない場合はJAPAN_CITIESを確認
  if (!coords && cityName in JAPAN_CITIES) {
    const japanCity = JAPAN_CITIES[cityName as keyof typeof JAPAN_CITIES]
    coords = { lat: japanCity.lat, lon: japanCity.lon }
  }
  
  const cityInfo = normalizedName ? CITY_TIMEZONES[normalizedName] : null
  
  if (!coords) {
    return 5 // デフォルト値
  }
  
  // 現在の都市時刻を取得（正確な方法）
  const now = new Date()
  let cityTimeMs = now.getTime()
  
  // タイムゾーン情報がある場合はそれを使用、ない場合は日本時間を仮定
  if (cityInfo) {
    cityTimeMs = now.getTime() + (cityInfo.offset * 3600000)
  } else {
    // 日本の都市の場合はJST（UTC+9）を使用
    cityTimeMs = now.getTime() + (9 * 3600000)
  }
  
  const cityTime = new Date(cityTimeMs)
  const hour = cityTime.getUTCHours()
  const minute = cityTime.getUTCMinutes()
  const month = now.getMonth() + 1
  const dayOfYear = Math.floor((cityTime.getTime() - new Date(cityTime.getFullYear(), 0, 0).getTime()) / 86400000)
  
  // 1. 太陽高度角の計算
  const lat = coords.lat * Math.PI / 180 // ラジアンに変換
  const timeDecimal = hour + minute / 60
  
  // 太陽の赤緯（太陽の位置）
  const declination = 23.45 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365) * Math.PI / 180
  
  // 時角（正午からの時間）
  const hourAngle = (timeDecimal - 12) * 15 * Math.PI / 180
  
  // 太陽高度角
  const solarElevation = Math.asin(
    Math.sin(lat) * Math.sin(declination) + 
    Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle)
  )
  
  const solarElevationDegrees = solarElevation * 180 / Math.PI
  
  // 太陽が地平線以下の場合はUV=0
  if (solarElevationDegrees <= 0) {
    return 0
  }
  
  // 2. 太陽高度補正係数（0-1）
  const solarElevationFactor = Math.sin(solarElevation)
  
  // 3. オゾン補正係数（緯度と季節による）
  let ozoneFactor = 1.0
  const absLat = Math.abs(coords.lat)
  
  // 緯度によるオゾン量の違い
  if (absLat < 20) { // 熱帯
    ozoneFactor = 0.95 // オゾンが少ない
  } else if (absLat < 40) { // 亜熱帯
    ozoneFactor = 1.0
  } else if (absLat < 60) { // 温帯
    ozoneFactor = 1.05 // オゾンが多い
  } else { // 寒帯
    ozoneFactor = 1.1
  }
  
  // 季節によるオゾン層の変動
  if (coords.lat > 0) { // 北半球
    if (month >= 3 && month <= 5) ozoneFactor *= 1.05 // 春にオゾンホール
    if (month >= 9 && month <= 11) ozoneFactor *= 0.95 // 秋にオゾン減少
  } else { // 南半球（季節逆転）
    if (month >= 9 && month <= 11) ozoneFactor *= 1.05
    if (month >= 3 && month <= 5) ozoneFactor *= 0.95
  }
  
  // 4. 雲量補正係数
  const cloudFactor = cloudCoverage !== undefined 
    ? Math.max(0.3, 1.0 - (cloudCoverage / 100) * 0.7) // 雲量に応じて20-70%削減
    : 0.85 // デフォルト（軽い雲想定）
  
  // 5. 大気透明度補正（標高と大気汚染）
  let atmosphereFactor = 1.0
  
  // 都市の大気汚染レベル（簡易推定）
  const pollutionIndex: Record<string, number> = {
    "Tokyo": 0.9,
    "New York": 0.85,
    "London": 0.9,
    "Paris": 0.85,
    "Berlin": 0.9,
    "Sydney": 0.95,
    "Seoul": 0.8,
    "Beijing": 0.7, // 大気汚染が深刻
    "Mumbai": 0.75,
    "Sao Paulo": 0.8,
    "Dubai": 0.95, // 砂漠地帯、清澄
    "Cairo": 0.9,
    "Lagos": 0.85,
    "Mexico City": 0.8, // 高標高だが汚染もある
    "Bangkok": 0.8,
  }
  
  atmosphereFactor = normalizedName ? (pollutionIndex[normalizedName] || 0.9) : 0.9
  
  // 6. 地表面反射係数（簡易）
  let reflectionFactor = 1.0
  if (month >= 12 || month <= 2) {
    // 冬季の雪反射（北半球の高緯度地域）
    if (coords.lat > 40) reflectionFactor = 1.1
  }
  
  // 砂漠地帯の反射
  if (normalizedName === "Dubai" || normalizedName === "Cairo") {
    reflectionFactor = 1.05
  }
  
  // 7. 基準UV値（緯度ベース）
  let baseUV = 12 // 最大値
  if (absLat > 60) baseUV = 6
  else if (absLat > 45) baseUV = 8
  else if (absLat > 30) baseUV = 10
  else baseUV = 12
  
  // 8. 最終計算
  const uvIndex = baseUV * 
    solarElevationFactor * 
    (1 / ozoneFactor) * // オゾンが少ないほどUV増加
    cloudFactor * 
    atmosphereFactor * 
    reflectionFactor
  
  // 10段階に正規化（0-10）
  const normalizedUV = Math.round(Math.max(0, Math.min(10, uvIndex)))
  
  console.log(`🌞 ${cityName} UV計算: 太陽高度=${solarElevationDegrees.toFixed(1)}°, UV=${normalizedUV}`)
  
  return normalizedUV
}

// 既存のUV指数計算（簡易版、後方互換性のため残す）
export function calculateUVIndex(cityName: string): number {
  return calculateAdvancedUVIndex(cityName)
}

