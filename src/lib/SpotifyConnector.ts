/**
 * Spotify Connector - Low-level API client
 */

import { Mutex } from 'async-mutex';
import * as yaml from 'js-yaml';
import {
  SpotifyConnectorOptions,
  RequestOptions,
  ImpressionKind,
  EpisodesOptions,
  CredentialsExpiredError,
  MaxRetriesException,
  AuthenticationError,
  MetadataResponse,
  StreamsResponse,
  ListenersResponse,
  FollowersResponse,
  AggregateResponse,
  ImpressionsResponse,
  Episode,
  CatalogResponse,
  PerformanceResponse,
  UserResponse,
} from '../types';
import { generatePKCEChallenge } from '../utils/crypto';
import { dateParams, sleep } from '../utils/date';

const DELAY_BASE = 2.0;
const MAX_REQUEST_ATTEMPTS = 6;
const IMPRESSIONS_DAYS_DIFF = 29;

export class SpotifyConnector {
  private baseUrl: string;
  private clientId: string;
  private podcastId: string;
  private spDc: string;
  private spKey: string;

  private bearer: string | null = null;
  private bearerExpires: Date | null = null;
  private authLock: Mutex;
  private authPoisoned: boolean = false;

  constructor(options: SpotifyConnectorOptions) {
    this.baseUrl = options.baseUrl;
    this.clientId = options.clientId;
    this.podcastId = options.podcastId;
    this.spDc = options.spDc;
    this.spKey = options.spKey;
    this.authLock = new Mutex();
  }

