import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 環境変数の確認
console.log('Supabase Configuration Check:')
console.log('SUPABASE_URL configured:', !!supabaseUrl && supabaseUrl !== 'your_supabase_project_url_here')
console.log('SUPABASE_ANON_KEY configured:', !!supabaseKey && supabaseKey !== 'your_supabase_anon_key_here')
if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url_here') {
  console.log('SUPABASE_URL domain:', new URL(supabaseUrl).hostname)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

// データベースの型定義
export interface WeatherRecord {
  id?: number
  city: string
  country: string
  temperature: number
  feels_like: number
  humidity: number
  pressure: number
  visibility: number
  uv_index: number
  wind_speed: number
  wind_direction: number
  weather_description: string
  weather_icon: string
  sunrise: string
  sunset: string
  timezone: string
  created_at?: string
  recorded_at: string
}

// Supabase接続テスト関数
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // 環境変数チェック
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }
    
    if (!supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured')
    }

    // 簡単なクエリでテスト
    const { data, error } = await supabase
      .from('weather_records')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error }
    }

    console.log('✅ Supabase connection test successful')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
    return { success: false, error }
  }
}

// 天気データをSupabaseに保存する関数
export const saveWeatherData = async (weatherData: WeatherRecord[]) => {
  try {
    // 接続テストを先に実行
    const connectionTest = await testSupabaseConnection()
    if (!connectionTest.success) {
      return { success: false, error: connectionTest.error }
    }

    console.log(`💾 Attempting to save ${weatherData.length} weather records...`)
    
    const { data, error } = await supabase
      .from('weather_records')
      .insert(weatherData)
      .select()

    if (error) {
      console.error('❌ Weather data save error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error }
    }

    console.log(`✅ Successfully saved ${data.length} weather records to database`)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Weather data save error:', error)
    return { success: false, error }
  }
}

// 過去の天気データを取得する関数
export const getWeatherHistory = async (city?: string, hours?: number) => {
  try {
    let query = supabase
      .from('weather_records')
      .select('*')
      .order('recorded_at', { ascending: false })

    if (city) {
      query = query.eq('city', city)
    }

    if (hours) {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
      query = query.gte('recorded_at', since)
    }

    const { data, error } = await query.limit(1000)

    if (error) {
      console.error('Weather history fetch error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Weather history fetch error:', error)
    return { success: false, error }
  }
}

// 古いデータを削除する関数（データベースサイズ管理）
export const cleanupOldWeatherData = async (daysToKeep: number = 30) => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString()
    
    const { data, error } = await supabase
      .from('weather_records')
      .delete()
      .lt('recorded_at', cutoffDate)
      .select('id')

    if (error) {
      console.error('Weather data cleanup error:', error)
      return { success: false, error }
    }

    console.log(`🧹 Cleaned up ${data?.length || 0} old weather records`)
    return { success: true, deletedCount: data?.length || 0 }
  } catch (error) {
    console.error('Weather data cleanup error:', error)
    return { success: false, error }
  }
} 