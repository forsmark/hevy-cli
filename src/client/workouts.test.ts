import { describe, it, expect, vi } from "vitest";
import { workouts } from "./workouts.js";
import type { HttpClient } from "./http.js";

const ok = (data: unknown) => ({ request: vi.fn(async () => data) }) as unknown as HttpClient;

describe("workouts client", () => {
  it("list passes pagination and parses", async () => {
    const sample = {
      page: 1,
      page_count: 2,
      workouts: [
        {
          id: "w1", title: "t", description: null,
          start_time: "2026-05-20T10:00:00Z", end_time: "2026-05-20T11:00:00Z",
          updated_at: "2026-05-20T11:00:00Z", created_at: "2026-05-20T10:00:00Z",
          exercises: [],
        },
      ],
    };
    const http = ok(sample);
    const r = await workouts.list(http, { page: 1, pageSize: 5 });
    expect(r.workouts[0]!.id).toBe("w1");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/workouts",
      query: { page: 1, pageSize: 5 },
    });
  });

  it("count parses payload", async () => {
    const http = ok({ workout_count: 42 });
    const r = await workouts.count(http);
    expect(r.workout_count).toBe(42);
  });

  it("throws SCHEMA when response shape is wrong", async () => {
    const http = ok({ workout_count: "not-a-number" });
    await expect(workouts.count(http)).rejects.toMatchObject({ code: "SCHEMA" });
  });

  it("parses workout exercise with supersets_id absent", async () => {
    // API may omit supersets_id entirely (not just null) — field must be optional
    const sample = {
      id: "w1", title: "t", description: null,
      start_time: "2026-05-20T10:00:00Z", end_time: "2026-05-20T11:00:00Z",
      updated_at: "2026-05-20T11:00:00Z", created_at: "2026-05-20T10:00:00Z",
      exercises: [
        {
          index: 0, title: "Squat", exercise_template_id: "T",
          // supersets_id intentionally omitted
          sets: [],
        },
      ],
    };
    const http = ok({ workout: [sample] });
    const r = await workouts.create(http, {
      workout: {
        title: "t", start_time: "2026-05-20T10:00:00Z", end_time: "2026-05-20T11:00:00Z",
        exercises: [{ exercise_template_id: "T", sets: [] }],
      },
    });
    expect(r.exercises[0]!.supersets_id).toBeUndefined();
  });

  it("latest returns first workout from page 1", async () => {
    const sample = {
      id: "w1", title: "t", description: null,
      start_time: "2026-05-20T10:00:00Z", end_time: "2026-05-20T11:00:00Z",
      updated_at: "2026-05-20T11:00:00Z", created_at: "2026-05-20T10:00:00Z",
      exercises: [],
    };
    const http = ok({ page: 1, page_count: 1, workouts: [sample] });
    const r = await workouts.latest(http);
    expect(r?.id).toBe("w1");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      query: { page: 1, pageSize: 1 },
    });
  });

  it("latest returns null when no workouts", async () => {
    const http = ok({ page: 1, page_count: 0, workouts: [] });
    expect(await workouts.latest(http)).toBeNull();
  });

  it("create unwraps { workout: [Workout] } wrapper from the API", async () => {
    const sample = {
      id: "w1", title: "t", description: null,
      start_time: "2026-05-20T10:00:00Z", end_time: "2026-05-20T11:00:00Z",
      updated_at: "2026-05-20T11:00:00Z", created_at: "2026-05-20T10:00:00Z",
      exercises: [],
    };
    const http = ok({ workout: [sample] });
    const r = await workouts.create(http, {
      workout: {
        title: "t",
        start_time: "2026-05-20T10:00:00Z",
        end_time: "2026-05-20T11:00:00Z",
        exercises: [{ exercise_template_id: "T", sets: [] }],
      },
    });
    expect(r.id).toBe("w1");
  });
});
