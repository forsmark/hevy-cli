import type { Command } from "commander";
import { createHttpClient, type HttpClient } from "../client/http.js";
import { createTokenStore, type TokenStore } from "../auth/token-store.js";
import { resolveApiKey } from "../auth/resolver.js";
import { writeData, writeError, type OutputMode } from "../output.js";
import { exitCodeFor, HevyError } from "../errors.js";

export interface CliDeps {
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
  fetchFn?: typeof fetch;
  store?: TokenStore;
}

export function outputMode(program: Command): OutputMode {
  return program.opts().pretty ? "pretty" : "json";
}

export interface RunOpts {
  program: Command;
  tag: string;
  deps: CliDeps;
}

export async function runWithHttp<T>(
  opts: RunOpts,
  fn: (http: HttpClient) => Promise<T>,
): Promise<void> {
  const stdout = opts.deps.stdout ?? ((s) => process.stdout.write(s));
  const stderr = opts.deps.stderr ?? ((s) => process.stderr.write(s));
  const mode = outputMode(opts.program);
  try {
    const flags = opts.program.opts() as { apiKey?: string; timeout?: string };
    const store = opts.deps.store ?? createTokenStore();
    const resolved = await resolveApiKey({ flag: flags.apiKey, store });
    if (!resolved.key) {
      throw new HevyError(
        "AUTH_MISSING",
        "No API key. Run `hevy auth login` or set HEVY_API_KEY.",
      );
    }
    const http = createHttpClient({
      apiKey: resolved.key,
      fetchFn: opts.deps.fetchFn,
      timeoutMs: flags.timeout ? Number(flags.timeout) : undefined,
    });
    const data = await fn(http);
    writeData(data, { mode, writer: stdout, prettyTag: opts.tag });
  } catch (err) {
    writeError(err, { mode, writer: stderr });
    process.exitCode = err instanceof HevyError ? exitCodeFor(err.code) : 1;
  }
}
