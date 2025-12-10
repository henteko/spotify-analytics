# Spotify Analytics

Spotify Podcast Analytics CLI & Library - Spotify Podcast APIからアナリティクスデータを取得するTypeScriptライブラリおよびCLIツール。

## 特徴

- **CLIツール**: コマンドラインから直接実行してCSV/JSON形式で標準出力
- **ライブラリ**: 他のNode.js/TypeScriptプロジェクトからimportして使用
- **型安全**: 完全なTypeScript型定義
- **堅牢なエラーハンドリング**: リトライ機構とわかりやすいエラーメッセージ
- **シンプルな設定**: `.env`ファイルによる環境変数管理

## インストール

```bash
# 依存関係のインストール
npm install
```

## セットアップ

### 1. 認証情報の取得

以下の手順でSpotifyの認証情報を取得します：

1. https://creators.spotify.com にログイン
2. ブラウザの開発者ツールを開く（F12）
3. Application/Storage → Cookies → https://creators.spotify.com
4. `sp_dc` と `sp_key` の値をコピー

### 2. 環境変数の設定

`.env`ファイルを作成して認証情報を設定します：

```bash
# initコマンドで対話的に作成
npm run dev -- init

# または手動で作成
cp .env.example .env
# .envファイルを編集して認証情報を設定
```

`.env`ファイルの内容：

```bash
SPOTIFY_SP_DC=your_sp_dc_cookie_here
SPOTIFY_SP_KEY=your_sp_key_cookie_here
SPOTIFY_CLIENT_ID=05a1371ee5194c27860b3ff3ff3979d2
```

## 使用方法

### CLIツールとして実行

出力は標準出力に表示されます。ファイルに保存する場合はリダイレクトを使用します。

```bash
# ストリーム数を取得（CSV形式）
npm run dev -- streams --podcast-id YOUR_PODCAST_ID --start 2024-01-01 --end 2024-01-31

# ファイルに保存
npm run dev -- streams --podcast-id YOUR_PODCAST_ID --start 2024-01-01 > streams.csv

# JSON形式で出力
npm run dev -- episodes --podcast-id YOUR_PODCAST_ID --start 2024-01-01 -f json

# JSON形式でファイルに保存
npm run dev -- episodes --podcast-id YOUR_PODCAST_ID --start 2024-01-01 -f json > episodes.json

# API生レスポンスを出力（デバッグ用）
npm run dev -- streams --podcast-id YOUR_PODCAST_ID --start 2024-01-01 --raw
```

### ライブラリとして使用

```typescript
import { SpotifyAnalytics } from './src';

const analytics = new SpotifyAnalytics({
  credentials: {
    sp_dc: process.env.SPOTIFY_SP_DC!,
    sp_key: process.env.SPOTIFY_SP_KEY!,
    client_id: process.env.SPOTIFY_CLIENT_ID,
  }
});

// ストリーム数を取得
const streams = await analytics.getStreams({
  podcastId: 'YOUR_PODCAST_ID',
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31')
});

console.log(streams);

// エピソード一覧を取得
const episodes = await analytics.getEpisodes({
  podcastId: 'YOUR_PODCAST_ID',
  start: new Date('2024-01-01'),
  limit: 10
});

console.log(episodes);
```

## 前提条件

このツールを使用するには、以下が必要です：

1. **Spotify for Podcastersアカウント**
   - https://creators.spotify.com でアカウントを作成
   - ポッドキャストを登録・管理している必要があります

2. **認証情報（Cookie）**
   - `sp_dc`と`sp_key`をブラウザから取得
   - `.env`ファイルに保存

> **注意**: ポッドキャストが登録されていないアカウントでは、データを取得できません。

## CLIコマンド一覧

### `init`
`.env`ファイルを対話的に作成します。

```bash
npm run dev -- init
```

### `me`
現在のユーザー情報を表示します（認証確認用）。

```bash
npm run dev -- me
```

### `episodes`
エピソード一覧を取得します。

