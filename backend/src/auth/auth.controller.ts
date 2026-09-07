import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private service: AuthService) {}

  cadastrar = async (req: Request, res: Response) => {
    const { nome_completo, email, senha } = req.body ?? {};
    const resultado = await this.service.cadastrar({ nome_completo, email, senha });
    res.status(201).json(resultado);
  };

  login = async (req: Request, res: Response) => {
    const { email, senha } = req.body ?? {};
    const resultado = await this.service.login(email, senha);
    res.json(resultado);
  };
}
