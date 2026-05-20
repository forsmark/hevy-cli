import { z } from "zod";

export const exerciseTemplate = z
  .object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    primary_muscle_group: z.string(),
    secondary_muscle_groups: z.array(z.string()),
    is_custom: z.boolean(),
  })
  .passthrough();

export type ExerciseTemplate = z.infer<typeof exerciseTemplate>;
