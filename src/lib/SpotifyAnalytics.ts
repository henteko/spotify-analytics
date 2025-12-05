/**
 * Spotify Analytics - High-level API client
 */

import { SpotifyConnector } from './SpotifyConnector';
import {
  SpotifyAnalyticsOptions,
  GetEpisodesOptions,
  GetStreamsOptions,
  GetListenersOptions,
  GetFollowersOptions,
  GetDemographicsOptions,
  ExportAllOptions,
  CSVExportOptions,
  JSONExportOptions,
  Podcast,
  Episode,
  StreamData,
  ListenerData,
  FollowerData,
  Demographics,
  DemographicData,
  PerformanceData,
  ExportResult,
  DataType,
} from '../types';

const DEFAULT_BASE_URL = 'https://generic.wg.spotify.com/podcasters/v0';
const DEFAULT_CLIENT_ID = '05a1371ee5194c27860b3ff3ff3979d2';

export class SpotifyAnalytics {
  private connector: SpotifyConnector | null = null;
  private credentials: {
    sp_dc: string;
    sp_key: string;
    client_id: string;
  };
  private defaultPodcastId?: string;
  private baseUrl: string;

  constructor(options: SpotifyAnalyticsOptions) {
    this.credentials = {
      sp_dc: options.credentials.sp_dc,
      sp_key: options.credentials.sp_key,
      client_id: options.credentials.client_id || DEFAULT_CLIENT_ID,
    };
    this.defaultPodcastId = options.podcastId;
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
  }

  /**
   * Get or create connector for a specific podcast
   */
  private getConnector(podcastId?: string): SpotifyConnector {
    const id = podcastId || this.defaultPodcastId;
    if (!id) {
      throw new Error('Podcast ID is required. Provide it in constructor or method options.');
    }

    // Create new connector (could be optimized with caching)
    return new SpotifyConnector({
      baseUrl: this.baseUrl,
      clientId: this.credentials.client_id,
      podcastId: id,
      spDc: this.credentials.sp_dc,
      spKey: this.credentials.sp_key,
    });
  }

  /**
   * Get list of user's podcasts
   */
  async getCatalog(): Promise<Podcast[]> {
    const connector = this.getConnector('dummy'); // Catalog doesn't need podcast ID
    const response = await connector.catalog();

    return response.shows.map(show => ({
      id: show.id,
      name: show.name,
      publisher: show.publisher || '',
      coverArt: show.coverArt,
    }));
  }

  /**
   * Get episodes for a podcast
   */
  async getEpisodes(options: GetEpisodesOptions = {}): Promise<Episode[]> {
    const connector = this.getConnector(options.podcastId);
    const episodes: Episode[] = [];

    const start = options.start || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Default: 1 year ago
    const end = options.end || new Date();

    let count = 0;
    const limit = options.limit || Infinity;

    for await (const episode of connector.episodes({
      start,
      end,
      sortBy: options.sortBy || 'releaseDate',
      sortOrder: options.sortOrder || 'descending',
    })) {
      episodes.push(episode);
      count++;
      if (count >= limit) {
        break;
      }
    }

    return episodes;
  }

  /**
   * Get streams data
   */
  async getStreams(options: GetStreamsOptions): Promise<StreamData[]> {
    const connector = this.getConnector(options.podcastId);
    const end = options.end || options.start;

    const response = await connector.streams(options.start, end, options.episodeId);

    const streamData: StreamData[] = [];

    for (const episodeStream of response.streams) {
      for (let i = 0; i < response.dates.length; i++) {
        streamData.push({
          date: response.dates[i],
          episodeId: episodeStream.episodeId,
          episodeName: episodeStream.episodeName,
          streams: episodeStream.streams[i] || 0,
          starts: episodeStream.starts[i] || 0,
        });
      }
    }

    return streamData;
  }

  /**
   * Get listeners data
   */
  async getListeners(options: GetListenersOptions): Promise<ListenerData[]> {
    const connector = this.getConnector(options.podcastId);
    const end = options.end || options.start;

    const response = await connector.listeners(options.start, end, options.episodeId);

    const listenerData: ListenerData[] = [];

    for (const episodeListeners of response.listeners) {
      for (let i = 0; i < response.dates.length; i++) {
        listenerData.push({
          date: response.dates[i],
          episodeId: episodeListeners.episodeId,
          episodeName: episodeListeners.episodeName,
          listeners: episodeListeners.count[i] || 0,
        });
      }
    }

    return listenerData;
  }

  /**
   * Get followers data
   */
  async getFollowers(options: GetFollowersOptions): Promise<FollowerData[]> {
    const connector = this.getConnector(options.podcastId);
    const end = options.end || options.start;

    const response = await connector.followers(options.start, end);

    const followerData: FollowerData[] = [];

    for (let i = 0; i < response.dates.length; i++) {
      const currentFollowers = response.followers[i] || 0;
      const prevFollowers = i > 0 ? response.followers[i - 1] || 0 : currentFollowers;
      const netChange = currentFollowers - prevFollowers;

      followerData.push({
        date: response.dates[i],
        followers: currentFollowers,
        netChange: i === 0 ? 0 : netChange,
      });
    }

    return followerData;
  }

