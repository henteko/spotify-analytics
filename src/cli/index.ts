/**
 * Spotify Analytics CLI
 */

import { Command } from 'commander';
import { SpotifyAnalytics } from '../lib';
import { loadEnv, getCredentials } from './utils/config';
import { Logger } from './utils/logger';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('spotify-analytics')
  .description('Spotify Podcast Analytics CLI & Library')
  .version('1.0.0');

// Global options
program
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress non-error output');

// Init command
program
  .command('init')
  .description('Create configuration file')
  .action(async () => {
    await initCommand();
  });

// Streams command
program
  .command('streams')
  .description('Get streams data')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--episode-id <id>', 'Specific episode ID')
  .option('-f, --format <format>', 'Output format (csv/json)', 'csv')
  .action(async (options) => {
    const logger = new Logger(program.opts().verbose, program.opts().quiet);

    try {
      await loadEnv(program.opts().config);
      const credentials = getCredentials();

      if (!credentials) {
        logger.error('No credentials found. Run "spotify-analytics init" first or set SPOTIFY_SP_DC and SPOTIFY_SP_KEY environment variables.');
        process.exit(2);
      }

      const analytics = new SpotifyAnalytics({ credentials });
      const start = new Date(options.start);
      const end = options.end ? new Date(options.end) : undefined;

      const streams = await analytics.getStreams({
        podcastId: options.podcastId,
        episodeId: options.episodeId,
        start,
        end,
      });

      if (options.format === 'csv') {
        const { CSVExporter } = await import('../exporters');
        const exporter = new CSVExporter();
        console.log(exporter.stringify(streams));
      } else {
        console.log(JSON.stringify(streams, null, 2));
      }
    } catch (error) {
      logger.error(`Failed to get streams: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Episodes command
program
  .command('episodes')
  .description('Get episodes list')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .option('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--limit <number>', 'Maximum number of episodes', parseInt)
  .option('-f, --format <format>', 'Output format (csv/json)', 'csv')
  .action(async (options) => {
    const logger = new Logger(program.opts().verbose, program.opts().quiet);

    try {
      await loadEnv(program.opts().config);
      const credentials = getCredentials();

      if (!credentials) {
        logger.error('No credentials found. Run "spotify-analytics init" first or set SPOTIFY_SP_DC and SPOTIFY_SP_KEY environment variables.');
        process.exit(2);
      }

      const analytics = new SpotifyAnalytics({ credentials });

      const episodes = await analytics.getEpisodes({
        podcastId: options.podcastId,
        start: options.start ? new Date(options.start) : undefined,
        end: options.end ? new Date(options.end) : undefined,
        limit: options.limit,
      });

      if (options.format === 'csv') {
        const { CSVExporter } = await import('../exporters');
        const exporter = new CSVExporter();
        console.log(exporter.stringify(episodes));
      } else {
        console.log(JSON.stringify(episodes, null, 2));
      }
    } catch (error) {
      logger.error(`Failed to get episodes: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Export-all command
program
  .command('export-all')
  .description('Export all data types')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--output-dir <dir>', 'Output directory', './output')
  .option('-f, --format <format>', 'Output format (csv/json/both)', 'csv')
  .action(async (options) => {
    const logger = new Logger(program.opts().verbose, program.opts().quiet);

    try {
      await loadEnv(program.opts().config);
      const credentials = getCredentials();

      if (!credentials) {
        logger.error('No credentials found. Run "spotify-analytics init" first or set SPOTIFY_SP_DC and SPOTIFY_SP_KEY environment variables.');
        process.exit(2);
      }

      const analytics = new SpotifyAnalytics({ credentials });
      const start = new Date(options.start);
      const end = options.end ? new Date(options.end) : undefined;

      logger.info(`Exporting all data for podcast ${options.podcastId}...`);

      const result = await analytics.exportAll({
        podcastId: options.podcastId,
        start,
        end,
        outputDir: options.outputDir,
        format: options.format,
        onProgress: (progress) => {
          logger.info(`${progress.type}: ${progress.percentage}%`);
        },
      });

      logger.success(`\nExported ${result.files.length} files in ${result.duration}ms`);
      logger.info('\nGenerated files:');
      result.files.forEach(file => logger.info(`  - ${file}`));
    } catch (error) {
      logger.error(`Failed to export data: ${(error as Error).message}`);
      if (program.opts().verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

// Me command (get user info)
program
  .command('me')
  .description('Get current user information')
  .action(async () => {
    const logger = new Logger(program.opts().verbose, program.opts().quiet);

    try {
      await loadEnv(program.opts().config);
      const credentials = getCredentials();

      if (!credentials) {
        logger.error('No credentials found. Run "spotify-analytics init" first or set SPOTIFY_SP_DC and SPOTIFY_SP_KEY environment variables.');
        process.exit(2);
      }

      const analytics = new SpotifyAnalytics({ credentials });
      const connector = (analytics as any).getConnector('dummy');
      const userInfo = await connector.me();

      logger.info('User Information:');
      console.log(JSON.stringify(userInfo, null, 2));
    } catch (error) {
      logger.error(`Failed to get user info: ${(error as Error).message}`);
      if (program.opts().verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
