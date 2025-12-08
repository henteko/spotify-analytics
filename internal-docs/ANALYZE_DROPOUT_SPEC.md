# Analyze Dropout Command Specification

## 概要

音声データとパフォーマンスデータを組み合わせて、エピソードのどの部分（どの話題）でリスナーが離脱しているかを分析するコマンド。

## コマンド仕様

### 基本コマンド

```bash
npm run dev -- analyze-dropout \
  --podcast-id <PODCAST_ID> \
  --episode-id <EPISODE_ID> \
  --audio <AUDIO_FILE_PATH> \
  --output-dir ./analysis
```

### オプション

| オプション | 必須 | 説明 | デフォルト |
|-----------|------|------|-----------|
| `--podcast-id` | ✓ | ポッドキャストID | - |
| `--episode-id` | ✓ | エピソードID | - |
| `--audio` | ✓ | 音声ファイルパス（mp3, wav, m4a等） | - |
| `--output-dir` | | 出力ディレクトリ | `./output` |
| `-f, --format` | | 出力形式（csv/json/both） | `csv` |
| `--segment-duration` | | セグメント長（秒） | `60` |
| `--transcribe-service` | | 文字起こしサービス（whisper/local） | `whisper` |
| `--language` | | 音声言語 | `ja` |

## 処理フロー

### 1. 音声文字起こし

音声ファイルをタイムスタンプ付きで文字起こし：

```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 12.5,
      "text": "今日は VS Code の拡張機能について話します"
    },
    {
      "start": 12.5,
      "end": 45.3,
      "text": "まず最初に紹介するのは..."
    }
  ]
}
```

**使用可能なサービス：**
- OpenAI Whisper API（クラウド、高精度）
- Whisper.cpp（ローカル、無料）

### 2. 話題セグメント化

文字起こし結果を意味のあるセグメントに分割：

**方法A: 時間ベース**
- `--segment-duration`で指定した秒数ごとにセグメント分割
- 例: 60秒ごとに区切り、各セグメントの話題を要約

**方法B: 話題ベース（将来実装）**
- LLMを使って話題の切り替わりを検出
- 自然な話題の区切りでセグメント分割

### 3. パフォーマンスデータ取得

Performance APIから視聴位置サンプルを取得：

```json
{
  "episodeId": "xxx",
  "samples": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, ...]
}
```

`samples`配列：各リスナーが視聴を止めた位置（パーセンテージ）

### 4. 離脱率計算

各セグメントでの離脱率を計算：

```
離脱率 = (セグメント内で離脱したリスナー数) / (セグメント開始時のリスナー数) * 100
```

例: エピソード長 60分（3600秒）、セグメント長 60秒の場合

| セグメント | 時間 | 開始時リスナー | 離脱数 | 離脱率 | 話題 |
|-----------|------|--------------|--------|--------|------|
| 1 | 0:00-1:00 | 1000 | 50 | 5% | オープニング |
| 2 | 1:00-2:00 | 950 | 30 | 3.2% | VS Code拡張機能の紹介 |
| 3 | 2:00-3:00 | 920 | 150 | 16.3% | **設定ファイルの詳細説明** |
| ... | ... | ... | ... | ... | ... |

### 5. 出力形式

#### CSV形式

```csv
segment,start_time,end_time,start_percentage,end_percentage,topic,listeners_start,listeners_end,dropout_count,dropout_rate,retention_rate
1,0,60,0.0,1.67,オープニング,1000,950,50,5.0,95.0
2,60,120,1.67,3.33,VS Code拡張機能の紹介,950,920,30,3.2,96.8
3,120,180,3.33,5.0,設定ファイルの詳細説明,920,770,150,16.3,83.7
```

**カラム説明：**
- `segment`: セグメント番号
- `start_time`, `end_time`: 開始・終了時間（秒）
- `start_percentage`, `end_percentage`: 開始・終了位置（パーセンテージ）
- `topic`: 話題の要約
- `listeners_start`, `listeners_end`: 開始・終了時のリスナー数（推定）
- `dropout_count`: 離脱リスナー数
- `dropout_rate`: 離脱率（%）
- `retention_rate`: 継続率（%）

#### JSON形式

```json
{
  "episodeId": "xxx",
  "episodeName": "VS Codeのレキシ",
  "duration": 3600,
  "totalSamples": 1000,
  "segments": [
    {
      "segment": 1,
      "startTime": 0,
      "endTime": 60,
      "startPercentage": 0.0,
      "endPercentage": 1.67,
      "topic": "オープニング",
      "transcript": "今日は...",
      "listenersStart": 1000,
      "listenersEnd": 950,
      "dropoutCount": 50,
      "dropoutRate": 5.0,
      "retentionRate": 95.0
    },
    ...
  ],
  "summary": {
    "highestDropoutSegment": {
      "segment": 3,
      "topic": "設定ファイルの詳細説明",
      "dropoutRate": 16.3
    },
    "averageDropoutRate": 5.2
  }
}
```

## 実装優先順位

### Phase 1: 基本機能（MVP）
1. ✓ Performance APIから samples データ取得（既存）
2. 音声文字起こし（Whisper API統合）
3. 時間ベースセグメント分割
4. 離脱率計算ロジック
5. CSV/JSON出力

### Phase 2: 拡張機能
1. ローカルWhisper対応
2. LLMによる話題要約
3. 可視化機能（グラフ生成）
4. 複数エピソード比較

## 技術要件

### 依存パッケージ

```json
{
  "dependencies": {
    "openai": "^4.x",  // Whisper API用
    "form-data": "^4.x"  // ファイルアップロード用
  }
}
```

### API設定

環境変数に OpenAI API キーを追加：

```bash
OPENAI_API_KEY=sk-...
```

## 使用例

### 基本的な使用

```bash
# 音声ファイルを指定して離脱分析
npm run dev -- analyze-dropout \
  --podcast-id abc123 \
  --episode-id ep456 \
  --audio ./audio/episode.mp3

# CSV出力をファイルに保存
npm run dev -- analyze-dropout \
  --podcast-id abc123 \
  --episode-id ep456 \
  --audio ./audio/episode.mp3 > dropout_analysis.csv

# JSON形式で詳細分析
npm run dev -- analyze-dropout \
  --podcast-id abc123 \
  --episode-id ep456 \
  --audio ./audio/episode.mp3 \
  -f json > dropout_analysis.json

# セグメント長を30秒に変更
npm run dev -- analyze-dropout \
  --podcast-id abc123 \
  --episode-id ep456 \
  --audio ./audio/episode.mp3 \
  --segment-duration 30
```

## 分析の活用方法

### 1. コンテンツ改善
- 離脱率が高いセグメントの話題を特定
- 話し方、テンポ、内容を見直し

### 2. エピソード構成最適化
- 離脱が多い話題を後半に移動
- 冒頭で離脱が多い場合、オープニングを短縮

### 3. A/Bテスト
- 同じ話題で話し方を変えた2つのエピソードを比較
- より継続率の高いアプローチを採用

## 制限事項

1. **Whisper API コスト**: 音声1時間あたり約$0.36の費用が発生
2. **サンプル数**: Performance APIのサンプル数が少ない場合、精度が低下
3. **言語**: 現状日本語と英語のみ対応

## 今後の拡張案

1. **リアルタイム分析**: エピソード公開後、定期的に分析を実行
2. **ビジュアライゼーション**: グラフ・ヒートマップ生成
3. **感情分析**: 話者の感情と離脱率の相関分析
4. **トピックモデリング**: 自動で話題カテゴリ分類
