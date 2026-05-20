import { z } from "zod";

export const bodyMeasurement = z
  .object({
    date: z.string(),
    weight_kg: z.number().nullable(),
    lean_mass_kg: z.number().nullable(),
    fat_percent: z.number().nullable(),
    neck_cm: z.number().nullable(),
    shoulder_cm: z.number().nullable(),
    chest_cm: z.number().nullable(),
    left_bicep_cm: z.number().nullable(),
    right_bicep_cm: z.number().nullable(),
    left_forearm_cm: z.number().nullable(),
    right_forearm_cm: z.number().nullable(),
    abdomen: z.number().nullable(),
    waist: z.number().nullable(),
    hips: z.number().nullable(),
    left_thigh: z.number().nullable(),
    right_thigh: z.number().nullable(),
    left_calf: z.number().nullable(),
    right_calf: z.number().nullable(),
  })
  .passthrough();

export type BodyMeasurement = z.infer<typeof bodyMeasurement>;

export const postBodyMeasurementBody = z.object({
  body_measurement: bodyMeasurement,
});

export type PostBodyMeasurementBody = z.infer<typeof postBodyMeasurementBody>;
