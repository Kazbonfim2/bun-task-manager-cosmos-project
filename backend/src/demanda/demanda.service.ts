import { HttpError } from "../http-error";
import { extrairMencoes } from "../notificacao/mencao.util";
import { notificacaoService } from "../notificacao/notificacao.service";
import { projetoRepository } from "../projeto/projeto.repository";
import { usuarioRepository } from "../usuario/usuario.repository";
import { demandaRepository } from "./demanda.repository";
import {
  STATUS_DEMANDA,
  type DemandaComNomes,
  type FiltroDemanda,
  type NovaDemanda,
  type StatusDemanda,
} from "./demanda.types";

function ehStatus(valor: string): valor is StatusDemanda {
  return (STATUS_DEMANDA as readonly string[]).includes(valor);
}

function validarPrazo(prazo: string): string {
  if (!prazo || Number.isNaN(Date.parse(prazo))) {
    throw new HttpError(400, "Prazo inválido");
  }
  return prazo.slice(0, 10);
}

export const demandaService = {
  listar(filtro: FiltroDemanda): DemandaComNomes[] {
    if (filtro.status && filtro.status !== "atrasadas" && !ehStatus(filtro.status)) {
      throw new HttpError(400, "Status inválido");
    }
    return demandaRepository.listar(filtro);
  },

  buscarPorId(id: string): DemandaComNomes {
    const demanda = demandaRepository.buscarPorId(id);
    if (!demanda) throw new HttpError(404, "Demanda não encontrada");
    return demanda;
  },

  criar(dados: NovaDemanda, criadoPorId: string): DemandaComNomes {
    const titulo = dados.titulo?.trim();
    if (!titulo) throw new HttpError(400, "Título é obrigatório");
    const descricao = dados.descricao?.trim() || null;
    if (!dados.projeto_id) throw new HttpError(400, "Projeto é obrigatório");
    if (!dados.responsavel_id) throw new HttpError(400, "Responsável é obrigatório");
    if (!ehStatus(dados.status)) throw new HttpError(400, "Status inválido");
    if (!projetoRepository.buscarPorId(dados.projeto_id)) {
      throw new HttpError(400, "Projeto não encontrado");
    }
    if (!usuarioRepository.buscarPorId(dados.responsavel_id)) {
      throw new HttpError(400, "Responsável não encontrado");
    }

    const agora = new Date().toISOString();
    const criada = demandaRepository.criar({
      id: crypto.randomUUID(),
      titulo,
      descricao,
      projeto_id: dados.projeto_id,
      responsavel_id: dados.responsavel_id,
      criado_por_id: criadoPorId,
      prazo: validarPrazo(dados.prazo),
      status: dados.status,
      criado_em: agora,
      atualizado_em: agora,
    });

    notificacaoService.notificar({
      usuario_id: criada.responsavel_id,
      demanda_id: criada.id,
      tipo: "demanda_criada",
      mensagem: `Nova demanda atribuída a você: "${criada.titulo}"`,
    });

    if (descricao) {
      const usuarios = usuarioRepository.listar();
      const idsMencionados = extrairMencoes(descricao, usuarios).filter(
        (id) => id !== criadoPorId && id !== criada.responsavel_id
      );

      for (const destId of idsMencionados) {
        notificacaoService.notificar({
          usuario_id: destId,
          demanda_id: criada.id,
          tipo: "mencao",
          mensagem: `Você foi mencionado na descrição da demanda "${criada.titulo}".`,
        });
      }
    }

    return criada;
  },

  atualizar(id: string, dados: NovaDemanda): DemandaComNomes {
    const atual = demandaRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");

    const titulo = dados.titulo?.trim();
    if (!titulo) throw new HttpError(400, "Título é obrigatório");
    const descricao = dados.descricao !== undefined ? (dados.descricao?.trim() || null) : atual.descricao;
    if (!dados.projeto_id) throw new HttpError(400, "Projeto é obrigatório");
    if (!dados.responsavel_id) throw new HttpError(400, "Responsável é obrigatório");
    if (!ehStatus(dados.status)) throw new HttpError(400, "Status inválido");
    if (!projetoRepository.buscarPorId(dados.projeto_id)) {
      throw new HttpError(400, "Projeto não encontrado");
    }
    if (!usuarioRepository.buscarPorId(dados.responsavel_id)) {
      throw new HttpError(400, "Responsável não encontrado");
    }

    const atualizada = demandaRepository.atualizar({
      ...atual,
      titulo,
      descricao,
      projeto_id: dados.projeto_id,
      responsavel_id: dados.responsavel_id,
      prazo: validarPrazo(dados.prazo),
      status: dados.status,
      atualizado_em: new Date().toISOString(),
    });

    if (atual.status !== dados.status) {
      const destinatarios = new Set([atualizada.responsavel_id, atualizada.criado_por_id]);
      for (const usuarioId of destinatarios) {
        notificacaoService.notificar({
          usuario_id: usuarioId,
          demanda_id: atualizada.id,
          tipo: "demanda_status_alterado",
          mensagem: `Demanda "${atualizada.titulo}" mudou para o status "${dados.status}".`,
        });
      }
    }

    if (atual.responsavel_id !== dados.responsavel_id) {
      notificacaoService.notificar({
        usuario_id: dados.responsavel_id,
        demanda_id: atualizada.id,
        tipo: "demanda_criada",
        mensagem: `Demanda "${atualizada.titulo}" atribuída a você.`,
      });
    }

    if (descricao && descricao !== atual.descricao) {
      const usuarios = usuarioRepository.listar();
      const mencoesAtuais = extrairMencoes(descricao, usuarios);
      const mencoesAntigas = atual.descricao ? extrairMencoes(atual.descricao, usuarios) : [];
      const novasMencoes = mencoesAtuais.filter(
        (id) => !mencoesAntigas.includes(id) && id !== atualizada.responsavel_id
      );

      for (const destId of novasMencoes) {
        notificacaoService.notificar({
          usuario_id: destId,
          demanda_id: atualizada.id,
          tipo: "mencao",
          mensagem: `Você foi mencionado na descrição da demanda "${atualizada.titulo}".`,
        });
      }
    }

    return atualizada;
  },

  alterarStatus(id: string, status: string): DemandaComNomes {
    const atual = demandaRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");
    if (!ehStatus(status)) throw new HttpError(400, "Status inválido");

    const atualizada = demandaRepository.atualizar({
      ...atual,
      status,
      atualizado_em: new Date().toISOString(),
    });

    if (atual.status !== status) {
      const destinatarios = new Set([atualizada.responsavel_id, atualizada.criado_por_id]);
      for (const usuarioId of destinatarios) {
        notificacaoService.notificar({
          usuario_id: usuarioId,
          demanda_id: atualizada.id,
          tipo: "demanda_status_alterado",
          mensagem: `Demanda "${atualizada.titulo}" mudou para o status "${status}".`,
        });
      }
    }

    return atualizada;
  },

  excluir(id: string): void {
    const atual = demandaRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");
    demandaRepository.excluir(id);
  },
};
