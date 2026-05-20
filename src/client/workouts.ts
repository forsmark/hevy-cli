import { z } from "zod";
import type { HttpClient } from "./http.js";
import { workout, workoutEvent, postWorkoutBody } from "../schemas/workout.js";
import { parse } from "./_parse.js";

const listResp = z.object({
  page: z.number().int(),
  page_count: z.number().int(),
  workouts: z.array(workout),
});

const countResp = z.object({ workout_count: z.number().int() });

const eventsResp = z.object({
  page: z.number().int(),
  page_count: z.number().int(),
  events: z.array(workoutEvent),
});

export const workouts = {
  async list(http: HttpClient, args: { page?: number; pageSize?: number } = {}) {
    const data = await http.request({
      method: "GET",
      path: "/v1/workouts",
      query: { page: args.page, pageSize: args.pageSize },
    });
    return parse(listResp, data);
  },

  async get(http: HttpClient, workoutId: string) {
    const data = await http.request({ method: "GET", path: `/v1/workouts/${workoutId}` });
    return parse(workout, data);
  },

  async count(http: HttpClient) {
    const data = await http.request({ method: "GET", path: "/v1/workouts/count" });
    return parse(countResp, data);
  },

  async events(http: HttpClient, args: { since: string; page?: number; pageSize?: number }) {
    const data = await http.request({
      method: "GET",
      path: "/v1/workouts/events",
      query: { since: args.since, page: args.page, pageSize: args.pageSize },
    });
    return parse(eventsResp, data);
  },

  async create(http: HttpClient, body: unknown) {
    const parsed = postWorkoutBody.parse(body);
    const data = await http.request({ method: "POST", path: "/v1/workouts", body: parsed });
    // API wraps as { workout: [Workout] } with one item.
    const arr = parse(z.object({ workout: z.array(workout).min(1) }), data).workout;
    return arr[0]!;
  },

  async update(http: HttpClient, workoutId: string, body: unknown) {
    const parsed = postWorkoutBody.parse(body);
    const data = await http.request({
      method: "PUT", path: `/v1/workouts/${workoutId}`, body: parsed,
    });
    const arr = parse(z.object({ workout: z.array(workout).min(1) }), data).workout;
    return arr[0]!;
  },
};
