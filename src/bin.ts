#!/usr/bin/env node
import { Command } from "commander";
import { writeError } from "./output.js";
import { exitCodeFor, HevyError } from "./errors.js";
import { registerAuth } from "./cli/auth.js";
import { registerWorkouts } from "./cli/workouts.js";
import { registerRoutines } from "./cli/routines.js";
import { registerRoutineFolders } from "./cli/routine-folders.js";
import { registerExerciseTemplates } from "./cli/exercise-templates.js";
import { registerExerciseHistory } from "./cli/exercise-history.js";
import { registerBodyMeasurements } from "./cli/body-measurements.js";
import { registerUser } from "./cli/user.js";

const program = new Command();
program
  .name("hevy")
  .description("CLI for the Hevy public API — JSON-by-default, agent-friendly")
  .version("0.1.0")
  .option("--pretty", "human-readable table output instead of JSON")
  .option("--json", "JSON output (default; explicit for clarity)")
  .option("--api-key <key>", "override resolved API key for this invocation")
  .option("--timeout <ms>", "request timeout in ms (default 30000)")
  .option("--verbose", "log resolution + request info to stderr");

registerAuth(program);
registerWorkouts(program);
registerRoutines(program);
registerRoutineFolders(program);
registerExerciseTemplates(program);
registerExerciseHistory(program);
registerBodyMeasurements(program);
registerUser(program);

program.parseAsync(process.argv).catch((err) => {
  const mode = program.opts().pretty ? "pretty" : "json";
  writeError(err, { mode });
  process.exit(err instanceof HevyError ? exitCodeFor(err.code) : 1);
});