```bash
# CSV形式（デフォルト）
npm run dev -- episodes --podcast-id YOUR_ID --start 2024-01-01

# 最大取得数を指定
npm run dev -- episodes --podcast-id YOUR_ID --start 2024-01-01 --limit 10

# JSON形式で出力
npm run dev -- episodes --podcast-id YOUR_ID --start 2024-01-01 -f json

# ファイルに保存
npm run dev -- episodes --podcast-id YOUR_ID --start 2024-01-01 > episodes.csv
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--start <date>`: 開始日 (YYYY-MM-DD)
- `--end <date>`: 終了日 (YYYY-MM-DD)
- `--limit <number>`: 最大取得数
- `-f, --format <format>`: 出力形式 (`csv` または `json`、デフォルト: `csv`)
- `--raw`: API生レスポンスを出力（デバッグ用）

### `streams`
ストリーム数データを取得します。

```bash
# CSV形式（デフォルト）
npm run dev -- streams --podcast-id YOUR_ID --start 2024-01-01 --end 2024-01-31

# JSON形式で出力
npm run dev -- streams --podcast-id YOUR_ID --start 2024-01-01 -f json

# 特定のエピソードのみ
npm run dev -- streams --podcast-id YOUR_ID --episode-id EPISODE_ID --start 2024-01-01

# ファイルに保存
npm run dev -- streams --podcast-id YOUR_ID --start 2024-01-01 > streams.csv

# API生レスポンス出力
npm run dev -- streams --podcast-id YOUR_ID --start 2024-01-01 --raw
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--start <date>` (必須): 開始日 (YYYY-MM-DD)
- `--end <date>`: 終了日 (YYYY-MM-DD)
- `--episode-id <id>`: 特定のエピソードID
- `-f, --format <format>`: 出力形式 (`csv` または `json`、デフォルト: `csv`)
- `--raw`: API生レスポンスを出力（デバッグ用）

### `listeners`
リスナー数データを取得します。

```bash
# CSV形式（デフォルト）
npm run dev -- listeners --podcast-id YOUR_ID --start 2024-01-01 --end 2024-01-31

# JSON形式で出力
npm run dev -- listeners --podcast-id YOUR_ID --start 2024-01-01 -f json

# 特定のエピソードのみ
npm run dev -- listeners --podcast-id YOUR_ID --episode-id EPISODE_ID --start 2024-01-01

# ファイルに保存
npm run dev -- listeners --podcast-id YOUR_ID --start 2024-01-01 > listeners.csv
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--start <date>` (必須): 開始日 (YYYY-MM-DD)
- `--end <date>`: 終了日 (YYYY-MM-DD)
- `--episode-id <id>`: 特定のエピソードID
- `-f, --format <format>`: 出力形式 (`csv` または `json`、デフォルト: `csv`)
- `--raw`: API生レスポンスを出力（デバッグ用）

### `followers`
フォロワー数データを取得します。

```bash
# CSV形式（デフォルト）
npm run dev -- followers --podcast-id YOUR_ID --start 2024-01-01 --end 2024-01-31

# JSON形式で出力
npm run dev -- followers --podcast-id YOUR_ID --start 2024-01-01 -f json

# ファイルに保存
npm run dev -- followers --podcast-id YOUR_ID --start 2024-01-01 > followers.csv
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--start <date>` (必須): 開始日 (YYYY-MM-DD)
- `--end <date>`: 終了日 (YYYY-MM-DD)
- `-f, --format <format>`: 出力形式 (`csv` または `json`、デフォルト: `csv`)
- `--raw`: API生レスポンスを出力（デバッグ用）

### `demographics`
デモグラフィック情報（年齢・性別・国）を取得します。

```bash
# すべてのデモグラフィック情報
npm run dev -- demographics --podcast-id YOUR_ID --start 2024-01-01 --end 2024-01-31

# 特定のファセットのみ
npm run dev -- demographics --podcast-id YOUR_ID --start 2024-01-01 --facet age
npm run dev -- demographics --podcast-id YOUR_ID --start 2024-01-01 --facet gender
npm run dev -- demographics --podcast-id YOUR_ID --start 2024-01-01 --facet country

# 特定のエピソード
npm run dev -- demographics --podcast-id YOUR_ID --episode-id EPISODE_ID --start 2024-01-01

# ファイルに保存
npm run dev -- demographics --podcast-id YOUR_ID --start 2024-01-01 > demographics.json
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--start <date>` (必須): 開始日 (YYYY-MM-DD)
- `--end <date>`: 終了日 (YYYY-MM-DD)
- `--episode-id <id>`: 特定のエピソードID
- `--facet <facet>`: デモグラフィックファセット (`age`, `gender`, `country`, または `all`、デフォルト: `all`)
- `-f, --format <format>`: 出力形式 (JSON のみ)
- `--raw`: API生レスポンスを出力（デバッグ用）

