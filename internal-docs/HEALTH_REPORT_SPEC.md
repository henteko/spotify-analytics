# Episode Health Report Feature Specification

## 概要

単一エピソードの健全性を評価し、改善提案を含む統合HTMLレポートを生成する機能。

draft.mdで提案されている3つの分析指標を実装し、エピソードを詳細に分析することで、具体的な改善アクションを提供する。既存の`analyze-dropout`コマンドを拡張・統合した上位機能として位置づけられる。

## 背景・目的

### 解決したい課題

現状の`analyze-dropout`機能では：
- 離脱分析に特化しているが、再生率やリスナー増加の評価が不足
- draft.mdの3指標を包括的に評価する仕組みがない
- エピソード全体の「健康スコア」が一目でわからない
- 改善すべきポイントが明確に示されない

### draft.mdの分析指標

1. **再生率の確認**：平均再生率が80％以上なら良好、50％以下は要改善
2. **離脱ポイントの特定**：再生率が急激に落ちる箇所の特定と改善
3. **フォロワー数と再生数のバランス**：このエピソードがフォロワー獲得に貢献しているか

### 目的

- 上記3指標を自動的に評価する統合レポート機能
- エピソード単体の健康スコア（0-100点）による一目での状態把握
- 優先度付きの具体的な改善アクションアイテムの提供
- このエピソード固有の問題点と改善策の明確化

## 機能仕様

### コマンド

```bash
npm run dev -- episode-report \
  --podcast-id <id> \
  --episode-id <id> \
  [--audio <path>] \
  [--output-dir <dir>] \
  [--theme <theme>]
```

### オプション

| オプション | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `--podcast-id <id>` | ✓ | - | ポッドキャストID |
| `--episode-id <id>` | ✓ | - | エピソードID |
| `--audio <path>` | | - | 音声ファイルパス（詳細離脱分析用） |
| `--output-dir <dir>` | | `./reports` | レポート出力ディレクトリ |
| `--theme <theme>` | | `light` | テーマ (`light` or `dark`) |

### 出力ファイル

- `{output-dir}/episode-report-{episode-id}-{date}.html`: インタラクティブHTMLレポート
- `{output-dir}/episode-report-{episode-id}-{date}.json`: 生データ（オプション）

## レポート内容

### 1. エグゼクティブサマリー

**エピソード健康スコア（0-100点）**

```
健康スコア = 再生率スコア(40点) + 離脱率スコア(30点) + エンゲージメントスコア(30点)
```

- **90-100点**：🟢 優秀（Excellent）
- **70-89点**：🟡 良好（Good）
- **50-69点**：🟠 要改善（Needs Improvement）
- **0-49点**：🔴 緊急対応（Critical）

**エピソード基本情報**
- エピソード名
- リリース日時
- エピソード長
- 総再生数
- 総リスナー数
- 平均再生時間

**AI総合評価**
- Gemini APIによる総合的な健康状態の評価
- 優先的に対応すべき改善事項トップ3
- draft.mdの3指標に基づく評価コメント

### 2. 再生率分析（draft.md指標1）

**このエピソードの再生率**
- 全体の平均再生率：XX%
- 評価：🟢 80%以上 / 🟡 50-80% / 🔴 50%以下
- draft.md基準による判定結果

**時間帯別再生率**
- イントロ（0-5分）の視聴維持率
- 本編前半（5-15分）の視聴維持率
- 本編中盤（15-30分）の視聴維持率
- 本編後半（30分-終了）の視聴維持率

**グラフ**
- 折れ線グラフ：時間経過による視聴維持率の推移
- 棒グラフ：時間帯別の視聴維持率

**AI分析**
- 再生率が基準を満たしているか/満たしていない場合の原因
- タイトル、長さ、内容構成の評価
- 具体的な改善提案

### 3. 離脱ポイント分析（draft.md指標2）

**離脱の全体像**
- 平均離脱率：XX%
- 最大離脱ポイント：XX分XX秒（離脱率YY%）
- 離脱パターン分類
  - ✅ 優秀：終盤まで維持（離脱率<20%）
  - 🟡 標準：徐々に減少（離脱率20-40%）
  - 🔴 問題あり：急激な離脱（離脱率>40%）

