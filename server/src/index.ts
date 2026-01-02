import express from "express";

import { connectDb } from "./db";

const app = express();
const port = process.env.PORT || 4000;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, async () => {
  try {
    await connectDb();

    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    console.error(err);
  }
});
