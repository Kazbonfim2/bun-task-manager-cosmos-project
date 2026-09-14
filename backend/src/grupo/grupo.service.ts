import { HttpError } from "../http-error";
import { notificacaoService } from "../notificacao/notificacao.service";
import { usuarioRepository } from "../usuario/usuario.repository";
import { grupoRepository } from "./grupo.repository";
import type { Convite, Grupo, GrupoComDetalhes, MembroGrupo, NovoGrupo } from "./grupo.types";

export const grupoService = {
  criar(dados: NovoGrupo, donoId: string): { grupo: Grupo; convites: Convite[] } {
    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do grupo é obrigatório");

    const usuario = usuarioRepository.buscarPorId(donoId);
    if (!usuario) throw new HttpError(404, "Usuário não encontrado");

    return grupoRepository.criar(nome, donoId);
  },

  listarPorUsuario(usuarioId: string): GrupoComDetalhes[] {
    return grupoRepository.listarPorUsuario(usuarioId);
  },

  buscarPorId(id: string, usuarioId: string): GrupoComDetalhes {
    if (!grupoRepository.ehMembro(id, usuarioId)) {
      throw new HttpError(403, "Você não tem acesso a este grupo");
    }
    const grupo = grupoRepository.buscarPorId(id);
    if (!grupo) throw new HttpError(404, "Grupo não encontrado");
    return grupo;
  },

  listarMembros(grupoId: string, usuarioId: string): MembroGrupo[] {
    if (!grupoRepository.ehMembro(grupoId, usuarioId)) {
      throw new HttpError(403, "Você não tem acesso a este grupo");
    }
    return grupoRepository.listarMembros(grupoId);
  },

  listarConvites(grupoId: string, usuarioId: string): Convite[] {
    if (!grupoRepository.ehMembro(grupoId, usuarioId)) {
      throw new HttpError(403, "Você não tem acesso a este grupo");
    }
    return grupoRepository.listarConvites(grupoId);
  },

  validarConvite(codigo: string): { codigo: string; grupo_nome: string; valido: boolean } {
    const convite = grupoRepository.buscarConvitePorCodigo(codigo);
    if (!convite || convite.usado_por_id) {
      throw new HttpError(404, "Convite inválido ou já utilizado");
    }
    return {
      codigo: convite.codigo,
      grupo_nome: convite.grupo_nome,
      valido: true,
    };
  },

  aceitarConvite(codigo: string, usuarioId: string): { grupo: GrupoComDetalhes; mensagem: string } {
    const codigoNormalizado = codigo?.trim().toUpperCase();
    if (!codigoNormalizado) throw new HttpError(400, "Código de convite é obrigatório");

    const convite = grupoRepository.buscarConvitePorCodigo(codigoNormalizado);
    if (!convite) {
      throw new HttpError(404, "Código de convite não encontrado");
    }
    if (convite.usado_por_id) {
      throw new HttpError(400, "Este código de convite já foi utilizado");
    }

    if (grupoRepository.ehMembro(convite.grupo_id, usuarioId)) {
      throw new HttpError(400, "Você já faz parte deste grupo de trabalho");
    }

    const usuario = usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) throw new HttpError(404, "Usuário não encontrado");

    grupoRepository.usarConvite(convite.id, usuarioId);
    grupoRepository.adicionarMembro(convite.grupo_id, usuarioId);

    const grupo = grupoRepository.buscarPorId(convite.grupo_id);
    if (!grupo) throw new HttpError(500, "Erro ao recuperar dados do grupo");

    // Notificar o dono do grupo
    if (grupo.dono_id !== usuarioId) {
      notificacaoService.notificar({
        usuario_id: grupo.dono_id,
        tipo: "novo_membro_grupo",
        mensagem: `${usuario.nome_completo} entrou no grupo "${grupo.nome}" usando um convite.`,
      });
    }

    return {
      grupo,
      mensagem: `Bem-vindo ao grupo "${grupo.nome}"!`,
    };
  },
};
