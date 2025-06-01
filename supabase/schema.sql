-- 天気データ記録テーブル
CREATE TABLE IF NOT EXISTS public.weather_records (
    id BIGSERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    temperature REAL NOT NULL,
    feels_like REAL NOT NULL,
    humidity INTEGER NOT NULL,
    pressure REAL NOT NULL,
    visibility REAL NOT NULL,
    uv_index REAL NOT NULL,
    wind_speed REAL NOT NULL,
    wind_direction INTEGER NOT NULL,
    weather_description TEXT NOT NULL,
    weather_icon TEXT NOT NULL,
    sunrise TEXT NOT NULL,
    sunset TEXT NOT NULL,
    timezone TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成（クエリパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_weather_records_city ON public.weather_records(city);
CREATE INDEX IF NOT EXISTS idx_weather_records_recorded_at ON public.weather_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_weather_records_city_recorded_at ON public.weather_records(city, recorded_at);

-- 過去データを自動削除するための関数（30日以上古いデータを削除）
CREATE OR REPLACE FUNCTION cleanup_old_weather_data()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.weather_records 
    WHERE recorded_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- 週1回古いデータを自動削除するCronジョブ（pg_cronが有効な場合）
-- SELECT cron.schedule('cleanup-weather-data', '0 2 * * 0', 'SELECT cleanup_old_weather_data();');

-- Row Level Security (RLS) を有効化
ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー（誰でも読み取り可能）
CREATE POLICY "Weather records are viewable by everyone"
    ON public.weather_records FOR SELECT
    USING (true);

-- 挿入ポリシー（認証されたユーザーのみ挿入可能）
CREATE POLICY "Weather records are insertable by authenticated users"
    ON public.weather_records FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 統計情報を取得するためのビュー
CREATE OR REPLACE VIEW public.weather_stats AS
SELECT 
    city,
    country,
    COUNT(*) as record_count,
    AVG(temperature) as avg_temperature,
    MIN(temperature) as min_temperature,
    MAX(temperature) as max_temperature,
    AVG(humidity) as avg_humidity,
    MIN(recorded_at) as first_record,
    MAX(recorded_at) as last_record
FROM public.weather_records
GROUP BY city, country;

-- 最新の天気データを取得するためのビュー
CREATE OR REPLACE VIEW public.latest_weather AS
SELECT DISTINCT ON (city, country)
    *
FROM public.weather_records
ORDER BY city, country, recorded_at DESC; 