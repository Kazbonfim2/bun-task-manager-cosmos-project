import { Router } from "express";
import { authController } from "./auth.controller";

export const authRoutes = Router();
authRoutes.post("/cadastro", authController.cadastrar);
authRoutes.post("/login", authController.login);
