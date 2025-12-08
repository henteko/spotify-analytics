/**
 * Types for dropout analysis
 */

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  duration: number;
  language: string;
  segments: TranscriptSegment[];
}

export interface DropoutSegment {
  segment: number;
  startTime: number;
  endTime: number;
  startPercentage: number;
  endPercentage: number;
  topic: string;
  transcript: string;
  listenersStart: number;
  listenersEnd: number;
  dropoutCount: number;
  dropoutRate: number;
  retentionRate: number;
}

export interface CategorizedDropoutSegment extends DropoutSegment {
  category: string;
}

export interface DropoutAnalysisResult {
  episodeId: string;
  episodeName: string;
  duration: number;
  totalSamples: number;
  segments: DropoutSegment[] | CategorizedDropoutSegment[];
  summary: {
    highestDropoutSegment?: {
      segment: number;
      topic: string;
      dropoutRate: number;
    };
    averageDropoutRate: number;
  };
}

export interface AnalyzeDropoutOptions {
  podcastId: string;
  episodeId: string;
  audioFilePath: string;
  segmentDuration?: number;
  language?: string;
  modelPath?: string;
}
