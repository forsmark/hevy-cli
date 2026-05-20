import { Command } from "commander";
import { exerciseHistory } from "../client/exercise-history.js";
import { runWithHttp, type CliDeps } from "./_utils.js";

export function registerExerciseHistory(program: Command, deps: CliDeps = {}): void {
  const cmd = program.command("exercise-history").description("exercise history");

  cmd
    .command("get <exerciseTemplateId>")
    .option("--start-date <date>", "start date (ISO)")
    .option("--end-date <date>", "end date (ISO)")
    .action((exerciseTemplateId, opts) =>
      runWithHttp({ program, tag: "exercise-history.get", deps }, (http) =>
        exerciseHistory.list(http, exerciseTemplateId, {
          startDate: opts.startDate,
          endDate: opts.endDate,
        }),
      ),
    );
}
