import { z } from "zod";
import type { HttpClient } from "./http.js";
import { parse } from "./_parse.js";
import { user } from "../schemas/user.js";

// GET /v1/user/info returns { data: UserInfo } per swagger (UserInfoResponse wrapper)
const userInfoResp = z.object({ data: user });

export const userClient = {
  async info(http: HttpClient) {
    const data = await http.request({ method: "GET", path: "/v1/user/info" });
    return parse(userInfoResp, data).data;
  },
};
