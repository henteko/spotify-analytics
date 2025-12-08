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

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: ${theme === 'dark' ? '#1e1e1e' : '#f5f5f5'};
      color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2em;
      margin-bottom: 10px;
      color: ${theme === 'dark' ? '#fff' : '#000'};
    }
    .summary {
      background: ${theme === 'dark' ? '#2d2d2d' : '#fff'};
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 15px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-item .label {
      font-size: 0.9em;
      opacity: 0.7;
      margin-bottom: 5px;
    }
    .summary-item .value {
      font-size: 2em;
      font-weight: bold;
      color: ${theme === 'dark' ? '#4fc3f7' : '#1976d2'};
    }
    .chart-container {
      background: ${theme === 'dark' ? '#2d2d2d' : '#fff'};
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .chart-container h2 {
      margin-bottom: 15px;
      font-size: 1.3em;
    }
    canvas {
      max-height: 400px;
    }
    .heatmap-container {
      background: ${theme === 'dark' ? '#2d2d2d' : '#fff'};
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .heatmap {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: 5px;
      margin-top: 15px;
    }
    .heatmap-cell {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      font-size: 0.8em;
      padding: 5px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .heatmap-cell:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .heatmap-cell .segment-num {
      font-weight: bold;
      margin-bottom: 3px;
    }
    .heatmap-cell .dropout-rate {
      font-size: 1.2em;
    }
    .segment-list {
      background: ${theme === 'dark' ? '#2d2d2d' : '#fff'};
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .segment-item {
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid;
      background: ${theme === 'dark' ? '#3d3d3d' : '#f9f9f9'};
      border-radius: 4px;
    }
    .segment-item .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .segment-item .topic {
      color: ${theme === 'dark' ? '#4fc3f7' : '#1976d2'};
    }
    .segment-item .transcript {
      font-size: 0.9em;
      opacity: 0.8;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>

    <div class="summary">
      <h2>サマリー</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="label">エピソード</div>
          <div class="value" style="font-size: 1.2em;">${result.episodeName}</div>
        </div>
        <div class="summary-item">
          <div class="label">総リスナー数</div>
          <div class="value">${result.totalSamples}</div>
        </div>
        <div class="summary-item">
          <div class="label">平均離脱率</div>
          <div class="value">${result.summary.averageDropoutRate.toFixed(1)}%</div>
        </div>
        <div class="summary-item">
          <div class="label">最大離脱セグメント</div>
          <div class="value">#${result.summary.highestDropoutSegment?.segment || '-'}</div>
        </div>
        <div class="summary-item">
          <div class="label">最大離脱率</div>
          <div class="value">${(result.summary.highestDropoutSegment?.dropoutRate || 0).toFixed(1)}%</div>
        </div>
      </div>
    </div>

    <div class="heatmap-container">
      <h2>離脱率ヒートマップ</h2>
      <div class="heatmap" id="heatmap"></div>
    </div>

    <div class="chart-container">
      <h2>離脱率推移</h2>
      <canvas id="dropoutChart"></canvas>
    </div>

    <div class="chart-container">
      <h2>リスナー数推移</h2>
      <canvas id="listenersChart"></canvas>
    </div>

    <div class="segment-list">
      <h2>セグメント詳細</h2>
      ${result.segments.map((seg, i) => `
        <div class="segment-item" style="border-left-color: ${this.getDropoutColor(seg.dropoutRate)}">
          <div class="header">
            <span class="topic">セグメント #${seg.segment}: ${seg.topic}</span>
            <span>離脱率: ${seg.dropoutRate}%</span>
          </div>
          <div>時間: ${this.formatTime(seg.startTime)} - ${this.formatTime(seg.endTime)}</div>
          <div>リスナー: ${seg.listenersStart} → ${seg.listenersEnd} (-${seg.dropoutCount})</div>
          <div class="transcript">${seg.transcript}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    const isDark = ${theme === 'dark'};
    const textColor = isDark ? '#e0e0e0' : '#666';
    const gridColor = isDark ? '#444' : '#e0e0e0';

    // Heatmap
    const heatmapContainer = document.getElementById('heatmap');
    const segments = ${JSON.stringify(result.segments)};

    segments.forEach(seg => {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.style.background = getDropoutColor(seg.dropoutRate);
      cell.innerHTML = \`
        <div class="segment-num">#\${seg.segment}</div>
        <div class="dropout-rate">\${seg.dropoutRate}%</div>
      \`;
      cell.title = seg.topic;
      heatmapContainer.appendChild(cell);
    });

    function getDropoutColor(rate) {
      if (rate < 2) return '#4caf50';
      if (rate < 5) return '#8bc34a';
      if (rate < 10) return '#ffc107';
      if (rate < 15) return '#ff9800';
      return '#f44336';
    }

    // Dropout Rate Chart
    new Chart(document.getElementById('dropoutChart'), {
      type: 'line',
      data: {
        labels: segments.map(s => \`#\${s.segment}\`),
        datasets: [{
          label: '離脱率 (%)',
          data: segments.map(s => s.dropoutRate),
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const seg = segments[context.dataIndex];
                return \`話題: \${seg.topic}\`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor }
          }
        }
      }
    });

    // Listeners Chart
    new Chart(document.getElementById('listenersChart'), {
      type: 'line',
      data: {
        labels: segments.map(s => \`#\${s.segment}\`),
        datasets: [
          {
            label: '開始時リスナー数',
            data: segments.map(s => s.listenersStart),
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4
          },
          {
            label: '終了時リスナー数',
            data: segments.map(s => s.listenersEnd),
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { labels: { color: textColor } }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
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
