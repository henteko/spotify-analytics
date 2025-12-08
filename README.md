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

# whisper.cppのセットアップ（analyze-dropoutコマンドを使用する場合）
# 注意: cmakeが必要です
#   macOS: brew install cmake
#   Ubuntu/Debian: sudo apt-get install cmake
npm run setup:whisper
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

### `analyze-dropout`
音声データとパフォーマンスデータを組み合わせて、どの話題でリスナーが離脱しているかを分析します。

**セットアップ（初回のみ）:**

```bash
# whisper.cppのセットアップ（サブモジュール初期化、ビルド、モデルダウンロード）
npm run setup:whisper

# 別のモデルを使用する場合（オプション）
npm run setup:whisper -- small  # small, medium, large など

# AI分析機能を使用する場合（オプション）
# .envファイルにGemini API Keyを追加
echo "GEMINI_API_KEY=your_api_key_here" >> .env
# API Keyの取得: https://aistudio.google.com/app/apikey
```

**使用例:**

```bash
# 基本的な使用
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3

# HTMLビジュアライゼーション付き分析（グラフ・ヒートマップ生成）
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3 \
  --visualize

# トピック自動分類機能を有効化
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3 \
  --categorize

# ビジュアライゼーション + トピック分類 + ダークテーマ
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3 \
  --visualize \
  --categorize \
  --theme dark \
  --output-dir ./reports

# JSON形式で詳細分析
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3 \
  -f json > dropout_analysis.json

# セグメント長を30秒に変更
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3 \
  --segment-duration 30

# 英語の音声を分析
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3 \
  --language en

# カスタムモデルを指定（より高精度）
npm run dev -- analyze-dropout \
  --podcast-id YOUR_ID \
  --episode-id EPISODE_ID \
  --audio ./audio/episode.mp3 \
  --model-path ./whisper.cpp/models/ggml-large.bin
```

**オプション:**
- `--podcast-id <id>` (必須): ポッドキャストID
- `--episode-id <id>` (必須): エピソードID
- `--audio <path>` (必須): 音声ファイルパス（mp3, wav, m4a等）
- `--segment-duration <seconds>`: セグメント長（秒、デフォルト: `60`）
- `--language <lang>`: 音声言語（デフォルト: `ja`）
- `--model-path <path>`: Whisperモデルファイルのパス（デフォルト: `whisper.cpp/models/ggml-base.bin`）
- `-f, --format <format>`: 出力形式 (`csv`, `json`, `html`、デフォルト: `csv`)
- `--visualize`: HTMLビジュアライゼーションを生成（グラフ・ヒートマップ）
- `--categorize`: 話題の自動カテゴリ分類を有効化
- `--output-dir <dir>`: 出力ディレクトリ（デフォルト: `./output`）
- `--theme <theme>`: ビジュアライゼーションのテーマ（`light` または `dark`、デフォルト: `light`）

**出力例（CSV）:**
```csv
segment,startTime,endTime,startPercentage,endPercentage,topic,transcript,listenersStart,listenersEnd,dropoutCount,dropoutRate,retentionRate
1,0,60,0.0,2.8,今日はVS Codeの拡張機能について...,今日はVS Codeの拡張機能について話します...,1000,950,50,5.0,95.0
2,60,120,2.8,5.6,最初に紹介するのは...,最初に紹介するのはGitLensです...,950,920,30,3.2,96.8
3,120,180,5.6,8.3,設定ファイルの詳細な説明...,設定ファイルの詳細な説明をします...,920,770,150,16.3,83.7
```

**モデルサイズの選択:**
- `tiny`: 最速、低精度（75MB）
- `base`: 推奨、バランス良好（142MB）
- `small`: 高精度、やや遅い（466MB）
- `medium`: より高精度（1.5GB）
- `large`: 最高精度、最も遅い（2.9GB）

**特徴:**
- ✅ 完全無料（ローカル実行）
- ✅ プライバシー保護（音声データが外部送信されない）
- ✅ オフライン動作可能
- ✅ インタラクティブなHTMLビジュアライゼーション
  - 離脱率推移の折れ線グラフ
  - リスナー数推移の折れ線グラフ
  - セグメント別離脱率ヒートマップ
  - 詳細なセグメント情報の表示
  - プロフェッショナルなビジネスデザイン（Tailwind CSS）
