import { Command } from "commander";
import { routineFolders } from "../client/routine-folders.js";
import { runWithHttp, type CliDeps } from "./_utils.js";
import { readBody, emitSchema, requireFile } from "./_body.js";
import { postRoutineFolderBodyExample } from "../schemas/routine-folder.js";

export function registerRoutineFolders(program: Command, deps: CliDeps = {}): void {
  const cmd = program.command("routine-folders").description("routine folders");

  cmd
    .command("list")
    .option("--page <n>", "page number", "1")
    .option("--page-size <n>", "items per page", "5")
    .action((opts) =>
      runWithHttp({ program, tag: "routine-folders.list", deps }, (http) =>
        routineFolders.list(http, { page: Number(opts.page), pageSize: Number(opts.pageSize) }),
      ),
    );

  cmd
    .command("get <folderId>")
    .action((folderId) =>
      runWithHttp({ program, tag: "routine-folders.get", deps }, (http) =>
        routineFolders.get(http, Number(folderId)),
      ),
    );

  cmd
    .command("create")
    .option("--file <path>", "JSON body file path, or `-` for stdin")
    .option("--schema", "print a minimal JSON example body and exit")
    .action(async (opts) => {
      if (opts.schema) return emitSchema(postRoutineFolderBodyExample, deps);
      if (!requireFile(opts, deps)) return;
      const body = await readBody(opts.file);
      await runWithHttp({ program, tag: "routine-folders.create", deps }, (http) =>
        routineFolders.create(http, body),
      );
    });
}
