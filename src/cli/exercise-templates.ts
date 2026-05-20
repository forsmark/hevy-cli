import { Command } from "commander";
import { exerciseTemplates } from "../client/exercise-templates.js";
import { runWithHttp, type CliDeps } from "./_utils.js";

export function registerExerciseTemplates(program: Command, deps: CliDeps = {}): void {
  const cmd = program.command("exercise-templates").description("exercise templates");

  cmd
    .command("list")
    .option("--page <n>", "page number", "1")
    .option("--page-size <n>", "items per page", "5")
    .action((opts) =>
      runWithHttp({ program, tag: "exercise-templates.list", deps }, (http) =>
        exerciseTemplates.list(http, { page: Number(opts.page), pageSize: Number(opts.pageSize) }),
      ),
    );

  cmd
    .command("get <exerciseTemplateId>")
    .action((exerciseTemplateId) =>
      runWithHttp({ program, tag: "exercise-templates.get", deps }, (http) =>
        exerciseTemplates.get(http, exerciseTemplateId),
      ),
    );
}
