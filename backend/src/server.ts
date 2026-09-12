import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { authRoutes } from "./auth/auth.routes";
import { comentarioRoutes } from "./comentario/comentario.routes";
import { demandaRoutes } from "./demanda/demanda.routes";
import { HttpError } from "./http-error";
import { notificacaoRoutes } from "./notificacao/notificacao.routes";
import { projetoRoutes } from "./projeto/projeto.routes";
import { usuarioRoutes } from "./usuario/usuario.routes";
import "./database/connection";
import { seedDatabaseIfEmpty } from "./database/seed.database";

await seedDatabaseIfEmpty();

const app = express();
const porta = Number(process.env.PORT ?? 3005);
const frontendRoot = join(import.meta.dir, "../../frontend");
const frontendDist = join(frontendRoot, "dist");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/projetos", projetoRoutes);
app.use("/api/demandas", demandaRoutes);
app.use("/api/comentarios", comentarioRoutes);
app.use("/api/notificacoes", notificacaoRoutes);
app.use("/api", (_req, res) => {
  res.status(404).json({ erro: "Não encontrado" });
});

const server = createServer(app);

if (process.env.NODE_ENV !== "production") {
  const { createServer: createVite } = await import("vite");
  const vite = await createVite({
    configFile: join(frontendRoot, "vite.config.ts"),
    root: frontendRoot,
    server: {
      middlewareMode: { server },
      ws: { server },
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else if (existsSync(frontendDist)) {
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

server.listen(porta, "0.0.0.0", () => {
  console.log(`ORION em http://localhost:${porta}`);
});
