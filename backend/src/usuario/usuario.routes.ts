import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { usuarioController } from "./usuario.controller";

export const usuarioRoutes = Router();
usuarioRoutes.use(authMiddleware);
usuarioRoutes.get("/", usuarioController.listar);
