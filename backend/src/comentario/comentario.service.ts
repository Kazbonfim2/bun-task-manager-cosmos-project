import { demandaRepository } from "../demanda/demanda.repository";
import { HttpError } from "../http-error";
import { extrairMencoes } from "../notificacao/mencao.util";
import { notificacaoService } from "../notificacao/notificacao.service";
import { usuarioRepository } from "../usuario/usuario.repository";
import { comentarioRepository } from "./comentario.repository";
import type { ComentarioComAutor, NovoComentario } from "./comentario.types";

export const comentarioService = {
  listarPorDemanda(demandaId: string): ComentarioComAutor[] {
    if (!demandaRepository.buscarPorId(demandaId)) {
      throw new HttpError(404, "Demanda não encontrada");
    }
    return comentarioRepository.listarPorDemanda(demandaId);
  },

  criar(demandaId: string, dados: NovoComentario, usuarioId: string): ComentarioComAutor {
    const demanda = demandaRepository.buscarPorId(demandaId);
    if (!demanda) {
      throw new HttpError(404, "Demanda não encontrada");
    }
    if (!usuarioId || !usuarioRepository.buscarPorId(usuarioId)) {
      throw new HttpError(400, "Usuário não encontrado");
    }

    const texto = dados.texto?.trim();
    if (!texto) {
      throw new HttpError(400, "Texto do comentário é obrigatório");
    }

    const agora = new Date().toISOString();
    const criado = comentarioRepository.criar({
      id: crypto.randomUUID(),
      demanda_id: demandaId,
      usuario_id: usuarioId,
      texto,
      criado_em: agora,
      atualizado_em: agora,
    });

    const usuarios = usuarioRepository.listar();
    const idsMencionados = extrairMencoes(texto, usuarios).filter((id) => id !== usuarioId);

    for (const destId of idsMencionados) {
      notificacaoService.notificar({
        usuario_id: destId,
        demanda_id: demanda.id,
        tipo: "mencao",
        mensagem: `${criado.usuario_nome} mencionou você em um comentário na demanda "${demanda.titulo}".`,
      });
    }

    const outrosDestinatarios = new Set<string>();
    if (demanda.responsavel_id !== usuarioId && !idsMencionados.includes(demanda.responsavel_id)) {
      outrosDestinatarios.add(demanda.responsavel_id);
    }
    if (demanda.criado_por_id !== usuarioId && !idsMencionados.includes(demanda.criado_por_id)) {
      outrosDestinatarios.add(demanda.criado_por_id);
    }

    for (const destId of outrosDestinatarios) {
      notificacaoService.notificar({
        usuario_id: destId,
        demanda_id: demanda.id,
        tipo: "demanda_comentario",
        mensagem: `${criado.usuario_nome} comentou na demanda "${demanda.titulo}".`,
      });
    }

    return criado;
  },

  atualizar(id: string, dados: NovoComentario, usuarioId: string): ComentarioComAutor {
    const atual = comentarioRepository.buscarPorId(id);
    if (!atual) {
      throw new HttpError(404, "Comentário não encontrado");
    }

    if (atual.usuario_id !== usuarioId) {
      throw new HttpError(403, "Sem permissão para editar este comentário");
    }

    const texto = dados.texto?.trim();
    if (!texto) {
      throw new HttpError(400, "Texto do comentário não pode ser vazio");
    }

    const agora = new Date().toISOString();
    return comentarioRepository.atualizar(id, texto, agora);
  },

  excluir(id: string, usuarioId: string): void {
    const atual = comentarioRepository.buscarPorId(id);
    if (!atual) {
      throw new HttpError(404, "Comentário não encontrado");
    }

    if (atual.usuario_id !== usuarioId) {
      throw new HttpError(403, "Sem permissão para excluir este comentário");
    }

    comentarioRepository.excluir(id);
  },
};
