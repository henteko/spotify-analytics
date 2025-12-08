/**
 * Dropout visualizer - generates charts and heatmaps
 */

import * as fs from 'fs';
import * as path from 'path';
import { DropoutAnalysisResult } from '../types';

export interface VisualizationOptions {
  outputPath: string;
  title?: string;
  theme?: 'light' | 'dark';
}

export class DropoutVisualizer {
  /**
   * Generate HTML visualization with charts
   */
  generateHTML(result: DropoutAnalysisResult, options: VisualizationOptions): void {
    const { outputPath, title = 'Dropout Analysis', theme = 'light' } = options;

    const isDark = theme === 'dark';
    const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
    const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

    const html = `<!DOCTYPE html>
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
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
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
  <!-- Header -->
  <div class="border-b ${borderClass} ${cardBgClass} sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}">${title}</h1>
          <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1">Podcast Listener Dropout Analysis Report</p>
        </div>
        <button onclick="window.print()" class="no-print px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Key Metrics Cards -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Key Metrics</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Episode Name -->
        <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass} hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide">Episode</p>
              <p class="mt-2 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate" title="${result.episodeName}">${result.episodeName}</p>
            </div>
            <div class="ml-3">
              <div class="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Listeners -->
        <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass} hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide">Total Listeners</p>
              <p class="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">${result.totalSamples.toLocaleString()}</p>
            </div>
            <div class="ml-3">
              <div class="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Average Dropout Rate -->
        <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass} hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide">Avg Dropout</p>
              <p class="mt-2 text-3xl font-bold ${result.summary.averageDropoutRate > 10 ? 'text-red-600 dark:text-red-400' : result.summary.averageDropoutRate > 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}">${result.summary.averageDropoutRate.toFixed(1)}%</p>
            </div>
            <div class="ml-3">
              <div class="bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
                <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Highest Dropout Segment -->
        <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass} hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide">Peak Segment</p>
              <p class="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">#${result.summary.highestDropoutSegment?.segment || '-'}</p>
            </div>
            <div class="ml-3">
              <div class="bg-orange-100 dark:bg-orange-900 rounded-full p-3">
                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Max Dropout Rate -->
        <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass} hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide">Max Dropout</p>
              <p class="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">${(result.summary.highestDropoutSegment?.dropoutRate || 0).toFixed(1)}%</p>
            </div>
            <div class="ml-3">
              <div class="bg-red-100 dark:bg-red-900 rounded-full p-3">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Heatmap -->
    <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass} mb-8">
      <h2 class="text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Dropout Rate Heatmap</h2>
      <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4">Visual representation of dropout rates across all segments. Hover over each cell for details.</p>
      <div id="heatmap" class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2"></div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass}">
        <h2 class="text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Dropout Rate Trend</h2>
        <canvas id="dropoutChart"></canvas>
      </div>
      <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass}">
        <h2 class="text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Listener Count Trend</h2>
        <canvas id="listenersChart"></canvas>
      </div>
    </div>

    <!-- Segment Details -->
    <div class="${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass}">
      <h2 class="text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}">Detailed Segment Analysis</h2>
      <div class="space-y-4">
        ${result.segments.map((seg, i) => {
          const dropoutLevel = seg.dropoutRate < 5 ? 'low' : seg.dropoutRate < 10 ? 'medium' : 'high';
          const borderColor = dropoutLevel === 'low' ? 'border-green-500' : dropoutLevel === 'medium' ? 'border-yellow-500' : 'border-red-500';
          const badgeColor = dropoutLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : dropoutLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          const category = (seg as any).category;

          return `
        <div class="border-l-4 ${borderColor} ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-r-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">Segment #${seg.segment}</h3>
                <span class="${badgeColor} text-xs font-semibold px-2.5 py-0.5 rounded-full">${seg.dropoutRate.toFixed(1)}% dropout</span>
                ${category ? `<span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">${category}</span>` : ''}
              </div>
              <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2">${seg.topic}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
            <div>
              <p class="${isDark ? 'text-gray-400' : 'text-gray-600'}">Time Range</p>
              <p class="font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">${this.formatTime(seg.startTime)} - ${this.formatTime(seg.endTime)}</p>
            </div>
            <div>
              <p class="${isDark ? 'text-gray-400' : 'text-gray-600'}">Start Listeners</p>
              <p class="font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">${seg.listenersStart.toLocaleString()}</p>
            </div>
            <div>
              <p class="${isDark ? 'text-gray-400' : 'text-gray-600'}">End Listeners</p>
              <p class="font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">${seg.listenersEnd.toLocaleString()}</p>
            </div>
            <div>
              <p class="${isDark ? 'text-gray-400' : 'text-gray-600'}">Lost Listeners</p>
              <p class="font-semibold text-red-600 dark:text-red-400">-${seg.dropoutCount.toLocaleString()}</p>
            </div>
          </div>
          <div class="${isDark ? 'bg-gray-800' : 'bg-white'} rounded p-3">
            <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 font-semibold uppercase tracking-wide">Transcript</p>
            <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed">${seg.transcript}</p>
          </div>
        </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}">
      <p>Generated by Spotify Analytics Tool • ${new Date().toLocaleString('ja-JP')}</p>
    </div>
  </div>

