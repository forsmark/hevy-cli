import { describe, it, expect } from "vitest";
import { resolveApiKey } from "./resolver.js";
import { maskKey } from "./mask.js";

const fakeStore = (val: string | null) => ({
  get: async () => val,
  set: async () => {},
  clear: async () => {},
});

describe("resolveApiKey", () => {
  it("prefers flag over env over keychain", async () => {
    const r = await resolveApiKey({
      flag: "FLAG",
      env: { HEVY_API_KEY: "ENV" },
      store: fakeStore("KEYCHAIN"),
    });
    expect(r).toEqual({ key: "FLAG", source: "flag" });
  });

  it("falls back to env when no flag", async () => {
    const r = await resolveApiKey({
      env: { HEVY_API_KEY: "ENV" },
      store: fakeStore("KEYCHAIN"),
    });
    expect(r).toEqual({ key: "ENV", source: "env" });
  });

  it("falls back to keychain when no flag or env", async () => {
    const r = await resolveApiKey({ env: {}, store: fakeStore("KEYCHAIN") });
    expect(r).toEqual({ key: "KEYCHAIN", source: "keychain" });
  });

  it("returns none when nothing is set", async () => {
    const r = await resolveApiKey({ env: {}, store: fakeStore(null) });
    expect(r).toEqual({ key: null, source: "none" });
  });
});

describe("maskKey", () => {
  it("masks all but the last 4 chars, preserving dashes layout", () => {
    expect(maskKey("01234567-89ab-cdef-0123-456789abcdef")).toBe(
      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxcdef",
    );
  });
  it("returns 'none' for empty", () => {
    expect(maskKey("")).toBe("none");
  });
});
