/**
 * Episode Health Report Generator
 * Generates comprehensive health analysis for a single episode
 */

import { SpotifyAnalytics } from './SpotifyAnalytics';
import { DropoutAnalyzer } from './DropoutAnalyzer';
import { TopicModeler } from './TopicModeler';
import {
  EpisodeHealthReportOptions,
  EpisodeHealthReport,
  EpisodeInfo,
  HealthScore,
  PlaybackRateAnalysis,
  DropoutAnalysis,
  EngagementAnalysis,
  EpisodeDemographics,
  ActionItem,
  AIInsights,
} from '../types/health-report';

export class EpisodeHealthReportGenerator {
  private analytics: SpotifyAnalytics;
  private dropoutAnalyzer?: DropoutAnalyzer;
  private topicModeler: TopicModeler;

  constructor(analytics: SpotifyAnalytics) {
    this.analytics = analytics;
    this.topicModeler = new TopicModeler();
  }

  /**
   * Generate episode health report
   */
  async generate(options: EpisodeHealthReportOptions): Promise<EpisodeHealthReport> {
    // 1. Collect episode data
    const episodeInfo = await this.collectEpisodeData(options);

    // 2. Analyze playback rate (metric 1)
    const playbackRateAnalysis = await this.analyzePlaybackRate(
      options.podcastId,
      options.episodeId,
      episodeInfo.duration
    );

    // 3. Analyze dropout (metric 2)
    const dropoutAnalysis = await this.analyzeDropout(options, episodeInfo.duration);

    // 4. Analyze engagement (metric 3)
    const engagementAnalysis = await this.analyzeEngagement(
      options.podcastId,
      options.episodeId,
      episodeInfo.releaseDate
    );

    // 5. Get demographics
    const demographics = await this.analyzeDemographics(
      options.podcastId,
      options.episodeId
    );

    // 6. Calculate health score
    const healthScore = this.calculateHealthScore({
      playbackRateAnalysis,
      dropoutAnalysis,
      engagementAnalysis,
    });

    // 7. Generate action items
    const actionItems = this.generateActionItems({
      episodeInfo,
      playbackRateAnalysis,
      dropoutAnalysis,
      engagementAnalysis,
      healthScore,
    });

    // 8. Generate AI insights (optional, if GEMINI_API_KEY is available)
    let aiInsights: AIInsights | undefined;
    try {
      aiInsights = await this.generateAIInsights({
        episodeInfo,
        healthScore,
        playbackRateAnalysis,
        dropoutAnalysis,
        engagementAnalysis,
        actionItems,
      });
    } catch (error) {
      console.warn('AI insights generation skipped:', (error as Error).message);
    }

    return {
      episode: episodeInfo,
      healthScore,
      playbackRateAnalysis,
      dropoutAnalysis,
      engagementAnalysis,
      demographics,
      actionItems,
      aiInsights,
    };
  }

  /**
   * Collect episode data
   */
  private async collectEpisodeData(
    options: EpisodeHealthReportOptions
  ): Promise<EpisodeInfo> {
    const connector = (this.analytics as any).getConnector(options.podcastId);

    // Get episode metadata
    const metadata = await connector.metadata(options.episodeId);
    const episodeName = metadata.name || metadata.episode?.name || 'Unknown';
    const duration = metadata.duration || metadata.episode?.duration || 0;
    const releaseDate = metadata.publishTime
      ? new Date(metadata.publishTime)
      : metadata.episode?.publishTime
      ? new Date(metadata.episode.publishTime)
      : new Date();

    // Get performance data
    const performance = await this.analytics.getPerformance(options.episodeId, options.podcastId);
    const averageListenTime = (performance.averageListenPercentage / 100) * duration;

    // Get streams and listeners (last 30 days or since release)
    const endDate = new Date();
    const startDate = new Date(Math.max(releaseDate.getTime(), endDate.getTime() - 30 * 24 * 60 * 60 * 1000));

    const [streams, listeners] = await Promise.all([
      this.analytics.getStreams({
        podcastId: options.podcastId,
        episodeId: options.episodeId,
        start: startDate,
        end: endDate,
      }),
      this.analytics.getListeners({
        podcastId: options.podcastId,
        episodeId: options.episodeId,
        start: startDate,
        end: endDate,
      }),
    ]);

    const totalStreams = streams.reduce((sum, s) => sum + s.streams, 0);
    const totalListeners = listeners.reduce((sum, l) => sum + l.listeners, 0);

    return {
      id: options.episodeId,
      name: episodeName,
      releaseDate,
      duration,
      totalStreams,
      totalListeners,
      averageListenTime,
    };
  }

