import type { Request, Response } from "express";
import { ProjetoService } from "./projeto.service";

export class ProjetoController {
  constructor(private service: ProjetoService) {}

  listar = (_req: Request, res: Response) => {
    res.json(this.service.listar());
  };

  criar = (req: Request, res: Response) => {
    const projeto = this.service.criar(req.body ?? {});
    res.status(201).json(projeto);
  };
}
