
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import tasksRouter from "./routes/tasks.routes";
import { swaggerUi, swaggerSpec } from "./utils/swagger";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Task API (SQLite + TS) is running" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/tasks", tasksRouter);

// Not found handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

export default app;
