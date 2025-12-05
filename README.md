# Spotify Analytics

Spotify Podcast Analytics CLI & Library - Spotify Podcast APIからアナリティクスデータを取得するTypeScriptライブラリおよびCLIツール。

## 特徴

- **CLIツール**: コマンドラインから直接実行してCSV/JSON出力
- **ライブラリ**: 他のNode.js/TypeScriptプロジェクトからimportして使用
- **型安全**: 完全なTypeScript型定義
- **堅牢なエラーハンドリング**: リトライ機構とわかりやすいエラーメッセージ

## インストール

```bash
npm install
```

## 開発

### CLIツールとして実行

```bash
# 設定ファイルを作成
npm run dev -- init

# ポッドキャスト一覧を表示
npm run dev -- list

# ストリーム数を取得
npm run dev -- streams --podcast-id YOUR_PODCAST_ID --start 2024-01-01 --end 2024-01-31

# エピソード一覧を取得
npm run dev -- episodes --podcast-id YOUR_PODCAST_ID

# すべてのデータを一括エクスポート
npm run dev -- export-all --podcast-id YOUR_PODCAST_ID --start 2024-01-01 --output-dir ./output
```

### ライブラリとして使用

```typescript
import { SpotifyAnalytics } from './src';

const analytics = new SpotifyAnalytics({
  credentials: {
    sp_dc: 'your_sp_dc_cookie',
    sp_key: 'your_sp_key_cookie',
  },
  podcastId: 'your_podcast_id'
});

// ストリーム数を取得
const streams = await analytics.getStreams({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31')
});

console.log(streams);
```

## 認証情報の取得

以下の2つの値が必要です:

1. **`sp_dc`**: Spotifyのログイン後にCookieから取得（約160文字の長い文字列）
2. **`sp_key`**: Spotifyのログイン後にCookieから取得（36文字のUUID）

### 取得方法

1. https://creators.spotify.com にログイン
2. ブラウザの開発者ツールを開く（F12）
3. Application/Storage → Cookies → https://creators.spotify.com
4. `sp_dc` と `sp_key` の値をコピー

## 前提条件

このツールを使用するには、以下が必要です：

1. **Spotify for Podcastersアカウント**
   - https://creators.spotify.com でアカウントを作成
   - ポッドキャストを登録・管理している必要があります

2. **認証情報（Cookie）**
   - `sp_dc`と`sp_key`をブラウザから取得

> **注意**: ポッドキャストが登録されていないアカウントでは、データを取得できません。

## CLIコマンド一覧

### `me`
現在のユーザー情報を表示します（認証確認用）。

```bash
npm run dev -- me
```

### `init`
設定ファイルを作成します。

```bash
npm run dev -- init
```

### `list`
利用可能なポッドキャスト一覧を表示します。

```bash
npm run dev -- list
npm run dev -- list --format csv -o podcasts.csv
```

### `episodes`
エピソード一覧を取得します。

```bash
npm run dev -- episodes --podcast-id YOUR_ID
npm run dev -- episodes --podcast-id YOUR_ID --limit 10
```

### `streams`
ストリーム数データを取得します。

```bash
npm run dev -- streams --podcast-id YOUR_ID --start 2024-01-01 --end 2024-01-31
```

### `export-all`
すべてのデータを一括エクスポートします。

```bash
npm run dev -- export-all \
  --podcast-id YOUR_ID \
  --start 2024-01-01 \
  --end 2024-12-31 \
  --output-dir ./analytics_2024
```

## ライブラリAPI

詳細は `internal-docs/CLI_TOOL_SPECIFICATION.md` を参照してください。

### 主なクラス

- **SpotifyAnalytics**: 高レベルAPI（推奨）
- **SpotifyConnector**: 低レベルAPI

### 主なメソッド

- `getCatalog()`: ポッドキャスト一覧取得
- `getEpisodes()`: エピソード一覧取得
- `getStreams()`: ストリーム数取得
- `getListeners()`: リスナー数取得
- `getFollowers()`: フォロワー数取得
- `getDemographics()`: デモグラフィック情報取得
- `getPerformance()`: パフォーマンスデータ取得
- `exportToCSV()`: CSV出力
- `exportToJSON()`: JSON出力
- `exportAll()`: 一括エクスポート

## ビルド

```bash
npm run build
```

ビルド後、`dist/` ディレクトリに出力されます。

## プロジェクト構成

```
spotify-analytics/
├── src/
│   ├── lib/                  # ライブラリコア
│   ├── cli/                  # CLIツール
│   ├── exporters/            # エクスポーター
│   ├── types/                # 型定義
│   └── utils/                # ユーティリティ
├── internal-docs/            # ドキュメント
└── dist/                     # ビルド出力
```

## ライセンス

MIT

## 免責事項

このツールはSpotify公式ツールではありません。非公式APIを使用しているため、仕様変更により動作しなくなる可能性があります。
