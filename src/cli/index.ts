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
  .option('--raw', 'Output raw API response')
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
      const connector = (analytics as any).getConnector(options.podcastId);
      const start = new Date(options.start);
      const end = options.end ? new Date(options.end) : undefined;

      // Output raw API response if requested
      if (options.raw) {
        const rawResponse = await connector.streams(start, end || start, options.episodeId);
        console.log(JSON.stringify(rawResponse, null, 2));
        return;
      }

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
  .option('--raw', 'Output raw API response')
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
      const connector = (analytics as any).getConnector(options.podcastId);

      // Output raw API response if requested
      if (options.raw) {
        const start = options.start ? new Date(options.start) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const end = options.end ? new Date(options.end) : new Date();
        const episodes = [];
        let count = 0;
        const limit = options.limit || 10;

        for await (const episode of connector.episodes({ start, end, sortBy: 'releaseDate', sortOrder: 'descending' })) {
          episodes.push(episode);
          count++;
          if (count >= limit) break;
        }
        console.log(JSON.stringify(episodes, null, 2));
        return;
      }

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

// Listeners command
program
  .command('listeners')
  .description('Get listeners data')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--episode-id <id>', 'Specific episode ID')
  .option('-f, --format <format>', 'Output format (csv/json)', 'csv')
  .option('--raw', 'Output raw API response')
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
      const connector = (analytics as any).getConnector(options.podcastId);
      const start = new Date(options.start);
      const end = options.end ? new Date(options.end) : undefined;

      // Output raw API response if requested
      if (options.raw) {
        const rawResponse = await connector.listeners(start, end || start, options.episodeId);
        console.log(JSON.stringify(rawResponse, null, 2));
        return;
      }

      const listeners = await analytics.getListeners({
        podcastId: options.podcastId,
        episodeId: options.episodeId,
        start,
        end,
      });

      if (options.format === 'csv') {
        const { CSVExporter } = await import('../exporters');
        const exporter = new CSVExporter();
        console.log(exporter.stringify(listeners));
      } else {
        console.log(JSON.stringify(listeners, null, 2));
      }
    } catch (error) {
      logger.error(`Failed to get listeners: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Followers command
program
  .command('followers')
  .description('Get followers data')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('-f, --format <format>', 'Output format (csv/json)', 'csv')
  .option('--raw', 'Output raw API response')
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
      const connector = (analytics as any).getConnector(options.podcastId);
      const start = new Date(options.start);
      const end = options.end ? new Date(options.end) : undefined;

      // Output raw API response if requested
      if (options.raw) {
        const rawResponse = await connector.followers(start, end || start);
        console.log(JSON.stringify(rawResponse, null, 2));
        return;
      }

      const followers = await analytics.getFollowers({
        podcastId: options.podcastId,
        start,
        end,
      });

      if (options.format === 'csv') {
        const { CSVExporter } = await import('../exporters');
        const exporter = new CSVExporter();
        console.log(exporter.stringify(followers));
      } else {
        console.log(JSON.stringify(followers, null, 2));
      }
    } catch (error) {
      logger.error(`Failed to get followers: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Demographics command
program
  .command('demographics')
  .description('Get demographics data')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--episode-id <id>', 'Specific episode ID')
  .option('--facet <facet>', 'Demographic facet (age/gender/country/all)', 'all')
  .option('-f, --format <format>', 'Output format (csv/json)', 'csv')
  .option('--raw', 'Output raw API response')
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
      const connector = (analytics as any).getConnector(options.podcastId);
      const start = new Date(options.start);
      const end = options.end ? new Date(options.end) : undefined;

      // Output raw API response if requested
      if (options.raw) {
        const rawResponse = await connector.aggregate(start, end || start, options.episodeId);
        console.log(JSON.stringify(rawResponse, null, 2));
        return;
      }

      const demographics = await analytics.getDemographics({
        podcastId: options.podcastId,
        episodeId: options.episodeId,
        start,
        end,
        facet: options.facet,
      });

      if (options.format === 'csv') {
        // Flatten demographics data for CSV output
        const flatData: any[] = [];
        for (const [facetType, facetData] of Object.entries(demographics)) {
          for (const [key, value] of Object.entries(facetData as Record<string, any>)) {
            flatData.push({
              facet: facetType,
              category: key,
              percentage: value.percentage,
              listenerCount: value.listenerCount,
              countryName: value.countryName || '',
            });
          }
        }
        const { CSVExporter } = await import('../exporters');
        const exporter = new CSVExporter();
        console.log(exporter.stringify(flatData));
      } else {
        console.log(JSON.stringify(demographics, null, 2));
      }
    } catch (error) {
      logger.error(`Failed to get demographics: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Performance command
program
  .command('performance')
  .description('Get episode performance data')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--episode-id <id>', 'Episode ID')
  .option('-f, --format <format>', 'Output format (csv/json)', 'csv')
  .option('--raw', 'Output raw API response')
  .option('--metadata', 'Output raw metadata API response')
  .action(async (options) => {
    const logger = new Logger(program.opts().verbose, program.opts().quiet);

    try {
      await loadEnv(program.opts().config);
      const credentials = getCredentials();

      if (!credentials) {
        logger.error('No credentials found. Run "spotify-analytics init" first or set SPOTIFY_SP_DC and SPOTIFY_SP_KEY environment variables.');
        process.exit(2);
      }

      const analytics = new SpotifyAnalytics({
        credentials,
        podcastId: options.podcastId
      });
      const connector = (analytics as any).getConnector(options.podcastId);

      // Output raw metadata API response if requested
      if (options.metadata) {
        const rawMetadata = await connector.metadata(options.episodeId);
        console.log(JSON.stringify(rawMetadata, null, 2));
        return;
      }

      // Output raw API response if requested
      if (options.raw) {
        const rawResponse = await connector.performance(options.episodeId);
        console.log(JSON.stringify(rawResponse, null, 2));
        return;
      }

      const performance = await analytics.getPerformance(options.episodeId);

      if (options.format === 'csv') {
        const { CSVExporter } = await import('../exporters');
        const exporter = new CSVExporter();
        console.log(exporter.stringify([performance]));
      } else {
        console.log(JSON.stringify(performance, null, 2));
      }
    } catch (error) {
      logger.error(`Failed to get performance: ${(error as Error).message}`);
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

// Analyze-dropout command
program
  .command('analyze-dropout')
  .description('Generate HTML visualization report for dropout analysis')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--episode-id <id>', 'Episode ID')
  .requiredOption('--audio <path>', 'Audio file path')
  .option('--segment-duration <seconds>', 'Segment duration in seconds', '60')
  .option('--language <lang>', 'Audio language', 'ja')
  .option('--model-path <path>', 'Path to whisper model file')
  .option('--output-dir <dir>', 'Output directory for HTML report', './output')
  .option('--theme <theme>', 'Visualization theme (light/dark)', 'light')
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
      const { DropoutAnalyzer, DropoutVisualizer, TopicModeler, AISummaryGenerator } = await import('../lib');

      logger.info('Using whisper.cpp for local transcription');
      logger.info('Make sure whisper.cpp is installed: https://github.com/ggerganov/whisper.cpp');

      const analyzer = new DropoutAnalyzer(analytics);

      logger.info(`Analyzing dropout for episode ${options.episodeId}...`);
      logger.info('Step 1: Transcribing audio (this may take a few minutes)...');

      const result = await analyzer.analyze({
        podcastId: options.podcastId,
        episodeId: options.episodeId,
        audioFilePath: options.audio,
        segmentDuration: parseInt(options.segmentDuration),
        language: options.language,
        modelPath: options.modelPath,
      });

      logger.info('Step 2: Calculating dropout rates...');

      // Topic categorization (always enabled)
      logger.info('Step 3: Categorizing topics...');
      const topicModeler = new TopicModeler();
      const categorizedSegments = topicModeler.extractTopicsFromDropout(result.segments);
      result.segments = categorizedSegments;

      const distribution = topicModeler.getTopicDistribution(categorizedSegments);
      const dropoutByTopic = topicModeler.getDropoutByTopic(categorizedSegments);

      logger.info('Topic distribution:');
      for (const [topic, count] of Object.entries(distribution)) {
        const avg = dropoutByTopic[topic]?.averageDropoutRate.toFixed(1) || '0.0';
        logger.info(`  ${topic}: ${count} segments (avg dropout: ${avg}%)`);
      }

      logger.info('Analysis complete!');

      // Generate AI summary
      logger.info('Step 4: Generating AI-powered summary...');
      const summaryGenerator = new AISummaryGenerator();
      const aiSummary = await summaryGenerator.generateSummary(result);

      if (aiSummary) {
        logger.info('AI summary generated successfully');
      } else {
        logger.warn('AI summary generation skipped (GEMINI_API_KEY not set)');
      }

      // Generate HTML visualization
      const { promises: fs } = await import('fs');
      await fs.mkdir(options.outputDir, { recursive: true });

      const visualizer = new DropoutVisualizer();
      const htmlPath = `${options.outputDir}/dropout-analysis-${options.episodeId}.html`;
      visualizer.generateHTML(result, {
        outputPath: htmlPath,
        title: `Dropout Analysis - ${result.episodeName}`,
        theme: options.theme,
        aiSummary,
      });

      logger.info(`✅ HTML report saved to: ${htmlPath}`);
      logger.info(`Open it in your browser to view the interactive analysis!`);
    } catch (error) {
      logger.error(`Failed to analyze dropout: ${(error as Error).message}`);
      if (program.opts().verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

// Episode report command
program
  .command('episode-report')
  .description('Generate comprehensive health report for a single episode')
  .requiredOption('--podcast-id <id>', 'Podcast ID')
  .requiredOption('--episode-id <id>', 'Episode ID')
  .option('--audio <path>', 'Audio file path for detailed dropout analysis (optional)')
  .option('--output-dir <dir>', 'Output directory', './reports')
  .option('--theme <theme>', 'Theme (light/dark)', 'light')
  .action(async (options) => {
    const logger = new Logger(program.opts().verbose, program.opts().quiet);

    try {
      await loadEnv(program.opts().config);
      const credentials = getCredentials();

      if (!credentials) {
        logger.error('No credentials found. Run "spotify-analytics init" first or set SPOTIFY_SP_DC and SPOTIFY_SP_KEY environment variables.');
        process.exit(2);
      }

      logger.info('🏥 Episode Health Report Generator');
      logger.info('====================================');

      const analytics = new SpotifyAnalytics({ credentials });

      // Step 1: Generate health report
      logger.info('Step 1: Collecting episode data...');
      const { EpisodeHealthReportGenerator } = await import('../lib/EpisodeHealthReportGenerator');
      const generator = new EpisodeHealthReportGenerator(analytics);

      const report = await generator.generate({
        podcastId: options.podcastId,
        episodeId: options.episodeId,
        audioFilePath: options.audio,
      });

      logger.info('✅ Health report generated successfully!');
      logger.info(`   Health Score: ${report.healthScore.total}/100 (${report.healthScore.level})`);
      logger.info(`   Playback Rate: ${report.playbackRateAnalysis.overallRate}%`);
      logger.info(`   Dropout Rate: ${report.dropoutAnalysis.averageDropoutRate}%`);
      logger.info(`   Engagement Rate: ${report.engagementAnalysis.engagementRate.toFixed(3)}`);

      // Step 2: Generate HTML visualization
      logger.info('Step 2: Generating HTML report...');
      const { promises: fs } = await import('fs');
      await fs.mkdir(options.outputDir, { recursive: true });

      const { EpisodeHealthReportVisualizer } = await import('../lib/EpisodeHealthReportVisualizer');
      const visualizer = new EpisodeHealthReportVisualizer();

      const date = new Date().toISOString().split('T')[0];
      const htmlPath = `${options.outputDir}/episode-report-${options.episodeId}-${date}.html`;

      visualizer.generateHTML(report, {
        outputPath: htmlPath,
        title: `Episode Health Report - ${report.episode.name}`,
        theme: options.theme as 'light' | 'dark',
      });

      logger.info(`✅ HTML report saved to: ${htmlPath}`);

      // Step 3: Optionally save JSON data
      const jsonPath = `${options.outputDir}/episode-report-${options.episodeId}-${date}.json`;
      await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
      logger.info(`✅ JSON data saved to: ${jsonPath}`);

      // Summary
      logger.info('');
      logger.info('📊 Summary:');
      logger.info(`   Episode: ${report.episode.name}`);
      logger.info(`   Health Score: ${report.healthScore.total}/100 (${report.healthScore.level})`);
      logger.info(`   Critical Actions: ${report.actionItems.critical.length}`);
      logger.info(`   High Priority Actions: ${report.actionItems.high.length}`);
      logger.info(`   Recommended Actions: ${report.actionItems.recommended.length}`);
      logger.info('');
      logger.info('🎉 Report generation complete! Open the HTML file in your browser to view the full analysis.');
    } catch (error) {
      logger.error(`Failed to generate episode report: ${(error as Error).message}`);
      if (program.opts().verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
