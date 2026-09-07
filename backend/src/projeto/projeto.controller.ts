import type { Request, Response } from "express";
import { projetoService } from "./projeto.service";

export const projetoController = {
  criar: (req: Request, res: Response) => {
    const { nome, descricao } = req.body ?? {};
    const projeto = projetoService.criar({ nome, descricao });
    res.status(201).json(projeto);
  },

  listar: (_req: Request, res: Response) => {
    res.json(projetoService.listar());
  },
};
