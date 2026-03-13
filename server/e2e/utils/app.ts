import request from "supertest";

import { createHttpApp } from "~src/http/setup";

export const createTestApp = () => createHttpApp();

export const createTestAgent = () => request.agent(createTestApp());
