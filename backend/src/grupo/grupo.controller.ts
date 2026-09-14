import type { Request, Response } from "express";
import { grupoService } from "./grupo.service";

export const grupoController = {
  listar: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const grupos = grupoService.listarPorUsuario(usuarioId);
    res.json(grupos);
  },

  buscarPorId: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const grupo = grupoService.buscarPorId(String(req.params.id), usuarioId);
    res.json(grupo);
  },

  criar: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const resultado = grupoService.criar(req.body, usuarioId);
    res.status(201).json(resultado);
  },

  listarMembros: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const membros = grupoService.listarMembros(String(req.params.id), usuarioId);
    res.json(membros);
  },

  listarConvites: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const convites = grupoService.listarConvites(String(req.params.id), usuarioId);
    res.json(convites);
  },

  validarConvite: (req: Request, res: Response) => {
    const resultado = grupoService.validarConvite(String(req.params.codigo));
    res.json(resultado);
  },

  aceitarConvite: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const resultado = grupoService.aceitarConvite(req.body?.codigo, usuarioId);
    res.json(resultado);
  },
};
