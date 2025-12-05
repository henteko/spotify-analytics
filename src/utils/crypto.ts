/**
 * Cryptographic utilities for PKCE
 */

import { webcrypto } from 'crypto';

/**
 * Generate a random string of specified length
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  webcrypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Generate PKCE challenge parameters
 */
export async function generatePKCEChallenge(): Promise<{
  state: string;
  codeVerifier: string;
  codeChallenge: string;
}> {
  const state = randomString(32);
  const codeVerifier = randomString(64);

  // SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await webcrypto.subtle.digest('SHA-256', data);

  // Base64 encode
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  let codeChallenge = Buffer.from(hashArray).toString('base64');

  // Format for Spotify
  codeChallenge = codeChallenge
    .replace(/=+$/, '')  // Remove trailing =
    .replace(/\//g, '_') // Replace / with _
    .replace(/\+/g, '-'); // Replace + with -

  return { state, codeVerifier, codeChallenge };
}
