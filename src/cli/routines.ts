import { Command } from "commander";
import { routines } from "../client/routines.js";
import { runWithHttp, type CliDeps } from "./_utils.js";
import { readBody, emitSchema, requireFile, requirePositional } from "./_body.js";
import { postRoutineBodyExample, putRoutineBodyExample } from "../schemas/routine.js";

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
    .option("--file <path>", "JSON body file path, or `-` for stdin")
    .option("--schema", "print a minimal JSON example body and exit")
    .action(async (opts) => {
      if (opts.schema) return emitSchema(postRoutineBodyExample, deps);
      if (!requireFile(opts, deps)) return;
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "routines.create", deps }, (http) =>
        routines.create(http, body),
      );
    });

  cmd
    .command("update [routineId]")
    .option("--file <path>", "JSON body file path, or `-` for stdin")
    .option("--schema", "print a minimal JSON example body and exit")
    .action(async (routineId, opts) => {
      if (opts.schema) return emitSchema(putRoutineBodyExample, deps);
      if (!routineId) return requirePositional("routineId", deps);
      if (!requireFile(opts, deps)) return;
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "routines.update", deps }, (http) =>
        routines.update(http, routineId, body),
      );
    });
}
