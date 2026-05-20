import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { registerBodyMeasurements } from "./body-measurements.js";

describe("body-measurements list", () => {
  it("prints body measurements JSON to stdout", async () => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          page: 1,
          page_count: 1,
          body_measurements: [
            {
              date: "2026-05-20",
              weight_kg: 80,
              lean_mass_kg: null,
              fat_percent: null,
              neck_cm: null,
              shoulder_cm: null,
              chest_cm: null,
              left_bicep_cm: null,
              right_bicep_cm: null,
              left_forearm_cm: null,
              right_forearm_cm: null,
              abdomen: null,
              waist: null,
              hips: null,
              left_thigh: null,
              right_thigh: null,
              left_calf: null,
              right_calf: null,
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
    registerBodyMeasurements(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });
    await program.parseAsync(["node", "hevy", "body-measurements", "list"]);
    delete process.env.HEVY_API_KEY;
    const json = JSON.parse(stdout.join(""));
    expect(json.body_measurements[0].date).toBe("2026-05-20");
  });
});
