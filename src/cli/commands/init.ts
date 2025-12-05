/**
 * Init command - Create .env file
 */

import inquirer from 'inquirer';
import { saveEnv } from '../utils/config';
import { Logger } from '../utils/logger';

export async function initCommand(): Promise<void> {
  const logger = new Logger();

  logger.info('Creating Spotify Analytics .env file...\n');

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
  ]);

  const envPath = await saveEnv({
    sp_dc: answers.sp_dc,
    sp_key: answers.sp_key,
    client_id: '05a1371ee5194c27860b3ff3ff3979d2',
  });

  logger.success(`Configuration saved to ${envPath}`);
}
