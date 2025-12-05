/**
 * CSV Exporter
 */

import { promises as fs } from 'fs';
import { CSVExportOptions } from '../types';

export class CSVExporter {
  private delimiter: string;
  private encoding: BufferEncoding;
  private includeHeaders: boolean;
  private customHeaders?: string[];

  constructor(options?: CSVExportOptions) {
    this.delimiter = options?.delimiter || ',';
    this.encoding = options?.encoding || 'utf-8';
    this.includeHeaders = options?.includeHeaders !== false;
    this.customHeaders = options?.headers;
  }

  /**
   * Convert array of objects to CSV string
   */
  stringify(data: any[]): string {
    if (data.length === 0) {
      return '';
    }

    const rows: string[] = [];

    // Extract headers
    const headers = this.customHeaders || Object.keys(data[0]);

    // Add header row
    if (this.includeHeaders) {
      rows.push(this.escapeRow(headers));
    }

    // Add data rows
    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header];
        return value !== undefined && value !== null ? String(value) : '';
      });
      rows.push(this.escapeRow(values));
    }

    return rows.join('\n');
  }

  /**
   * Escape a row for CSV
   */
  private escapeRow(values: string[]): string {
    return values.map(value => this.escapeValue(value)).join(this.delimiter);
  }

  /**
   * Escape a single value for CSV
   */
  private escapeValue(value: string): string {
    // If value contains delimiter, quotes, or newlines, wrap in quotes
    if (
      value.includes(this.delimiter) ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      // Escape quotes by doubling them
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    return value;
  }

  /**
   * Write data to CSV file
   */
  async writeFile(data: any[], filePath: string): Promise<void> {
    const csvContent = this.stringify(data);
    await fs.writeFile(filePath, csvContent, { encoding: this.encoding });
  }
}
