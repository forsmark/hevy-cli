import { z } from "zod";

export const apiErrorBody = z.object({ error: z.string() }).partial();
export type ApiErrorBody = z.infer<typeof apiErrorBody>;
