import { envs } from "~src/config/envs";

import setupDb from "./db/setup";
import setupHttpServer from "./http/setup";

const { PORT } = envs;

console.log("Project CB!");

(async () => {
  await Promise.all([setupHttpServer(), setupDb()]);

  console.log(`HTTP server running on port ${PORT}`);
})();
