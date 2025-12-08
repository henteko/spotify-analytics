/**
 * Local Whisper client using whisper.cpp
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { TranscriptResult, TranscriptSegment } from '../types';

const execAsync = promisify(exec);

export interface LocalWhisperClientOptions {
  modelPath?: string;
  language?: string;
}

export class LocalWhisperClient {
  private modelPath?: string;
  private language: string;

  constructor(options: LocalWhisperClientOptions = {}) {
    this.modelPath = options.modelPath;
    this.language = options.language || 'ja';
  }

  /**
   * Transcribe audio file using whisper.cpp
   */
  async transcribe(audioFilePath: string): Promise<TranscriptResult> {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    return this.transcribeWithWhisperCpp(audioFilePath);
  }

  /**
   * Transcribe using whisper.cpp
   */
  private async transcribeWithWhisperCpp(audioFilePath: string): Promise<TranscriptResult> {
    // Check if whisper.cpp is installed
    try {
      await execAsync('which whisper-cpp 2>/dev/null || which main 2>/dev/null');
    } catch {
      throw new Error(
        'whisper.cpp not found. Please install from https://github.com/ggerganov/whisper.cpp'
      );
    }

    const outputDir = path.dirname(audioFilePath);
    const baseName = path.basename(audioFilePath, path.extname(audioFilePath));
    const outputPath = path.join(outputDir, `${baseName}.json`);

    // Determine whisper.cpp command (could be 'main' or 'whisper-cpp')
    let whisperCmd = 'main';
    try {
      await execAsync('which whisper-cpp');
      whisperCmd = 'whisper-cpp';
    } catch {
      // Use 'main' as default
    }

    // Build command
    const modelArg = this.modelPath ? `-m ${this.modelPath}` : '-m models/ggml-base.bin';
    const cmd = `${whisperCmd} ${modelArg} -l ${this.language} -oj -of ${path.join(outputDir, baseName)} "${audioFilePath}"`;

    try {
      const { stdout, stderr } = await execAsync(cmd);

      if (!fs.existsSync(outputPath)) {
        throw new Error(`Transcription failed. Output file not created.\nStderr: ${stderr}`);
      }

      // Read JSON output
      const result = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

      // Clean up output file
      fs.unlinkSync(outputPath);

      // Convert to our format
      const segments: TranscriptSegment[] = result.transcription?.map((seg: any) => ({
        start: seg.timestamps?.from || seg.offsets?.from / 1000 || 0,
        end: seg.timestamps?.to || seg.offsets?.to / 1000 || 0,
        text: seg.text?.trim() || '',
      })) || [];

      // Calculate duration from last segment
      const duration = segments.length > 0 ? segments[segments.length - 1].end : 0;

      return {
        duration,
        language: this.language,
        segments,
      };
    } catch (error) {
      throw new Error(`whisper.cpp execution failed: ${(error as Error).message}`);
    }
  }

  /**
   * Split transcript into fixed-duration segments
   */
  splitIntoSegments(
    transcript: TranscriptResult,
    segmentDuration: number
  ): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const totalDuration = transcript.duration;
    const numSegments = Math.ceil(totalDuration / segmentDuration);

    for (let i = 0; i < numSegments; i++) {
      const start = i * segmentDuration;
      const end = Math.min((i + 1) * segmentDuration, totalDuration);

      // Find all original segments that overlap with this time range
      const overlappingSegments = transcript.segments.filter(
        seg => seg.start < end && seg.end > start
      );

      const text = overlappingSegments.map(seg => seg.text).join(' ');

      segments.push({
        start,
        end,
        text: text.trim(),
      });
    }

    return segments;
  }
}
