import { describe, it, expect } from "vitest";
import { HevyError, ERROR_CODES, exitCodeFor } from "./errors.js";

describe("HevyError", () => {
  it("serializes to the documented error JSON shape", () => {
    const err = new HevyError(ERROR_CODES.NOT_FOUND, "missing", { status: 404 });
    expect(err.toJSON()).toEqual({
      error: { code: "NOT_FOUND", message: "missing", status: 404, details: null },
    });
  });

  it("maps each code to the documented exit code", () => {
    expect(exitCodeFor("AUTH_MISSING")).toBe(2);
    expect(exitCodeFor("AUTH_INVALID")).toBe(2);
    expect(exitCodeFor("VALIDATION")).toBe(3);
    expect(exitCodeFor("NOT_FOUND")).toBe(4);
    expect(exitCodeFor("NETWORK")).toBe(5);
    expect(exitCodeFor("SCHEMA")).toBe(6);
    expect(exitCodeFor("HTTP")).toBe(1);
  });
});
