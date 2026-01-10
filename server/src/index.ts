import setupDb from "./db/setup";
import setupHttpServer from "./http/setup";

console.log("Project CB!");

(async () => {
  await Promise.all([setupHttpServer(), setupDb()]);

  console.log("HTTP server running on port 9001");
})();
