import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { registerUser } from "./user.js";

describe("user info", () => {
  it("prints user JSON to stdout", async () => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: {
            id: "u1",
            name: "Test User",
            url: "https://hevy.com/user/u1",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const program = new Command().exitOverride();
    program
      .option("--pretty")
      .option("--api-key <key>")
      .option("--timeout <ms>")
      .option("--verbose");
    registerUser(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });
    await program.parseAsync(["node", "hevy", "user", "info"]);
    delete process.env.HEVY_API_KEY;
    const json = JSON.parse(stdout.join(""));
    expect(json.id).toBe("u1");
  });
});
