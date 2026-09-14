import type { Request, Response } from "express";
import { projetoService } from "./projeto.service";

export const projetoController = {
  criar: (req: Request, res: Response) => {
    const { nome, descricao, grupo_id } = req.body ?? {};
    const headerGrupoId = (req.headers["x-grupo-id"] as string) || undefined;
    const projeto = projetoService.criar({ nome, descricao, grupo_id }, headerGrupoId);
    res.status(201).json(projeto);
  },

  listar: (req: Request, res: Response) => {
    const grupoId = (req.query.grupo_id as string) || (req.headers["x-grupo-id"] as string) || undefined;
    res.json(projetoService.listar(grupoId));
  },

  atualizar: (req: Request, res: Response) => {
    const { nome, descricao } = req.body ?? {};
    const projeto = projetoService.atualizar(String(req.params.id), { nome, descricao });
    res.json(projeto);
  },

  excluir: (req: Request, res: Response) => {
    projetoService.excluir(String(req.params.id));
    res.status(204).send();
  },
};
