/**
 * Configuration and option types
 */

export interface SpotifyConnectorOptions {
  baseUrl: string;
  clientId: string;
  podcastId: string;
  spDc: string;
  spKey: string;
}

export interface SpotifyAnalyticsOptions {
  credentials: {
    sp_dc: string;
    sp_key: string;
    client_id?: string;
  };
  podcastId?: string;
  baseUrl?: string;
}

export interface GetEpisodesOptions {
  podcastId?: string;
  start?: Date;
  end?: Date;
  sortBy?: 'releaseDate' | 'title';
  sortOrder?: 'ascending' | 'descending';
  limit?: number;
}

export interface GetStreamsOptions {
  podcastId?: string;
  episodeId?: string;
  start: Date;
  end?: Date;
}

export interface GetListenersOptions {
  podcastId?: string;
  episodeId?: string;
  start: Date;
  end?: Date;
}

export interface GetFollowersOptions {
  podcastId?: string;
  start: Date;
  end?: Date;
}

export interface GetDemographicsOptions {
  podcastId?: string;
  episodeId?: string;
  start: Date;
  end?: Date;
  facet?: 'age' | 'gender' | 'country' | 'all';
}

export type DataType = 'episodes' | 'streams' | 'listeners' | 'followers' | 'demographics';

export interface ExportAllOptions {
  podcastId?: string;
  start: Date;
  end?: Date;
  outputDir: string;
  format?: 'csv' | 'json' | 'both';
  include?: DataType[];
  exclude?: DataType[];
  onProgress?: (progress: ProgressInfo) => void;
}

export interface ProgressInfo {
  type: DataType;
  current: number;
  total: number;
  percentage: number;
}

export interface CSVExportOptions {
  delimiter?: string;
  encoding?: BufferEncoding;
  includeHeaders?: boolean;
  headers?: string[];
}

export interface JSONExportOptions {
  pretty?: boolean;
  encoding?: BufferEncoding;
}

export type ImpressionKind = 'total' | 'daily' | 'faceted';

export interface EpisodesOptions {
  start: Date;
  end?: Date;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ascending' | 'descending';
  filterBy?: string;
}

export interface RequestOptions {
  url: string;
  params?: Record<string, string>;
}
