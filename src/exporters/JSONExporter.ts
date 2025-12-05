/**
 * JSON Exporter
 */

import { promises as fs } from 'fs';
import { JSONExportOptions } from '../types';

export class JSONExporter {
  private pretty: boolean;
  private encoding: BufferEncoding;

  constructor(options?: JSONExportOptions) {
    this.pretty = options?.pretty !== false;
    this.encoding = options?.encoding || 'utf-8';
  }

  /**
   * Convert data to JSON string
   */
  stringify(data: any): string {
    if (this.pretty) {
      return JSON.stringify(data, null, 2);
    }
    return JSON.stringify(data);
  }

  /**
   * Write data to JSON file
   */
  async writeFile(data: any, filePath: string): Promise<void> {
    const jsonContent = this.stringify(data);
    await fs.writeFile(filePath, jsonContent, { encoding: this.encoding });
  }
}
