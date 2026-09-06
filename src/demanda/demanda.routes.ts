import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { ProjetoRepository } from "../projeto/projeto.repository";
import { UsuarioRepository } from "../usuario/usuario.repository";
import { DemandaController } from "./demanda.controller";
import { DemandaRepository } from "./demanda.repository";
import { DemandaService } from "./demanda.service";

const service = new DemandaService(
  new DemandaRepository(),
  new ProjetoRepository(),
  new UsuarioRepository(),
);
const controller = new DemandaController(service);

export const demandaRoutes = Router();
demandaRoutes.use(authMiddleware);
demandaRoutes.get("/", controller.listar);
demandaRoutes.get("/:id", controller.buscarPorId);
demandaRoutes.post("/", controller.criar);
demandaRoutes.put("/:id", controller.atualizar);
demandaRoutes.patch("/:id/status", controller.alterarStatus);
demandaRoutes.delete("/:id", controller.excluir);
