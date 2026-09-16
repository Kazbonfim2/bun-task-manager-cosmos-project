import type { Request, Response } from "express";
import { grupoRepository } from "../grupo/grupo.repository";
import { usuarioService } from "./usuario.service";

export const usuarioController = {
  listar: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.json([]);

    const gruposUsuario = await grupoRepository.listarPorUsuario(usuarioId);
    const headerGrupoId = (req.query.grupo_id as string) || (req.headers["x-grupo-id"] as string);
    const grupoAtivo = gruposUsuario.find((g) => g.id === headerGrupoId) || gruposUsuario[0];

    if (!grupoAtivo) return res.json([]);

    const usuarios = await usuarioService.listarPublicos(grupoAtivo.id);
    res.json(usuarios);
  },

  atualizarPerfil: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const { nome_completo, email } = req.body ?? {};
    const usuario = await usuarioService.atualizarPerfil(usuarioId, { nome_completo, email });
    res.json(usuario);
  },

  alterarSenha: async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id ?? "";
    const { senha_atual, nova_senha } = req.body ?? {};
    await usuarioService.alterarSenha(usuarioId, senha_atual, nova_senha);
    res.json({ sucesso: true });
  },
};
