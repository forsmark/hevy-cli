---
name: hevy
description: Use when the user asks to log, fetch, update, or analyze Hevy workout data (workouts, routines, exercise history, body measurements, user info). Wraps the Hevy public API.
---

# Hevy CLI

Run from the hevy-cli repo root via `npm run hevy -- <args>` or `node dist/bin.js <args>`.

## Precondition — always run first

```bash
npm run hevy -- auth status
```

- Exit `0` with `reachable: true` → proceed.
- Exit `2` → tell the user to run `npm run hevy -- auth login` (do not run it yourself; it prompts).
- Other non-zero → report `error.message` from stderr to the user.

## Output contract

- **stdout** = JSON data only (always parseable). Default format.
- **stderr** = error JSON `{"error":{"code":…,"message":…,"status":…,"details":…}}` plus any logs.
- Never use `--pretty` when parsing output programmatically.

## Recipes

| User intent | Command |
|-------------|---------|
| List recent workouts | `npm run hevy -- workouts list --page-size 10` |
| Fetch one workout | `npm run hevy -- workouts get <id>` |
| Count total workouts | `npm run hevy -- workouts count` |
| Workouts changed since a date | `npm run hevy -- workouts events --since 2026-05-01T00:00:00Z` |
| Log a workout described by the user | Build JSON, then `npm run hevy -- workouts create --file path.json` |
| Log a workout without a temp file | `echo '{"workout":{…}}' \| npm run hevy -- workouts create --file -` |
| Show user's routines | `npm run hevy -- routines list` |
| Create a new routine | `npm run hevy -- routines create --file path.json` |
| Update a routine | `npm run hevy -- routines update <id> --file path.json` |
| Browse exercise library | `npm run hevy -- exercise-templates list` |
| Lookup exercise progression | `npm run hevy -- exercise-history get <exerciseTemplateId>` |
| Log a body measurement | `npm run hevy -- body-measurements create --file path.json` |
| Delete a body measurement | `npm run hevy -- body-measurements delete <date>` |
| Who is the logged-in user | `npm run hevy -- user info` (returns `{ id, name, url }`) |

## Error branching

| Exit | Code | What to do |
|------|------|-----------|
| 2 | `AUTH_MISSING` / `AUTH_INVALID` | Ask the user to run `npm run hevy -- auth login` |
| 3 | `VALIDATION` | JSON body is malformed. Show `error.details` and re-ask the user. |
| 4 | `NOT_FOUND` | The id or date doesn't exist. Confirm with the user. |
| 5 | `NETWORK` | Transient — retry once after a few seconds. |
| 6 | `SCHEMA` | API drift — surface the failure verbatim; do not silently continue. |
| 1 | `HTTP` | Show `error.message` and `error.status` to the user. |

## Body-from-file tip

When the user describes a workout, routine, or measurement in natural language, build the JSON
and pipe it via stdin to avoid writing a temp file:

```bash
echo '{"workout":{"title":"Push","start_time":"…","end_time":"…","exercises":[]}}' \
  | npm run hevy -- workouts create --file -
```

## Token resolution order

`--api-key` flag > `HEVY_API_KEY` env var > OS keychain.

## Endpoint reference

See `README.md` in this repo for the full command list, global flags, and exit codes.