  /**
   * Get demographics data
   */
  async getDemographics(options: GetDemographicsOptions): Promise<Demographics> {
    const connector = this.getConnector(options.podcastId);
    const end = options.end || options.start;
    const facet = options.facet || 'all';

    const response = await connector.aggregate(options.start, end, options.episodeId);

    const demographics: Demographics = {};

    if (facet === 'all' || facet === 'age') {
      demographics.age = this.convertDemographics(response.age);
    }

    if (facet === 'all' || facet === 'gender') {
      demographics.gender = this.convertDemographics(response.gender);
    }

    if (facet === 'all' || facet === 'country') {
      demographics.country = this.convertDemographics(response.country);
    }

    return demographics;
  }

  /**
   * Convert raw demographics to structured format
   */
  private convertDemographics(raw: Record<string, number>): Record<string, DemographicData> {
    const total = Object.values(raw).reduce((sum, val) => sum + val, 0);
    const result: Record<string, DemographicData> = {};

    for (const [key, value] of Object.entries(raw)) {
      result[key] = {
        percentage: total > 0 ? (value / total) * 100 : 0,
        listenerCount: value,
      };
    }

    return result;
  }

  /**
   * Get episode performance data
   */
  async getPerformance(episodeId: string): Promise<PerformanceData> {
    const connector = this.getConnector(this.defaultPodcastId);
    const response = await connector.performance(episodeId);

    // Get episode metadata for name
    const metadata = await connector.metadata(episodeId);

    return {
      episodeId: response.episodeId,
      episodeName: metadata.episode?.name || 'Unknown',
      averageListenPercentage: response.averageListenPercentage,
      medianListenPercentage: response.medianListenPercentage,
      completionRate: response.completionRate || 0,
    };
  }

  /**
   * Export data to CSV
   */
  async exportToCSV(
    data: any[],
    filePath: string,
    options?: CSVExportOptions
  ): Promise<void> {
    const { CSVExporter } = await import('../exporters');
    const exporter = new CSVExporter(options);
    await exporter.writeFile(data, filePath);
  }

  /**
   * Export data to JSON
   */
  async exportToJSON(
    data: any,
    filePath: string,
    options?: JSONExportOptions
  ): Promise<void> {
    const { JSONExporter } = await import('../exporters');
    const exporter = new JSONExporter(options);
    await exporter.writeFile(data, filePath);
  }

  /**
   * Export all data types
   */
  async exportAll(options: ExportAllOptions): Promise<ExportResult> {
    const { promises: fs } = await import('fs');
    const path = await import('path');

    const startTime = Date.now();
    const files: string[] = [];
    const summary: ExportResult['summary'] = {};

    // Ensure output directory exists
    await fs.mkdir(options.outputDir, { recursive: true });

    const podcastId = options.podcastId || this.defaultPodcastId;
    if (!podcastId) {
      throw new Error('Podcast ID is required');
    }

    // Get podcast metadata for naming
    const connector = this.getConnector(podcastId);
    const metadata = await connector.metadata();
    const podcastName = metadata.show?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'podcast';

    const dataTypes: DataType[] = options.include || ['episodes', 'streams', 'listeners', 'followers', 'demographics'];
    const excludeTypes = new Set(options.exclude || []);

    let currentIndex = 0;
    const totalTypes = dataTypes.filter(t => !excludeTypes.has(t)).length;

    for (const dataType of dataTypes) {
      if (excludeTypes.has(dataType)) {
        continue;
      }

      currentIndex++;

      if (options.onProgress) {
        options.onProgress({
          type: dataType,
          current: currentIndex,
          total: totalTypes,
          percentage: Math.round((currentIndex / totalTypes) * 100),
        });
      }

      const startDate = options.start.toISOString().split('T')[0];
      const endDate = (options.end || options.start).toISOString().split('T')[0];

      let data: any;
      let fileName: string;

      switch (dataType) {
        case 'episodes':
          data = await this.getEpisodes({ podcastId, start: options.start, end: options.end });
          fileName = `${podcastName}_episodes_${startDate}_${endDate}`;
          break;

        case 'streams':
          data = await this.getStreams({ podcastId, start: options.start, end: options.end });
          fileName = `${podcastName}_streams_${startDate}_${endDate}`;
          break;

        case 'listeners':
          data = await this.getListeners({ podcastId, start: options.start, end: options.end });
          fileName = `${podcastName}_listeners_${startDate}_${endDate}`;
          break;

        case 'followers':
          data = await this.getFollowers({ podcastId, start: options.start, end: options.end });
          fileName = `${podcastName}_followers_${startDate}_${endDate}`;
          break;

        case 'demographics':
          data = await this.getDemographics({ podcastId, start: options.start, end: options.end });
          fileName = `${podcastName}_demographics_${startDate}_${endDate}`;
          break;

        default:
          continue;
      }

      // Export based on format
      const format = options.format || 'csv';

      if (format === 'csv' || format === 'both') {
        const csvPath = path.join(options.outputDir, `${fileName}.csv`);
        await this.exportToCSV(Array.isArray(data) ? data : [data], csvPath);
        files.push(csvPath);

        const stats = await fs.stat(csvPath);
        summary[dataType] = {
          recordCount: Array.isArray(data) ? data.length : 1,
          fileSize: stats.size,
        };
      }

      if (format === 'json' || format === 'both') {
        const jsonPath = path.join(options.outputDir, `${fileName}.json`);
        await this.exportToJSON(data, jsonPath);
        files.push(jsonPath);

        if (format === 'json') {
          const stats = await fs.stat(jsonPath);
          summary[dataType] = {
            recordCount: Array.isArray(data) ? data.length : 1,
            fileSize: stats.size,
          };
        }
      }
    }

    return {
      files,
      duration: Date.now() - startTime,
      summary,
    };
  }
}
