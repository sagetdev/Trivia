import "dotenv/config";
import express from "express";
import quizRoutes, { initializeQuizRoutes } from "./routes/quiz.routes";
import advancedRoutes from "./routes/advanced.routes";
import { InMemoryRateLimiter } from "./services/rate-limit";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

const rateLimiter = new InMemoryRateLimiter();
app.use("/api", (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const isAnswer = req.method === "POST" && /^\/quizzes\/[^/]+\/answers$/.test(req.path);
  const isQuizCreation = req.method === "POST" && req.path === "/quizzes";
  const bucket = isAnswer ? "answer" : isQuizCreation ? "create" : "general";
  const limit = isAnswer ? 40 : isQuizCreation ? 10 : 120;
  const decision = rateLimiter.consume(ip + ":" + bucket, limit, 60_000);

  res.setHeader("RateLimit-Limit", String(limit));
  res.setHeader("RateLimit-Remaining", String(decision.remaining));
  if (!decision.allowed) {
    res.setHeader("Retry-After", String(decision.retryAfterSeconds));
    res.status(429).json({ error: "Trop de requêtes. Attends quelques secondes avant de réessayer." });
    return;
  }
  next();
});

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
