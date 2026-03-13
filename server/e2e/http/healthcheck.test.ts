import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/app";

describe("GET /healthcheck", () => {
  it("returns the expected success payload", async () => {
    const response = await request(createTestApp()).get("/healthcheck");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Alive and well!" });
  });
});