- ✅ 自動トピック分類
  - 技術・開発、歴史・背景、機能・特徴、問題・課題など
  - トピック別離脱率の統計情報
  - カテゴリ別の分析レポート
- ✅ AI分析サマリー（Gemini API）
  - 全体的な傾向の自動分析
  - 重要な発見の抽出
  - 具体的な改善提案の生成
  - 問題のあるセグメントの詳細分析と改善案

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

#### `LocalWhisperClient`

ローカルで音声を文字起こしするためのクライアントです。

```typescript
import { LocalWhisperClient } from 'spotify-analytics';

const whisper = new LocalWhisperClient({
  language: 'ja',
  modelPath: './whisper.cpp/models/ggml-base.bin'
});

// 音声ファイルを文字起こし
const transcript = await whisper.transcribe('./audio/episode.mp3');

// セグメント分割
const segments = whisper.splitIntoSegments(transcript, 60);
```

#### `DropoutAnalyzer`

リスナーの離脱分析を行うクラスです。

```typescript
import { DropoutAnalyzer } from 'spotify-analytics';

const analyzer = new DropoutAnalyzer(spotifyAnalytics);

const result = await analyzer.analyzeDropout({
  podcastId: 'YOUR_ID',
  episodeId: 'EPISODE_ID',
  audioFilePath: './audio/episode.mp3',
  segmentDuration: 60,
  language: 'ja'
});

console.log(result.summary.averageDropoutRate);
```

#### `TopicModeler`

トピック分類を行うクラスです。

```typescript
import { TopicModeler } from 'spotify-analytics';

const modeler = new TopicModeler();

// Dropout segmentsをカテゴリ分類
const categorized = modeler.extractTopicsFromDropout(result.segments);

// トピック別統計
const distribution = modeler.getTopicDistribution(categorized);
const dropoutByTopic = modeler.getDropoutByTopic(categorized);
```

#### `DropoutVisualizer`

分析結果をHTMLで可視化するクラスです。

```typescript
import { DropoutVisualizer, AISummaryGenerator } from 'spotify-analytics';

const visualizer = new DropoutVisualizer();

// AI分析サマリーを生成（オプション）
const summaryGenerator = new AISummaryGenerator();
const aiSummary = await summaryGenerator.generateSummary(result);

visualizer.generateHTML(result, {
  outputPath: './output/analysis.html',
  title: 'Dropout Analysis Report',
  theme: 'dark',
  aiSummary // AI分析結果を含める
});
```

#### `AISummaryGenerator`

Gemini APIを使用してAI分析サマリーを生成するクラスです。

```typescript
import { AISummaryGenerator } from 'spotify-analytics';

const generator = new AISummaryGenerator(process.env.GEMINI_API_KEY);

// 分析結果からAIサマリーを生成
const summary = await generator.generateSummary(dropoutAnalysisResult);

if (summary) {
  console.log('Overview:', summary.overview);
  console.log('Key Findings:', summary.keyFindings);
  console.log('Recommendations:', summary.recommendations);
  console.log('Critical Segments:', summary.criticalSegments);
}
```

**生成される情報:**
- `overview`: 全体的な傾向と状況の説明
- `keyFindings`: 重要な発見のリスト
- `recommendations`: 具体的な改善提案のリスト
- `criticalSegments`: 問題のあるセグメントの詳細分析と改善案

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
│   │   ├── SpotifyConnector.ts    # 低レベルAPI
│   │   ├── LocalWhisperClient.ts  # Whisper.cpp連携
│   │   ├── DropoutAnalyzer.ts     # 離脱分析
│   │   ├── DropoutVisualizer.ts   # HTMLビジュアライゼーション
│   │   ├── TopicModeler.ts        # トピック自動分類
│   │   └── AISummaryGenerator.ts  # AI分析サマリー生成
│   ├── cli/                       # CLIツール
│   │   ├── index.ts               # CLIエントリーポイント
│   │   ├── commands/              # CLIコマンド
│   │   └── utils/                 # CLI用ユーティリティ
│   ├── exporters/                 # CSV/JSONエクスポーター
│   ├── types/                     # TypeScript型定義
│   └── utils/                     # 共通ユーティリティ
├── whisper.cpp/                   # Whisper.cppサブモジュール
├── scripts/                       # セットアップスクリプト
│   └── setup-whisper.sh          # Whisper.cppセットアップ
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
