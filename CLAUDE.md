# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spotify Podcast Analytics is a TypeScript CLI tool and library for fetching analytics data from the Spotify for Podcasters API.

## Development Commands

### Build and Run
```bash
npm run build              # Compile TypeScript to dist/
npm run dev -- <command>   # Run CLI in development mode (uses tsx)
npm run cli -- <command>   # Alternative CLI entry point
```

### Testing and Linting
```bash
npm test                   # Run Jest tests
npm run lint               # ESLint on src/ directory
npm run format             # Format code with Prettier
```

### Running Single Tests
```bash
npx jest path/to/test.ts              # Run specific test file
npx jest -t "test name pattern"       # Run tests matching pattern
```

## Architecture

### Two-Layer API Design

The codebase uses a two-layer architecture for Spotify API access:

1. **SpotifyConnector** (Low-level, `src/lib/SpotifyConnector.ts`)
   - Direct API client with authentication handling
   - Implements PKCE OAuth flow using cookie-based credentials (sp_dc, sp_key)
   - Handles retries, rate limiting, and error recovery
   - Returns raw API responses
   - Uses mutex-based locking to prevent concurrent authentication
   - Tracks authentication state with bearer token caching

2. **SpotifyAnalytics** (High-level, `src/lib/SpotifyAnalytics.ts`)
   - User-friendly wrapper around SpotifyConnector
   - Transforms raw API responses into typed, simplified data structures
   - Provides convenience methods (getEpisodes, getStreams, getListeners, etc.)
   - Handles connector lifecycle (creates connectors per podcast ID)

**Always use SpotifyAnalytics for new features** unless you need direct API access.

### CLI Architecture

The CLI (`src/cli/index.ts`) uses Commander.js for command parsing. Each command:
- Loads `.env` file using dotenv
- Validates credentials
- Creates SpotifyAnalytics instance
- Executes the requested operation
- Outputs to stdout (CSV/JSON) or files (export-all)

Commands are implemented inline in `src/cli/index.ts` except for `init` which is in `src/cli/commands/init.ts`.

### Data Flow

```
User Input → CLI Commands → SpotifyAnalytics → SpotifyConnector → Spotify API
                                              ↓
                              CSVExporter / JSONExporter → stdout / files
```

## Environment Variables

Required credentials (stored in `.env`):
```bash
SPOTIFY_SP_DC=...      # From creators.spotify.com cookies
SPOTIFY_SP_KEY=...     # From creators.spotify.com cookies
SPOTIFY_CLIENT_ID=05a1371ee5194c27860b3ff3ff3979d2  # Default client ID
```

Obtain sp_dc and sp_key by:
1. Logging into https://creators.spotify.com
2. Opening browser DevTools → Application/Storage → Cookies
3. Copying the values

## Key Implementation Details

### Authentication Flow
- Uses PKCE (Proof Key for Code Exchange) OAuth 2.0 flow
- Extracts authorization code from JavaScript in HTML response
- Bearer tokens are cached with expiration tracking
- Authentication is "poisoned" after credential failures to prevent retry loops

### API Rate Limiting
- Exponential backoff with base delay of 2 seconds
- Maximum 6 retry attempts per request
- 429 responses trigger increasing delays before retry

### Async Iteration Pattern
SpotifyConnector uses async generators for paginated data (e.g., episodes):
```typescript
async *episodes(options: EpisodesOptions): AsyncGenerator<Episode> {
  // Yields episodes one at a time across multiple API calls
}
```

This allows memory-efficient streaming of large datasets.

### Type Safety
All types are defined in `src/types/`:
- `options.ts`: Input options for API methods
- `responses.ts`: Raw API response types
- `errors.ts`: Custom error classes
- `index.ts`: Re-exports all types

## Common Patterns

### Adding a New CLI Command
1. Add command definition to `src/cli/index.ts` using `.command()` and `.action()`
2. Load credentials with `getCredentials()` from `src/cli/utils/config.ts`
3. Create SpotifyAnalytics instance
4. Use Logger for consistent output (`src/cli/utils/logger.ts`)
5. Output to stdout (not files) unless it's an export command

### Adding a New Analytics Method
1. Add method to SpotifyAnalytics class
2. Use `this.getConnector()` to get a SpotifyConnector instance
3. Call connector methods and transform results
4. Add appropriate TypeScript types in `src/types/`

### Error Handling
- Use custom errors from `src/types/errors.ts`: `CredentialsExpiredError`, `MaxRetriesException`, `AuthenticationError`
- CLI commands should catch errors, log with Logger.error(), and exit with code 1
- Authentication errors should suggest running `init` command

## Testing Considerations

- Tests use Jest with ts-jest
- Test files should be named `*.test.ts`
- Mock external dependencies (fetch, file system, subprocesses)
- Authentication is complex - consider mocking SpotifyConnector for high-level tests

## Dependencies Notes

- **async-mutex**: Used for thread-safe authentication in SpotifyConnector
- **commander**: CLI framework
- **chalk**: Terminal colors (version 4.x, uses require not ESM)
- **inquirer**: Interactive prompts (version 8.x for CommonJS compatibility)
- **tsx**: TypeScript execution for development

## File Structure

```
src/
├── lib/                   # Core library logic
│   ├── SpotifyConnector.ts       # Low-level API client
│   └── SpotifyAnalytics.ts       # High-level API wrapper
├── cli/                   # CLI implementation
│   ├── index.ts                  # Main CLI entry (all commands)
│   ├── commands/init.ts          # Init command
│   └── utils/                    # CLI utilities (logger, config)
├── exporters/             # CSV and JSON exporters
├── types/                 # TypeScript type definitions
└── utils/                 # Shared utilities (crypto, date)
```

## Build Output

- TypeScript compiles to CommonJS in `dist/`
- Declaration files (`.d.ts`) are generated for library usage
- Package exports define entry points: root, `/lib`, `/cli`, `/exporters`

## Notes

- The project uses CommonJS (`"module": "commonjs"`) for compatibility
- All CLI output goes to stdout by default (except export-all which writes files)
- The Spotify API is unofficial and may change without notice
- Cookie credentials (sp_dc, sp_key) expire periodically and need manual refresh
