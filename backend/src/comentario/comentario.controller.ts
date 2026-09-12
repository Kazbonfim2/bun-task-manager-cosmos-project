import type { Request, Response } from "express";
import { comentarioService } from "./comentario.service";

export const comentarioController = {
  listarPorDemanda: (req: Request, res: Response) => {
    const demandaId = String(req.params.demandaId || req.params.id);
    const comentarios = comentarioService.listarPorDemanda(demandaId);
    res.json(comentarios);
  },

  criar: (req: Request, res: Response) => {
    const demandaId = String(req.params.demandaId || req.params.id);
    const usuarioId = req.usuario?.id ?? "";
    const comentario = comentarioService.criar(demandaId, req.body, usuarioId);
    res.status(201).json(comentario);
  },

  atualizar: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const comentario = comentarioService.atualizar(String(req.params.id), req.body, usuarioId);
    res.json(comentario);
  },

  excluir: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    comentarioService.excluir(String(req.params.id), usuarioId);
    res.status(204).send();
  },
};