**詳細離脱分析（音声ファイル提供時）**
- セグメント別離脱率ヒートマップ
- 急激な離脱が発生している具体的な箇所
  - タイムスタンプ
  - トランスクリプト
  - トピック分類
  - 離脱率
- 離脱が少ないセグメントの特徴

**トピック別離脱率**
（TopicModelerを活用）
- このエピソードで扱ったトピックカテゴリ
- 各トピックでの離脱率
- リスナーの興味が高いトピック/低いトピック

**グラフ**
- ヒートマップ：セグメント別離脱率
- 折れ線グラフ：リスナー数の推移
- 棒グラフ：トピック別離脱率

**AI分析**
- 離脱を引き起こしている要因の特定
- 「○○分○○秒で△△の話題になり、離脱が増加」のような具体的な指摘
- 構成改善のための具体的な提案（イントロ短縮、トピック順序変更など）

### 4. エンゲージメント分析（draft.md指標3）

**このエピソードのパフォーマンス**
- エピソード公開前後のフォロワー増加数
- 総再生数
- 総リスナー数
- エンゲージメント率 = 再生数 / 公開時点のフォロワー数

**評価**
- 🟢 優秀：フォロワー増加が顕著、再生数が多い
- 🟡 標準：フォロワー・再生数ともに標準的
- 🔴 要改善：フォロワーは増えているのに再生数が少ない（タイトル・テーマに問題の可能性）

**グラフ**
- 折れ線グラフ：公開前後のフォロワー数推移

**AI分析**
- このエピソードの強み・弱みの分析
- フォロワー獲得/再生数増加のための改善案
- タイトル・説明文の最適化提案

### 5. リスナーデモグラフィック

**このエピソードのリスナー属性**
- 年齢別分布（円グラフ）
- 性別分布（円グラフ）
- 国別分布（トップ10、棒グラフ）

**AI分析**
- ターゲットリスナーに届いているか
- より効果的なターゲティング戦略

### 6. アクションアイテム

**このエピソード固有の改善提案**

優先度付きの具体的な改善提案リスト：

**🔴 緊急（Critical）**
- 再生率が50%以下の場合：タイトル・テーマの見直し
- 急激な離脱箇所の特定と対策
- フォロワーが増えているのに再生数が少ない場合の対策

**🟡 重要（High Priority）**
- 再生率50-80%の場合の改善策
- 離脱率が高いセグメントの構成変更
- タイトル・説明文の最適化

**🟢 推奨（Recommended）**
- さらに再生率を上げるための工夫
- リスナーエンゲージメント向上施策
- 次回エピソードへの活かし方

**将来のエピソードへの学び**
- このエピソードの成功要因（再現すべきポイント）
- このエピソードの失敗要因（避けるべきポイント）
- 次回エピソードへの具体的な提案

各アクションアイテムには：
- 具体的な問題の説明
- 推奨される対応策
- 期待される効果
- 実施優先度

## 技術設計

### アーキテクチャ

```
CLI Command (episode-report)
    ↓
EpisodeHealthReportGenerator
    ├─ DataCollector (データ収集)
    │   ├─ getEpisode(episodeId) - エピソード基本情報
    │   ├─ getPerformance(episodeId) - パフォーマンスデータ
    │   ├─ getStreams(episodeId) - 再生データ
    │   ├─ getListeners(episodeId) - リスナーデータ
    │   ├─ getDemographics(episodeId) - デモグラフィック
    │   └─ getFollowers() - フォロワー推移（公開前後）
    │
    ├─ PlaybackRateAnalyzer (再生率分析)
    │   ├─ calculatePlaybackRate() - このエピソードの再生率
    │   ├─ evaluateByDraftMdStandard() - draft.md基準で評価
    │   └─ analyzeByTimeSegment() - 時間帯別分析
    │
    ├─ DropoutPatternAnalyzer (離脱パターン分析)
    │   ├─ analyzeDropoutPattern() - 離脱パターン分類
    │   ├─ identifyCriticalPoints() - 最大離脱ポイント特定
    │   ├─ analyzeByTopic() ← TopicModeler
    │   └─ analyzeDetailedDropout() ← DropoutAnalyzer (音声ファイル提供時)
    │
    ├─ EngagementAnalyzer (エンゲージメント分析)
    │   ├─ calculateEngagementRate() - エンゲージメント率
    │   ├─ analyzeFollowerImpact() - フォロワー増加への貢献
    │   └─ evaluatePerformance() - パフォーマンス評価
    │
    ├─ HealthScoreCalculator (スコア算出)
    │   └─ calculateScore() - 0-100点のスコア算出
    │
    └─ AIInsightsGenerator (AI分析)
        └─ generateInsights() ← AISummaryGenerator拡張
            - draft.mdの3指標に基づく評価
            - このエピソード固有の改善提案
    ↓
EpisodeHealthReportVisualizer
    └─ generateHTML() ← DropoutVisualizer拡張
```

