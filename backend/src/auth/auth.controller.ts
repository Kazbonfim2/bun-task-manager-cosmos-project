import type { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
  cadastrar: async (req: Request, res: Response) => {
    const { nome_completo, email, senha } = req.body ?? {};
    const resultado = await authService.cadastrar({ nome_completo, email, senha });
    res.status(201).json(resultado);
  },

  login: async (req: Request, res: Response) => {
    const { email, senha } = req.body ?? {};
    const resultado = await authService.login(email, senha);
    res.json(resultado);
  },
};
