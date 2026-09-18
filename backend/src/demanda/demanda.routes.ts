import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { comentarioController } from "../comentario/comentario.controller";
import { demandaController } from "./demanda.controller";

export const demandaRoutes = Router();
demandaRoutes.use(authMiddleware);
demandaRoutes.patch("/reordenar", demandaController.reordenar);
demandaRoutes.get("/", demandaController.listar);
demandaRoutes.get("/:id", demandaController.buscarPorId);
demandaRoutes.post("/", demandaController.criar);
demandaRoutes.put("/:id", demandaController.atualizar);
demandaRoutes.patch("/:id/status", demandaController.alterarStatus);
demandaRoutes.delete("/:id", demandaController.excluir);
demandaRoutes.get("/:id/comentarios", comentarioController.listarPorDemanda);
demandaRoutes.post("/:id/comentarios", comentarioController.criar);

