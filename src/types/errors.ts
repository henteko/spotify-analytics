/**
 * Custom error classes for Spotify Analytics
 */

export class CredentialsExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CredentialsExpiredError';
    Object.setPrototypeOf(this, CredentialsExpiredError.prototype);
  }
}

export class MaxRetriesException extends Error {
  constructor(
    public url: string,
    public lastStatusCode: number | null,
    public attempts: number
  ) {
    super(
      `All retries failed for URL ${url}. ` +
      `Last status code: ${lastStatusCode}. ` +
      `Attempts: ${attempts}`
    );
    this.name = 'MaxRetriesException';
    Object.setPrototypeOf(this, MaxRetriesException.prototype);
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
