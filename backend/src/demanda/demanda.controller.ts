import type { Request, Response } from "express";
import { grupoRepository } from "../grupo/grupo.repository";
import { demandaService } from "./demanda.service";

export const demandaController = {
  listar: (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.json([]);
    }

    const gruposUsuario = grupoRepository.listarPorUsuario(usuarioId);
    const headerGrupoId = (req.query.grupo_id as string) || (req.headers["x-grupo-id"] as string);
    const grupoAtivo = gruposUsuario.find((g) => g.id === headerGrupoId) || gruposUsuario[0];

    if (!grupoAtivo) {
      return res.json([]);
    }

    const { status, responsavel_id, projeto_id, busca, limite, pagina } = req.query;
    const demandas = demandaService.listar({
      status: typeof status === "string" ? status : undefined,
      responsavel_id: typeof responsavel_id === "string" ? responsavel_id : undefined,
      projeto_id: typeof projeto_id === "string" ? projeto_id : undefined,
      busca: typeof busca === "string" ? busca : undefined,
      limite: limite ? Number(limite) : undefined,
      pagina: pagina ? Number(pagina) : undefined,
      grupo_id: grupoAtivo.id,
    });
    res.json(demandas);
  },

  buscarPorId: (req: Request, res: Response) => {
    const demanda = demandaService.buscarPorId(String(req.params.id));
    res.json(demanda);
  },

  criar: (req: Request, res: Response) => {
    const criadoPorId = req.usuario?.id ?? "";
    const demanda = demandaService.criar(req.body, criadoPorId);
    res.status(201).json(demanda);
  },

  atualizar: (req: Request, res: Response) => {
    const demanda = demandaService.atualizar(String(req.params.id), req.body);
    res.json(demanda);
  },

  alterarStatus: (req: Request, res: Response) => {
    const { status } = req.body ?? {};
    const demanda = demandaService.alterarStatus(String(req.params.id), status);
    res.json(demanda);
  },

  excluir: (req: Request, res: Response) => {
    demandaService.excluir(String(req.params.id));
    res.status(204).send();
  },
};