  <script>
    const isDark = ${theme === 'dark'};
    const textColor = isDark ? '#d1d5db' : '#4b5563';
    const gridColor = isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)';

    // Heatmap
    const heatmapContainer = document.getElementById('heatmap');
    const segments = ${JSON.stringify(result.segments)};

    segments.forEach(seg => {
      const cell = document.createElement('div');
      const bgColor = getDropoutColor(seg.dropoutRate);
      cell.className = \`aspect-square rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 flex flex-col items-center justify-center p-2 \${isDark ? 'hover:ring-2 hover:ring-gray-500' : 'hover:ring-2 hover:ring-gray-300'}\`;
      cell.style.backgroundColor = bgColor;
      cell.innerHTML = \`
        <div class="text-xs font-bold \${seg.dropoutRate < 5 ? 'text-green-900' : seg.dropoutRate < 10 ? 'text-yellow-900' : 'text-white'}">#\${seg.segment}</div>
        <div class="text-sm font-bold \${seg.dropoutRate < 5 ? 'text-green-900' : seg.dropoutRate < 10 ? 'text-yellow-900' : 'text-white'}">\${seg.dropoutRate.toFixed(1)}%</div>
      \`;

      // Tooltip
      cell.setAttribute('data-tooltip', seg.topic);
      cell.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg max-w-xs';
        tooltip.textContent = seg.topic;
        tooltip.style.left = e.pageX + 'px';
        tooltip.style.top = (e.pageY - 40) + 'px';
        tooltip.id = 'heatmap-tooltip';
        document.body.appendChild(tooltip);
      });
      cell.addEventListener('mouseleave', () => {
        const tooltip = document.getElementById('heatmap-tooltip');
        if (tooltip) tooltip.remove();
      });

      heatmapContainer.appendChild(cell);
    });

    function getDropoutColor(rate) {
      if (rate < 2) return '#22c55e';  // green-500
      if (rate < 5) return '#84cc16';  // lime-500
      if (rate < 10) return '#eab308'; // yellow-500
      if (rate < 15) return '#f97316'; // orange-500
      return '#ef4444';                 // red-500
    }

    // Chart.js global config
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 15;

    // Dropout Rate Chart
    new Chart(document.getElementById('dropoutChart'), {
      type: 'line',
      data: {
        labels: segments.map(s => \`Segment #\${s.segment}\`),
        datasets: [{
          label: 'Dropout Rate (%)',
          data: segments.map(s => s.dropoutRate),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: { size: 13, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: isDark ? '#f3f4f6' : '#111827',
            bodyColor: isDark ? '#d1d5db' : '#374151',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (items) => {
                const seg = segments[items[0].dataIndex];
                return \`Segment #\${seg.segment}\`;
              },
              label: (context) => {
                return \` Dropout Rate: \${context.parsed.y.toFixed(1)}%\`;
              },
              afterLabel: (context) => {
                const seg = segments[context.dataIndex];
                return \`Topic: \${seg.topic}\`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              font: { size: 12 },
              callback: (value) => value + '%'
            },
            grid: { color: gridColor }
          },
          x: {
            ticks: {
              color: textColor,
              font: { size: 12 }
            },
            grid: { color: gridColor }
          }
        }
      }
    });

    // Listeners Chart
    new Chart(document.getElementById('listenersChart'), {
      type: 'line',
      data: {
        labels: segments.map(s => \`Segment #\${s.segment}\`),
        datasets: [
          {
            label: 'Start Listeners',
            data: segments.map(s => s.listenersStart),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'End Listeners',
            data: segments.map(s => s.listenersEnd),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#22c55e',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: { size: 13, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: isDark ? '#f3f4f6' : '#111827',
            bodyColor: isDark ? '#d1d5db' : '#374151',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: (context) => {
                return \` \${context.dataset.label}: \${context.parsed.y.toLocaleString()}\`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              font: { size: 12 },
              callback: (value) => value.toLocaleString()
            },
            grid: { color: gridColor }
          },
          x: {
            ticks: {
              color: textColor,
              font: { size: 12 }
            },
            grid: { color: gridColor }
          }
        }
      }
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(outputPath, html, 'utf-8');
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private getDropoutColor(rate: number): string {
    if (rate < 2) return '#4caf50';
    if (rate < 5) return '#8bc34a';
    if (rate < 10) return '#ffc107';
    if (rate < 15) return '#ff9800';
    return '#f44336';
  }
}
