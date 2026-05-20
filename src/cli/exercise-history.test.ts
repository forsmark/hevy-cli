import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { registerExerciseHistory } from "./exercise-history.js";

describe("exercise-history get", () => {
  it("prints exercise history JSON to stdout", async () => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          exercise_history: [
            {
              workout_id: "w1",
              workout_title: "Morning Workout",
              workout_start_time: "2026-05-20T10:00:00Z",
              workout_end_time: "2026-05-20T11:00:00Z",
              exercise_template_id: "et1",
              weight_kg: 100,
              reps: 5,
              distance_meters: null,
              duration_seconds: null,
              rpe: null,
              custom_metric: null,
              set_type: "normal",
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
    registerExerciseHistory(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });
    await program.parseAsync(["node", "hevy", "exercise-history", "get", "et1"]);
    delete process.env.HEVY_API_KEY;
    const json = JSON.parse(stdout.join(""));
    expect(json.exercise_history[0].workout_id).toBe("w1");
  });
});
