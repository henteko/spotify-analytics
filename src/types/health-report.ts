/**
 * Types for Episode Health Report
 */

import { DropoutSegment } from './analysis';

export interface EpisodeHealthReportOptions {
  podcastId: string;
  episodeId: string;
  audioFilePath?: string; // Optional audio file for detailed dropout analysis
}

export interface EpisodeInfo {
  id: string;
  name: string;
  releaseDate: Date;
  duration: number; // seconds
  totalStreams: number;
  totalListeners: number;
  averageListenTime: number; // seconds
}

export interface HealthScore {
  total: number; // 0-100
  level: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  breakdown: {
    playbackRate: number; // out of 40
    dropoutRate: number; // out of 30
    engagement: number; // out of 30
  };
}

export interface PlaybackRateAnalysis {
  overallRate: number; // %
  evaluation: 'excellent' | 'good' | 'needs-improvement'; // standard
  byTimeSegment: {
    intro: number; // 0-5min
    earlyMain: number; // 5-15min
    midMain: number; // 15-30min
    lateMain: number; // 30min-end
  };
}

export interface DropoutAnalysis {
  averageDropoutRate: number;
  maxDropoutPoint: { timestamp: number; rate: number };
  pattern: 'excellent' | 'standard' | 'problematic';
  detailedSegments?: DropoutSegment[]; // Only when audio file is provided
  topicAnalysis?: {
    topics: { name: string; dropoutRate: number }[];
    highInterest: string[];
    lowInterest: string[];
  };
}

export interface EngagementAnalysis {
  followerGrowthAroundRelease: number; // Follower growth around release date
  totalStreams: number;
  totalListeners: number;
  engagementRate: number; // streams / followers at release time
  evaluation: 'excellent' | 'standard' | 'needs-improvement';
}

export interface EpisodeDemographics {
  age: Record<string, number>;
  gender: Record<string, number>;
  country: Record<string, number>;
}

export interface ActionItem {
  priority: 'critical' | 'high' | 'recommended';
  issue: string;
  action: string;
  expectedImpact: string;
}

export interface AIInsights {
  overview: string;
  playbackRateAssessment: string; // metric 1 assessment
  dropoutAssessment: string; // metric 2 assessment
  engagementAssessment: string; // metric 3 assessment
  priorityActions: string[];
  successFactors: string[];
  improvementAreas: string[];
  nextEpisodeSuggestions: string[];
}

export interface EpisodeHealthReport {
  episode: EpisodeInfo;
  healthScore: HealthScore;
  playbackRateAnalysis: PlaybackRateAnalysis;
  dropoutAnalysis: DropoutAnalysis;
  engagementAnalysis: EngagementAnalysis;
  demographics: EpisodeDemographics;
  actionItems: {
    critical: ActionItem[];
    high: ActionItem[];
    recommended: ActionItem[];
    futureEpisodes: ActionItem[];
  };
  aiInsights?: AIInsights; // Optional when GEMINI_API_KEY is not available
}

export interface VisualizerOptions {
  outputPath: string;
  title: string;
  theme: 'light' | 'dark';
}
