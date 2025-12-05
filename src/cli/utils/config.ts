/**
 * Configuration file management
 */

import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface Config {
  credentials: {
    sp_dc: string;
    sp_key: string;
    client_id?: string;
  };
  defaults?: {
    podcast_id?: string;
    output_dir?: string;
    date_range?: {
      days?: number;
    };
  };
  output?: {
    format?: 'csv' | 'json';
    delimiter?: string;
    encoding?: string;
    include_headers?: boolean;
  };
}

const CONFIG_FILENAMES = [
  '.spotify-analytics.json',
  join(homedir(), '.spotify-analytics.json'),
  '/etc/spotify-analytics.json',
];

/**
 * Find configuration file
 */
export async function findConfigFile(customPath?: string): Promise<string | null> {
  if (customPath) {
    try {
      await fs.access(customPath);
      return customPath;
    } catch {
      return null;
    }
  }

  for (const path of CONFIG_FILENAMES) {
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
 * Load configuration from file
 */
export async function loadConfig(customPath?: string): Promise<Config | null> {
  const configPath = await findConfigFile(customPath);
  if (!configPath) {
    return null;
  }

  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save configuration to file
 */
export async function saveConfig(config: Config, filePath?: string): Promise<string> {
  const path = filePath || CONFIG_FILENAMES[0];
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(path, content, 'utf-8');
  return path;
}

/**
 * Get credentials from config or environment variables
 */
export function getCredentials(config?: Config | null): {
  sp_dc: string;
  sp_key: string;
  client_id?: string;
} | null {
  // Try environment variables first
  if (process.env.SPOTIFY_SP_DC && process.env.SPOTIFY_SP_KEY) {
    return {
      sp_dc: process.env.SPOTIFY_SP_DC,
      sp_key: process.env.SPOTIFY_SP_KEY,
      client_id: process.env.SPOTIFY_CLIENT_ID,
    };
  }

  // Then try config file
  if (config?.credentials) {
    return config.credentials;
  }

  return null;
}
