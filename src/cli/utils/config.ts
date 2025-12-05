/**
 * Configuration file management
 */

import { config as dotenvConfig } from 'dotenv';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const ENV_FILENAMES = [
  '.env',
  join(homedir(), '.spotify-analytics.env'),
];

/**
 * Find .env file
 */
export async function findEnvFile(customPath?: string): Promise<string | null> {
  if (customPath) {
    try {
      await fs.access(customPath);
      return customPath;
    } catch {
      return null;
    }
  }

  for (const path of ENV_FILENAMES) {
    try {
      await fs.access(path);
      return path;
    } catch {
      // Continue to next path
    }
  }

  return null;
}

/**
 * Load environment variables from .env file
 */
export async function loadEnv(customPath?: string): Promise<void> {
  const envPath = await findEnvFile(customPath);
  if (envPath) {
    dotenvConfig({ path: envPath });
  }
}

/**
 * Save credentials to .env file
 */
export async function saveEnv(
  credentials: { sp_dc: string; sp_key: string; client_id?: string },
  filePath?: string
): Promise<string> {
  const path = filePath || ENV_FILENAMES[0];
  const content = [
    `SPOTIFY_SP_DC=${credentials.sp_dc}`,
    `SPOTIFY_SP_KEY=${credentials.sp_key}`,
    credentials.client_id ? `SPOTIFY_CLIENT_ID=${credentials.client_id}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  await fs.writeFile(path, content + '\n', 'utf-8');
  return path;
}

/**
 * Get credentials from environment variables
 */
export function getCredentials(): {
  sp_dc: string;
  sp_key: string;
  client_id?: string;
} | null {
  if (process.env.SPOTIFY_SP_DC && process.env.SPOTIFY_SP_KEY) {
    return {
      sp_dc: process.env.SPOTIFY_SP_DC,
      sp_key: process.env.SPOTIFY_SP_KEY,
      client_id: process.env.SPOTIFY_CLIENT_ID,
    };
  }

  return null;
}
