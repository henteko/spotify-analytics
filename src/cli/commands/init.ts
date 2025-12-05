/**
 * Init command - Create configuration file
 */

import inquirer from 'inquirer';
import { saveConfig, Config } from '../utils/config';
import { Logger } from '../utils/logger';

export async function initCommand(): Promise<void> {
  const logger = new Logger();

  logger.info('Creating Spotify Analytics configuration...\n');

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'sp_dc',
      message: 'Enter your sp_dc cookie:',
      validate: (input: string) => input.length > 0 || 'sp_dc is required',
    },
    {
      type: 'password',
      name: 'sp_key',
      message: 'Enter your sp_key cookie:',
      validate: (input: string) => input.length > 0 || 'sp_key is required',
    },
    {
      type: 'input',
      name: 'podcast_id',
      message: 'Enter default podcast ID (optional):',
    },
    {
      type: 'input',
      name: 'output_dir',
      message: 'Enter output directory:',
      default: './output',
    },
  ]);

  const config: Config = {
    credentials: {
      sp_dc: answers.sp_dc,
      sp_key: answers.sp_key,
      client_id: '05a1371ee5194c27860b3ff3ff3979d2',
    },
    defaults: {
      podcast_id: answers.podcast_id || undefined,
      output_dir: answers.output_dir,
      date_range: {
        days: 30,
      },
    },
    output: {
      format: 'csv',
      delimiter: ',',
      encoding: 'utf-8',
      include_headers: true,
    },
  };

  const configPath = await saveConfig(config);
  logger.success(`Configuration saved to ${configPath}`);
}
