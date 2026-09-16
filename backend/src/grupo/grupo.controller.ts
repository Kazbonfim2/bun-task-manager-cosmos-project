import type { Request, Response } from "express";
import { grupoService } from "./grupo.service";

export const grupoController = {
  listar: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const grupos = await grupoService.listarPorUsuario(usuarioId);
    res.json(grupos);
  },

  buscarPorId: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const grupo = await grupoService.buscarPorId(String(req.params.id), usuarioId);
    res.json(grupo);
  },

  criar: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const resultado = await grupoService.criar(req.body, usuarioId);
    res.status(201).json(resultado);
  },

  listarMembros: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const membros = await grupoService.listarMembros(String(req.params.id), usuarioId);
    res.json(membros);
  },

  listarConvites: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const convites = await grupoService.listarConvites(String(req.params.id), usuarioId);
    res.json(convites);
  },

  validarConvite: async (req: Request, res: Response) => {
    const resultado = await grupoService.validarConvite(String(req.params.codigo));
    res.json(resultado);
  },

  aceitarConvite: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const resultado = await grupoService.aceitarConvite(req.body?.codigo, usuarioId);
    res.json(resultado);
  },

  excluir: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    await grupoService.excluir(String(req.params.id), usuarioId);
    res.status(204).end();
  },

  removerMembro: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    await grupoService.removerMembro(String(req.params.id), String(req.params.usuarioId), usuarioId);
    res.status(204).end();
  },
};
