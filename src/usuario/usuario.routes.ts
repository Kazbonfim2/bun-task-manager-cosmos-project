import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { UsuarioController } from "./usuario.controller";
import { UsuarioService } from "./usuario.service";
import { UsuarioRepository } from "./usuario.repository";

const repository = new UsuarioRepository();
const service = new UsuarioService(repository);
const controller = new UsuarioController(service);

export const usuarioRoutes = Router();
usuarioRoutes.use(authMiddleware);
usuarioRoutes.get("/", controller.listar);
