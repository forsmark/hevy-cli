import { describe, it, expect, vi } from "vitest";
import { userClient } from "./user.js";
import type { HttpClient } from "./http.js";

const ok = (data: unknown) => ({ request: vi.fn(async () => data) }) as unknown as HttpClient;

describe("user client", () => {
  it("info unwraps user from data envelope", async () => {
    const http = ok({
      data: { id: "9c465af3", name: "John Doe", url: "https://hevy.com/user/john" },
    });
    const r = await userClient.info(http);
    expect(r.id).toBe("9c465af3");
    expect(r.name).toBe("John Doe");
    expect((http.request as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({
      method: "GET",
      path: "/v1/user/info",
    });
  });

  it("throws SCHEMA when user response shape is wrong", async () => {
    const http = ok({ data: { id: 12345, name: "Bad" } }); // id should be string, url missing
    await expect(userClient.info(http)).rejects.toMatchObject({ code: "SCHEMA" });
  });
});
