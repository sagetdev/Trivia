"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const quiz_routes_1 = __importStar(require("./routes/quiz.routes"));
const advanced_routes_1 = __importDefault(require("./routes/advanced.routes"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
app.disable("x-powered-by");
app.use(express_1.default.json({ limit: "20kb" }));
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Trivia API", timestamp: new Date().toISOString() });
});
app.use("/api", quiz_routes_1.default);
app.use("/api", advanced_routes_1.default);
app.use((_req, res) => res.status(404).json({ error: "Route introuvable." }));
app.use((error, _req, res, _next) => {
    console.error("[api-error]", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
});
(0, quiz_routes_1.initializeQuizRoutes)()
    .then(() => app.listen(port, "0.0.0.0", () => console.log(`Trivia API démarrée sur le port ${port}`)))
    .catch((error) => {
    console.error("Impossible de restaurer les données du quiz:", error);
    process.exitCode = 1;
});
