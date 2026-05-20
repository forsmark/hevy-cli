/**
 * End-to-end smoke test (Approach B — in-process).
 *
 * MSW v2 only intercepts within the same process and cannot intercept a
 * spawned `tsx` child process. We therefore build the Command tree in-process,
 * inject a stub fetchFn, and capture stdout/stderr via injected writers.
 * This exercises every module behind bin.ts but not the bin.ts entry point
 * itself (shebang, parseAsync call site).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Command } from "commander";
import { registerWorkouts } from "./cli/workouts.js";

function makeProgram() {
  const program = new Command().exitOverride();
  program
    .option("--pretty")
    .option("--json")
    .option("--api-key <key>")
    .option("--timeout <ms>");
  return program;
}

const WORKOUT_FIXTURE = {
  id: "w1",
  title: "Morning Lift",
  description: null,
  start_time: "2026-05-20T06:00:00Z",
  end_time: "2026-05-20T07:00:00Z",
  updated_at: "2026-05-20T07:00:00Z",
  created_at: "2026-05-20T06:00:00Z",
  exercises: [],
};

describe("e2e smoke tests", () => {
  beforeEach(() => {
    process.env.HEVY_API_KEY = "01234567-89ab-cdef-0123-456789abcdef";
    // Reset exitCode before each test so prior tests don't bleed through.
    process.exitCode = undefined;
    return () => {
      delete process.env.HEVY_API_KEY;
      process.exitCode = undefined;
    };
  });

  it("workouts list — 200 → valid JSON on stdout, nothing on stderr, exit 0", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    const fetchFn = async () =>
      new Response(
        JSON.stringify({
          page: 1,
          page_count: 1,
          workouts: [WORKOUT_FIXTURE],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    const program = makeProgram();
    registerWorkouts(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });

    await program.parseAsync(["node", "hevy", "workouts", "list"]);

    // stdout must be valid JSON containing our workout
    const json = JSON.parse(stdout.join(""));
    expect(json.workouts).toHaveLength(1);
    expect(json.workouts[0].id).toBe("w1");
    expect(json.workouts[0].title).toBe("Morning Lift");

    // stderr must be empty
    expect(stderr.join("")).toBe("");

    // exit code must be 0 (process.exitCode unset means 0)
    expect(process.exitCode ?? 0).toBe(0);
  });

  it("workouts get <missing> — 404 → NOT_FOUND JSON on stderr, nothing on stdout, exit 4", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    const fetchFn = async () =>
      new Response(JSON.stringify({ message: "Workout not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });

    const program = makeProgram();
    registerWorkouts(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn,
    });

    await program.parseAsync(["node", "hevy", "workouts", "get", "nonexistent-id"]);

    // stdout must be empty
    expect(stdout.join("")).toBe("");

    // stderr must contain a NOT_FOUND error JSON
    const errJson = JSON.parse(stderr.join(""));
    expect(errJson.error.code).toBe("NOT_FOUND");

    // exit code must be 4
    expect(process.exitCode).toBe(4);
  });

  it("AUTH_MISSING when no key configured", async () => {
    delete process.env.HEVY_API_KEY;
    const stdout: string[] = [];
    const stderr: string[] = [];

    const program = makeProgram();
    registerWorkouts(program, {
      stdout: (s) => stdout.push(s),
      stderr: (s) => stderr.push(s),
      fetchFn: vi.fn(),
      store: { get: async () => null, set: async () => {}, clear: async () => {} },
    });

    await program.parseAsync(["node", "hevy", "workouts", "list"]);

    expect(stdout.join("")).toBe("");
    const err = JSON.parse(stderr.join(""));
    expect(err.error.code).toBe("AUTH_MISSING");
    expect(process.exitCode).toBe(2);
  });
});
