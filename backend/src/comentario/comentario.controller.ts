import type { Request, Response } from "express";
import { comentarioService } from "./comentario.service";

export const comentarioController = {
  listarPorDemanda: async (req: Request, res: Response) => {
    const demandaId = String(req.params.demandaId || req.params.id);
    const comentarios = await comentarioService.listarPorDemanda(demandaId);
    res.json(comentarios);
  },

  criar: async (req: Request, res: Response) => {
    const demandaId = String(req.params.demandaId || req.params.id);
    const usuarioId = req.usuario?.id ?? "";
    const comentario = await comentarioService.criar(demandaId, req.body, usuarioId);
    res.status(201).json(comentario);
  },

  atualizar: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const comentario = await comentarioService.atualizar(String(req.params.id), req.body, usuarioId);
    res.json(comentario);
  },

  excluir: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    await comentarioService.excluir(String(req.params.id), usuarioId);
    res.status(204).send();
  },
};
