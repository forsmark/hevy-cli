# hevy-cli

A TypeScript CLI for the [Hevy](https://hevy.com) public API. Designed primarily for AI agents.

## For AI agents (read this first)

- **Output contract:** stdout = JSON data only. stderr = errors, prompts, logs. Always.
- **Errors:** stderr contains `{"error":{"code":"…","message":"…","status":…,"details":…}}`.
- **Auth check before any command:** run `npm run hevy -- auth status`. Exit code `0` and `reachable: true` = good to go.
- **Token resolution order:** `--api-key` flag > `HEVY_API_KEY` env > OS keychain.
- **Exit codes:** 0 success · 1 generic · 2 auth · 3 validation · 4 not found · 5 network · 6 schema drift.
- **Bodies:** create/update commands take JSON via `--file <path>` or `--file -` (stdin).
- **User identity:** `hevy user info` returns `{ id, name, url }` — there is no `username` field.

## Install (local-only)

```bash
git clone <repo> && cd hevy-cli
npm ci
npm run build
# run via:
npm run hevy -- <args>
# or equivalently:
node dist/bin.js <args>
```

Linux requires `secret-tool` (package `libsecret-tools` or `libsecret`) for keychain access. macOS uses the built-in `security` binary. Windows is best-effort — set `HEVY_API_KEY` instead.

## Authentication

```bash
# interactive login (prompts for API key)
npm run hevy -- auth login

# pipe from a secret manager (avoids shell history)
echo "$HEVY_KEY" | npm run hevy -- auth login

# check key source and API reachability
npm run hevy -- auth status

# remove stored key from keychain
npm run hevy -- auth logout
```

## Commands

### Workouts

- `npm run hevy -- workouts list [--page N] [--page-size N]`
- `npm run hevy -- workouts get <workoutId>`
- `npm run hevy -- workouts count`
- `npm run hevy -- workouts events --since <iso> [--page N] [--page-size N]`
- `npm run hevy -- workouts create --file <path|->`
- `npm run hevy -- workouts update <workoutId> --file <path|->`

### Routines

- `npm run hevy -- routines list [--page N] [--page-size N]`
- `npm run hevy -- routines get <routineId>`
- `npm run hevy -- routines create --file <path|->`
- `npm run hevy -- routines update <routineId> --file <path|->`

### Routine folders

- `npm run hevy -- routine-folders list [--page N] [--page-size N]`
- `npm run hevy -- routine-folders get <folderId>`
- `npm run hevy -- routine-folders create --file <path|->`

### Exercise templates / history

- `npm run hevy -- exercise-templates list [--page N] [--page-size N]`
- `npm run hevy -- exercise-templates get <exerciseTemplateId>`
- `npm run hevy -- exercise-history get <exerciseTemplateId> [--page N] [--page-size N]`

### Body measurements

- `npm run hevy -- body-measurements list [--page N] [--page-size N]`
- `npm run hevy -- body-measurements create --file <path|->`
- `npm run hevy -- body-measurements delete <date>`

### User

- `npm run hevy -- user info`

## Example invocations

```bash
# List workout titles
npm run hevy -- workouts list | jq '.workouts[].title'

# Fetch one workout by id
npm run hevy -- workouts get $(npm run hevy -- workouts list 2>/dev/null | jq -r '.workouts[0].id')

# Count total workouts
npm run hevy -- workouts count

# Log a workout from a file
npm run hevy -- workouts create --file new-workout.json

# Log a workout from stdin (no temp file)
echo '{"workout":{"title":"Push","start_time":"2026-05-20T10:00:00Z","end_time":"2026-05-20T11:00:00Z","exercises":[]}}' \
  | npm run hevy -- workouts create --file -

# Who is the logged-in user?
npm run hevy -- user info | jq '.name'
```

## Global flags

| Flag | Description |
|------|-------------|
| `--pretty` | Render a human-readable table to stdout instead of JSON |
| `--api-key <key>` | Override resolved key for this invocation only |
| `--timeout <ms>` | Request timeout in ms (default 30000) |
| `--verbose` | Log resolution + request info to stderr (the key is never logged) |

## Error JSON shape

```json
{
  "error": {
    "code": "AUTH_MISSING",
    "message": "human-readable description",
    "status": 401,
    "details": null
  }
}
```

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Generic / unexpected |
| 2 | Auth missing or invalid |
| 3 | User input / validation error |
| 4 | Resource not found |
| 5 | Network / unreachable |
| 6 | Response schema mismatch (surface API drift) |

## Environment variables

| Variable | Description |
|----------|-------------|
| `HEVY_API_KEY` | API key — overrides the keychain-stored key |
