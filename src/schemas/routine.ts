import { z } from "zod";

// Routine response set (inline in swagger Routine schema)
const routineSet = z
  .object({
    index: z.number(),
    type: z.string(),
    weight_kg: z.number().nullable(),
    reps: z.number().nullable(),
    rep_range: z
      .object({
        start: z.number().nullable(),
        end: z.number().nullable(),
      })
      .nullable()
      .optional(),
    distance_meters: z.number().nullable(),
    duration_seconds: z.number().nullable(),
    rpe: z.number().nullable().optional(),
    custom_metric: z.number().nullable(),
  })
  .passthrough();

// Routine response exercise (inline in swagger Routine schema)
// Note: swagger types rest_seconds as "string" but it is clearly numeric; using z.number().
const routineExercise = z
  .object({
    index: z.number(),
    title: z.string(),
    rest_seconds: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
    exercise_template_id: z.string(),
    supersets_id: z.number().nullable().optional(),
    sets: z.array(routineSet),
  })
  .passthrough();

export const routine = z
  .object({
    id: z.string(),
    title: z.string(),
    folder_id: z.number().nullable(),
    updated_at: z.string(),
    created_at: z.string(),
    exercises: z.array(routineExercise),
  })
  .passthrough();

export type Routine = z.infer<typeof routine>;

// Request schemas

const postRoutineSet = z.object({
  type: z.enum(["warmup", "normal", "failure", "dropset"]).optional(),
  weight_kg: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  distance_meters: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  custom_metric: z.number().nullable().optional(),
  rep_range: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .nullable()
    .optional(),
});

const postRoutineExercise = z.object({
  exercise_template_id: z.string(),
  superset_id: z.number().nullable().optional(),
  rest_seconds: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(postRoutineSet),
});

export const postRoutineBody = z.object({
  routine: z.object({
    title: z.string(),
    folder_id: z.number().nullable().optional(),
    notes: z.string().optional(),
    exercises: z.array(postRoutineExercise),
  }),
});

export type PostRoutineBody = z.infer<typeof postRoutineBody>;

const putRoutineSet = z.object({
  type: z.enum(["warmup", "normal", "failure", "dropset"]).optional(),
  weight_kg: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  distance_meters: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  custom_metric: z.number().nullable().optional(),
  rep_range: z
    .object({
      start: z.number().nullable(),
      end: z.number().nullable(),
    })
    .nullable()
    .optional(),
});

const putRoutineExercise = z.object({
  exercise_template_id: z.string(),
  superset_id: z.number().nullable().optional(),
  rest_seconds: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(putRoutineSet),
});

export const putRoutineBody = z.object({
  routine: z.object({
    title: z.string(),
    notes: z.string().nullable().optional(),
    exercises: z.array(putRoutineExercise),
  }),
});

export type PutRoutineBody = z.infer<typeof putRoutineBody>;