### `performance`
エピソードのパフォーマンスデータを取得します。

```bash
# パフォーマンスデータ取得
npm run dev -- performance --podcast-id YOUR_ID --episode-id EPISODE_ID

# ファイルに保存
npm run dev -- performance --podcast-id YOUR_ID --episode-id EPISODE_ID > performance.json
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--episode-id <id>` (必須): エピソードID
- `-f, --format <format>`: 出力形式 (JSON のみ)
- `--raw`: API生レスポンスを出力（デバッグ用）

### `export-all`
すべてのデータを一括でファイル出力します。

```bash
npm run dev -- export-all \
  --podcast-id YOUR_ID \
  --start 2024-01-01 \
  --end 2024-12-31 \
  --output-dir ./analytics_2024
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--start <date>` (必須): 開始日 (YYYY-MM-DD)
- `--end <date>`: 終了日 (YYYY-MM-DD)
- `--output-dir <dir>`: 出力ディレクトリ (デフォルト: `./output`)
- `-f, --format <format>`: 出力形式 (`csv`, `json`, または `both`、デフォルト: `csv`)

## ライブラリAPI

### 主なクラス

#### `SpotifyAnalytics` (高レベルAPI - 推奨)

```typescript
import { SpotifyAnalytics } from 'spotify-analytics';

const analytics = new SpotifyAnalytics({
  credentials: {
    sp_dc: process.env.SPOTIFY_SP_DC!,
    sp_key: process.env.SPOTIFY_SP_KEY!,
    client_id: process.env.SPOTIFY_CLIENT_ID,
  }
});
```

#### 主なメソッド

**データ取得:**
- `getEpisodes(options)`: エピソード一覧取得
- `getStreams(options)`: ストリーム数取得
- `getListeners(options)`: リスナー数取得
- `getFollowers(options)`: フォロワー数取得
- `getDemographics(options)`: デモグラフィック情報取得
- `getPerformance(episodeId)`: パフォーマンスデータ取得

**エクスポート:**
- `exportToCSV(data, filePath)`: CSV出力
- `exportToJSON(data, filePath)`: JSON出力
- `exportAll(options)`: 一括エクスポート

#### `SpotifyConnector` (低レベルAPI)

直接APIを呼び出す場合に使用します。通常は`SpotifyAnalytics`の使用を推奨します。

詳細は `internal-docs/CLI_TOOL_SPECIFICATION.md` を参照してください。

## 開発

### ビルド

```bash
npm run build
```

ビルド後、`dist/` ディレクトリに出力されます。

### プロジェクト構成

```
spotify-analytics/
├── src/
│   ├── lib/                       # ライブラリコア
│   │   ├── SpotifyAnalytics.ts    # 高レベルAPI
│   │   └── SpotifyConnector.ts    # 低レベルAPI
│   ├── cli/                       # CLIツール
│   │   ├── index.ts               # CLIエントリーポイント
│   │   ├── commands/              # CLIコマンド
│   │   └── utils/                 # CLI用ユーティリティ
│   ├── exporters/                 # CSV/JSONエクスポーター
│   ├── types/                     # TypeScript型定義
│   └── utils/                     # 共通ユーティリティ
├── .env                           # 環境変数（gitignoreに含む）
├── .env.example                   # 環境変数のサンプル
├── internal-docs/                 # ドキュメント
└── dist/                          # ビルド出力
```

## トラブルシューティング

### 認証エラーが発生する

- `.env`ファイルが存在し、正しい認証情報が設定されているか確認
- `sp_dc`と`sp_key`が最新のものか確認（Cookieは定期的に更新される）
- `npm run dev -- me`コマンドで認証状態を確認

### データが取得できない

- ポッドキャストIDが正しいか確認
- 指定した日付範囲にデータが存在するか確認
- Spotify for Podcastersダッシュボードで同じデータが表示されるか確認

## ライセンス

MIT

## 免責事項

このツールはSpotify公式ツールではありません。非公式APIを使用しているため、仕様変更により動作しなくなる可能性があります。商用利用する場合は、Spotifyの利用規約を確認してください。
