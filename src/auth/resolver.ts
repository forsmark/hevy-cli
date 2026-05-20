import type { TokenStore } from "./token-store.js";

export type Source = "flag" | "env" | "keychain" | "none";

export interface ResolveResult {
  key: string | null;
  source: Source;
}

export interface ResolveOptions {
  flag?: string;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  store: TokenStore;
}

export async function resolveApiKey(opts: ResolveOptions): Promise<ResolveResult> {
  if (opts.flag) return { key: opts.flag, source: "flag" };
  const envKey = (opts.env ?? process.env).HEVY_API_KEY;
  if (envKey) return { key: envKey, source: "env" };
  const stored = await opts.store.get();
  if (stored) return { key: stored, source: "keychain" };
  return { key: null, source: "none" };
}
