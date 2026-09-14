import type { Request, Response } from "express";
import { usuarioService } from "./usuario.service";

export const usuarioController = {
  listar: (req: Request, res: Response) => {
    const grupoId = (req.query.grupo_id as string) || (req.headers["x-grupo-id"] as string) || undefined;
    res.json(usuarioService.listarPublicos(grupoId));
  },
};

