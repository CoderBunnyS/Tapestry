import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ApiHealth } from "@tapestry/shared";
import { config } from "./config.js";
import { connectDatabase } from "./database.js";
import { getDailyRecord, isDateKey, saveDailyRecord } from "./dailyRecord.js";

const app = express();
let databaseConnected = false;

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  const health: ApiHealth = {
    status: "ok",
    service: "tapestry-api",
    database: databaseConnected ? "connected" : "disconnected",
  };
  response.json(health);
});

app.get("/api/daily-records/:date", async (request, response) => {
  const { date } = request.params;
  if (!isDateKey(date)) return void response.status(400).json({ error: "Date must use YYYY-MM-DD." });
  if (!databaseConnected) return void response.status(503).json({ error: "Persistence is unavailable." });
  try {
    response.json(await getDailyRecord(date));
  } catch (error) {
    console.error("Unable to load daily record", error);
    response.status(500).json({ error: "Unable to load daily record." });
  }
});

app.put("/api/daily-records/:date", async (request, response) => {
  const { date } = request.params;
  if (!isDateKey(date)) return void response.status(400).json({ error: "Date must use YYYY-MM-DD." });
  if (!databaseConnected) return void response.status(503).json({ error: "Persistence is unavailable." });
  try {
    response.json(await saveDailyRecord(date, request.body));
  } catch (error) {
    console.error("Unable to save daily record", error);
    response.status(500).json({ error: "Unable to save daily record." });
  }
});

if (config.nodeEnv === "production") {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const clientDirectory = path.resolve(currentDirectory, "../../client/dist");
  app.use(express.static(clientDirectory));
  app.get("*", (_request, response) => response.sendFile(path.join(clientDirectory, "index.html")));
} else {
  app.use((_request, response) => response.status(404).json({ error: "Not found" }));
}

connectDatabase()
  .then((connected) => {
    databaseConnected = connected;
    app.listen(config.port, () => console.log(`Tapestry API listening on http://localhost:${config.port}`));
  })
  .catch((error: unknown) => {
    console.error("Unable to connect to MongoDB", error);
    process.exitCode = 1;
  });
