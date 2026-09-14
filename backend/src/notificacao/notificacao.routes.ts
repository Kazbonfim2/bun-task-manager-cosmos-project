import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { notificacaoService } from "./notificacao.service";

export const notificacaoRoutes = Router();
notificacaoRoutes.use(authMiddleware);

notificacaoRoutes.get("/", async (req: Request, res: Response) => {
  const usuarioId = req.usuario?.id ?? "";
  const notificacoes = await notificacaoService.listarPorUsuario(usuarioId);
  res.json(notificacoes);
});

notificacaoRoutes.patch("/ler-todas", async (req: Request, res: Response) => {
  const usuarioId = req.usuario?.id ?? "";
  await notificacaoService.marcarTodasComoLidas(usuarioId);
  res.status(204).send();
});

notificacaoRoutes.patch("/:id/lida", async (req: Request, res: Response) => {
  const usuarioId = req.usuario?.id ?? "";
  await notificacaoService.marcarComoLida(String(req.params.id), usuarioId);
  res.status(204).send();
});

notificacaoRoutes.delete("/:id", async (req: Request, res: Response) => {
  const usuarioId = req.usuario?.id ?? "";
  await notificacaoService.marcarComoLida(String(req.params.id), usuarioId);
  res.status(204).send();
});
