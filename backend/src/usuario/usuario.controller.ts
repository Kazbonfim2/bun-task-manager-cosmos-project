import type { Request, Response } from "express";
import { grupoRepository } from "../grupo/grupo.repository";
import { usuarioService } from "./usuario.service";

export const usuarioController = {
  listar: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.json([]);

    const gruposUsuario = grupoRepository.listarPorUsuario(usuarioId);
    const headerGrupoId = (req.query.grupo_id as string) || (req.headers["x-grupo-id"] as string);
    const grupoAtivo = gruposUsuario.find((g) => g.id === headerGrupoId) || gruposUsuario[0];

    if (!grupoAtivo) return res.json([]);

    res.json(usuarioService.listarPublicos(grupoAtivo.id));
  },
};

