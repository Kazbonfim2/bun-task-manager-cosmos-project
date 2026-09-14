import jwt from "jsonwebtoken";
import { HttpError } from "../http-error";
import { grupoRepository } from "../grupo/grupo.repository";
import type { Convite, Grupo } from "../grupo/grupo.types";
import { usuarioRepository } from "../usuario/usuario.repository";
import { semSenha, usuarioService } from "../usuario/usuario.service";
import type { NovoUsuario, UsuarioPublico } from "../usuario/usuario.types";

export type TokenPayload = {
  id: string;
  email: string;
  nome_completo: string;
};

const jwtSecret = () => process.env.JWT_SECRET ?? "orion-dev-secret";

export const authService = {
  async cadastrar(dados: NovoUsuario): Promise<{
    usuario: UsuarioPublico;
    token: string;
    grupo?: Grupo;
    convites?: Convite[];
  }> {
    if (dados.codigo_convite) {
      const convite = await grupoRepository.buscarConvitePorCodigo(dados.codigo_convite);
      if (!convite || convite.usado_por_id) {
        throw new HttpError(400, "Código de convite inválido ou já utilizado");
      }
    }

    const usuario = await usuarioService.cadastrar(dados);
    const token = this.gerarToken(usuario);

    let grupo: Grupo | undefined;
    let convites: Convite[] | undefined;

    if (dados.codigo_convite) {
      const convite = (await grupoRepository.buscarConvitePorCodigo(dados.codigo_convite))!;
      await grupoRepository.usarConvite(convite.id, usuario.id);
      await grupoRepository.adicionarMembro(convite.grupo_id, usuario.id);
      grupo = (await grupoRepository.buscarPorId(convite.grupo_id)) ?? undefined;
    } else if (dados.grupo_nome?.trim()) {
      const criado = await grupoRepository.criar(dados.grupo_nome.trim(), usuario.id);
      grupo = criado.grupo;
      convites = criado.convites;
    }

    return { usuario, token, grupo, convites };
  },

  async login(email: string, senha: string): Promise<{ usuario: UsuarioPublico; token: string; grupo?: Grupo }> {
    const usuario = await usuarioRepository.buscarPorEmail(email?.trim().toLowerCase() ?? "");
    if (!usuario || !(await Bun.password.verify(senha ?? "", usuario.senha_hash))) {
      throw new HttpError(401, "E-mail ou senha inválidos");
    }
    const publico = semSenha(usuario);
    const grupos = await grupoRepository.listarPorUsuario(publico.id);
    return { usuario: publico, token: this.gerarToken(publico), grupo: grupos[0] };
  },

  async buscarPergunta(email: string): Promise<{ email: string; pergunta: string }> {
    const usuario = await usuarioRepository.buscarPorEmail(email?.trim().toLowerCase() ?? "");
    if (!usuario || !usuario.pergunta_secreta) {
      throw new HttpError(404, "E-mail não encontrado ou sem pergunta secreta configurada");
    }
    return { email: usuario.email, pergunta: usuario.pergunta_secreta };
  },

  async validarRespostaSecreta(email: string, resposta: string): Promise<{ token_reset: string }> {
    const usuario = await usuarioRepository.buscarPorEmail(email?.trim().toLowerCase() ?? "");
    if (!usuario || !usuario.resposta_secreta_hash) {
      throw new HttpError(400, "Dados de recuperação inválidos");
    }
    const respostaNormalizada = (resposta ?? "").trim().toLowerCase();
    const valida = await Bun.password.verify(respostaNormalizada, usuario.resposta_secreta_hash);
    if (!valida) {
      throw new HttpError(400, "Resposta incorreta");
    }
    const token_reset = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: "recuperacao" },
      jwtSecret(),
      { expiresIn: "15m" },
    );
    return { token_reset };
  },

  async redefinirSenha(token_reset: string, nova_senha: string): Promise<void> {
    if (!nova_senha || nova_senha.length < 6) {
      throw new HttpError(400, "Senha deve ter pelo menos 6 caracteres");
    }
    try {
      const payload = jwt.verify(token_reset, jwtSecret()) as { id: string; email: string; tipo: string };
      if (payload.tipo !== "recuperacao") {
        throw new HttpError(400, "Token inválido para redefinição");
      }
      const senha_hash = await Bun.password.hash(nova_senha);
      await usuarioRepository.atualizarSenha(payload.id, senha_hash);
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(400, "Token de recuperação inválido ou expirado");
    }
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
