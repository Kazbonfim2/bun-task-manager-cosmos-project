import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { grupoController } from "./grupo.controller";

export const grupoRoutes = Router();

// Rota pública para checar validade do convite na tela de cadastro
grupoRoutes.get("/convites/validar/:codigo", grupoController.validarConvite);

// Rotas protegidas
grupoRoutes.use(authMiddleware);

grupoRoutes.get("/", grupoController.listar);
grupoRoutes.post("/", grupoController.criar);
grupoRoutes.post("/convites/aceitar", grupoController.aceitarConvite);
grupoRoutes.get("/:id", grupoController.buscarPorId);
grupoRoutes.get("/:id/membros", grupoController.listarMembros);
grupoRoutes.get("/:id/convites", grupoController.listarConvites);
grupoRoutes.delete("/:id/membros/:usuarioId", grupoController.removerMembro);
grupoRoutes.delete("/:id", grupoController.excluir);
