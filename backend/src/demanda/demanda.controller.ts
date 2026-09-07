import type { Request, Response } from "express";
import { HttpError } from "../http-error";
import { DemandaService } from "./demanda.service";

export class DemandaController {
  constructor(private service: DemandaService) {}

  listar = (req: Request, res: Response) => {
    const responsavel_id =
      typeof req.query.responsavel_id === "string" ? req.query.responsavel_id : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(this.service.listar({ responsavel_id, status }));
  };

  buscarPorId = (req: Request, res: Response) => {
    const demanda = this.service.buscarPorId(req.params.id as string);
    res.json(demanda);
  };

  criar = (req: Request, res: Response) => {
    if (!req.usuario) throw new HttpError(401, "Token ausente");
    const demanda = this.service.criar(req.body ?? {}, req.usuario.id);
    res.status(201).json(demanda);
  };

  atualizar = (req: Request, res: Response) => {
    const demanda = this.service.atualizar(req.params.id as string, req.body ?? {});
    res.json(demanda);
  };

  alterarStatus = (req: Request, res: Response) => {
    const demanda = this.service.alterarStatus(req.params.id as string, req.body?.status);
    res.json(demanda);
  };

  excluir = (req: Request, res: Response) => {
    this.service.excluir(req.params.id as string);
    res.status(204).send();
  };
}
