# 世界天気ダッシュボード

リアルタイムで世界各国の天気情報を表示し、Supabaseデータベースに自動保存する Next.js アプリケーションです。

## 🌟 主な機能

- **リアルタイム現在時刻表示**: 1秒ごとに更新される時計
- **世界15都市の天気情報**: OpenWeatherMap APIを使用した正確な天気データ
- **10分間隔の自動更新**: 天気データの自動取得・更新
- **Supabaseデータベース連携**: 天気データの自動保存・履歴管理
- **レスポンシブデザイン**: モバイル・デスクトップ対応の美しいUI
- **エラーハンドリング**: API障害時のモックデータ表示

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. OpenWeatherMap API キーの取得

1. [OpenWeatherMap](https://openweathermap.org/api) にアカウントを作成
2. API キーを取得

### 3. Supabase プロジェクトの設定

#### 3.1 Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com) にアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトURL と anon キーを取得

#### 3.2 データベーススキーマの設定
Supabaseダッシュボードの SQL Editor で `supabase/schema.sql` の内容を実行してください：

```sql
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

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_weather_records_city ON public.weather_records(city);
CREATE INDEX IF NOT EXISTS idx_weather_records_recorded_at ON public.weather_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_weather_records_city_recorded_at ON public.weather_records(city, recorded_at);
```

### 4. 環境変数の設定

`.env.local` ファイルを作成し、以下の内容を設定：

```env
# OpenWeatherMap API
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. アプリケーションの起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションを確認してください。

## 📊 データベース構造

### weather_records テーブル

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | BIGSERIAL | 主キー |
| city | TEXT | 都市名 |
| country | TEXT | 国コード |
| temperature | REAL | 気温（℃） |
| feels_like | REAL | 体感温度（℃） |
| humidity | INTEGER | 湿度（%） |
| pressure | REAL | 気圧（hPa） |
| visibility | REAL | 視界（km） |
| uv_index | REAL | UV指数 |
| wind_speed | REAL | 風速（m/s） |
| wind_direction | INTEGER | 風向（度） |
| weather_description | TEXT | 天気の説明 |
| weather_icon | TEXT | 天気アイコンコード |
| sunrise | TEXT | 日の出時刻 |
| sunset | TEXT | 日の入時刻 |
| timezone | TEXT | タイムゾーン |
| recorded_at | TIMESTAMPTZ | データ記録時刻 |
| created_at | TIMESTAMPTZ | レコード作成時刻 |

## 🔧 最適化のポイント

### パフォーマンス
- 10分間隔での自動更新により API制限を回避
- Next.js の ISR (Incremental Static Regeneration) によるキャッシング
- データベースインデックスによる高速クエリ

### 拡張性
- **新しい都市の追加**: `actions/weather-actions.ts` の `CITIES` 配列に追加
- **データ保存間隔の変更**: `weather-app.tsx` の `setInterval` 値を調整
- **API データの拡張**: OpenWeatherMap の他のエンドポイント利用可能
- **分析機能**: Supabase のビューを活用した統計データ取得

### データ管理
- 30日以上古いデータの自動削除機能
- Row Level Security (RLS) によるセキュリティ
- 統計情報取得用のビュー

## 📈 今後の拡張案

1. **天気予報の追加**: 5日間予報の表示
2. **グラフ表示**: 温度・湿度の時系列グラフ
3. **アラート機能**: 特定条件での通知
4. **地図表示**: 世界地図上での天気表示
5. **ユーザー設定**: 表示都市のカスタマイズ
6. **API の追加**: 複数の天気APIの併用
7. **モバイルアプリ**: React Native による展開

## 🛠️ 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **API**: OpenWeatherMap
- **Deployment**: Vercel 推奨

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！ 