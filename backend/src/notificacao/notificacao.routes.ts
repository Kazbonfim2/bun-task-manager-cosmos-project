import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { notificacaoService } from "./notificacao.service";

export const notificacaoRoutes = Router();
notificacaoRoutes.use(authMiddleware);

notificacaoRoutes.get("/", (req: Request, res: Response) => {
  const usuarioId = req.usuario?.id ?? "";
  const notificacoes = notificacaoService.listarPorUsuario(usuarioId);
  res.json(notificacoes);
});

notificacaoRoutes.patch("/ler-todas", (req: Request, res: Response) => {
  const usuarioId = req.usuario?.id ?? "";
  notificacaoService.marcarTodasComoLidas(usuarioId);
  res.status(204).send();
});

notificacaoRoutes.patch("/:id/lida", (req: Request, res: Response) => {
  const usuarioId = req.usuario?.id ?? "";
  notificacaoService.marcarComoLida(req.params.id, usuarioId);
  res.status(204).send();
});
