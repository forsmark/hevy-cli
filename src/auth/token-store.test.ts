import { describe, it, expect, vi } from "vitest";
import { createTokenStore } from "./token-store.js";
import { HevyError } from "../errors.js";

function fakeExec(map: Record<string, { stdout?: string; code?: number; stderr?: string }>) {
  return vi.fn(async (cmd: string, _args: string[], _input?: string) => {
    const r = map[cmd] ?? { code: 127, stderr: "not found" };
    return { stdout: r.stdout ?? "", stderr: r.stderr ?? "", code: r.code ?? 0 };
  });
}

describe("token store (linux backend)", () => {
  it("returns null when secret-tool has no entry", async () => {
    const exec = fakeExec({ "secret-tool": { code: 1, stderr: "" } });
    const store = createTokenStore({ platform: "linux", exec });
    expect(await store.get()).toBeNull();
  });

  it("returns key from secret-tool lookup", async () => {
    const exec = fakeExec({ "secret-tool": { stdout: "abc\n", code: 0 } });
    const store = createTokenStore({ platform: "linux", exec });
    expect(await store.get()).toBe("abc");
  });

  it("stores via secret-tool store and passes key on stdin", async () => {
    const exec = fakeExec({ "secret-tool": { code: 0 } });
    const store = createTokenStore({ platform: "linux", exec });
    await store.set("xyz");
    const call = exec.mock.calls[0]!;
    expect(call[0]).toBe("secret-tool");
    expect(call[1]).toContain("store");
    expect(call[2]).toBe("xyz");
  });

  it("clear is idempotent (exit 1 from secret-tool clear is OK)", async () => {
    const exec = fakeExec({ "secret-tool": { code: 1 } });
    const store = createTokenStore({ platform: "linux", exec });
    await expect(store.clear()).resolves.toBeUndefined();
  });

  it("throws helpful HevyError when secret-tool binary missing", async () => {
    const exec = vi.fn(async () => {
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });
    const store = createTokenStore({ platform: "linux", exec });
    await expect(store.get()).rejects.toBeInstanceOf(HevyError);
  });
});
