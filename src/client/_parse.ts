import { z } from "zod";
import { HevyError } from "../errors.js";

export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    throw new HevyError("SCHEMA", "Response did not match expected schema", {
      details: r.error.issues,
    });
  }
  return r.data;
}
