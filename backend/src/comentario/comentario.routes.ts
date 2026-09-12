import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { comentarioController } from "./comentario.controller";

export const comentarioRoutes = Router();
comentarioRoutes.use(authMiddleware);

comentarioRoutes.put("/:id", comentarioController.atualizar);
comentarioRoutes.delete("/:id", comentarioController.excluir);
