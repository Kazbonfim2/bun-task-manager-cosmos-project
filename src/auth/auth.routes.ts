import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authService } from "./auth.service";

const controller = new AuthController(authService);

export const authRoutes = Router();
authRoutes.post("/cadastro", (req, res, next) => {
  controller.cadastrar(req, res).catch(next);
});
authRoutes.post("/login", (req, res, next) => {
  controller.login(req, res).catch(next);
});
