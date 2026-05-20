import { Command } from "commander";
import { routines } from "../client/routines.js";
import { runWithHttp, type CliDeps } from "./_utils.js";
import { readBody } from "./_body.js";

export function registerRoutines(program: Command, deps: CliDeps = {}): void {
  const cmd = program.command("routines").description("routines");

  cmd
    .command("list")
    .option("--page <n>", "page number", "1")
    .option("--page-size <n>", "items per page", "5")
    .action((opts) =>
      runWithHttp({ program, tag: "routines.list", deps }, (http) =>
        routines.list(http, { page: Number(opts.page), pageSize: Number(opts.pageSize) }),
      ),
    );

  cmd
    .command("get <routineId>")
    .action((routineId) =>
      runWithHttp({ program, tag: "routines.get", deps }, (http) =>
        routines.get(http, routineId),
      ),
    );

  cmd
    .command("create")
    .requiredOption("--file <path>", "JSON body file path, or `-` for stdin")
    .action(async (opts) => {
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "routines.create", deps }, (http) =>
        routines.create(http, body),
      );
    });

  cmd
    .command("update <routineId>")
    .requiredOption("--file <path>", "JSON body file path, or `-` for stdin")
    .action(async (routineId, opts) => {
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "routines.update", deps }, (http) =>
        routines.update(http, routineId, body),
      );
    });
}
