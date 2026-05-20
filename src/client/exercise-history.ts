import { z } from "zod";
import type { HttpClient } from "./http.js";
import { parse } from "./_parse.js";

// Inline schema derived from swagger ExerciseHistoryEntry component.
// Each entry represents a single set within a workout for this exercise template.
const exerciseHistoryEntry = z
  .object({
    workout_id: z.string(),
    workout_title: z.string(),
    workout_start_time: z.string(),
    workout_end_time: z.string(),
    exercise_template_id: z.string(),
    weight_kg: z.number().nullable(),
    reps: z.number().int().nullable(),
    distance_meters: z.number().int().nullable(),
    duration_seconds: z.number().int().nullable(),
    rpe: z.number().nullable(),
    custom_metric: z.number().nullable(),
    set_type: z.string(),
  })
  .passthrough();

const historyResp = z.object({
  exercise_history: z.array(exerciseHistoryEntry),
});

export type ExerciseHistoryEntry = z.infer<typeof exerciseHistoryEntry>;

export const exerciseHistory = {
  async list(
    http: HttpClient,
    exerciseTemplateId: string,
    args: { startDate?: string; endDate?: string } = {},
  ) {
    const data = await http.request({
      method: "GET",
      path: `/v1/exercise_history/${exerciseTemplateId}`,
      query: { start_date: args.startDate, end_date: args.endDate },
    });
    return parse(historyResp, data);
  },
};
