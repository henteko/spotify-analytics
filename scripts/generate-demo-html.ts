/**
 * Generate HTML reports from demo JSON data
 */

import * as fs from 'fs';
import * as path from 'path';
import { EpisodeHealthReport } from '../src/types/health-report';
import { EpisodeHealthReportVisualizer } from '../src/lib/EpisodeHealthReportVisualizer';

const demoDir = path.join(__dirname, '..', 'demo-reports');

// Load demo data
const excellentData: EpisodeHealthReport = JSON.parse(
  fs.readFileSync(path.join(demoDir, 'demo-excellent-report.json'), 'utf-8')
);

const improvementData: EpisodeHealthReport = JSON.parse(
  fs.readFileSync(path.join(demoDir, 'demo-improvement-needed-report.json'), 'utf-8')
);

const criticalData: EpisodeHealthReport = JSON.parse(
  fs.readFileSync(path.join(demoDir, 'demo-critical-report.json'), 'utf-8')
);

// Convert date strings back to Date objects
excellentData.episode.releaseDate = new Date(excellentData.episode.releaseDate);
improvementData.episode.releaseDate = new Date(improvementData.episode.releaseDate);
criticalData.episode.releaseDate = new Date(criticalData.episode.releaseDate);

// Generate HTML reports
const visualizer = new EpisodeHealthReportVisualizer();

// Excellent report
visualizer.generateHTML(excellentData, {
  outputPath: path.join(demoDir, 'demo-excellent-report.html'),
  title: `Episode Health Report - ${excellentData.episode.name}`,
  theme: 'light',
});

// Improvement needed report
visualizer.generateHTML(improvementData, {
  outputPath: path.join(demoDir, 'demo-improvement-needed-report.html'),
  title: `Episode Health Report - ${improvementData.episode.name}`,
  theme: 'light',
});

// Critical report
visualizer.generateHTML(criticalData, {
  outputPath: path.join(demoDir, 'demo-critical-report.html'),
  title: `Episode Health Report - ${criticalData.episode.name}`,
  theme: 'light',
});

// Also generate dark theme versions
visualizer.generateHTML(excellentData, {
  outputPath: path.join(demoDir, 'demo-excellent-report-dark.html'),
  title: `Episode Health Report - ${excellentData.episode.name}`,
  theme: 'dark',
});

console.log('✅ HTML reports generated successfully!');
console.log('📁 Files created:');
console.log('   - demo-excellent-report.html (Light theme)');
console.log('   - demo-excellent-report-dark.html (Dark theme)');
console.log('   - demo-improvement-needed-report.html');
console.log('   - demo-critical-report.html');
