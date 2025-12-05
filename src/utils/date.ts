/**
 * Date utility functions
 */

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Convert date parameters to query string format
 */
export function dateParams(start: Date, end: Date): Record<string, string> {
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

/**
 * Sleep for specified seconds
 */
export function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * Calculate days difference between two dates
 */
export function daysDifference(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}
