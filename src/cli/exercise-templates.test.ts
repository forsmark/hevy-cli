import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { registerExerciseTemplates } from "./exercise-templates.js";

describe("exercise-templates list", () => {
  it("prints exercise templates JSON to stdout", async () => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          page: 1,
          page_count: 1,
          exercise_templates: [
            {
              id: "et1",
              title: "Bench Press",
              type: "weight_reps",
              primary_muscle_group: "chest",
              secondary_muscle_groups: [],
              is_custom: false,
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
    registerExerciseTemplates(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });
    await program.parseAsync(["node", "hevy", "exercise-templates", "list"]);
    delete process.env.HEVY_API_KEY;
    const json = JSON.parse(stdout.join(""));
    expect(json.exercise_templates[0].id).toBe("et1");
  });
});
