import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { demandaController } from "./demanda.controller";

export const demandaRoutes = Router();
demandaRoutes.use(authMiddleware);
demandaRoutes.get("/", demandaController.listar);
demandaRoutes.get("/:id", demandaController.buscarPorId);
demandaRoutes.post("/", demandaController.criar);
demandaRoutes.put("/:id", demandaController.atualizar);
demandaRoutes.patch("/:id/status", demandaController.alterarStatus);
demandaRoutes.delete("/:id", demandaController.excluir);
