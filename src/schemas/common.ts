import { z } from "zod";

export const apiErrorBody = z.object({ error: z.string() }).partial();
