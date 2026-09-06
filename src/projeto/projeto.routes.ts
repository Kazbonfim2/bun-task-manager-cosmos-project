import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { ProjetoController } from "./projeto.controller";
import { ProjetoRepository } from "./projeto.repository";
import { ProjetoService } from "./projeto.service";

const service = new ProjetoService(new ProjetoRepository());
const controller = new ProjetoController(service);

export const projetoRoutes = Router();
projetoRoutes.use(authMiddleware);
projetoRoutes.get("/", controller.listar);
projetoRoutes.post("/", controller.criar);
