/**
 * CLI Logger utility
 */

import chalk from 'chalk';

export class Logger {
  constructor(private verbose: boolean = false, private quiet: boolean = false) {}

  info(message: string): void {
    if (!this.quiet) {
      console.log(message);
    }
  }

  success(message: string): void {
    if (!this.quiet) {
      console.log(chalk.green('✓'), message);
    }
  }

  error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  warn(message: string): void {
    if (!this.quiet) {
      console.warn(chalk.yellow('⚠'), message);
    }
  }

  debug(message: string): void {
    if (this.verbose && !this.quiet) {
      console.log(chalk.gray('[DEBUG]'), message);
    }
  }

  table(data: any[]): void {
    if (!this.quiet) {
      console.table(data);
    }
  }
}
