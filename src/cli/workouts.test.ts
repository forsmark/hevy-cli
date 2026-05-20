import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { registerWorkouts } from "./workouts.js";

describe("workouts list", () => {
  it("prints workouts JSON to stdout", async () => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          page: 1,
          page_count: 1,
          workouts: [
            {
              id: "w1",
              title: "t",
              description: null,
              start_time: "2026-05-20T10:00:00Z",
              end_time: "2026-05-20T11:00:00Z",
              updated_at: "2026-05-20T11:00:00Z",
              created_at: "2026-05-20T10:00:00Z",
              exercises: [],
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
      .option("--timeout <ms>");
    registerWorkouts(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });
    await program.parseAsync(["node", "hevy", "workouts", "list", "--page", "1"]);
    delete process.env.HEVY_API_KEY;
    const json = JSON.parse(stdout.join(""));
    expect(json.workouts[0].id).toBe("w1");
  });
});
