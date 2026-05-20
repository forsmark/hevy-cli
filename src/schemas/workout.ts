import { z } from "zod";

const workoutSet = z
  .object({
    index: z.number(),
    type: z.string(),
    weight_kg: z.number().nullable(),
    reps: z.number().nullable(),
    distance_meters: z.number().nullable(),
    duration_seconds: z.number().nullable(),
    rpe: z.number().nullable(),
    custom_metric: z.number().nullable(),
  })
  .passthrough();

const workoutExercise = z
  .object({
    index: z.number(),
    title: z.string(),
    notes: z.string().nullable().optional(),
    exercise_template_id: z.string(),
    supersets_id: z.number().nullable(),
    sets: z.array(workoutSet),
  })
  .passthrough();

export const workout = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    routine_id: z.string().nullable().optional(),
    start_time: z.string(),
    end_time: z.string(),
    updated_at: z.string(),
    created_at: z.string(),
    exercises: z.array(workoutExercise),
  })
  .passthrough();

export type Workout = z.infer<typeof workout>;

const updatedWorkout = z
  .object({
    type: z.literal("updated"),
    workout: workout,
  })
  .passthrough();

const deletedWorkout = z
  .object({
    type: z.literal("deleted"),
    id: z.string(),
    deleted_at: z.string().optional(),
  })
  .passthrough();

export const workoutEvent = z.discriminatedUnion("type", [
  updatedWorkout,
  deletedWorkout,
]);

export type WorkoutEvent = z.infer<typeof workoutEvent>;

const postWorkoutRequestSet = z.object({
  type: z.enum(["warmup", "normal", "failure", "dropset"]).optional(),
  weight_kg: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  distance_meters: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  custom_metric: z.number().nullable().optional(),
  rpe: z.number().nullable().optional(),
});

const postWorkoutRequestExercise = z.object({
  exercise_template_id: z.string(),
  superset_id: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(postWorkoutRequestSet),
});

export const postWorkoutBody = z.object({
  workout: z.object({
    title: z.string(),
    description: z.string().nullable().optional(),
    start_time: z.string(),
    end_time: z.string(),
    is_private: z.boolean().optional(),
    exercises: z.array(postWorkoutRequestExercise),
  }),
});

export type PostWorkoutBody = z.infer<typeof postWorkoutBody>;