### 新規クラス

#### `EpisodeHealthReportGenerator`

```typescript
interface EpisodeHealthReportOptions {
  podcastId: string;
  episodeId: string;
  audioFilePath?: string; // 音声ファイル（オプション）
}

interface EpisodeHealthReport {
  // エピソード基本情報
  episode: {
    id: string;
    name: string;
    releaseDate: Date;
    duration: number; // 秒
    totalStreams: number;
    totalListeners: number;
    averageListenTime: number; // 秒
  };

  // 健康スコア
  healthScore: {
    total: number; // 0-100
    level: 'excellent' | 'good' | 'needs-improvement' | 'critical';
    breakdown: {
      playbackRate: number; // 40点満点
      dropoutRate: number; // 30点満点
      engagement: number; // 30点満点
    };
  };

  // 再生率分析（draft.md指標1）
  playbackRateAnalysis: {
    overallRate: number; // %
    evaluation: 'excellent' | 'good' | 'needs-improvement'; // draft.md基準
    byTimeSegment: {
      intro: number; // 0-5分
      earlyMain: number; // 5-15分
      midMain: number; // 15-30分
      lateMain: number; // 30分-終了
    };
  };

  // 離脱分析（draft.md指標2）
  dropoutAnalysis: {
    averageDropoutRate: number;
    maxDropoutPoint: { timestamp: number; rate: number };
    pattern: 'excellent' | 'standard' | 'problematic';
    detailedSegments?: DropoutSegment[]; // 音声ファイル提供時のみ
    topicAnalysis?: {
      topics: { name: string; dropoutRate: number }[];
      highInterest: string[];
      lowInterest: string[];
    };
  };

  // エンゲージメント分析（draft.md指標3）
  engagementAnalysis: {
    followerGrowthAroundRelease: number; // 公開前後のフォロワー増加数
    totalStreams: number; // 総再生数
    totalListeners: number; // 総リスナー数
    engagementRate: number; // 再生数 / 公開時点のフォロワー数
    evaluation: 'excellent' | 'standard' | 'needs-improvement';
  };

  // デモグラフィック
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    country: Record<string, number>;
  };

  // アクションアイテム
  actionItems: {
    critical: ActionItem[];
    high: ActionItem[];
    recommended: ActionItem[];
    futureEpisodes: ActionItem[];
  };

  // AI分析
  aiInsights: {
    overview: string;
    playbackRateAssessment: string; // draft.md指標1の評価
    dropoutAssessment: string; // draft.md指標2の評価
    engagementAssessment: string; // draft.md指標3の評価
    priorityActions: string[];
    successFactors: string[];
    improvementAreas: string[];
  };
}

interface ActionItem {
  priority: 'critical' | 'high' | 'recommended';
  issue: string;
  action: string;
  expectedImpact: string;
}

class EpisodeHealthReportGenerator {
  constructor(private analytics: SpotifyAnalytics) {}

  async generate(options: EpisodeHealthReportOptions): Promise<EpisodeHealthReport> {
    // 1. このエピソードのデータ収集
    const episode = await this.collectEpisodeData(options);

    // 2. 再生率分析（draft.md指標1）
    const playbackRateAnalysis = await this.analyzePlaybackRate(episode);

    // 3. 離脱分析（draft.md指標2）
    const dropoutAnalysis = await this.analyzeDropout(episode, options);

    // 4. エンゲージメント分析（draft.md指標3）
    const engagementAnalysis = await this.analyzeEngagement(episode);

    // 5. デモグラフィック
    const demographics = await this.analyzeDemographics(options);

    // 6. 健康スコア算出
    const healthScore = this.calculateHealthScore({
      playbackRateAnalysis,
      dropoutAnalysis,
      engagementAnalysis,
    });

    // 7. アクションアイテム生成
    const actionItems = this.generateActionItems({
      episode,
      playbackRateAnalysis,
      dropoutAnalysis,
      engagementAnalysis,
    });

    // 8. AI分析（draft.mdの3指標を明示的に評価）
    const aiInsights = await this.generateAIInsights({
      episode,
      healthScore,
      playbackRateAnalysis,
      dropoutAnalysis,
      engagementAnalysis,
      actionItems,
    });

    return {
      episode: episode.info,
      healthScore,
      playbackRateAnalysis,
      dropoutAnalysis,
      engagementAnalysis,
      demographics,
      actionItems,
      aiInsights,
    };
  }

  private calculateHealthScore(data: {
    playbackRateAnalysis: PlaybackRateAnalysis;
    dropoutAnalysis: DropoutAnalysis;
    engagementAnalysis: EngagementAnalysis;
  }): HealthScore {
    // 再生率スコア (40点満点) - draft.md指標1
    const rate = data.playbackRateAnalysis.overallRate;
    const playbackScore = rate >= 80 ? 40 :
                          rate >= 70 ? 35 :
                          rate >= 60 ? 28 :
                          rate >= 50 ? 20 : 10;

    // 離脱率スコア (30点満点) - draft.md指標2
    const dropout = data.dropoutAnalysis.averageDropoutRate;
    const dropoutScore = dropout <= 20 ? 30 :
                         dropout <= 30 ? 25 :
                         dropout <= 40 ? 18 :
                         dropout <= 50 ? 12 : 5;

    // エンゲージメントスコア (30点満点) - draft.md指標3
    const engagement = data.engagementAnalysis.engagementRate;
    const followerGrowth = data.engagementAnalysis.followerGrowthAroundRelease;
    // エンゲージメント率と フォロワー増加を組み合わせて評価
    const engagementScore = (engagement >= 0.3 && followerGrowth > 100) ? 30 :
                            (engagement >= 0.2 && followerGrowth > 50) ? 25 :
                            (engagement >= 0.1 || followerGrowth > 20) ? 18 :
                            engagement >= 0.05 ? 12 : 5;

    const total = playbackScore + dropoutScore + engagementScore;

    return {
      total,
      level: this.getHealthLevel(total),
      breakdown: {
        playbackRate: playbackScore,
        dropoutRate: dropoutScore,
        engagement: engagementScore,
      },
    };
  }

  private getHealthLevel(score: number): 'excellent' | 'good' | 'needs-improvement' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'critical';
  }
}
```

