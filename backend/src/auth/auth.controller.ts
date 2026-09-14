import type { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
  cadastrar: async (req: Request, res: Response) => {
    const { nome_completo, email, senha, pergunta_secreta, resposta_secreta } = req.body ?? {};
    const resultado = await authService.cadastrar({
      nome_completo,
      email,
      senha,
      pergunta_secreta,
      resposta_secreta,
    });
    res.status(201).json(resultado);
  },

  login: async (req: Request, res: Response) => {
    const { email, senha } = req.body ?? {};
    const resultado = await authService.login(email, senha);
    res.json(resultado);
  },

  recuperarPergunta: async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    const resultado = await authService.buscarPergunta(email);
    res.json(resultado);
  },

  validarResposta: async (req: Request, res: Response) => {
    const { email, resposta } = req.body ?? {};
    const resultado = await authService.validarRespostaSecreta(email, resposta);
    res.json(resultado);
  },

  redefinirSenha: async (req: Request, res: Response) => {
    const { token_reset, nova_senha } = req.body ?? {};
    await authService.redefinirSenha(token_reset, nova_senha);
    res.json({ sucesso: true, mensagem: "Senha redefinida com sucesso" });
  },
};
