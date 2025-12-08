/**
 * Topic modeling - automatic topic categorization
 */

import { TranscriptSegment, DropoutSegment, CategorizedDropoutSegment } from '../types';

export interface TopicCategory {
  category: string;
  keywords: string[];
  confidence: number;
}

export class TopicModeler {
  // 事前定義されたトピックカテゴリとキーワード
  private readonly categories = {
    '技術・開発': ['開発', 'プログラミング', 'コード', 'API', 'アルゴリズム', 'データベース', 'サーバー', 'クラウド', 'フレームワーク', 'ライブラリ'],
    '歴史・背景': ['歴史', '創業', '設立', '誕生', '開始', '起源', '初期', '創設', '発表'],
    '機能・特徴': ['機能', '特徴', 'サポート', '対応', '実装', '提供', '搭載', 'できる'],
    '問題・課題': ['問題', '課題', 'エラー', 'バグ', '欠点', '制限', '難点', '困難'],
    '改善・解決': ['改善', '解決', '修正', '対策', '最適化', '向上', '強化'],
    '比較・競合': ['比較', '違い', '対して', 'より', 'ほど', '一方', '逆に'],
    '将来・展望': ['将来', '今後', '予定', '計画', 'ロードマップ', '次期', '次世代'],
    'ツール・環境': ['ツール', 'エディタ', 'IDE', '環境', 'プラグイン', '拡張機能'],
    'コミュニティ': ['コミュニティ', 'オープンソース', 'OSS', 'GitHub', '開発者', '貢献'],
    '紹介・説明': ['紹介', '説明', '解説', 'について', 'とは', 'いう', 'です'],
  };

  /**
   * Extract topics from transcript segments
   */
  extractTopics(segments: TranscriptSegment[]): Array<TranscriptSegment & { category: string }> {
    return segments.map(segment => ({
      ...segment,
      category: this.categorizeText(segment.text),
    }));
  }

  /**
   * Extract topics from dropout segments
   */
  extractTopicsFromDropout(segments: DropoutSegment[]): CategorizedDropoutSegment[] {
    return segments.map(segment => ({
      ...segment,
      category: this.categorizeText(segment.transcript),
    }));
  }

  /**
   * Categorize text using keyword matching
   */
  private categorizeText(text: string): string {
    const scores: Record<string, number> = {};

    // Calculate score for each category
    for (const [category, keywords] of Object.entries(this.categories)) {
      let score = 0;
      for (const keyword of keywords) {
        const count = this.countOccurrences(text, keyword);
        score += count;
      }
      scores[category] = score;
    }

    // Find category with highest score
    const entries = Object.entries(scores);
    if (entries.length === 0) {
      return 'その他';
    }

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const maxScore = sorted[0][1];

    // If no keywords matched, return "その他"
    if (maxScore === 0) {
      return 'その他';
    }

    return sorted[0][0];
  }

  /**
   * Count keyword occurrences in text
   */
  private countOccurrences(text: string, keyword: string): number {
    const regex = new RegExp(keyword, 'g');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Get topic distribution statistics
   */
  getTopicDistribution(segments: Array<{ category: string }>): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const segment of segments) {
      distribution[segment.category] = (distribution[segment.category] || 0) + 1;
    }

    return distribution;
  }

  /**
   * Get dropout rate by topic
   */
  getDropoutByTopic(
    segments: Array<{ category: string; dropoutRate: number }>
  ): Record<string, { count: number; averageDropoutRate: number }> {
    const byTopic: Record<string, { total: number; count: number }> = {};

    for (const segment of segments) {
      if (!byTopic[segment.category]) {
        byTopic[segment.category] = { total: 0, count: 0 };
      }
      byTopic[segment.category].total += segment.dropoutRate;
      byTopic[segment.category].count += 1;
    }

    const result: Record<string, { count: number; averageDropoutRate: number }> = {};
    for (const [category, data] of Object.entries(byTopic)) {
      result[category] = {
        count: data.count,
        averageDropoutRate: data.total / data.count,
      };
    }

    return result;
  }
}
