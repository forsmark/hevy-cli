import { describe, it, expect, vi } from "vitest";
import { writeData, writeError, formatPretty } from "./output.js";
import { HevyError } from "./errors.js";

describe("writeData", () => {
  it("writes pretty-printed JSON to stdout when mode=json", () => {
    const writer = vi.fn();
    writeData({ a: 1 }, { mode: "json", writer });
    expect(writer).toHaveBeenCalledWith('{\n  "a": 1\n}\n');
  });
});

describe("writeError", () => {
  it("writes HevyError JSON shape to stderr", () => {
    const writer = vi.fn();
    writeError(new HevyError("NOT_FOUND", "x", { status: 404 }), { mode: "json", writer });
    const arg = writer.mock.calls[0]![0] as string;
    expect(JSON.parse(arg)).toEqual({
      error: { code: "NOT_FOUND", message: "x", status: 404, details: null },
    });
  });

  it("writes a red one-liner in pretty mode", () => {
    const writer = vi.fn();
    writeError(new HevyError("HTTP", "boom"), { mode: "pretty", writer });
    expect(writer).toHaveBeenCalled();
    expect((writer.mock.calls[0]![0] as string)).toMatch(/HTTP.*boom/);
  });
});

describe("formatPretty", () => {
  it("renders a table for a workouts list payload", () => {
    const out = formatPretty("workouts.list", {
      page: 1,
      page_count: 1,
      workouts: [{ id: "w1", title: "Push", start_time: "2026-05-20T10:00:00Z", end_time: "" }],
    });
    expect(out).toContain("w1");
    expect(out).toContain("Push");
  });
});
