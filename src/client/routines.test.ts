import { describe, it, expect, vi } from "vitest";
import { routines } from "./routines.js";
import type { HttpClient } from "./http.js";

const ok = (data: unknown) => ({ request: vi.fn(async () => data) }) as unknown as HttpClient;

const sampleRoutine = {
  id: "r1",
  title: "Push Day",
  folder_id: null,
  updated_at: "2026-05-20T10:00:00Z",
  created_at: "2026-05-20T10:00:00Z",
  exercises: [],
};

describe("routines client", () => {
  it("list passes pagination and parses", async () => {
    const http = ok({ page: 1, page_count: 3, routines: [sampleRoutine] });
    const r = await routines.list(http, { page: 1, pageSize: 5 });
    expect(r.routines[0]!.id).toBe("r1");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/routines",
      query: { page: 1, pageSize: 5 },
    });
  });

  it("get unwraps routine from response envelope", async () => {
    const http = ok({ routine: sampleRoutine });
    const r = await routines.get(http, "r1");
    expect(r.id).toBe("r1");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/routines/r1",
    });
  });

  it("throws SCHEMA when list response shape is wrong", async () => {
    const http = ok({ page: "not-a-number", page_count: 1, routines: [] });
    await expect(routines.list(http)).rejects.toMatchObject({ code: "SCHEMA" });
  });

  it("create unwraps the { routine: [Routine] } array wrapper from the API", async () => {
    const http = ok({ routine: [sampleRoutine] });
    const r = await routines.create(http, {
      routine: { title: "x", exercises: [{ exercise_template_id: "T", sets: [] }] },
    });
    expect(r.id).toBe("r1");
  });

  it("update unwraps the { routine: [Routine] } array wrapper from the API", async () => {
    const http = ok({ routine: [sampleRoutine] });
    const r = await routines.update(http, "r1", {
      routine: { title: "x", exercises: [{ exercise_template_id: "T", sets: [] }] },
    });
    expect(r.id).toBe("r1");
  });
});
