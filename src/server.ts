import { existsSync } from "node:fs";
import { join } from "node:path";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { authRoutes } from "./auth/auth.routes";
import { demandaRoutes } from "./demanda/demanda.routes";
import { HttpError } from "./http-error";
import { projetoRoutes } from "./projeto/projeto.routes";
import { usuarioRoutes } from "./usuario/usuario.routes";
import "./database/connection";

const app = express();
const porta = Number(process.env.PORT ?? 3005);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/projetos", projetoRoutes);
app.use("/api/demandas", demandaRoutes);

const frontendDist = join(import.meta.dir, "../frontend/dist");
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(frontendDist, "index.html"));
  });
}

app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof HttpError) {
    res.status(erro.status).json({ erro: erro.message });
    return;
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno" });
});

app.listen(porta, "0.0.0.0", () => {
  console.log(`ORION em http://localhost:${porta}`);
});
