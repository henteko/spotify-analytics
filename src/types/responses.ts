/**
 * API response types
 */

export interface Podcast {
  id: string;
  name: string;
  publisher: string;
  coverArt: string;
  episodeCount?: number;
}

export interface Episode {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  duration: number;
  starts?: number;
  streams?: number;
  listeners?: number;
}

export interface StreamData {
  date: string;
  episodeId: string;
  episodeName: string;
  streams: number;
  starts: number;
}

export interface ListenerData {
  date: string;
  episodeId: string;
  episodeName: string;
  listeners: number;
}

export interface FollowerData {
  date: string;
  followers: number;
  netChange: number;
}

export interface DemographicData {
  percentage: number;
  listenerCount: number;
}

export interface Demographics {
  age?: Record<string, DemographicData>;
  gender?: Record<string, DemographicData>;
  country?: Record<string, DemographicData & { countryName?: string }>;
}

export interface PerformanceData {
  episodeId: string;
  episodeName: string;
  averageListenPercentage: number;
  medianListenPercentage: number;
  completionRate: number;
}

export interface ExportResult {
  files: string[];
  duration: number;
  summary: {
    [key: string]: {
      recordCount: number;
      fileSize: number;
    };
  };
}

// Raw API response types

export interface MetadataResponse {
  // Direct episode properties
  id?: string;
  name?: string;
  description?: string;
  duration?: number;
  releaseDate?: string;
  // Nested show/episode properties (older format)
  show?: {
    id: string;
    name: string;
    description: string;
    publisher: string;
    coverArt: string;
  };
  episode?: {
    id: string;
    name: string;
    description: string;
    duration: number;
    releaseDate: string;
  };
}

export interface StreamsResponse {
  // Episode-level format
  dates?: string[];
  streams?: Array<{
    episodeId: string;
    episodeName: string;
    starts: number[];
    streams: number[];
  }>;
  // Podcast-level format
  detailedStreams?: Array<{
    date: string;
    starts: number;
    streams: number;
    episodeId?: string;
    episodeName?: string;
  }>;
}

export interface ListenersResponse {
  // Array format
  dates?: string[];
  listeners?: Array<{
    episodeId: string;
    episodeName: string;
    count: number[];
  }>;
  // Object array format
  counts?: Array<{
    date: string;
    count: number;
  }>;
}

export interface FollowersResponse {
  // Array format
  dates?: string[];
  followers?: number[];
  // Object array format
  counts?: Array<{
    date: string;
    count: number;
  }>;
}

export interface AggregateResponse {
  // Simple format
  age?: Record<string, number>;
  gender?: Record<string, number>;
  country?: Record<string, number>;
  // Faceted format
  count?: number;
  ageFacetedCounts?: Record<string, {
    counts: Record<string, number>;
  }>;
  genderedCounts?: {
    counts: Record<string, number>;
  };
  countryCounts?: Record<string, number>;
}

export interface ImpressionsResponse {
  total?: number;
  daily?: Array<{
    date: string;
    impressions: number;
  }>;
  faceted?: {
    platform: Record<string, number>;
    source: Record<string, number>;
  };
}

export interface EpisodesResponse {
  episodes: Episode[];
  totalPages: number;
  currentPage: number;
}

export interface CatalogResponse {
  shows: Array<{
    id: string;
    name: string;
    coverArt: string;
    publisher?: string;
  }>;
}

export interface PerformanceResponse {
  episodeId?: string;
  averageListenPercentage?: number;
  medianListenPercentage?: number;
  completionRate?: number;
  // Samples array format
  samples?: number[];
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
}
