/**
 * Episode Health Report Visualizer
 * Generates comprehensive HTML report for episode health analysis
 */

import * as fs from 'fs';
import { EpisodeHealthReport, VisualizerOptions } from '../types/health-report';

export class EpisodeHealthReportVisualizer {
  /**
   * Generate HTML report
   */
  generateHTML(report: EpisodeHealthReport, options: VisualizerOptions): void {
    const { outputPath, title, theme } = options;
    const isDark = theme === 'dark';

    const html = this.buildHTML(report, title, isDark);

    // Write to file
    fs.writeFileSync(outputPath, html, 'utf-8');
  }

  /**
   * Build HTML content
   */
  private buildHTML(report: EpisodeHealthReport, title: string, isDark: boolean): string {
    const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
    const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

    return `<!DOCTYPE html>
<html lang="ja" class="${isDark ? 'dark' : ''}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
            }
          }
        }
      }
    }
  </script>
  <style>
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body class="${bgClass} ${textClass} min-h-screen">
  ${this.buildHeader(title, isDark, borderClass, cardBgClass)}

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    ${this.buildHealthScoreDashboard(report, isDark, cardBgClass, borderClass)}
    ${this.buildAIInsightsSection(report, isDark, cardBgClass, borderClass)}
    ${this.buildTabNavigation(report, isDark, cardBgClass, borderClass)}
    ${this.buildFooter(report, isDark, cardBgClass, borderClass)}
  </div>

  ${this.buildChartScripts(report)}
</body>
</html>`;
  }

  /**
   * Build header section
   */
  private buildHeader(title: string, isDark: boolean, borderClass: string, cardBgClass: string): string {
    return `
  <div class="border-b ${borderClass} ${cardBgClass} sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${title}</h1>
          <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1">Episode Health Report</p>
        </div>
        <button onclick="window.print()" class="no-print px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  </div>`;
  }

  /**
   * Build health score dashboard
   */
  private buildHealthScoreDashboard(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    const { healthScore, episode } = report;
    const levelEmoji = {
      excellent: '🟢',
      good: '🟡',
      'needs-improvement': '🟠',
      critical: '🔴',
    };

    const levelText = {
      excellent: 'Excellent',
      good: 'Good',
      'needs-improvement': 'Needs Improvement',
      critical: 'Critical',
    };

    const levelColor = {
      excellent: 'green',
      good: 'blue',
      'needs-improvement': 'amber',
      critical: 'red',
    };

    const color = levelColor[healthScore.level];

    return `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Health Score Dashboard</h2>

      <!-- Main Score Card -->
      <div class="${cardBgClass} rounded-lg shadow-lg p-8 border ${borderClass} mb-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2">Episode Health Score</h3>
            <div class="flex items-center gap-3">
              <span class="text-6xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${healthScore.total}</span>
              <span class="text-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}">/100</span>
            </div>
            <div class="mt-3 flex items-center gap-2">
              <span class="text-3xl">${levelEmoji[healthScore.level]}</span>
              <span class="text-xl font-semibold text-${color}-600">${levelText[healthScore.level]}</span>
            </div>
          </div>
          <div class="w-64 h-64">
            <canvas id="healthScoreGauge"></canvas>
          </div>
        </div>

        <!-- Score Breakdown -->
        <div class="grid grid-cols-3 gap-4 pt-6 border-t ${borderClass}">
          <div class="text-center">
            <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2">Playback Rate</p>
            <p class="text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${healthScore.breakdown.playbackRate}</p>
            <p class="text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}">out of 40</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2">Dropout Rate</p>
            <p class="text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${healthScore.breakdown.dropoutRate}</p>
            <p class="text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}">out of 30</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2">Engagement</p>
            <p class="text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${healthScore.breakdown.engagement}</p>
            <p class="text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}">out of 30</p>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        ${this.buildKPICard('Episode Name', episode.name, '🎙️', isDark, cardBgClass, borderClass)}
        ${this.buildKPICard('Total Streams', episode.totalStreams.toLocaleString(), '📊', isDark, cardBgClass, borderClass)}
        ${this.buildKPICard('Total Listeners', episode.totalListeners.toLocaleString(), '👥', isDark, cardBgClass, borderClass)}
        ${this.buildKPICard('Playback Rate', `${report.playbackRateAnalysis.overallRate}%`, '▶️', isDark, cardBgClass, borderClass)}
        ${this.buildKPICard('Dropout Rate', `${report.dropoutAnalysis.averageDropoutRate}%`, '📉', isDark, cardBgClass, borderClass)}
        ${this.buildKPICard('Engagement', report.engagementAnalysis.engagementRate.toFixed(3), '💡', isDark, cardBgClass, borderClass)}
      </div>
    </div>`;
  }

