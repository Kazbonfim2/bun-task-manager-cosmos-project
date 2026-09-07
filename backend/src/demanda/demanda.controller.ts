import type { Request, Response } from "express";
import { demandaService } from "./demanda.service";

export const demandaController = {
  listar: (req: Request, res: Response) => {
    const { status, responsavel_id } = req.query;
    const demandas = demandaService.listar({
      status: typeof status === "string" ? status : undefined,
      responsavel_id: typeof responsavel_id === "string" ? responsavel_id : undefined,
    });
    res.json(demandas);
  },

  buscarPorId: (req: Request, res: Response) => {
    const demanda = demandaService.buscarPorId(req.params.id);
    res.json(demanda);
  },

  criar: (req: Request, res: Response) => {
    const criadoPorId = req.usuario?.id ?? "";
    const demanda = demandaService.criar(req.body, criadoPorId);
    res.status(201).json(demanda);
  },

  atualizar: (req: Request, res: Response) => {
    const demanda = demandaService.atualizar(req.params.id, req.body);
    res.json(demanda);
  },

  alterarStatus: (req: Request, res: Response) => {
    const { status } = req.body ?? {};
    const demanda = demandaService.alterarStatus(req.params.id, status);
    res.json(demanda);
  },

  excluir: (req: Request, res: Response) => {
    demandaService.excluir(req.params.id);
    res.status(204).send();
  },
};
