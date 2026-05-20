import { z } from "zod";

export const user = z
  .object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
  })
  .passthrough();

export type User = z.infer<typeof user>;