  /**
   * Build KPI card
   */
  private buildKPICard(
    label: string,
    value: string,
    emoji: string,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    return `
        <div class="${cardBgClass} rounded-lg shadow p-4 border ${borderClass}">
          <p class="text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase mb-2">${label}</p>
          <div class="flex items-center gap-2">
            <span class="text-2xl">${emoji}</span>
            <p class="text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} truncate" title="${value}">${value}</p>
          </div>
        </div>`;
  }

  /**
   * Build AI insights section
   */
  private buildAIInsightsSection(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    if (!report.aiInsights) {
      return '';
    }

    const { aiInsights } = report;

    return `
    <div class="mb-8 ${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass} border-l-4 border-l-blue-500">
      <div class="flex items-start gap-3 mb-4">
        <div class="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
          <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1">AI Analysis Summary</h2>
          <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}">Generated by Gemini AI</p>
        </div>
      </div>

      <!-- Overview -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2">Overview</h3>
        <p class="${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed">${aiInsights.overview}</p>
      </div>

      <!-- Draft.md Metrics Assessment -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="${isDark ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg p-4 border-l-4 border-blue-500">
          <h4 class="text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-800'} mb-2">📊 Metric 1: Playback Rate</h4>
          <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}">${aiInsights.playbackRateAssessment}</p>
        </div>
        <div class="${isDark ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-4 border-l-4 border-amber-500">
          <h4 class="text-sm font-semibold ${isDark ? 'text-amber-400' : 'text-amber-800'} mb-2">📉 Metric 2: Dropout Points</h4>
          <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}">${aiInsights.dropoutAssessment}</p>
        </div>
        <div class="${isDark ? 'bg-gray-700' : 'bg-green-50'} rounded-lg p-4 border-l-4 border-green-500">
          <h4 class="text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-800'} mb-2">💡 Metric 3: Engagement</h4>
          <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}">${aiInsights.engagementAssessment}</p>
        </div>
      </div>

      <!-- Priority Actions -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Priority Actions
        </h3>
        <ul class="space-y-2">
          ${aiInsights.priorityActions.map((action, i) => `
            <li class="flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}">
              <span class="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">${i + 1}</span>
              <span>${action}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Success Factors -->
        <div>
          <h3 class="text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Success Factors
          </h3>
          <ul class="space-y-2">
            ${aiInsights.successFactors.map(factor => `
              <li class="flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                <span class="text-green-500 mt-1">✓</span>
                <span>${factor}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Improvement Areas -->
        <div>
          <h3 class="text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Improvement Areas
          </h3>
          <ul class="space-y-2">
            ${aiInsights.improvementAreas.map(area => `
              <li class="flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                <span class="text-red-500 mt-1">⚠</span>
                <span>${area}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <!-- Next Episode Suggestions -->
      ${aiInsights.nextEpisodeSuggestions && aiInsights.nextEpisodeSuggestions.length > 0 ? `
      <div class="mt-6 pt-6 border-t ${borderClass}">
        <h3 class="text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Next Episode Suggestions
        </h3>
        <ul class="space-y-2">
          ${aiInsights.nextEpisodeSuggestions.map(suggestion => `
            <li class="flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}">
              <span class="text-blue-500 mt-1">→</span>
              <span>${suggestion}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}
    </div>`;
  }

  /**
   * Build tab navigation
   */
  private buildTabNavigation(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    return `
    <div class="mb-8">
      <div class="border-b ${borderClass} mb-6">
        <nav class="flex space-x-8">
          <button onclick="showTab('playback')" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-primary-600 text-primary-600">
            Playback Rate
          </button>
          <button onclick="showTab('dropout')" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}">
            Dropout Analysis
          </button>
          <button onclick="showTab('engagement')" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}">
            Engagement
          </button>
          <button onclick="showTab('actions')" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}">
            Action Items
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div id="playback-tab" class="tab-content">
        ${this.buildPlaybackRateTab(report, isDark, cardBgClass, borderClass)}
      </div>

      <div id="dropout-tab" class="tab-content hidden">
        ${this.buildDropoutTab(report, isDark, cardBgClass, borderClass)}
      </div>

      <div id="engagement-tab" class="tab-content hidden">
        ${this.buildEngagementTab(report, isDark, cardBgClass, borderClass)}
      </div>

      <div id="actions-tab" class="tab-content hidden">
        ${this.buildActionItemsTab(report, isDark, cardBgClass, borderClass)}
      </div>
    </div>

