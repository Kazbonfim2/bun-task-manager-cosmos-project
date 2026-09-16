import { HttpError } from "../http-error";
import { notificacaoService } from "../notificacao/notificacao.service";
import { usuarioRepository } from "../usuario/usuario.repository";
import { grupoRepository } from "./grupo.repository";
import type { Convite, Grupo, GrupoComDetalhes, MembroGrupo, NovoGrupo } from "./grupo.types";

export const grupoService = {
  async criar(dados: NovoGrupo, donoId: string): Promise<{ grupo: Grupo; convites: Convite[] }> {
    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do grupo é obrigatório");

    const usuario = await usuarioRepository.buscarPorId(donoId);
    if (!usuario) throw new HttpError(404, "Usuário não encontrado");

    return grupoRepository.criar(nome, donoId);
  },

  async listarPorUsuario(usuarioId: string): Promise<GrupoComDetalhes[]> {
    return grupoRepository.listarPorUsuario(usuarioId);
  },

  async buscarPorId(id: string, usuarioId: string): Promise<GrupoComDetalhes> {
    if (!(await grupoRepository.ehMembro(id, usuarioId))) {
      throw new HttpError(403, "Você não tem acesso a este grupo");
    }
    const grupo = await grupoRepository.buscarPorId(id);
    if (!grupo) throw new HttpError(404, "Grupo não encontrado");
    return grupo;
  },

  async listarMembros(grupoId: string, usuarioId: string): Promise<MembroGrupo[]> {
    if (!(await grupoRepository.ehMembro(grupoId, usuarioId))) {
      throw new HttpError(403, "Você não tem acesso a este grupo");
    }
    return grupoRepository.listarMembros(grupoId);
  },

  async listarConvites(grupoId: string, usuarioId: string): Promise<Convite[]> {
    if (!(await grupoRepository.ehMembro(grupoId, usuarioId))) {
      throw new HttpError(403, "Você não tem acesso a este grupo");
    }
    return grupoRepository.listarConvites(grupoId);
  },

  async validarConvite(codigo: string): Promise<{ codigo: string; grupo_nome: string; valido: boolean }> {
    const convite = await grupoRepository.buscarConvitePorCodigo(codigo);
    if (!convite || convite.usado_por_id) {
      throw new HttpError(404, "Convite inválido ou já utilizado");
    }
    return {
      codigo: convite.codigo,
      grupo_nome: convite.grupo_nome,
      valido: true,
    };
  },

  async aceitarConvite(codigo: string, usuarioId: string): Promise<{ grupo: GrupoComDetalhes; mensagem: string }> {
    const codigoNormalizado = codigo?.trim().toUpperCase();
    if (!codigoNormalizado) throw new HttpError(400, "Código de convite é obrigatório");

    const convite = await grupoRepository.buscarConvitePorCodigo(codigoNormalizado);
    if (!convite) {
      throw new HttpError(404, "Código de convite não encontrado");
    }
    if (convite.usado_por_id) {
      throw new HttpError(400, "Este código de convite já foi utilizado");
    }

    if (await grupoRepository.ehMembro(convite.grupo_id, usuarioId)) {
      throw new HttpError(400, "Você já faz parte deste grupo de trabalho");
    }

    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) throw new HttpError(404, "Usuário não encontrado");

    await grupoRepository.usarConvite(convite.id, usuarioId);
    await grupoRepository.adicionarMembro(convite.grupo_id, usuarioId);

    const grupo = await grupoRepository.buscarPorId(convite.grupo_id);
    if (!grupo) throw new HttpError(500, "Erro ao recuperar dados do grupo");

    // Notificar o dono do grupo
    if (grupo.dono_id !== usuarioId) {
      await notificacaoService.notificar({
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

  async removerMembro(grupoId: string, membroId: string, solicitanteId: string): Promise<void> {
    const grupo = await grupoRepository.buscarPorId(grupoId);
    if (!grupo) throw new HttpError(404, "Grupo não encontrado");
    if (grupo.dono_id !== solicitanteId) {
      throw new HttpError(403, "Apenas o dono do grupo pode remover membros");
    }
    if (membroId === grupo.dono_id) {
      throw new HttpError(400, "O dono não pode ser removido do próprio grupo");
    }
    if (!(await grupoRepository.ehMembro(grupoId, membroId))) {
      throw new HttpError(404, "Usuário não é membro deste grupo");
    }

    // Projetos e demandas do grupo não são afetados; só o vínculo do membro sai
    await grupoRepository.removerMembro(grupoId, membroId);

    await notificacaoService.notificar({
      usuario_id: membroId,
      tipo: "removido_grupo",
      mensagem: `Você foi removido do grupo "${grupo.nome}".`,
    });
  },

  async excluir(grupoId: string, usuarioId: string): Promise<void> {
    const grupo = await grupoRepository.buscarPorId(grupoId);
    if (!grupo) throw new HttpError(404, "Grupo não encontrado");
    if (grupo.dono_id !== usuarioId) {
      throw new HttpError(403, "Apenas o dono do grupo pode excluí-lo");
    }

    // Captura membros antes de excluir (o cascade remove grupo_membros)
    const membros = await grupoRepository.listarMembros(grupoId);
    await grupoRepository.excluir(grupoId);

    // Usuários permanecem; apenas recebem notificação da exclusão
    for (const membro of membros) {
      if (membro.usuario_id === usuarioId) continue;
      await notificacaoService.notificar({
        usuario_id: membro.usuario_id,
        tipo: "grupo_excluido",
        mensagem: `O grupo "${grupo.nome}" foi excluído pelo dono.`,
      });
    }
  },
};
