/**
 * Dropout analyzer - combines performance data with transcript
 */

import { LocalWhisperClient } from './LocalWhisperClient';
import { SpotifyAnalytics } from './SpotifyAnalytics';
import {
  AnalyzeDropoutOptions,
  DropoutAnalysisResult,
  DropoutSegment,
  TranscriptSegment,
} from '../types';

export class DropoutAnalyzer {
  private analytics: SpotifyAnalytics;
  private whisperClient?: LocalWhisperClient;

  constructor(analytics: SpotifyAnalytics) {
    this.analytics = analytics;
  }

  /**
   * Analyze dropout patterns for an episode
   */
  async analyze(options: AnalyzeDropoutOptions): Promise<DropoutAnalysisResult> {
    const {
      podcastId,
      episodeId,
      audioFilePath,
      segmentDuration = 60,
      language = 'ja',
    } = options;

    // 1. Get episode metadata and performance data
    const connector = (this.analytics as any).getConnector(podcastId);
    const metadata = await connector.metadata(episodeId);
    const performanceResponse = await connector.performance(episodeId);

    const episodeName = metadata.name || metadata.episode?.name || 'Unknown';
    const duration = metadata.duration || metadata.episode?.duration || 0;
    const samples = performanceResponse.samples || [];

    if (samples.length === 0) {
      throw new Error('No performance samples available for this episode');
    }

    // 2. Transcribe audio using whisper.cpp
    if (!this.whisperClient) {
      this.whisperClient = new LocalWhisperClient({
        language,
        modelPath: options.modelPath,
      });
    }
    const transcript = await this.whisperClient.transcribe(audioFilePath);

    // 3. Split into segments
    const segments = this.whisperClient.splitIntoSegments(transcript, segmentDuration);

    // 4. Calculate dropout for each segment
    const dropoutSegments = this.calculateDropout(segments, samples, duration);

    // 5. Calculate summary
    const summary = this.calculateSummary(dropoutSegments);

    return {
      episodeId,
      episodeName,
      duration,
      totalSamples: samples.length,
      segments: dropoutSegments,
      summary,
    };
  }

  /**
   * Calculate dropout rate for each segment
   */
  private calculateDropout(
    segments: TranscriptSegment[],
    samples: number[],
    episodeDuration: number
  ): DropoutSegment[] {
    const dropoutSegments: DropoutSegment[] = [];
    const totalListeners = samples.length;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const startPercentage = (segment.start / episodeDuration) * 100;
      const endPercentage = (segment.end / episodeDuration) * 100;

      // Count listeners still active at segment start
      const listenersStart = samples.filter(s => s >= startPercentage).length;

      // Count listeners still active at segment end
      const listenersEnd = samples.filter(s => s >= endPercentage).length;

      // Calculate dropout
      const dropoutCount = listenersStart - listenersEnd;
      const dropoutRate = listenersStart > 0 ? (dropoutCount / listenersStart) * 100 : 0;
      const retentionRate = 100 - dropoutRate;

      dropoutSegments.push({
        segment: i + 1,
        startTime: segment.start,
        endTime: segment.end,
        startPercentage,
        endPercentage,
        topic: this.summarizeTopic(segment.text),
        transcript: segment.text,
        listenersStart,
        listenersEnd,
        dropoutCount,
        dropoutRate: Math.round(dropoutRate * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
      });
    }

    return dropoutSegments;
  }

  /**
   * Summarize segment topic (first 100 characters for now)
   */
  private summarizeTopic(text: string): string {
    if (text.length <= 100) {
      return text;
    }
    return text.substring(0, 97) + '...';
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(segments: DropoutSegment[]): {
    highestDropoutSegment?: {
      segment: number;
      topic: string;
      dropoutRate: number;
    };
    averageDropoutRate: number;
  } {
    if (segments.length === 0) {
      return { averageDropoutRate: 0 };
    }

    // Find highest dropout segment
    const highestDropout = segments.reduce((max, seg) =>
      seg.dropoutRate > max.dropoutRate ? seg : max
    );

    // Calculate average dropout rate
    const totalDropoutRate = segments.reduce((sum, seg) => sum + seg.dropoutRate, 0);
    const averageDropoutRate = Math.round((totalDropoutRate / segments.length) * 10) / 10;

    return {
      highestDropoutSegment: {
        segment: highestDropout.segment,
        topic: highestDropout.topic,
        dropoutRate: highestDropout.dropoutRate,
      },
      averageDropoutRate,
    };
  }
}
