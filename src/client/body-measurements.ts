import { z } from "zod";
import type { HttpClient } from "./http.js";
import { parse } from "./_parse.js";
import { bodyMeasurement, postBodyMeasurementBody } from "../schemas/body-measurement.js";

const listResp = z.object({
  page: z.number().int(),
  page_count: z.number().int(),
  body_measurements: z.array(bodyMeasurement),
});

export const bodyMeasurements = {
  async list(http: HttpClient, args: { page?: number; pageSize?: number } = {}) {
    const data = await http.request({
      method: "GET",
      path: "/v1/body_measurements",
      query: { page: args.page, pageSize: args.pageSize },
    });
    return parse(listResp, data);
  },

  async create(http: HttpClient, body: unknown) {
    const parsed = postBodyMeasurementBody.parse(body);
    // POST returns 200 with no body per swagger; http client returns null for empty responses
    await http.request({ method: "POST", path: "/v1/body_measurements", body: parsed });
    return null;
  },

  async remove(http: HttpClient, date: string): Promise<null> {
    // DELETE /v1/body_measurements/{date} — no response body
    await http.request({ method: "DELETE", path: `/v1/body_measurements/${date}` });
    return null;
  },
};
