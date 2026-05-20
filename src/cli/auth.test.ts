import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { registerAuth } from "./auth.js";

describe("auth status", () => {
  it("prints JSON with source=env and masked key", async () => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({ data: { id: "1", name: "marc", url: "https://hevy.com/user/marc" } }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const program = new Command().exitOverride();
    registerAuth(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });
    await program.parseAsync(["node", "hevy", "auth", "status"]);
    delete process.env.HEVY_API_KEY;
    const json = JSON.parse(stdout.join(""));
    expect(json.source).toBe("env");
    expect(json.key_masked.endsWith("cdef")).toBe(true);
    expect(json.reachable).toBe(true);
  });
});
