"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || "*",
}));
app.use(express_1.default.json({ limit: "20kb" }));
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "RoamApp API",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api", quiz_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({ error: "Route introuvable." });
});
app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
});
app.listen(port, "0.0.0.0", () => {
    console.log(`RoamApp API démarrée sur http://localhost:${port}`);
});
