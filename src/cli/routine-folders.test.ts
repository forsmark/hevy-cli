import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { registerRoutineFolders } from "./routine-folders.js";

describe("routine-folders list", () => {
  it("prints routine folders JSON to stdout", async () => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          page: 1,
          page_count: 1,
          routine_folders: [
            {
              id: 1,
              index: 0,
              title: "My Folder",
              updated_at: "2026-05-20T10:00:00Z",
              created_at: "2026-05-20T10:00:00Z",
            },
          ],
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
    registerRoutineFolders(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });
    await program.parseAsync(["node", "hevy", "routine-folders", "list"]);
    delete process.env.HEVY_API_KEY;
    const json = JSON.parse(stdout.join(""));
    expect(json.routine_folders[0].id).toBe(1);
  });
});
