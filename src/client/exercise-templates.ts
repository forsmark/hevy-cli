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
  async list(
    http: HttpClient,
    args: { page?: number; pageSize?: number; name?: string } = {},
  ) {
    if (args.name) return listAllByName(http, args.name);
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

// API has no server-side search; fetch all pages once and filter by title substring.
async function listAllByName(http: HttpClient, name: string) {
  const needle = name.toLowerCase();
  const all: z.infer<typeof exerciseTemplate>[] = [];
  let page = 1;
  while (true) {
    const data = await http.request({
      method: "GET",
      path: "/v1/exercise_templates",
      query: { page, pageSize: 100 },
    });
    const parsed = parse(listResp, data);
    all.push(...parsed.exercise_templates);
    if (page >= parsed.page_count) break;
    page += 1;
  }
  const matches = all.filter((t) => t.title.toLowerCase().includes(needle));
  return { page: 1, page_count: 1, exercise_templates: matches };
}