#### `EpisodeHealthReportVisualizer`

```typescript
interface VisualizerOptions {
  outputPath: string;
  title: string;
  theme: 'light' | 'dark';
}

class EpisodeHealthReportVisualizer {
  generateHTML(report: EpisodeHealthReport, options: VisualizerOptions): void {
    // DropoutVisualizerを拡張
    // 追加のグラフタイプ:
    // - ゲージチャート (健康スコア0-100点)
    // - レーダーチャート (スコア内訳: 再生率/離脱率/エンゲージメント)
    // - 棒グラフ (このエピソード vs 平均 vs ベスト)
    // - 折れ線グラフ (時間経過による視聴維持率)
    // - ヒートマップ (セグメント別離脱率)
    // - 円グラフ (デモグラフィック分布)
  }
}
```

### 既存機能の活用

| 既存クラス | 活用箇所 |
|-----------|---------|
| `SpotifyAnalytics` | 全データ取得の基盤 |
| `DropoutAnalyzer` | 音声ファイルがある場合の詳細離脱分析 |
| `TopicModeler` | トピック分類と離脱率統計 |
| `AISummaryGenerator` | AI分析の基盤（機能拡張して利用） |
| `DropoutVisualizer` | HTMLレポート生成の基盤（機能拡張して利用） |

### データフロー

