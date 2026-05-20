import { spawn } from "node:child_process";
import { HevyError } from "../errors.js";

export type Platform = "linux" | "darwin" | "win32";

export interface ExecResult {
  stdout: string;
  stderr: string;
  code: number;
}
export type Exec = (cmd: string, args: string[], input?: string) => Promise<ExecResult>;

export interface TokenStore {
  get(): Promise<string | null>;
  set(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface TokenStoreOptions {
  platform?: Platform;
  exec?: Exec;
  service?: string;
  account?: string;
}

const DEFAULT_SERVICE = "hevy-cli";
const DEFAULT_ACCOUNT = "api-key";

export function createTokenStore(opts: TokenStoreOptions = {}): TokenStore {
  const platform = opts.platform ?? (process.platform as Platform);
  const exec = opts.exec ?? nodeExec;
  const service = opts.service ?? DEFAULT_SERVICE;
  const account = opts.account ?? DEFAULT_ACCOUNT;

  switch (platform) {
    case "linux":
      return linuxStore(exec, service, account);
    case "darwin":
      return darwinStore(exec, service, account);
    case "win32":
      return win32Store(exec, service, account);
    default:
      throw new HevyError("HTTP", `Unsupported platform: ${platform}`);
  }
}

function linuxStore(exec: Exec, service: string, account: string): TokenStore {
  const base = ["service", service, "account", account];
  const missing = () =>
    new HevyError(
      "HTTP",
      "secret-tool not found. Install libsecret-tools (e.g. `sudo dnf install libsecret`) or set HEVY_API_KEY.",
    );
  return {
    async get() {
      try {
        const r = await exec("secret-tool", ["lookup", ...base]);
        if (r.code === 0) return r.stdout.trim() || null;
        return null;
      } catch (err) {
        if (isENOENT(err)) throw missing();
        throw err;
      }
    },
    async set(key) {
      try {
        const r = await exec(
          "secret-tool",
          ["store", "--label=Hevy CLI API key", ...base],
          key,
        );
        if (r.code !== 0) throw new HevyError("HTTP", `secret-tool store failed: ${r.stderr}`);
      } catch (err) {
        if (isENOENT(err)) throw missing();
        throw err;
      }
    },
    async clear() {
      try {
        await exec("secret-tool", ["clear", ...base]);
      } catch (err) {
        if (isENOENT(err)) throw missing();
        throw err;
      }
    },
  };
}

function darwinStore(exec: Exec, service: string, account: string): TokenStore {
  return {
    async get() {
      const r = await exec("security", ["find-generic-password", "-s", service, "-a", account, "-w"]);
      if (r.code !== 0) return null;
      return r.stdout.trim() || null;
    },
    async set(key) {
      const r = await exec("security", [
        "add-generic-password",
        "-s", service, "-a", account, "-w", key, "-U",
      ]);
      if (r.code !== 0) throw new HevyError("HTTP", `security add failed: ${r.stderr}`);
    },
    async clear() {
      await exec("security", ["delete-generic-password", "-s", service, "-a", account]);
    },
  };
}

function win32Store(exec: Exec, service: string, _account: string): TokenStore {
  const notSupported = new HevyError(
    "HTTP",
    "Windows keychain access not implemented. Set HEVY_API_KEY instead.",
  );
  return {
    async get() {
      throw notSupported;
    },
    async set() {
      throw notSupported;
    },
    async clear() {
      // best-effort no-op so logout doesn't error on Windows when env var was the source
      void service;
    },
  };
}

function isENOENT(err: unknown): boolean {
  return !!err && typeof err === "object" && (err as { code?: string }).code === "ENOENT";
}

const nodeExec: Exec = (cmd, args, input) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", reject);
    child.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 }));
    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
