import type { Request, Response } from "express";
import { grupoRepository } from "../grupo/grupo.repository";
import { projetoService } from "./projeto.service";

export const projetoController = {
  criar: async (req: Request, res: Response) => {
    const { nome, descricao, grupo_id } = req.body ?? {};
    const headerGrupoId = (req.headers["x-grupo-id"] as string) || undefined;
    const projeto = await projetoService.criar({ nome, descricao, grupo_id }, headerGrupoId);
    res.status(201).json(projeto);
  },

  listar: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.json([]);

    const gruposUsuario = await grupoRepository.listarPorUsuario(usuarioId);
    const headerGrupoId = (req.query.grupo_id as string) || (req.headers["x-grupo-id"] as string);
    const grupoAtivo = gruposUsuario.find((g) => g.id === headerGrupoId) || gruposUsuario[0];

    if (!grupoAtivo) return res.json([]);

    const projetos = await projetoService.listar(grupoAtivo.id);
    res.json(projetos);
  },

  atualizar: async (req: Request, res: Response) => {
    const { nome, descricao } = req.body ?? {};
    const projeto = await projetoService.atualizar(String(req.params.id), { nome, descricao });
    res.json(projeto);
  },

  excluir: async (req: Request, res: Response) => {
    await projetoService.excluir(String(req.params.id));
    res.status(204).send();
  },
};
