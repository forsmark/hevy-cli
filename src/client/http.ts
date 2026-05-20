import { HevyError } from "../errors.js";

export interface HttpClient {
  request<T = unknown>(req: HttpRequest): Promise<T>;
}

export interface HttpRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

export interface HttpClientOptions {
  apiKey: string;
  fetchFn?: typeof fetch;
  baseUrl?: string;
  timeoutMs?: number;
  retry?: number;
  retryDelayMs?: number;
  userAgent?: string;
}

const DEFAULT_BASE = "https://api.hevyapp.com";

export function createHttpClient(opts: HttpClientOptions): HttpClient {
  const fetchFn = opts.fetchFn ?? globalThis.fetch;
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE;
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const retry = opts.retry ?? 1;
  const retryDelayMs = opts.retryDelayMs ?? 500;
  const userAgent = opts.userAgent ?? "hevy-cli/0.1.0";

  async function once(req: HttpRequest): Promise<unknown> {
    const url = new URL(baseUrl + req.path);
    if (req.query) {
      for (const [k, v] of Object.entries(req.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchFn(url.toString(), {
        method: req.method,
        headers: {
          "api-key": opts.apiKey,
          "user-agent": userAgent,
          ...(req.body !== undefined ? { "content-type": "application/json" } : {}),
          accept: "application/json",
        },
        body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      const data = text.length > 0 ? safeJson(text) : null;
      if (res.status >= 200 && res.status < 300) return data;
      if (res.status === 401) {
        throw new HevyError("AUTH_INVALID", "API key rejected", { status: 401, details: data });
      }
      if (res.status === 404) {
        throw new HevyError("NOT_FOUND", "Resource not found", { status: 404, details: data });
      }
      if (res.status === 400 || res.status === 422) {
        throw new HevyError("VALIDATION", "Invalid request", { status: res.status, details: data });
      }
      throw new HevyError("HTTP", `HTTP ${res.status}`, { status: res.status, details: data });
    } finally {
      clearTimeout(timer);
    }
  }

  function isRetryable(err: unknown): boolean {
    if (err instanceof HevyError) return err.code === "HTTP" && (err.status ?? 0) >= 500;
    return true;
  }

  return {
    async request<T = unknown>(req: HttpRequest): Promise<T> {
      let attempt = 0;
      let lastErr: unknown;
      while (attempt <= retry) {
        try {
          return (await once(req)) as T;
        } catch (err) {
          lastErr = err;
          if (attempt === retry || !isRetryable(err)) break;
          await new Promise((r) => setTimeout(r, retryDelayMs));
          attempt += 1;
        }
      }
      if (lastErr instanceof HevyError) throw lastErr;
      const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
      throw new HevyError("NETWORK", message);
    },
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
