import jwt from "jsonwebtoken";
import { HttpError } from "../http-error";
import { usuarioRepository } from "../usuario/usuario.repository";
import { semSenha, usuarioService } from "../usuario/usuario.service";
import type { UsuarioPublico } from "../usuario/usuario.types";

export type TokenPayload = {
  id: string;
  email: string;
  nome_completo: string;
};

const jwtSecret = () => process.env.JWT_SECRET ?? "orion-dev-secret";

export const authService = {
  async cadastrar(dados: {
    nome_completo: string;
    email: string;
    senha: string;
  }): Promise<{ usuario: UsuarioPublico; token: string }> {
    const usuario = await usuarioService.cadastrar(dados);
    return { usuario, token: this.gerarToken(usuario) };
  },

  async login(email: string, senha: string): Promise<{ usuario: UsuarioPublico; token: string }> {
    const usuario = usuarioRepository.buscarPorEmail(email?.trim().toLowerCase() ?? "");
    if (!usuario || !(await Bun.password.verify(senha ?? "", usuario.senha_hash))) {
      throw new HttpError(401, "E-mail ou senha inválidos");
    }
    const publico = semSenha(usuario);
    return { usuario: publico, token: this.gerarToken(publico) };
  },

  gerarToken(usuario: UsuarioPublico): string {
    return jwt.sign(
      { id: usuario.id, email: usuario.email, nome_completo: usuario.nome_completo },
      jwtSecret(),
      { expiresIn: "7d" },
    );
  },

  validarToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, jwtSecret()) as TokenPayload;
    } catch {
      throw new HttpError(401, "Token inválido ou expirado");
    }
  },
};
