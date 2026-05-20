import { Command } from "commander";
import { bodyMeasurements } from "../client/body-measurements.js";
import { runWithHttp, type CliDeps } from "./_utils.js";
import { readBody } from "./_body.js";

export function registerBodyMeasurements(program: Command, deps: CliDeps = {}): void {
  const cmd = program.command("body-measurements").description("body measurements");

  cmd
    .command("list")
    .option("--page <n>", "page number", "1")
    .option("--page-size <n>", "items per page", "5")
    .action((opts) =>
      runWithHttp({ program, tag: "body-measurements.list", deps }, (http) =>
        bodyMeasurements.list(http, { page: Number(opts.page), pageSize: Number(opts.pageSize) }),
      ),
    );

  cmd
    .command("create")
    .requiredOption("--file <path>", "JSON body file path, or `-` for stdin")
    .action(async (opts) => {
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "body-measurements.create", deps }, (http) =>
        bodyMeasurements.create(http, body),
      );
    });

  cmd
    .command("delete <date>")
    .action((date) =>
      runWithHttp({ program, tag: "body-measurements.delete", deps }, (http) =>
        bodyMeasurements.remove(http, date),
      ),
    );
}
