import { Command } from "commander";
import { workouts } from "../client/workouts.js";
import { runWithHttp, type CliDeps } from "./_utils.js";
import { readBody, emitSchema, requireFile, requirePositional } from "./_body.js";
import { postWorkoutBodyExample } from "../schemas/workout.js";

export function registerWorkouts(program: Command, deps: CliDeps = {}): void {
  const cmd = program.command("workouts").description("workouts");

  cmd
    .command("list")
    .option("--page <n>", "page number", "1")
    .option("--page-size <n>", "items per page", "5")
    .action((opts) =>
      runWithHttp({ program, tag: "workouts.list", deps }, (http) =>
        workouts.list(http, { page: Number(opts.page), pageSize: Number(opts.pageSize) }),
      ),
    );

  cmd
    .command("get <workoutId>")
    .action((workoutId) =>
      runWithHttp({ program, tag: "workouts.get", deps }, (http) =>
        workouts.get(http, workoutId),
      ),
    );

  cmd
    .command("latest")
    .description("fetch the most recent workout")
    .action(() =>
      runWithHttp({ program, tag: "workouts.latest", deps }, (http) =>
        workouts.latest(http),
      ),
    );

  cmd
    .command("count")
    .action(() =>
      runWithHttp({ program, tag: "workouts.count", deps }, (http) => workouts.count(http)),
    );

  cmd
    .command("events")
    .requiredOption("--since <iso>", "ISO date to fetch events since")
    .option("--page <n>", "page number", "1")
    .option("--page-size <n>", "items per page", "5")
    .action((opts) =>
      runWithHttp({ program, tag: "workouts.events", deps }, (http) =>
        workouts.events(http, {
          since: opts.since,
          page: Number(opts.page),
          pageSize: Number(opts.pageSize),
        }),
      ),
    );

  cmd
    .command("create")
    .option("--file <path>", "JSON body file path, or `-` for stdin")
    .option("--schema", "print a minimal JSON example body and exit")
    .action(async (opts) => {
      if (opts.schema) return emitSchema(postWorkoutBodyExample, deps);
      if (!requireFile(opts, deps)) return;
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "workouts.create", deps }, (http) =>
        workouts.create(http, body),
      );
    });

  cmd
    .command("update [workoutId]")
    .option("--file <path>", "JSON body file path, or `-` for stdin")
    .option("--schema", "print a minimal JSON example body and exit")
    .action(async (workoutId, opts) => {
      if (opts.schema) return emitSchema(postWorkoutBodyExample, deps);
      if (!workoutId) return requirePositional("workoutId", deps);
      if (!requireFile(opts, deps)) return;
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "workouts.update", deps }, (http) =>
        workouts.update(http, workoutId, body),
      );
    });
}
