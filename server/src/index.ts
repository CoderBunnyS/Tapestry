import cors from "cors";
import express from "express";
import type { ApiHealth } from "@tapestry/shared";
import { config } from "./config.js";
import { connectDatabase } from "./database.js";

const app = express();
let databaseConnected = false;

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  const health: ApiHealth = {
    status: "ok",
    service: "tapestry-api",
    database: databaseConnected ? "connected" : "disconnected",
  };
  response.json(health);
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

connectDatabase()
  .then((connected) => {
    databaseConnected = connected;
    app.listen(config.port, () => {
      console.log(`Tapestry API listening on http://localhost:${config.port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Unable to connect to MongoDB", error);
    process.exitCode = 1;
  });