```
1. 対象エピソードのデータ取得
   - getEpisode(episodeId) - 基本情報
   - getPerformance(episodeId) - パフォーマンスデータ
   - getStreams(episodeId) - 再生データ
   - getListeners(episodeId) - リスナーデータ
   - getDemographics(episodeId) - デモグラフィック
   - getFollowers() - フォロワー数推移（公開前後）
   ↓
2. 音声分析（オプション）
   - LocalWhisperClient - 音声文字起こし
   - DropoutAnalyzer - 詳細離脱分析
   - TopicModeler - トピック分類
   ↓
3. 分析処理
   - 再生率分析（draft.md指標1）
   - 離脱パターン分析（draft.md指標2）
   - エンゲージメント分析（draft.md指標3）
   ↓
4. スコアリング
   - 健康スコア算出（0-100点）
   - アクションアイテム生成
   ↓
5. AI総合分析 (Gemini API)
   - draft.mdの3指標に基づいた個別評価
   - このエピソード固有の改善提案
   - 将来のエピソードへの学び
   ↓
6. HTMLレポート生成
   - ビジュアライゼーション
   - インタラクティブ要素
```

## AI分析の強化

### プロンプト設計

draft.mdの3指標を明示的にプロンプトに組み込み、単一エピソードに特化した評価を行う：

```
あなたはポッドキャストの分析専門家です。以下のデータに基づいて、このエピソードの健全性を評価してください。

## エピソード情報
- エピソード名: {episodeName}
- 公開日: {releaseDate}
- エピソード長: {duration}分
- 総再生数: {totalStreams}
- 総リスナー数: {totalListeners}

## 評価基準（重要）- draft.md準拠
1. **再生率の確認**：平均再生率が80％以上なら良好、50％以下は要改善
   - このエピソードの再生率: {playbackRate}%
   - 評価: {evaluation}
   - 時間帯別の維持率: イントロ {intro}%, 前半 {early}%, 中盤 {mid}%, 後半 {late}%

2. **離脱ポイントの特定**：再生率が急激に落ちる箇所の改善が必要
   - 平均離脱率: {dropoutRate}%
   - 最大離脱ポイント: {maxDropoutPoint}
   - 離脱パターン: {pattern}
   [音声分析データがある場合]
   - 急激な離脱が発生した箇所: {criticalSegments}

3. **フォロワー数と再生数のバランス**：フォロワーが増えているのに再生数が伸びない場合は問題
   - 公開前後のフォロワー増加: {followerGrowth}人
   - 総再生数: {totalStreams}
   - エンゲージメント率: {engagementRate} (再生数/フォロワー数)
   - 評価: {engagementEvaluation}

## 健康スコア
- 総合: {healthScore}/100点 ({healthLevel})
- 内訳:
  - 再生率スコア: {playbackScore}/40点
  - 離脱率スコア: {dropoutScore}/30点
  - エンゲージメントスコア: {engagementScore}/30点

## 求める回答
1. **総合評価**（3-5文）
   - このエピソードの全体的な評価
   - draft.mdの3指標から見た総合判断

2. **指標別詳細評価**
   - 指標1（再生率）: このエピソードの再生率は基準を満たしているか、問題点は何か
   - 指標2（離脱ポイント）: 離脱が発生している箇所と原因の分析
   - 指標3（エンゲージメント）: フォロワー獲得・再生数の観点からの評価

3. **優先改善事項**（3-5項目）
   - このエピソード固有の問題点
   - 具体的な改善アクション
   - 期待される効果

4. **成功要因と改善点**
   - うまくいっている点（他のエピソードでも再現すべき要素）
   - 改善が必要な点（今後避けるべき要素）

5. **次回エピソードへの提案**（2-3項目）
   - このエピソードの分析結果を踏まえた次回の改善案
```

### AI分析の出力構造

```typescript
interface AIInsights {
  overview: string; // 総合評価

  // draft.mdの3指標それぞれの詳細評価
  playbackRateAssessment: string; // 指標1の評価
  dropoutAssessment: string; // 指標2の評価
  engagementAssessment: string; // 指標3の評価

  // アクション
  priorityActions: string[]; // 優先改善事項
  successFactors: string[]; // 成功要因（再現すべき点）
  improvementAreas: string[]; // 改善点（避けるべき点）

  // 将来への提案
  nextEpisodeSuggestions: string[]; // 次回エピソードへの提案
}
```

## UI/UXデザイン

### レポート構成（ページ内セクション）

1. **ヘッダー**
   - ポッドキャスト名
   - エピソード名
   - 公開日・エピソード長
   - レポート生成日時

