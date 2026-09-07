import { HttpError } from "../http-error";
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
    const descricao = dados.descricao?.trim();
    if (!descricao) throw new HttpError(400, "Descrição é obrigatória");
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
      mensagem: `Nova demanda atribuída a você: "${criada.descricao}"`,
    });

    return criada;
  },

  atualizar(id: string, dados: NovaDemanda): DemandaComNomes {
    const atual = demandaRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");

    const descricao = dados.descricao?.trim();
    if (!descricao) throw new HttpError(400, "Descrição é obrigatória");
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
          mensagem: `Demanda "${atualizada.descricao}" mudou para o status "${dados.status}".`,
        });
      }
    }

    if (atual.responsavel_id !== dados.responsavel_id) {
      notificacaoService.notificar({
        usuario_id: dados.responsavel_id,
        demanda_id: atualizada.id,
        tipo: "demanda_criada",
        mensagem: `Demanda "${atualizada.descricao}" atribuída a você.`,
      });
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
          mensagem: `Demanda "${atualizada.descricao}" mudou para o status "${status}".`,
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