  /**
   * Authenticate with Spotify using PKCE flow
   */
  private async authenticate(): Promise<void> {
    if (this.authPoisoned) {
      throw new CredentialsExpiredError(
        'Authentication has failed, not retrying. Check credentials and try again.'
      );
    }

    await this.authLock.runExclusive(async () => {
      const { state, codeVerifier, codeChallenge } = await generatePKCEChallenge();

      // Step 1: User authorization request
      const authUrl = 'https://accounts.spotify.com/oauth2/v2/auth?' + new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        scope: 'streaming ugc-image-upload user-read-email user-read-private',
        redirect_uri: 'https://creators.spotify.com',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state,
        response_mode: 'web_message',
        prompt: 'none',
      });

      const authResponse = await fetch(authUrl, {
        headers: {
          Cookie: `sp_dc=${this.spDc}; sp_key=${this.spKey}`,
        },
      });

      if (!authResponse.ok) {
        throw new Error(`Auth request failed: ${authResponse.status}`);
      }

      const html = await authResponse.text();

      // Check for login_required error
      if (html.includes('login_required')) {
        this.authPoisoned = true;
        throw new CredentialsExpiredError(
          'Login required (credentials cookie expired?)'
        );
      }

      // Extract JavaScript response
      const match = html.match(/const authorizationResponse = (.*?);/s);
      if (!match) {
        throw new AuthenticationError('Could not extract authorization response');
      }

      // Parse using YAML (since it's not valid JSON)
      const authData: any = yaml.load(match[1]);

      // Validate response
      if (authData.type !== 'authorization_response') {
        throw new AuthenticationError(
          `Expected authorization_response, got ${authData.type}`
        );
      }
      if (authData.response.state !== state) {
        throw new AuthenticationError('State parameter mismatch');
      }

      const authCode = authData.response.code;

      // Step 2: Request bearer token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          code: authCode,
          redirect_uri: 'https://creators.spotify.com',
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      const tokenData: any = await tokenResponse.json();

      this.bearer = tokenData.access_token;
      this.bearerExpires = new Date(Date.now() + tokenData.expires_in * 1000);
    });
  }

  /**
   * Ensure authentication token is valid
   */
  private async ensureAuth(): Promise<void> {
    // Re-authenticate if token is missing or expires within 5 minutes
    if (
      !this.bearer ||
      !this.bearerExpires ||
      this.bearerExpires < new Date(Date.now() + 5 * 60 * 1000)
    ) {
      await this.authenticate();
    }
  }

  /**
   * Make an authenticated request with retry logic
   */
  private async request<T = any>(options: RequestOptions): Promise<T> {
    const { url, params } = options;
    let delay = DELAY_BASE;
    let lastStatusCode: number | null = null;
    let lastException: Error | null = null;

    for (let attempt = 0; attempt < MAX_REQUEST_ATTEMPTS; attempt++) {
      try {
        // Only attempt auth if no network error occurred
        if (attempt === 0 || lastException === null) {
          await this.ensureAuth();
        }

        const queryString = params ? '?' + new URLSearchParams(params) : '';
        const response = await fetch(url + queryString, {
          headers: {
            Authorization: `Bearer ${this.bearer}`,
          },
        });

        // Handle rate limiting and server errors
        if ([429, 502, 503, 504].includes(response.status)) {
          lastStatusCode = response.status;
          delay *= 2;

          const logLevel = attempt < 3 ? 'info' : 'warn';
          console[logLevel](
            `Got ${response.status} for URL "${url}", next delay: ${delay}s`
          );

          await sleep(delay);
          continue;
        }

        // Handle authentication errors
        if (response.status === 401) {
          lastStatusCode = response.status;
          await this.authenticate(); // Force re-authentication
          continue;
        }

        // Handle other HTTP errors
        if (!response.ok) {
          lastStatusCode = response.status;
          const text = await response.text();
          console.error('Error in API:');
          console.info(response.status);
          console.info(response.headers);
          console.info(text);
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        // Success
        return await response.json() as T;

      } catch (error) {
        // Network errors
        if (
          error instanceof TypeError ||
          (error as any).name === 'AbortError'
        ) {
          lastException = error as Error;
          delay *= 2;

          const logLevel = attempt < 3 ? 'info' : 'warn';
          console[logLevel](
            `Network error for URL "${url}": ${(error as Error).message} ` +
            `(attempt ${attempt + 1}/${MAX_REQUEST_ATTEMPTS}), next delay: ${delay}s`
          );

          if (attempt < MAX_REQUEST_ATTEMPTS - 1) {
            await sleep(delay);
          }
          continue;
        }

        // Other errors thrown immediately
        throw error;
      }
    }

    // All retries failed
    if (lastException) {
      throw lastException;
    }
    throw new MaxRetriesException(url, lastStatusCode, MAX_REQUEST_ATTEMPTS);
  }

  /**
   * Build API URL
   */
  private buildUrl(...paths: string[]): string {
    return `${this.baseUrl}/${paths.join('/')}`;
  }

  /**
   * Set appropriate date range for impressions endpoint
   */
  private setImpressionDateRange(
    kind: ImpressionKind,
    start: Date,
    end: Date
  ): [Date, Date] {
    if (kind === 'total' || kind === 'faceted') {
      const newEnd = new Date(start.getTime() + IMPRESSIONS_DAYS_DIFF * 24 * 60 * 60 * 1000);

      if (newEnd.getTime() !== end.getTime()) {
        console.warn(
          `kind is ${kind}, overriding end date to be ${IMPRESSIONS_DAYS_DIFF} days ` +
          `after start date (${start.toISOString().split('T')[0]}). ` +
          `New end date: ${newEnd.toISOString().split('T')[0]}`
        );
      }

      return [start, newEnd];
    }

    if (end < start) {
      console.warn(
        `End date ${end.toISOString().split('T')[0]} is before ` +
        `start date ${start.toISOString().split('T')[0]}, setting end date to start date.`
      );
      return [start, start];
    }

    return [start, end];
  }

  // Public API methods

  async metadata(episodeId?: string): Promise<MetadataResponse> {
    const url = episodeId
      ? this.buildUrl('episodes', episodeId, 'metadata')
      : this.buildUrl('shows', this.podcastId, 'metadata');

    return this.request({ url });
  }

  async streams(start: Date, end?: Date, episodeId?: string): Promise<StreamsResponse> {
    const endDate = end || start;

    const url = episodeId
      ? this.buildUrl('episodes', episodeId, 'detailedStreams')
      : this.buildUrl('shows', this.podcastId, 'detailedStreams');

    return this.request({
      url,
      params: dateParams(start, endDate),
    });
  }

  async listeners(start: Date, end?: Date, episodeId?: string): Promise<ListenersResponse> {
    const endDate = end || start;

    const url = episodeId
      ? this.buildUrl('episodes', episodeId, 'listeners')
      : this.buildUrl('shows', this.podcastId, 'listeners');

    return this.request({
      url,
      params: dateParams(start, endDate),
    });
  }

  async followers(start: Date, end?: Date): Promise<FollowersResponse> {
    const endDate = end || start;

    const url = this.buildUrl('shows', this.podcastId, 'followers');

    return this.request({
      url,
      params: dateParams(start, endDate),
    });
  }

  async impressions(
    kind: ImpressionKind = 'total',
    start?: Date,
    end?: Date
  ): Promise<ImpressionsResponse> {
    const defaultStart = start || new Date(Date.now() - IMPRESSIONS_DAYS_DIFF * 24 * 60 * 60 * 1000);
    const defaultEnd = end || new Date(defaultStart.getTime() + IMPRESSIONS_DAYS_DIFF * 24 * 60 * 60 * 1000);

    const [validStart, validEnd] = this.setImpressionDateRange(
      kind,
      defaultStart,
      defaultEnd
    );

    const url = this.buildUrl('shows', this.podcastId, 'impressions', kind);

    return this.request({
      url,
      params: dateParams(validStart, validEnd),
    });
  }

  async aggregate(start: Date, end?: Date, episodeId?: string): Promise<AggregateResponse> {
    const endDate = end || start;

    const url = episodeId
      ? this.buildUrl('episodes', episodeId, 'aggregate')
      : this.buildUrl('shows', this.podcastId, 'aggregate');

    return this.request({
      url,
      params: dateParams(start, endDate),
    });
  }

  async *episodes(options: EpisodesOptions): AsyncGenerator<Episode, void, unknown> {
    const {
      start,
      end = start,
      page: initialPage = 1,
      size = 50,
      sortBy = 'releaseDate',
      sortOrder = 'descending',
      filterBy = '',
    } = options;

    const url = this.buildUrl('shows', this.podcastId, 'episodes');
    const datePrms = dateParams(start, end);
    let currentPage = initialPage;

    while (true) {
      const response: any = await this.request({
        url,
        params: {
          ...datePrms,
          page: currentPage.toString(),
          size: size.toString(),
          sortBy,
          sortOrder,
          filter: filterBy,
        },
      });

      for (const episode of response.episodes) {
        yield episode;
      }

      if (currentPage === response.totalPages) {
        break;
      }

      currentPage++;
    }
  }

  async catalog(): Promise<CatalogResponse> {
    const url = this.buildUrl('user', 'shows');

    // Set wide date range to include all shows
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1); // 1 year in the future
    const start = new Date();
    start.setFullYear(start.getFullYear() - 10); // 10 years in the past

    return this.request({
      url,
      params: {
        page: '1',
        size: '200',
        sortBy: 'name',
        sortOrder: 'ascending',
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    });
  }

  async performance(episodeId: string): Promise<PerformanceResponse> {
    const url = this.buildUrl('episodes', episodeId, 'performance');
    return this.request({ url });
  }

  async me(): Promise<UserResponse> {
    const url = this.buildUrl('user', 'me');
    return this.request({ url });
  }
}
