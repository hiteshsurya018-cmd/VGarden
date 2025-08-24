import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import backendRoutes from "./routes/backend";
// Import backend proxy to auto-start backend
import "./backend-proxy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Backend management routes
  app.use("/api/backend", backendRoutes);

  // Virtual Garden status endpoint
  app.get("/api/garden/status", async (_req, res) => {
    res.json({
      name: "Virtual Garden",
      version: "1.0.0",
      features: {
        plant_detection: true,
        yolov5_ai: true,
        garden_3d: true,
        medicinal_database: true
      },
      endpoints: {
        frontend: "Already running in browser",
        backend: "http://localhost:8000",
        backend_docs: "http://localhost:8000/docs"
      }
    });
  });

  return app;
}
