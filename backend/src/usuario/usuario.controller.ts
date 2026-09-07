import type { Request, Response } from "express";
import { UsuarioService } from "./usuario.service";

export class UsuarioController {
  constructor(private service: UsuarioService) {}

  listar = (_req: Request, res: Response) => {
    res.json(this.service.listarPublicos());
  };
}
