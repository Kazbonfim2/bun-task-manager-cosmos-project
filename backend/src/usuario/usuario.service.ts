import { HttpError } from "../http-error";
import { usuarioRepository } from "./usuario.repository";
import type { NovoUsuario, Usuario, UsuarioPublico } from "./usuario.types";

export function semSenha(usuario: Usuario): UsuarioPublico {
  const { senha_hash: _omit, ...publico } = usuario;
  return publico;
}

export const usuarioService = {
  async cadastrar(dados: NovoUsuario): Promise<UsuarioPublico> {
    const nome = dados.nome_completo?.trim();
    const email = dados.email?.trim().toLowerCase();
    const senha = dados.senha ?? "";

    if (!nome) throw new HttpError(400, "Nome completo é obrigatório");
    if (!email || !email.includes("@")) throw new HttpError(400, "E-mail inválido");
    if (senha.length < 6) throw new HttpError(400, "Senha deve ter pelo menos 6 caracteres");
    if (usuarioRepository.buscarPorEmail(email)) {
      throw new HttpError(409, "E-mail já cadastrado");
    }

    const usuario = usuarioRepository.criar({
      id: crypto.randomUUID(),
      nome_completo: nome,
      email,
      senha_hash: await Bun.password.hash(senha),
      criado_em: new Date().toISOString(),
    });

    return semSenha(usuario);
  },

  listarPublicos(): UsuarioPublico[] {
    return usuarioRepository.listar().map(semSenha);
  },

  buscarPorEmail(email: string): Usuario | null {
    return usuarioRepository.buscarPorEmail(email);
  },
};
