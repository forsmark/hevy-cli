import Table from "cli-table3";
import { HevyError } from "./errors.js";

export type OutputMode = "json" | "pretty";
type Writer = (s: string) => void;

interface WriteOpts {
  mode: OutputMode;
  writer?: Writer;
  prettyTag?: string;
}

export function writeData(data: unknown, opts: WriteOpts): void {
  const w = opts.writer ?? ((s) => process.stdout.write(s));
  if (opts.mode === "json" || !opts.prettyTag) {
    w(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  w(formatPretty(opts.prettyTag, data) + "\n");
}

export function writeError(err: unknown, opts: WriteOpts): void {
  const w = opts.writer ?? ((s) => process.stderr.write(s));
  const hevy =
    err instanceof HevyError
      ? err
      : new HevyError("HTTP", err instanceof Error ? err.message : String(err));
  if (opts.mode === "json") {
    w(JSON.stringify(hevy.toJSON(), null, 2) + "\n");
    return;
  }
  const RED = "\x1b[31m";
  const RESET = "\x1b[0m";
  w(`${RED}${hevy.code}: ${hevy.message}${RESET}\n`);
}

type Row = string[];

export function formatPretty(tag: string, data: unknown): string {
  const renderer = renderers[tag];
  if (!renderer) return JSON.stringify(data, null, 2);
  const { head, rows } = renderer(data);
  const t = new Table({ head });
  for (const r of rows) t.push(r);
  return t.toString();
}

const renderers: Record<string, (data: unknown) => { head: string[]; rows: Row[] }> = {
  "workouts.list": (data) => ({
    head: ["id", "title", "start", "end"],
    rows: ((data as { workouts: Array<Record<string, string>> }).workouts ?? []).map((w) => [
      w["id"] ?? "",
      w["title"] ?? "",
      w["start_time"] ?? "",
      w["end_time"] ?? "",
    ]),
  }),
  "routines.list": (data) => ({
    head: ["id", "title"],
    rows: ((data as { routines: Array<Record<string, string>> }).routines ?? []).map((r) => [
      r["id"] ?? "",
      r["title"] ?? "",
    ]),
  }),
};
