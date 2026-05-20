import { readFile } from "node:fs/promises";
import { HevyError, exitCodeFor } from "../errors.js";
import { writeError } from "../output.js";
import type { CliDeps } from "./_utils.js";

export async function readBody(file: string): Promise<unknown> {
  const text = file === "-" ? await readAllStdin() : await readFile(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new HevyError("VALIDATION", `Invalid JSON in ${file === "-" ? "stdin" : file}`, {
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

export function emitSchema(example: unknown, deps: CliDeps): void {
  const stdout = deps.stdout ?? ((s) => process.stdout.write(s));
  stdout(JSON.stringify(example, null, 2) + "\n");
}

export function requireFile(opts: { file?: string }, deps: CliDeps): boolean {
  if (opts.file) return true;
  const stderr = deps.stderr ?? ((s) => process.stderr.write(s));
  writeError(
    new HevyError("VALIDATION", "Required: --file <path> (or use --schema to print an example)"),
    { mode: "json", writer: stderr },
  );
  process.exitCode = exitCodeFor("VALIDATION");
  return false;
}

export function requirePositional(name: string, deps: CliDeps): void {
  const stderr = deps.stderr ?? ((s) => process.stderr.write(s));
  writeError(new HevyError("VALIDATION", `Required positional argument: <${name}>`), {
    mode: "json",
    writer: stderr,
  });
  process.exitCode = exitCodeFor("VALIDATION");
}

async function readAllStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}
