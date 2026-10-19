import "dotenv/config";
import express from "express";
import quizRoutes, { initializeQuizRoutes } from "./routes/quiz.routes";
import advancedRoutes from "./routes/advanced.routes";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Trivia API", timestamp: new Date().toISOString() });
});

app.use("/api", quizRoutes);
app.use("/api", advancedRoutes);
app.use((_req, res) => res.status(404).json({ error: "Route introuvable." }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[api-error]", error);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

initializeQuizRoutes()
  .then(() => app.listen(port, "0.0.0.0", () => console.log(`Trivia API démarrée sur le port ${port}`)))
  .catch((error) => {
    console.error("Impossible de restaurer les données du quiz:", error);
    process.exitCode = 1;
  });
