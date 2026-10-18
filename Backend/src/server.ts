import "dotenv/config";
import express from "express";
import cors from "cors";
import quizRoutes from "./routes/quiz.routes";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
  }),
);

app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "RoamApp API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", quizRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  },
);

app.listen(port, "0.0.0.0", () => {
  console.log(`RoamApp API démarrée sur http://localhost:${port}`);
});