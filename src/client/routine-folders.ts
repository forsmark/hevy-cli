import { z } from "zod";
import type { HttpClient } from "./http.js";
import { parse } from "./_parse.js";
import { routineFolder, postRoutineFolderBody } from "../schemas/routine-folder.js";

const listResp = z.object({
  page: z.number().int(),
  page_count: z.number().int(),
  routine_folders: z.array(routineFolder),
});

export const routineFolders = {
  async list(http: HttpClient, args: { page?: number; pageSize?: number } = {}) {
    const data = await http.request({
      method: "GET",
      path: "/v1/routine_folders",
      query: { page: args.page, pageSize: args.pageSize },
    });
    return parse(listResp, data);
  },

  async get(http: HttpClient, folderId: number) {
    const data = await http.request({
      method: "GET",
      path: `/v1/routine_folders/${folderId}`,
    });
    // GET single returns bare RoutineFolder per swagger
    return parse(routineFolder, data);
  },

  async create(http: HttpClient, body: unknown) {
    const parsed = postRoutineFolderBody.parse(body);
    const data = await http.request({
      method: "POST",
      path: "/v1/routine_folders",
      body: parsed,
    });
    // POST returns bare RoutineFolder per swagger
    return parse(routineFolder, data);
  },
};
