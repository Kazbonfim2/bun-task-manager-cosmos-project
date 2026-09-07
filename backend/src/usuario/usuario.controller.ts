import type { Request, Response } from "express";
import { usuarioService } from "./usuario.service";

export const usuarioController = {
  listar: (_req: Request, res: Response) => {
    res.json(usuarioService.listarPublicos());
  },
};
