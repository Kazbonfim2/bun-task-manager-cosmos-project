import { HttpError } from "../http-error";
import { usuarioRepository } from "./usuario.repository";
import type { NovoUsuario, Usuario, UsuarioPublico } from "./usuario.types";

export function semSenha(usuario: Usuario): UsuarioPublico {
  const { senha_hash: _omit, resposta_secreta_hash: _omitResp, ...publico } = usuario;
  return publico;
}

export const usuarioService = {
  async cadastrar(dados: NovoUsuario): Promise<UsuarioPublico> {
    const nome = dados.nome_completo?.trim();
    const email = dados.email?.trim().toLowerCase();
    const senha = dados.senha ?? "";
    const pergunta = dados.pergunta_secreta?.trim();
    const resposta = dados.resposta_secreta?.trim();

    if (!nome) throw new HttpError(400, "Nome completo é obrigatório");
    if (!email || !email.includes("@")) throw new HttpError(400, "E-mail inválido");
    if (senha.length < 6) throw new HttpError(400, "Senha deve ter pelo menos 6 caracteres");
    if (!pergunta) throw new HttpError(400, "Pergunta secreta é obrigatória");
    if (!resposta) throw new HttpError(400, "Resposta secreta é obrigatória");
    if (await usuarioRepository.buscarPorEmail(email)) {
      throw new HttpError(409, "E-mail já cadastrado");
    }

    const usuario = await usuarioRepository.criar({
      id: crypto.randomUUID(),
      nome_completo: nome,
      email,
      senha_hash: await Bun.password.hash(senha),
      pergunta_secreta: pergunta,
      resposta_secreta_hash: await Bun.password.hash(resposta.toLowerCase()),
      criado_em: new Date().toISOString(),
    });

    return semSenha(usuario);
  },

  async listarPublicos(grupoId?: string): Promise<UsuarioPublico[]> {
    const usuarios = await usuarioRepository.listar(grupoId);
    return usuarios.map(semSenha);
  },

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return usuarioRepository.buscarPorEmail(email);
  },
};
