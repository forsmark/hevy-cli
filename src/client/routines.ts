import { z } from "zod";
import type { HttpClient } from "./http.js";
import { parse } from "./_parse.js";
import { routine, postRoutineBody, putRoutineBody } from "../schemas/routine.js";

const listResp = z.object({
  page: z.number().int(),
  page_count: z.number().int(),
  routines: z.array(routine),
});

// GET /v1/routines/{routineId} returns { routine: Routine } per swagger
const getResp = z.object({ routine });

export const routines = {
  async list(http: HttpClient, args: { page?: number; pageSize?: number } = {}) {
    const data = await http.request({
      method: "GET",
      path: "/v1/routines",
      query: { page: args.page, pageSize: args.pageSize },
    });
    return parse(listResp, data);
  },

  async get(http: HttpClient, routineId: string) {
    const data = await http.request({ method: "GET", path: `/v1/routines/${routineId}` });
    return parse(getResp, data).routine;
  },

  async create(http: HttpClient, body: unknown) {
    const parsed = postRoutineBody.parse(body);
    const data = await http.request({ method: "POST", path: "/v1/routines", body: parsed });
    // POST returns bare Routine per swagger
    return parse(routine, data);
  },

  async update(http: HttpClient, routineId: string, body: unknown) {
    const parsed = putRoutineBody.parse(body);
    const data = await http.request({
      method: "PUT",
      path: `/v1/routines/${routineId}`,
      body: parsed,
    });
    // PUT returns bare Routine per swagger
    return parse(routine, data);
  },
};