2. **健康スコアダッシュボード**（最上部）
   - 大きなゲージチャート（0-100点）
   - 健康レベル表示（優秀/良好/要改善/緊急対応）
   - スコア内訳（レーダーチャート：再生率/離脱率/エンゲージメント）
   - KPIカード（6つ）
     - 総再生数
     - 総リスナー数
     - 平均再生率
     - 平均離脱率
     - エンゲージメント率
     - フォロワー増加数

3. **AI総合評価セクション**
   - 概要テキスト（このエピソードの全体評価）
   - draft.md 3指標の評価（カード形式、色分け）
     - 指標1: 再生率評価 🟢/🟡/🔴
     - 指標2: 離脱ポイント評価
     - 指標3: エンゲージメント評価
   - 優先改善事項（アコーディオン形式、🔴🟡🟢で優先度表示）

4. **タブナビゲーション**
   - タブ1: 再生率分析（draft.md指標1）
   - タブ2: 離脱分析（draft.md指標2）
   - タブ3: エンゲージメント分析（draft.md指標3）
   - タブ4: デモグラフィック
   - タブ5: アクションアイテム

5. **フッター**
   - 生成ツール情報
   - データソース
   - 免責事項
   - 「次回エピソードへの提案」サマリー

### ビジュアライゼーション

#### Chart.js グラフタイプ

- **ゲージチャート**: 健康スコア
- **レーダーチャート**: スコア内訳（再生率/離脱率/成長）
- **折れ線グラフ**: 再生率推移、フォロワー/再生数推移
- **棒グラフ**: エピソードランキング、トピック別統計
- **散布図**: フォロワー vs 再生数
- **円グラフ**: デモグラフィック分布
- **ヒートマップ**: 離脱率（カスタム実装）
- **バブルチャート**: エピソード比較（サイズ=リスナー数）

#### カラーパレット

**Light Theme**
- 優秀: #10b981 (green)
- 良好: #3b82f6 (blue)
- 要注意: #f59e0b (amber)
- 要改善: #ef4444 (red)

**Dark Theme**
- 優秀: #059669
- 良好: #2563eb
- 要注意: #d97706
- 要改善: #dc2626

### インタラクティブ要素

- グラフのホバーで詳細情報表示
- エピソードをクリックして詳細モーダル表示
- アクションアイテムの完了チェックボックス（localStorage保存）
- フィルター機能（日付範囲、トピック、再生率範囲）
- PDFエクスポート機能（ブラウザ印刷）

## 実装順序

### Phase 1: 基本機能（MVP）
1. `EpisodeHealthReportGenerator` クラスの実装
   - 単一エピソードのデータ収集
   - 再生率分析（draft.md指標1）
   - 基本的な健康スコア算出
2. `EpisodeHealthReportVisualizer` クラスの基本実装
   - HTML生成（DropoutVisualizerを拡張）
   - 基本的なグラフ（ゲージ、折れ線、棒）
3. CLI コマンド `episode-report` の追加

### Phase 2: エンゲージメント分析
1. エンゲージメント分析の実装（draft.md指標3）
   - フォロワー推移分析
   - エンゲージメント率計算
   - パフォーマンス評価

### Phase 3: 離脱分析統合
1. 離脱パターン分析の実装（draft.md指標2）
2. DropoutAnalyzer統合（音声ファイル提供時）
3. TopicModeler統合
4. 詳細セグメント分析

### Phase 4: AI強化
1. AISummaryGenerator拡張
2. draft.md 3指標を組み込んだプロンプト設計
3. エピソード固有の詳細AI分析
4. 次回エピソードへの提案生成

### Phase 5: UI/UX改善
1. インタラクティブ要素の追加
2. 追加のグラフタイプ（レーダーチャート、ヒートマップ）
3. レスポンシブデザイン
4. アニメーション

### Phase 6: オプション機能
1. PDFエクスポート
2. データエクスポート（JSON）

## テストケース

### 単体テスト

- `HealthScoreCalculator`: スコア計算の正確性（draft.md基準）
- `PlaybackRateAnalyzer`: 再生率計算とdraft.md評価
- `DropoutPatternAnalyzer`: パターン分類ロジック
- `EngagementAnalyzer`: エンゲージメント率計算とフォロワー分析

### 統合テスト