  /**
   * Analyze playback rate (metric 1)
   */
  private async analyzePlaybackRate(
    podcastId: string,
    episodeId: string,
    duration: number
  ): Promise<PlaybackRateAnalysis> {
    const connector = (this.analytics as any).getConnector(podcastId);
    const performanceResponse = await connector.performance(episodeId);
    const samples = performanceResponse.samples || [];

    if (samples.length === 0) {
      throw new Error('No performance samples available for playback rate analysis');
    }

    // Calculate overall playback rate
    const sum = samples.reduce((acc: number, val: number) => acc + val, 0);
    const overallRate = sum / samples.length;

    // Evaluate by standard
    let evaluation: 'excellent' | 'good' | 'needs-improvement';
    if (overallRate >= 80) {
      evaluation = 'excellent';
    } else if (overallRate >= 50) {
      evaluation = 'good';
    } else {
      evaluation = 'needs-improvement';
    }

    // Calculate by time segment
    const byTimeSegment = this.calculateTimeSegmentRates(samples, duration);

    return {
      overallRate: Math.round(overallRate * 10) / 10,
      evaluation,
      byTimeSegment,
    };
  }

  /**
   * Calculate playback rate by time segment
   */
  private calculateTimeSegmentRates(
    samples: number[],
    duration: number
  ): PlaybackRateAnalysis['byTimeSegment'] {
    const durationMinutes = duration / 60;

    // Define time boundaries in percentage
    const intro = 5 / durationMinutes * 100; // 0-5min
    const earlyMain = 15 / durationMinutes * 100; // 5-15min
    const midMain = 30 / durationMinutes * 100; // 15-30min

    // Count listeners at each boundary
    const atIntro = samples.filter(s => s >= intro).length;
    const atEarlyMain = samples.filter(s => s >= earlyMain).length;
    const atMidMain = samples.filter(s => s >= midMain).length;
    const atEnd = samples.filter(s => s >= 90).length; // 90% as "completed"

    const total = samples.length;

    return {
      intro: Math.round((atIntro / total) * 100 * 10) / 10,
      earlyMain: Math.round((atEarlyMain / total) * 100 * 10) / 10,
      midMain: Math.round((atMidMain / total) * 100 * 10) / 10,
      lateMain: Math.round((atEnd / total) * 100 * 10) / 10,
    };
  }

  /**
   * Analyze dropout (metric 2)
   */
  private async analyzeDropout(
    options: EpisodeHealthReportOptions,
    duration: number
  ): Promise<DropoutAnalysis> {
    const connector = (this.analytics as any).getConnector(options.podcastId);
    const performanceResponse = await connector.performance(options.episodeId);
    const samples = performanceResponse.samples || [];

    if (samples.length === 0) {
      throw new Error('No performance samples available for dropout analysis');
    }

    // Calculate average dropout rate
    const averageDropoutRate = 100 - samples.reduce((sum: number, s: number) => sum + s, 0) / samples.length;

    // Find max dropout point
    const sorted = [...samples].sort((a, b) => a - b);
    const maxDropoutPercentage = sorted[0];
    const maxDropoutTimestamp = (maxDropoutPercentage / 100) * duration;

    // Classify pattern
    let pattern: 'excellent' | 'standard' | 'problematic';
    if (averageDropoutRate < 20) {
      pattern = 'excellent';
    } else if (averageDropoutRate <= 40) {
      pattern = 'standard';
    } else {
      pattern = 'problematic';
    }

    // Detailed analysis if audio file is provided
    let detailedSegments;
    let topicAnalysis;
    if (options.audioFilePath) {
      if (!this.dropoutAnalyzer) {
        this.dropoutAnalyzer = new DropoutAnalyzer(this.analytics);
      }
      try {
        const detailedAnalysis = await this.dropoutAnalyzer.analyze({
          podcastId: options.podcastId,
          episodeId: options.episodeId,
          audioFilePath: options.audioFilePath,
        });
        detailedSegments = detailedAnalysis.segments;

        // Phase 3: Topic analysis
        if (detailedSegments && detailedSegments.length > 0) {
          const categorizedSegments = this.topicModeler.extractTopicsFromDropout(detailedSegments);
          detailedSegments = categorizedSegments;

          // Get dropout statistics by topic
          const dropoutByTopic = this.topicModeler.getDropoutByTopic(categorizedSegments);

          // Sort topics by dropout rate
          const sortedTopics = Object.entries(dropoutByTopic)
            .map(([name, data]) => ({
              name,
              dropoutRate: Math.round(data.averageDropoutRate * 10) / 10,
            }))
            .sort((a, b) => a.dropoutRate - b.dropoutRate);

          // Identify high interest (low dropout) and low interest (high dropout) topics
          const highInterest = sortedTopics
            .filter(t => t.dropoutRate < 30)
            .map(t => t.name);

          const lowInterest = sortedTopics
            .filter(t => t.dropoutRate > 50)
            .map(t => t.name);

          topicAnalysis = {
            topics: sortedTopics,
            highInterest,
            lowInterest,
          };
        }
      } catch (error) {
        console.warn('Detailed dropout analysis skipped:', (error as Error).message);
      }
    }

    return {
      averageDropoutRate: Math.round(averageDropoutRate * 10) / 10,
      maxDropoutPoint: {
        timestamp: Math.round(maxDropoutTimestamp),
        rate: Math.round((100 - maxDropoutPercentage) * 10) / 10,
      },
      pattern,
      detailedSegments,
      topicAnalysis,
    };
  }

