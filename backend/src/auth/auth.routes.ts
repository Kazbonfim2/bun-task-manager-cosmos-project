import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authService } from "./auth.service";

const controller = new AuthController(authService);

export const authRoutes = Router();
authRoutes.post("/cadastro", controller.cadastrar);
authRoutes.post("/login", controller.login);

