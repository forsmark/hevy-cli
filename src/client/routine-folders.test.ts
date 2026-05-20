import { describe, it, expect, vi } from "vitest";
import { routineFolders } from "./routine-folders.js";
import type { HttpClient } from "./http.js";

const ok = (data: unknown) => ({ request: vi.fn(async () => data) }) as unknown as HttpClient;

const sampleFolder = {
  id: 1,
  index: 0,
  title: "Push Pull",
  updated_at: "2026-05-20T10:00:00Z",
  created_at: "2026-05-20T10:00:00Z",
};

describe("routine-folders client", () => {
  it("list passes pagination and parses", async () => {
    const http = ok({ page: 1, page_count: 2, routine_folders: [sampleFolder] });
    const r = await routineFolders.list(http, { page: 1, pageSize: 5 });
    expect(r.routine_folders[0]!.id).toBe(1);
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/routine_folders",
      query: { page: 1, pageSize: 5 },
    });
  });

  it("get parses bare folder response", async () => {
    const http = ok(sampleFolder);
    const r = await routineFolders.get(http, 1);
    expect(r.title).toBe("Push Pull");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/routine_folders/1",
    });
  });

  it("throws SCHEMA when list response shape is wrong", async () => {
    const http = ok({ page: "bad", page_count: 1, routine_folders: [] });
    await expect(routineFolders.list(http)).rejects.toMatchObject({ code: "SCHEMA" });
  });
});