  /**
   * Analyze engagement (metric 3)
   */
  private async analyzeEngagement(
    podcastId: string,
    episodeId: string,
    releaseDate: Date
  ): Promise<EngagementAnalysis> {
    // Get follower data around release date (7 days before and after)
    const beforeRelease = new Date(releaseDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const afterRelease = new Date(releaseDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const followerData = await this.analytics.getFollowers({
      podcastId,
      start: beforeRelease,
      end: afterRelease,
    });

    // Calculate follower growth around release
    const followerGrowthAroundRelease = followerData.reduce((sum, f) => sum + f.netChange, 0);

    // Get streams and listeners
    const endDate = new Date();
    const startDate = new Date(Math.max(releaseDate.getTime(), endDate.getTime() - 30 * 24 * 60 * 60 * 1000));

    const [streams, listeners] = await Promise.all([
      this.analytics.getStreams({
        podcastId,
        episodeId,
        start: startDate,
        end: endDate,
      }),
      this.analytics.getListeners({
        podcastId,
        episodeId,
        start: startDate,
        end: endDate,
      }),
    ]);

    const totalStreams = streams.reduce((sum, s) => sum + s.streams, 0);
    const totalListeners = listeners.reduce((sum, l) => sum + l.listeners, 0);

    // Get follower count at release time
    const releaseFollowerData = followerData.find(f => new Date(f.date) >= releaseDate);
    const followersAtRelease = releaseFollowerData?.followers || 1;

    // Calculate engagement rate
    const engagementRate = totalStreams / followersAtRelease;

    // Evaluate
    let evaluation: 'excellent' | 'standard' | 'needs-improvement';
    if (engagementRate >= 0.3 && followerGrowthAroundRelease > 100) {
      evaluation = 'excellent';
    } else if (engagementRate >= 0.2 || followerGrowthAroundRelease > 50) {
      evaluation = 'standard';
    } else {
      evaluation = 'needs-improvement';
    }

    return {
      followerGrowthAroundRelease,
      totalStreams,
      totalListeners,
      engagementRate: Math.round(engagementRate * 1000) / 1000,
      evaluation,
    };
  }

  /**
   * Analyze demographics
   */
  private async analyzeDemographics(
    podcastId: string,
    episodeId: string
  ): Promise<EpisodeDemographics> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const demographics = await this.analytics.getDemographics({
      podcastId,
      episodeId,
      start: startDate,
      end: endDate,
    });

    // Extract simple counts for the report
    const age: Record<string, number> = {};
    const gender: Record<string, number> = {};
    const country: Record<string, number> = {};

    if (demographics.age) {
      for (const [key, value] of Object.entries(demographics.age)) {
        age[key] = value.listenerCount;
      }
    }

    if (demographics.gender) {
      for (const [key, value] of Object.entries(demographics.gender)) {
        gender[key] = value.listenerCount;
      }
    }

    if (demographics.country) {
      for (const [key, value] of Object.entries(demographics.country)) {
        country[key] = value.listenerCount;
      }
    }

    return { age, gender, country };
  }

  /**
   * Calculate health score
   */
  private calculateHealthScore(data: {
    playbackRateAnalysis: PlaybackRateAnalysis;
    dropoutAnalysis: DropoutAnalysis;
    engagementAnalysis: EngagementAnalysis;
  }): HealthScore {
    // Playback rate score (40 points) - metric 1
    const rate = data.playbackRateAnalysis.overallRate;
    const playbackScore =
      rate >= 80 ? 40 : rate >= 70 ? 35 : rate >= 60 ? 28 : rate >= 50 ? 20 : 10;

    // Dropout rate score (30 points) - metric 2
    const dropout = data.dropoutAnalysis.averageDropoutRate;
    const dropoutScore =
      dropout <= 20 ? 30 : dropout <= 30 ? 25 : dropout <= 40 ? 18 : dropout <= 50 ? 12 : 5;

    // Engagement score (30 points) - metric 3
    const engagement = data.engagementAnalysis.engagementRate;
    const followerGrowth = data.engagementAnalysis.followerGrowthAroundRelease;
    const engagementScore =
      engagement >= 0.3 && followerGrowth > 100
        ? 30
        : engagement >= 0.2 && followerGrowth > 50
        ? 25
        : engagement >= 0.1 || followerGrowth > 20
        ? 18
        : engagement >= 0.05
        ? 12
        : 5;

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

  /**
   * Get health level from score
   */
  private getHealthLevel(
    score: number
  ): 'excellent' | 'good' | 'needs-improvement' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'critical';
  }

  /**
   * Generate action items
   */
  private generateActionItems(data: {
    episodeInfo: EpisodeInfo;
    playbackRateAnalysis: PlaybackRateAnalysis;
    dropoutAnalysis: DropoutAnalysis;
    engagementAnalysis: EngagementAnalysis;
    healthScore: HealthScore;
  }): EpisodeHealthReport['actionItems'] {
    const critical: ActionItem[] = [];
    const high: ActionItem[] = [];
    const recommended: ActionItem[] = [];
    const futureEpisodes: ActionItem[] = [];

    // Critical items
    if (data.playbackRateAnalysis.overallRate < 50) {
      critical.push({
        priority: 'critical',
        issue: `再生率が${data.playbackRateAnalysis.overallRate}%と基準値(50%)を下回っています`,
        action: 'タイトル、サムネイル、エピソード説明を見直し、リスナーの興味を引く内容に改善してください',
        expectedImpact: '再生率が10-20%向上し、新規リスナーの獲得につながります',
      });
    }

    if (data.dropoutAnalysis.pattern === 'problematic') {
      critical.push({
        priority: 'critical',
        issue: `離脱率が${data.dropoutAnalysis.averageDropoutRate}%と高く、リスナーの維持に問題があります`,
        action: `${Math.floor(data.dropoutAnalysis.maxDropoutPoint.timestamp / 60)}分${data.dropoutAnalysis.maxDropoutPoint.timestamp % 60}秒付近で最大離脱が発生しています。この箇所の内容を見直してください`,
        expectedImpact: '離脱率が15-25%改善し、平均視聴時間が延びます',
      });
    }

    if (
      data.engagementAnalysis.followerGrowthAroundRelease > 50 &&
      data.engagementAnalysis.engagementRate < 0.2
    ) {
      critical.push({
        priority: 'critical',
        issue: 'フォロワーは増えているのに再生数が伸びていません',
        action: 'タイトルやテーマがフォロワーの期待と合っていない可能性があります。フォロワー属性を分析し、興味に合った内容に調整してください',
        expectedImpact: 'エンゲージメント率が2-3倍向上し、フォロワーの定着率が上がります',
      });
    }

    // High priority items
    if (
      data.playbackRateAnalysis.overallRate >= 50 &&
      data.playbackRateAnalysis.overallRate < 80
    ) {
      high.push({
        priority: 'high',
        issue: `再生率は${data.playbackRateAnalysis.overallRate}%で基準内ですが、さらに改善の余地があります`,
        action: 'イントロ部分を短くし、早い段階で本題に入る構成を検討してください',
        expectedImpact: '再生率が70-80%以上に向上し、優良エピソードの基準を満たします',
      });
    }

    if (data.dropoutAnalysis.pattern === 'standard') {
      high.push({
        priority: 'high',
        issue: '離脱率は標準的ですが、さらなる改善が可能です',
        action: 'エピソードの中盤以降でリスナーの興味を保つ工夫（具体例、エピソード、質問など）を追加してください',
        expectedImpact: '離脱率が5-10%改善し、完走率が上がります',
      });
    }

    // Recommended items
    if (data.healthScore.level === 'excellent' || data.healthScore.level === 'good') {
      recommended.push({
        priority: 'recommended',
        issue: '現在の品質を維持しつつ、さらなる向上を目指せます',
        action: 'このエピソードの成功要因を分析し、次回エピソードでも同様の手法を活用してください',
        expectedImpact: '安定した高品質コンテンツの継続的な提供が可能になります',
      });
    }

    if (data.engagementAnalysis.evaluation === 'excellent') {
      recommended.push({
        priority: 'recommended',
        issue: 'エンゲージメントが高く、リスナーとの関係性が良好です',
        action: 'SNSやコミュニティでのリスナーとの交流を増やし、さらなるエンゲージメント向上を目指してください',
        expectedImpact: 'コミュニティが活性化し、口コミによる新規リスナー獲得が促進されます',
      });
    }

    // Future episodes suggestions
    if (data.playbackRateAnalysis.evaluation === 'excellent') {
      futureEpisodes.push({
        priority: 'recommended',
        issue: 'このエピソードの高い再生率を他のエピソードでも再現',
        action: 'このエピソードのタイトル構造、テーマ選定、イントロの長さを参考に、次回エピソードを企画してください',
        expectedImpact: 'ポッドキャスト全体の平均再生率が向上します',
      });
    }

    if (data.dropoutAnalysis.pattern === 'excellent') {
      futureEpisodes.push({
        priority: 'recommended',
        issue: 'このエピソードの優れた視聴維持率を活かす',
        action: 'このエピソードの構成（話の流れ、話題の展開、時間配分）を次回のテンプレートとして活用してください',
        expectedImpact: '視聴完走率が全体的に向上し、リスナー満足度が上がります',
      });
    }

    return {
      critical,
      high,
      recommended,
      futureEpisodes,
    };
  }

  /**
   * Generate AI insights (optional, requires GEMINI_API_KEY)
   */
  private async generateAIInsights(data: {
    episodeInfo: EpisodeInfo;
    healthScore: HealthScore;
    playbackRateAnalysis: PlaybackRateAnalysis;
    dropoutAnalysis: DropoutAnalysis;
    engagementAnalysis: EngagementAnalysis;
    actionItems: EpisodeHealthReport['actionItems'];
  }): Promise<AIInsights> {
    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build comprehensive prompt based on metrics
    const prompt = this.buildAIPrompt(data);

    try {
      const response = await model.generateContent(prompt);
      const text = response.response.text();

      // Extract JSON from response
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const insights: AIInsights = JSON.parse(jsonText);
      return insights;
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      throw error;
    }
  }

  /**
   * Build AI prompt for episode health analysis
   */
  private buildAIPrompt(data: {
    episodeInfo: EpisodeInfo;
    healthScore: HealthScore;
    playbackRateAnalysis: PlaybackRateAnalysis;
    dropoutAnalysis: DropoutAnalysis;
    engagementAnalysis: EngagementAnalysis;
    actionItems: EpisodeHealthReport['actionItems'];
  }): string {
    const { episodeInfo, healthScore, playbackRateAnalysis, dropoutAnalysis, engagementAnalysis } = data;

    // Format topic analysis if available
    let topicAnalysisText = '';
    if (dropoutAnalysis.topicAnalysis) {
      topicAnalysisText = `
## トピック別離脱率
${dropoutAnalysis.topicAnalysis.topics.map(t => `- ${t.name}: ${t.dropoutRate}%`).join('\n')}

高関心トピック（離脱率<30%）: ${dropoutAnalysis.topicAnalysis.highInterest.join(', ') || 'なし'}
低関心トピック（離脱率>50%）: ${dropoutAnalysis.topicAnalysis.lowInterest.join(', ') || 'なし'}
`;
    }

    return `あなたはポッドキャストの分析専門家です。以下のデータに基づいて、このエピソードの健全性を評価してください。

## エピソード情報
- エピソード名: ${episodeInfo.name}
- 公開日: ${episodeInfo.releaseDate.toISOString().split('T')[0]}
- エピソード長: ${Math.round(episodeInfo.duration / 60)}分
- 総再生数: ${episodeInfo.totalStreams}
- 総リスナー数: ${episodeInfo.totalListeners}
- 平均視聴時間: ${Math.round(episodeInfo.averageListenTime / 60)}分

## 評価基準（重要）
### 1. 再生率の確認（指標1）
- **基準**: 平均再生率が80％以上なら良好、50％以下は要改善
- **このエピソードの再生率**: ${playbackRateAnalysis.overallRate}%
- **評価**: ${playbackRateAnalysis.evaluation}
- **時間帯別の維持率**:
  - イントロ (0-5分): ${playbackRateAnalysis.byTimeSegment.intro}%
  - 前半 (5-15分): ${playbackRateAnalysis.byTimeSegment.earlyMain}%
  - 中盤 (15-30分): ${playbackRateAnalysis.byTimeSegment.midMain}%
  - 後半 (30分-): ${playbackRateAnalysis.byTimeSegment.lateMain}%

### 2. 離脱ポイントの特定（指標2）
- **基準**: 再生率が急激に落ちる箇所の改善が必要
- **平均離脱率**: ${dropoutAnalysis.averageDropoutRate}%
- **最大離脱ポイント**: ${Math.floor(dropoutAnalysis.maxDropoutPoint.timestamp / 60)}分${dropoutAnalysis.maxDropoutPoint.timestamp % 60}秒 (離脱率${dropoutAnalysis.maxDropoutPoint.rate}%)
- **離脱パターン**: ${dropoutAnalysis.pattern}
${topicAnalysisText}

### 3. フォロワー数と再生数のバランス（指標3）
- **基準**: フォロワーが増えているのに再生数が伸びない場合は問題
- **公開前後のフォロワー増加**: ${engagementAnalysis.followerGrowthAroundRelease}人
- **総再生数**: ${engagementAnalysis.totalStreams}
- **エンゲージメント率**: ${engagementAnalysis.engagementRate.toFixed(3)} (再生数/フォロワー数)
- **評価**: ${engagementAnalysis.evaluation}

## 健康スコア
- **総合**: ${healthScore.total}/100点 (${healthScore.level})
- **内訳**:
  - 再生率スコア: ${healthScore.breakdown.playbackRate}/40点
  - 離脱率スコア: ${healthScore.breakdown.dropoutRate}/30点
  - エンゲージメントスコア: ${healthScore.breakdown.engagement}/30点

## 求める回答
以下のJSON形式で出力してください。マークダウンのコードブロックは使わないでください：

{
  "overview": "このエピソードの全体的な評価を3-5文で。3つの指標から見た総合判断を含める",
  "playbackRateAssessment": "指標1（再生率）: このエピソードの再生率は基準を満たしているか、問題点は何か、どの時間帯が弱いか（2-3文）",
  "dropoutAssessment": "指標2（離脱ポイント）: 離脱が発生している箇所と原因の分析、トピックとの関連性（2-3文）",
  "engagementAssessment": "指標3（エンゲージメント）: フォロワー獲得・再生数の観点からの評価、バランスは適切か（2-3文）",
  "priorityActions": [
    "このエピソード固有の具体的な改善アクション1",
    "このエピソード固有の具体的な改善アクション2",
    "このエピソード固有の具体的な改善アクション3"
  ],
  "successFactors": [
    "うまくいっている点1（他のエピソードでも再現すべき要素）",
    "うまくいっている点2"
  ],
  "improvementAreas": [
    "改善が必要な点1（今後避けるべき要素）",
    "改善が必要な点2"
  ],
  "nextEpisodeSuggestions": [
    "このエピソードの分析結果を踏まえた次回の改善案1",
    "このエピソードの分析結果を踏まえた次回の改善案2"
  ]
}

重要な点：
1. 3つの指標（再生率、離脱ポイント、エンゲージメント）それぞれについて具体的に評価すること
2. 数値データに基づいた客観的な分析を行うこと
3. このエピソード固有の問題点と強みを明確にすること
4. 実行可能で具体的な改善提案を行うこと
5. 必ずJSON形式で出力し、マークダウンのコードブロックは使わないこと`;
  }
}