    <script>
      function showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
          tab.classList.add('hidden');
        });

        // Remove active state from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
          btn.classList.remove('border-primary-600', 'text-primary-600');
          btn.classList.add('border-transparent');
        });

        // Show selected tab
        document.getElementById(tabName + '-tab').classList.remove('hidden');

        // Set active button
        event.target.classList.remove('border-transparent');
        event.target.classList.add('border-primary-600', 'text-primary-600');
      }
    </script>`;
  }

  /**
   * Build playback rate tab
   */
  private buildPlaybackRateTab(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    const { playbackRateAnalysis } = report;
    const evalEmoji = {
      excellent: '🟢',
      good: '🟡',
      'needs-improvement': '🔴',
    };

    return `
      <div class="${cardBgClass} rounded-lg shadow p-6 border ${borderClass}">
        <h3 class="text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Playback Rate Analysis (Metric 1)</h3>

        <div class="mb-6">
          <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2">Overall Playback Rate</p>
          <div class="flex items-center gap-3">
            <span class="text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${playbackRateAnalysis.overallRate}%</span>
            <span class="text-2xl">${evalEmoji[playbackRateAnalysis.evaluation]}</span>
            <span class="text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}">${playbackRateAnalysis.evaluation}</span>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}">Time Segment Retention</h4>
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
              <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Intro (0-5min)</p>
              <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${playbackRateAnalysis.byTimeSegment.intro}%</p>
            </div>
            <div class="text-center p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
              <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Early (5-15min)</p>
              <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${playbackRateAnalysis.byTimeSegment.earlyMain}%</p>
            </div>
            <div class="text-center p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
              <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Mid (15-30min)</p>
              <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${playbackRateAnalysis.byTimeSegment.midMain}%</p>
            </div>
            <div class="text-center p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
              <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Late (30min+)</p>
              <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${playbackRateAnalysis.byTimeSegment.lateMain}%</p>
            </div>
          </div>
        </div>

        <div>
          <canvas id="playbackRateChart" height="80"></canvas>
        </div>
      </div>`;
  }

  /**
   * Build dropout tab
   */
  private buildDropoutTab(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    const { dropoutAnalysis } = report;
    const patternEmoji = {
      excellent: '✅',
      standard: '🟡',
      problematic: '🔴',
    };

    return `
      <div class="${cardBgClass} rounded-lg shadow p-6 border ${borderClass}">
        <h3 class="text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Dropout Analysis (Metric 2)</h3>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2">Average Dropout Rate</p>
            <p class="text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${dropoutAnalysis.averageDropoutRate}%</p>
          </div>
          <div>
            <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2">Pattern</p>
            <div class="flex items-center gap-2">
              <span class="text-2xl">${patternEmoji[dropoutAnalysis.pattern]}</span>
              <span class="text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">${dropoutAnalysis.pattern}</span>
            </div>
          </div>
        </div>

        <div class="mb-6 p-4 ${isDark ? 'bg-red-900' : 'bg-red-50'} rounded-lg border border-red-500">
          <p class="text-sm font-semibold ${isDark ? 'text-red-200' : 'text-red-800'} mb-2">Max Dropout Point</p>
          <p class="${isDark ? 'text-red-100' : 'text-red-900'}">
            <strong>Timestamp:</strong> ${Math.floor(dropoutAnalysis.maxDropoutPoint.timestamp / 60)}m ${dropoutAnalysis.maxDropoutPoint.timestamp % 60}s
            &nbsp;|&nbsp;
            <strong>Rate:</strong> ${dropoutAnalysis.maxDropoutPoint.rate}%
          </p>
        </div>

        ${dropoutAnalysis.topicAnalysis ? `
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}">Topic Analysis</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="p-4 ${isDark ? 'bg-green-900' : 'bg-green-50'} rounded-lg border border-green-500">
              <p class="text-sm font-semibold ${isDark ? 'text-green-200' : 'text-green-800'} mb-2">✅ High Interest Topics (Dropout < 30%)</p>
              <p class="text-sm ${isDark ? 'text-green-100' : 'text-green-900'}">
                ${dropoutAnalysis.topicAnalysis.highInterest.join(', ') || 'なし'}
              </p>
            </div>
            <div class="p-4 ${isDark ? 'bg-red-900' : 'bg-red-50'} rounded-lg border border-red-500">
              <p class="text-sm font-semibold ${isDark ? 'text-red-200' : 'text-red-800'} mb-2">⚠️ Low Interest Topics (Dropout > 50%)</p>
              <p class="text-sm ${isDark ? 'text-red-100' : 'text-red-900'}">
                ${dropoutAnalysis.topicAnalysis.lowInterest.join(', ') || 'なし'}
              </p>
            </div>
          </div>

          <div>
            <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3">Dropout Rate by Topic</p>
            <div class="space-y-2">
              ${dropoutAnalysis.topicAnalysis.topics.map(topic => {
                const color = topic.dropoutRate < 30 ? 'green' : topic.dropoutRate > 50 ? 'red' : 'amber';
                return `
                <div class="flex items-center gap-3">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}">${topic.name}</span>
                      <span class="text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}">${topic.dropoutRate}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-${color}-500 h-2 rounded-full" style="width: ${topic.dropoutRate}%"></div>
                    </div>
                  </div>
                </div>
              `;
              }).join('')}
            </div>
          </div>
        </div>
        ` : ''}
      </div>`;
  }

  /**
   * Build engagement tab
   */
  private buildEngagementTab(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    const { engagementAnalysis } = report;

    return `
      <div class="${cardBgClass} rounded-lg shadow p-6 border ${borderClass}">
        <h3 class="text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Engagement Analysis (Metric 3)</h3>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
            <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Follower Growth</p>
            <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">+${engagementAnalysis.followerGrowthAroundRelease}</p>
          </div>
          <div class="p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
            <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Total Streams</p>
            <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${engagementAnalysis.totalStreams.toLocaleString()}</p>
          </div>
          <div class="p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
            <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Total Listeners</p>
            <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${engagementAnalysis.totalListeners.toLocaleString()}</p>
          </div>
          <div class="p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg">
            <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Engagement Rate</p>
            <p class="text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${engagementAnalysis.engagementRate.toFixed(3)}</p>
          </div>
        </div>
      </div>`;
  }

  /**
   * Build action items tab
   */
  private buildActionItemsTab(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    const { actionItems } = report;

    const buildActionItemSection = (title: string, items: any[], color: string, icon: string) => {
      if (items.length === 0) return '';

      return `
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2">
            <span>${icon}</span>
            ${title}
          </h4>
          <div class="space-y-3">
            ${items
              .map(
                item => `
              <div class="${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-l-4 border-${color}-500">
                <p class="font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2">${item.issue}</p>
                <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2"><strong>Action:</strong> ${item.action}</p>
                <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}"><strong>Expected Impact:</strong> ${item.expectedImpact}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>`;
    };

    return `
      <div class="${cardBgClass} rounded-lg shadow p-6 border ${borderClass}">
        <h3 class="text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}">Action Items</h3>

        ${buildActionItemSection('Critical', actionItems.critical, 'red', '🔴')}
        ${buildActionItemSection('High Priority', actionItems.high, 'amber', '🟡')}
        ${buildActionItemSection('Recommended', actionItems.recommended, 'green', '🟢')}
        ${buildActionItemSection('Future Episodes', actionItems.futureEpisodes, 'blue', '📅')}
      </div>`;
  }

  /**
   * Build footer
   */
  private buildFooter(
    report: EpisodeHealthReport,
    isDark: boolean,
    cardBgClass: string,
    borderClass: string
  ): string {
    const now = new Date().toLocaleString('ja-JP');

    return `
    <div class="mt-8 pt-6 border-t ${borderClass} text-center">
      <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}">
        Generated by Spotify Analytics - Episode Health Report Tool
      </p>
      <p class="text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1">
        Report Date: ${now} | Episode: ${report.episode.name}
      </p>
    </div>`;
  }

  /**
   * Build Chart.js scripts
   */
  private buildChartScripts(report: EpisodeHealthReport): string {
    const { healthScore, playbackRateAnalysis } = report;

    return `
  <script>
    // Health Score Gauge
    const gaugeCtx = document.getElementById('healthScoreGauge').getContext('2d');
    new Chart(gaugeCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [${healthScore.total}, ${100 - healthScore.total}],
          backgroundColor: [
            ${healthScore.level === 'excellent' ? "'#10b981'" : healthScore.level === 'good' ? "'#3b82f6'" : healthScore.level === 'needs-improvement' ? "'#f59e0b'" : "'#ef4444'"},
            '#e5e7eb'
          ],
          borderWidth: 0
        }]
      },
      options: {
        circumference: 180,
        rotation: -90,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });

    // Playback Rate Chart
    const playbackCtx = document.getElementById('playbackRateChart').getContext('2d');
    new Chart(playbackCtx, {
      type: 'bar',
      data: {
        labels: ['Intro (0-5min)', 'Early (5-15min)', 'Mid (15-30min)', 'Late (30min+)'],
        datasets: [{
          label: 'Retention Rate (%)',
          data: [
            ${playbackRateAnalysis.byTimeSegment.intro},
            ${playbackRateAnalysis.byTimeSegment.earlyMain},
            ${playbackRateAnalysis.byTimeSegment.midMain},
            ${playbackRateAnalysis.byTimeSegment.lateMain}
          ],
          backgroundColor: '#3b82f6',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  </script>`;
  }
}
