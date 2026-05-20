import { describe, it, expect, vi } from "vitest";
import { bodyMeasurements } from "./body-measurements.js";
import type { HttpClient } from "./http.js";

const ok = (data: unknown) => ({ request: vi.fn(async () => data) }) as unknown as HttpClient;

const sampleMeasurement = {
  date: "2026-05-20",
  weight_kg: 80.5,
  lean_mass_kg: 65.0,
  fat_percent: 18.5,
  neck_cm: null,
  shoulder_cm: null,
  chest_cm: null,
  left_bicep_cm: null,
  right_bicep_cm: null,
  left_forearm_cm: null,
  right_forearm_cm: null,
  abdomen: null,
  waist: null,
  hips: null,
  left_thigh: null,
  right_thigh: null,
  left_calf: null,
  right_calf: null,
};

describe("body-measurements client", () => {
  it("list passes pagination and parses", async () => {
    const http = ok({ page: 1, page_count: 2, body_measurements: [sampleMeasurement] });
    const r = await bodyMeasurements.list(http, { page: 1, pageSize: 10 });
    expect(r.body_measurements[0]!.date).toBe("2026-05-20");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/body_measurements",
      query: { page: 1, pageSize: 10 },
    });
  });

  it("remove returns null without calling parse", async () => {
    const http = ok(null);
    const r = await bodyMeasurements.remove(http, "2026-05-20");
    expect(r).toBeNull();
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "DELETE",
      path: "/v1/body_measurements/2026-05-20",
    });
  });

  it("throws SCHEMA when list response shape is wrong", async () => {
    const http = ok({ page: "bad", page_count: 1, body_measurements: [] });
    await expect(bodyMeasurements.list(http)).rejects.toMatchObject({ code: "SCHEMA" });
  });
});
