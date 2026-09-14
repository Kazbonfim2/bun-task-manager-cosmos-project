import type { Request, Response } from "express";
import { demandaService } from "./demanda.service";

export const demandaController = {
  listar: (req: Request, res: Response) => {
    const { status, responsavel_id, projeto_id } = req.query;
    const grupoId = (req.query.grupo_id as string) || (req.headers["x-grupo-id"] as string) || undefined;
    const demandas = demandaService.listar({
      status: typeof status === "string" ? status : undefined,
      responsavel_id: typeof responsavel_id === "string" ? responsavel_id : undefined,
      projeto_id: typeof projeto_id === "string" ? projeto_id : undefined,
      grupo_id: grupoId,
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
