import { describe, it, expect, vi } from "vitest";
import { exerciseTemplates } from "./exercise-templates.js";
import type { HttpClient } from "./http.js";

const ok = (data: unknown) => ({ request: vi.fn(async () => data) }) as unknown as HttpClient;

const sampleTemplate = {
  id: "D04AC939",
  title: "Bench Press (Barbell)",
  type: "weight_reps",
  primary_muscle_group: "chest",
  secondary_muscle_groups: ["triceps", "front_deltoid"],
  is_custom: false,
};

describe("exercise-templates client", () => {
  it("list passes pagination and parses", async () => {
    const http = ok({ page: 1, page_count: 5, exercise_templates: [sampleTemplate] });
    const r = await exerciseTemplates.list(http, { page: 1, pageSize: 10 });
    expect(r.exercise_templates[0]!.id).toBe("D04AC939");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/exercise_templates",
      query: { page: 1, pageSize: 10 },
    });
  });

  it("get parses template response", async () => {
    const http = ok(sampleTemplate);
    const r = await exerciseTemplates.get(http, "D04AC939");
    expect(r.title).toBe("Bench Press (Barbell)");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/exercise_templates/D04AC939",
    });
  });

  it("throws SCHEMA when response shape is wrong", async () => {
    const http = ok({ page: 1, page_count: 1, exercise_templates: "not-an-array" });
    await expect(exerciseTemplates.list(http)).rejects.toMatchObject({ code: "SCHEMA" });
  });

  it("--name filter paginates through all pages and filters by title substring", async () => {
    const pages = [
      {
        page: 1,
        page_count: 2,
        exercise_templates: [
          sampleTemplate,
          { ...sampleTemplate, id: "X1", title: "Squat (Barbell)" },
        ],
      },
      {
        page: 2,
        page_count: 2,
        exercise_templates: [
          { ...sampleTemplate, id: "X2", title: "Front Squat" },
          { ...sampleTemplate, id: "X3", title: "Deadlift" },
        ],
      },
    ];
    let call = 0;
    const http = { request: vi.fn(async () => pages[call++]) } as unknown as HttpClient;
    const r = await exerciseTemplates.list(http, { name: "squat" });
    expect(r.exercise_templates.map((t) => t.id)).toEqual(["X1", "X2"]);
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });
});
