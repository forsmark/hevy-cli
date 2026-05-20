import { z } from "zod";

export const routineFolder = z
  .object({
    id: z.number(),
    index: z.number(),
    title: z.string(),
    updated_at: z.string(),
    created_at: z.string(),
  })
  .passthrough();

export type RoutineFolder = z.infer<typeof routineFolder>;

export const postRoutineFolderBody = z.object({
  routine_folder: z.object({
    title: z.string(),
  }),
});

export type PostRoutineFolderBody = z.infer<typeof postRoutineFolderBody>;
