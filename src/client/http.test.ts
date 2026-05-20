import { describe, it, expect, vi } from "vitest";
import { createHttpClient } from "./http.js";
import { HevyError } from "../errors.js";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("createHttpClient", () => {
  it("sends api-key header and parses JSON on 200", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    const client = createHttpClient({ apiKey: "k", fetchFn, retry: 0 });
    const result = await client.request({ method: "GET", path: "/v1/user/info" });
    expect(result).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledOnce();
    const [, init] = fetchFn.mock.calls[0]!;
    expect((init as RequestInit).headers).toMatchObject({ "api-key": "k" });
  });

  it("throws AUTH_INVALID on 401", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(401, { error: "bad" }));
    const client = createHttpClient({ apiKey: "k", fetchFn, retry: 0 });
    await expect(client.request({ method: "GET", path: "/v1/user/info" })).rejects.toMatchObject(
      { code: "AUTH_INVALID", status: 401 } satisfies Partial<HevyError>,
    );
  });

  it("throws NOT_FOUND on 404", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(404, {}));
    const client = createHttpClient({ apiKey: "k", fetchFn, retry: 0 });
    await expect(client.request({ method: "GET", path: "/v1/workouts/x" })).rejects.toMatchObject(
      { code: "NOT_FOUND", status: 404 },
    );
  });

  it("retries once on 500 then succeeds", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(500, {}))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = createHttpClient({ apiKey: "k", fetchFn, retry: 1, retryDelayMs: 1 });
    const result = await client.request({ method: "GET", path: "/v1/x" });
    expect(result).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("throws NETWORK on fetch rejection after retries", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("boom"));
    const client = createHttpClient({ apiKey: "k", fetchFn, retry: 1, retryDelayMs: 1 });
    await expect(client.request({ method: "GET", path: "/v1/x" })).rejects.toMatchObject({
      code: "NETWORK",
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
