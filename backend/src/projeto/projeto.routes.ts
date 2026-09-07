import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { projetoController } from "./projeto.controller";

export const projetoRoutes = Router();
projetoRoutes.use(authMiddleware);
projetoRoutes.get("/", projetoController.listar);
projetoRoutes.post("/", projetoController.criar);
