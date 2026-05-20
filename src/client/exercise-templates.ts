import { z } from "zod";
import type { HttpClient } from "./http.js";
import { parse } from "./_parse.js";
import { exerciseTemplate } from "../schemas/exercise-template.js";

const listResp = z.object({
  page: z.number().int(),
  page_count: z.number().int(),
  exercise_templates: z.array(exerciseTemplate),
});

export const exerciseTemplates = {
  async list(http: HttpClient, args: { page?: number; pageSize?: number } = {}) {
    const data = await http.request({
      method: "GET",
      path: "/v1/exercise_templates",
      query: { page: args.page, pageSize: args.pageSize },
    });
    return parse(listResp, data);
  },

  async get(http: HttpClient, exerciseTemplateId: string) {
    const data = await http.request({
      method: "GET",
      path: `/v1/exercise_templates/${exerciseTemplateId}`,
    });
    return parse(exerciseTemplate, data);
  },
};