- エンドツーエンドのデータフロー（単一エピソード）
- 音声ファイルあり/なしでの動作確認
- エラーハンドリング（エピソード不在、API障害）

### ビジュアル回帰テスト

- HTMLレポートの表示確認
- 各種グラフの描画確認
- ライト/ダークテーマの切り替え

## パフォーマンス考慮事項

### データ収集の最適化

- 必要なデータを並列で取得
  ```typescript
  const [episode, performance, streams, listeners, demographics, followers] = await Promise.all([
    analytics.getEpisode(episodeId),
    analytics.getPerformance(episodeId),
    analytics.getStreams({ episodeId, ... }),
    analytics.getListeners({ episodeId, ... }),
    analytics.getDemographics({ episodeId, ... }),
    analytics.getFollowers({ ... }), // 公開前後の期間
  ]);
  ```

### キャッシング

- 取得済みデータのキャッシュ
- 同じエピソードの再実行時の高速化

### プログレス表示

- 長時間処理のため、進捗表示が必須
  ```
  [1/5] エピソードデータ取得中...
  [2/5] 音声分析中... (オプション)
  [3/5] 分析処理中...
  [4/5] AI分析中...
  [5/5] HTMLレポート生成中...
  ```

## エラーハンドリング

### 想定エラーケース

1. **エピソード不在**
   - 指定されたエピソードIDが存在しない → エラーメッセージを表示して終了

2. **API障害**
   - リトライ処理（SpotifyConnectorの既存機能）
   - 部分的な失敗でも可能な範囲で分析を継続

3. **音声ファイル不在**（audioオプション指定時）
   - 警告を表示
   - 音声分析なしで基本的なレポート生成

4. **AI API障害**
   - AI分析セクションをスキップ
   - 基本的な統計分析のみでレポート生成

## セキュリティ考慮事項

- 生成されるHTMLファイルにAPIキーや認証情報を含めない
- XSS対策：動的なテキストは適切にエスケープ
- 生成されたHTMLはローカルで開くため、CSP（Content Security Policy）は不要

## 拡張性

### 将来の機能追加候補

1. **ポッドキャスト全体レポート**
   - 複数エピソードの横断分析
   - 期間比較（前月比、前年比）
   - トレンド分析

2. **予測分析**
   - このエピソードタイプの将来的なパフォーマンス予測
   - 最適な公開時間の提案

3. **自動レポート生成**
   - エピソード公開後の自動レポート生成
   - 定期的な健康チェック

4. **通知機能**
   - 健康スコアが閾値を下回った場合のアラート
   - 改善提案の通知

5. **A/Bテスト支援**
   - タイトルバリエーションの効果測定
   - リリース時間の最適化

## ドキュメント更新

実装完了後、以下のドキュメントを更新：

1. **README.md**
   - `episode-report` コマンドの使用例追加
   - 生成されるレポートのスクリーンショット
   - draft.mdの3指標との関連性を明記

2. **CLAUDE.md**
   - EpisodeHealthReportGenerator/Visualizerのアーキテクチャ説明
   - draft.md指標との関連性
   - 既存の analyze-dropout との違い

3. **新規ドキュメント**
   - `docs/EPISODE_REPORT_GUIDE.md`: ユーザー向けガイド
   - `docs/HEALTH_SCORE_CALCULATION.md`: スコア計算の詳細（draft.md基準の説明）

## まとめ

`episode-report` 機能により、ユーザーは：

✅ **単一エピソードの健康状態を一目で把握**（0-100点スコア）
✅ **draft.mdの3指標を自動的に評価**
   - 指標1: 再生率（80%以上=良好、50%以下=要改善）
   - 指標2: 離脱ポイント（急激な離脱箇所の特定）
   - 指標3: エンゲージメント（フォロワー・再生数バランス）
✅ **優先度付きの具体的な改善アクション**をエピソード固有で取得
✅ **AI駆動の詳細な改善提案**と次回エピソードへの学びを取得

これにより、ポッドキャスト運営者は：
- このエピソードの強み・弱みを正確に把握
- draft.mdの基準に基づいた客観的な評価を取得
- エピソード固有の問題点と改善策を理解
- 次回エピソードへの具体的な改善策を実施
- 継続的な品質向上を実現

できるようになります。
