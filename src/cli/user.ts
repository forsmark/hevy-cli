import { Command } from "commander";
import { userClient } from "../client/user.js";
import { runWithHttp, type CliDeps } from "./_utils.js";

export function registerUser(program: Command, deps: CliDeps = {}): void {
  const cmd = program.command("user").description("user");

  cmd
    .command("info")
    .action(() =>
      runWithHttp({ program, tag: "user.info", deps }, (http) => userClient.info(http)),
    );
}
