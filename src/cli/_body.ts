import { readFile } from "node:fs/promises";
import { HevyError } from "../errors.js";

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

async function readAllStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}
