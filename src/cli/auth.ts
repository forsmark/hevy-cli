import { Command } from "commander";
import { createHttpClient } from "../client/http.js";
import { createTokenStore } from "../auth/token-store.js";
import { resolveApiKey } from "../auth/resolver.js";
import { maskKey } from "../auth/mask.js";
import { userClient } from "../client/user.js";
import { HevyError } from "../errors.js";
import { writeData, writeError, type OutputMode } from "../output.js";
import { exitCodeFor } from "../errors.js";

export interface AuthDeps {
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
  fetchFn?: typeof fetch;
  promptKey?: () => Promise<string>;
}

export function registerAuth(program: Command, deps: AuthDeps = {}): void {
  const stdout = deps.stdout ?? ((s) => process.stdout.write(s));
  const stderr = deps.stderr ?? ((s) => process.stderr.write(s));

  const auth = program.command("auth").description("authentication");

  auth
    .command("status")
    .description("show resolved API key source and reachability")
    .action(async () => {
      try {
        const mode = outputMode(program);
        const store = createTokenStore();
        const resolved = await resolveApiKey({ store });
        let reachable = false;
        let info: unknown = null;
        if (resolved.key) {
          try {
            const http = createHttpClient({ apiKey: resolved.key, fetchFn: deps.fetchFn });
            info = await userClient.info(http);
            reachable = true;
          } catch {
            reachable = false;
          }
        }
        const payload = {
          source: resolved.source,
          key_masked: resolved.key ? maskKey(resolved.key) : null,
          user: info,
          reachable,
        };
        writeData(payload, { mode, writer: stdout });
      } catch (err) {
        writeError(err, { mode: outputMode(program), writer: stderr });
        if (err instanceof HevyError) process.exitCode = exitCodeFor(err.code);
        else process.exitCode = 1;
      }
    });

  auth
    .command("login")
    .description("store API key in OS keychain (prompts or reads stdin)")
    .action(async () => {
      const mode = outputMode(program);
      try {
        const key = await readKey(deps.promptKey, stderr);
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
          throw new HevyError("VALIDATION", "API key must be a UUID");
        }
        const http = createHttpClient({ apiKey: key, fetchFn: deps.fetchFn });
        const info = await userClient.info(http);
        const store = createTokenStore();
        await store.set(key);
        stderr(`Logged in as ${info.name}\n`);
      } catch (err) {
        writeError(err, { mode, writer: stderr });
        process.exitCode = err instanceof HevyError ? exitCodeFor(err.code) : 1;
      }
    });

  auth
    .command("logout")
    .description("remove the stored API key from the OS keychain")
    .action(async () => {
      try {
        const store = createTokenStore();
        await store.clear();
        stderr("Logged out\n");
      } catch (err) {
        writeError(err, { mode: outputMode(program), writer: stderr });
        process.exitCode = err instanceof HevyError ? exitCodeFor(err.code) : 1;
      }
    });
}

function outputMode(program: Command): OutputMode {
  return program.opts().pretty ? "pretty" : "json";
}

async function readKey(
  prompt: (() => Promise<string>) | undefined,
  stderr: (s: string) => void,
): Promise<string> {
  if (!process.stdin.isTTY) {
    return await readAllStdin();
  }
  if (prompt) return prompt();
  // default TTY prompt with masking
  return await defaultPrompt(stderr);
}

async function readAllStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8").trim();
}

async function defaultPrompt(stderr: (s: string) => void): Promise<string> {
  stderr("API key: ");
  const readline = await import("node:readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
    terminal: true,
  });
  return new Promise<string>((resolve) => {
    rl.question("", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
