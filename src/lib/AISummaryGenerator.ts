/**
 * AI Summary Generator using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { DropoutAnalysisResult, CategorizedDropoutSegment } from '../types';

export interface AISummary {
  overview: string;
  keyFindings: string[];
  recommendations: string[];
  criticalSegments: Array<{
    segment: number;
    issue: string;
    suggestion: string;
  }>;
}

export class AISummaryGenerator {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
    }
  }

  /**
   * Generate AI-powered summary and recommendations
   */
  async generateSummary(result: DropoutAnalysisResult): Promise<AISummary | null> {
    if (!this.genAI) {
      console.warn('Gemini API key not configured. Skipping AI summary generation.');
      return null;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      // Prepare data for analysis
      const analysisData = this.prepareAnalysisData(result);

      const prompt = `あなたはポッドキャスト分析の専門家です。以下のリスナー離脱分析データを分析し、改善提案を含むサマリーを生成してください。

# 分析データ
${analysisData}

# 出力形式
以下のJSON形式で出力してください：

{
  "overview": "全体的な傾向と状況を2-3文で簡潔に説明",
  "keyFindings": [
    "重要な発見1",
    "重要な発見2",
    "重要な発見3"
  ],
  "recommendations": [
    "具体的な改善提案1",
    "具体的な改善提案2",
    "具体的な改善提案3"
  ],
  "criticalSegments": [
    {
      "segment": セグメント番号,
      "issue": "問題点の説明",
      "suggestion": "具体的な改善案"
    }
  ]
}

重要な点：
1. 離脱率が高いセグメントに注目し、なぜ離脱が起きたか仮説を立ててください
2. トピックの内容から、リスナーが飽きた、難しすぎた、興味がないなどの理由を推測してください
3. 具体的で実行可能な改善提案を行ってください
4. criticalSegmentsは離脱率が高い上位3-5セグメントを選んでください
5. 必ずJSON形式で出力してください。マークダウンのコードブロックは使わないでください。`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      // JSONの抽出（マークダウンコードブロックがある場合に対応）
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const summary: AISummary = JSON.parse(jsonText);
      return summary;
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      return null;
    }
  }

  /**
   * Prepare analysis data for AI
   */
  private prepareAnalysisData(result: DropoutAnalysisResult): string {
    const lines: string[] = [];

    lines.push(`## エピソード情報`);
    lines.push(`- エピソード名: ${result.episodeName}`);
    lines.push(`- 総リスナー数: ${result.totalSamples.toLocaleString()}`);
    lines.push(`- 平均離脱率: ${result.summary.averageDropoutRate.toFixed(1)}%`);
    lines.push(`- 最大離脱セグメント: #${result.summary.highestDropoutSegment?.segment || '-'}`);
    lines.push(`- 最大離脱率: ${(result.summary.highestDropoutSegment?.dropoutRate || 0).toFixed(1)}%`);
    lines.push('');

    // Top 10 worst segments
    const sortedSegments = [...result.segments].sort((a, b) => b.dropoutRate - a.dropoutRate);
    const topSegments = sortedSegments.slice(0, Math.min(10, sortedSegments.length));

    lines.push(`## 離脱率が高いセグメント（上位${topSegments.length}件）`);
    topSegments.forEach((seg) => {
      const category = (seg as CategorizedDropoutSegment).category;
      lines.push(`### セグメント #${seg.segment} - 離脱率: ${seg.dropoutRate.toFixed(1)}%`);
      lines.push(`- 話題: ${seg.topic}`);
      if (category) {
        lines.push(`- カテゴリ: ${category}`);
      }
      lines.push(`- 時間: ${this.formatTime(seg.startTime)} - ${this.formatTime(seg.endTime)}`);
      lines.push(`- リスナー推移: ${seg.listenersStart.toLocaleString()} → ${seg.listenersEnd.toLocaleString()} (-${seg.dropoutCount.toLocaleString()})`);
      lines.push(`- 内容: ${seg.transcript.substring(0, 200)}${seg.transcript.length > 200 ? '...' : ''}`);
      lines.push('');
    });

    // Category analysis if available
    const categorizedSegments = result.segments.filter((seg) => (seg as any).category);
    if (categorizedSegments.length > 0) {
      const categoryStats: Record<string, { count: number; totalDropout: number }> = {};

      categorizedSegments.forEach((seg) => {
        const category = (seg as CategorizedDropoutSegment).category;
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, totalDropout: 0 };
        }
        categoryStats[category].count++;
        categoryStats[category].totalDropout += seg.dropoutRate;
      });

      lines.push(`## カテゴリ別離脱率`);
      Object.entries(categoryStats)
        .sort((a, b) => b[1].totalDropout / b[1].count - a[1].totalDropout / a[1].count)
        .forEach(([category, stats]) => {
          const avgDropout = stats.totalDropout / stats.count;
          lines.push(`- ${category}: 平均離脱率 ${avgDropout.toFixed(1)}% (${stats.count}セグメント)`);
        });
      lines.push('');
    }

    return lines.join('\n');
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
