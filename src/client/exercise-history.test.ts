import { describe, it, expect, vi } from "vitest";
import { exerciseHistory } from "./exercise-history.js";
import type { HttpClient } from "./http.js";

const ok = (data: unknown) => ({ request: vi.fn(async () => data) }) as unknown as HttpClient;

const sampleEntry = {
  workout_id: "b459cba5-cd6d-463c-abd6-54f8eafcadcb",
  workout_title: "Morning Workout",
  workout_start_time: "2026-05-20T10:00:00Z",
  workout_end_time: "2026-05-20T11:00:00Z",
  exercise_template_id: "D04AC939",
  weight_kg: 100,
  reps: 10,
  distance_meters: null,
  duration_seconds: null,
  rpe: null,
  custom_metric: null,
  set_type: "normal",
};

describe("exercise-history client", () => {
  it("list passes exerciseTemplateId and date filters", async () => {
    const http = ok({ exercise_history: [sampleEntry] });
    const r = await exerciseHistory.list(http, "D04AC939", {
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-05-20T23:59:59Z",
    });
    expect(r.exercise_history[0]!.workout_id).toBe("b459cba5-cd6d-463c-abd6-54f8eafcadcb");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/exercise_history/D04AC939",
      query: {
        start_date: "2026-01-01T00:00:00Z",
        end_date: "2026-05-20T23:59:59Z",
      },
    });
  });

  it("throws SCHEMA when response shape is wrong", async () => {
    // exercise_history must be an array, not an object
    const http = ok({ exercise_history: "not-an-array" });
    await expect(exerciseHistory.list(http, "D04AC939")).rejects.toMatchObject({ code: "SCHEMA" });
  });
});
