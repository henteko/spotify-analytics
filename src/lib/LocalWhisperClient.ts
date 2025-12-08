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
    const outputDir = path.dirname(audioFilePath);
    const baseName = path.basename(audioFilePath, path.extname(audioFilePath));
    const outputPath = path.join(outputDir, `${baseName}.json`);

    // Determine whisper.cpp command path
    const projectRoot = process.cwd();
    const possiblePaths = [
      path.join(projectRoot, 'whisper.cpp/build/bin/whisper-cli'),
      path.join(projectRoot, 'whisper.cpp/build/bin/main'),
      path.join(projectRoot, 'whisper.cpp/main'),
      'whisper-cli',
      'whisper-cpp',
      'main',
    ];

    let whisperCmd: string | null = null;
    for (const cmdPath of possiblePaths) {
      try {
        if (cmdPath.startsWith('/')) {
          // Absolute path - check if file exists
          if (require('fs').existsSync(cmdPath)) {
            whisperCmd = cmdPath;
            break;
          }
        } else {
          // Command name - check if in PATH
          await execAsync(`which ${cmdPath}`);
          whisperCmd = cmdPath;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!whisperCmd) {
      throw new Error(
        'whisper.cpp not found. Please run: npm run setup:whisper\n' +
        'Or install from https://github.com/ggerganov/whisper.cpp'
      );
    }

    // Build command
    const defaultModelPath = path.join(projectRoot, 'whisper.cpp/models/ggml-base.bin');
    const modelArg = this.modelPath ? `--model ${this.modelPath}` : `--model ${defaultModelPath}`;
    const cmd = `"${whisperCmd}" ${modelArg} --language ${this.language} --output-json --output-file ${path.join(outputDir, baseName)} "${audioFilePath}"`;

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
      const segments: TranscriptSegment[] = result.transcription?.map((seg: any) => {
        // Parse timestamps in format "HH:MM:SS,mmm"
        const parseTime = (timeStr: string): number => {
          const parts = timeStr.split(':');
          const hours = parseInt(parts[0]);
          const minutes = parseInt(parts[1]);
          const secParts = parts[2].split(',');
          const seconds = parseInt(secParts[0]);
          const milliseconds = parseInt(secParts[1]);
          return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        };

        return {
          start: seg.timestamps?.from ? parseTime(seg.timestamps.from) : (seg.offsets?.from / 1000 || 0),
          end: seg.timestamps?.to ? parseTime(seg.timestamps.to) : (seg.offsets?.to / 1000 || 0),
          text: seg.text?.trim() || '',
        };
      }) || [];

      // Calculate duration from last segment
      const duration = segments.length > 0 ? segments[segments.length - 1].end : 0;

      return {
        duration,
        language: result.result?.language || this.language,
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
