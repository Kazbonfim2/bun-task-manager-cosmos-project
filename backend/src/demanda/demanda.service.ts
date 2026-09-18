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

function estaAtrasada(prazo: string, status: string): boolean {
  return (
    status !== "feito" &&
    status !== "aprovado" &&
    status !== "concluida" &&
    prazo.slice(0, 10) < new Date().toISOString().slice(0, 10)
  );
}

export const demandaService = {
  async listar(filtro: FiltroDemanda): Promise<DemandaComNomes[]> {
    if (filtro.status && filtro.status !== "atrasadas" && !ehStatus(filtro.status)) {
      throw new HttpError(400, "Status inválido");
    }
    return demandaRepository.listar(filtro);
  },

  async buscarPorId(id: string): Promise<DemandaComNomes> {
    const demanda = await demandaRepository.buscarPorId(id);
    if (!demanda) throw new HttpError(404, "Demanda não encontrada");
    return demanda;
  },

  async criar(dados: NovaDemanda, criadoPorId: string): Promise<DemandaComNomes> {
    const titulo = dados.titulo?.trim();
    if (!titulo) throw new HttpError(400, "Título é obrigatório");
    const descricao = dados.descricao?.trim() || null;
    if (!dados.projeto_id) throw new HttpError(400, "Projeto é obrigatório");
    if (!dados.responsavel_id) throw new HttpError(400, "Responsável é obrigatório");
    if (!ehStatus(dados.status)) throw new HttpError(400, "Status inválido");
    if (!(await projetoRepository.buscarPorId(dados.projeto_id))) {
      throw new HttpError(400, "Projeto não encontrado");
    }
    if (!(await usuarioRepository.buscarPorId(dados.responsavel_id))) {
      throw new HttpError(400, "Responsável não encontrado");
    }

    const agora = new Date().toISOString();
    const criada = await demandaRepository.criar({
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

    await notificacaoService.notificar({
      usuario_id: criada.responsavel_id,
      demanda_id: criada.id,
      tipo: "demanda_criada",
      mensagem: `Nova demanda atribuída a você: "${criada.titulo}"`,
    });

    if (descricao) {
      const usuarios = await usuarioRepository.listar();
      const idsMencionados = extrairMencoes(descricao, usuarios).filter(
        (id) => id !== criadoPorId && id !== criada.responsavel_id
      );

      for (const destId of idsMencionados) {
        await notificacaoService.notificar({
          usuario_id: destId,
          demanda_id: criada.id,
          tipo: "mencao",
          mensagem: `Você foi mencionado na descrição da demanda "${criada.titulo}".`,
        });
      }
    }

    return criada;
  },

  async atualizar(id: string, dados: NovaDemanda): Promise<DemandaComNomes> {
    const atual = await demandaRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");

    const titulo = dados.titulo?.trim();
    if (!titulo) throw new HttpError(400, "Título é obrigatório");
    const descricao = dados.descricao !== undefined ? (dados.descricao?.trim() || null) : atual.descricao;
    if (!dados.projeto_id) throw new HttpError(400, "Projeto é obrigatório");
    if (!dados.responsavel_id) throw new HttpError(400, "Responsável é obrigatório");
    if (!ehStatus(dados.status)) throw new HttpError(400, "Status inválido");
    if (!(await projetoRepository.buscarPorId(dados.projeto_id))) {
      throw new HttpError(400, "Projeto não encontrado");
    }
    if (!(await usuarioRepository.buscarPorId(dados.responsavel_id))) {
      throw new HttpError(400, "Responsável não encontrado");
    }

    const atualizada = await demandaRepository.atualizar({
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
        await notificacaoService.notificar({
          usuario_id: usuarioId,
          demanda_id: atualizada.id,
          tipo: "demanda_status_alterado",
          mensagem: `Demanda "${atualizada.titulo}" mudou para o status "${dados.status}".`,
        });
      }
    }

    if (atual.responsavel_id !== dados.responsavel_id) {
      await notificacaoService.notificar({
        usuario_id: dados.responsavel_id,
        demanda_id: atualizada.id,
        tipo: "demanda_criada",
        mensagem: `Demanda "${atualizada.titulo}" atribuída a você.`,
      });
    }

    if (descricao && descricao !== atual.descricao) {
      const usuarios = await usuarioRepository.listar();
      const mencoesAtuais = extrairMencoes(descricao, usuarios);
      const mencoesAntigas = atual.descricao ? extrairMencoes(atual.descricao, usuarios) : [];
      const novasMencoes = mencoesAtuais.filter(
        (id) => !mencoesAntigas.includes(id) && id !== atualizada.responsavel_id
      );

      for (const destId of novasMencoes) {
        await notificacaoService.notificar({
          usuario_id: destId,
          demanda_id: atualizada.id,
          tipo: "mencao",
          mensagem: `Você foi mencionado na descrição da demanda "${atualizada.titulo}".`,
        });
      }
    }

    // Rearma o alerta de atraso se a demanda deixou de estar atrasada
    if (!estaAtrasada(atualizada.prazo, atualizada.status)) {
      await demandaRepository.limparAtrasoNotificado(atualizada.id);
    }

    return atualizada;
  },

  async alterarStatus(id: string, status: string): Promise<DemandaComNomes> {
    const atual = await demandaRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");
    if (!ehStatus(status)) throw new HttpError(400, "Status inválido");

    const atualizada = await demandaRepository.atualizar({
      ...atual,
      status,
      atualizado_em: new Date().toISOString(),
    });

    if (atual.status !== status) {
      const destinatarios = new Set([atualizada.responsavel_id, atualizada.criado_por_id]);
      for (const usuarioId of destinatarios) {
        await notificacaoService.notificar({
          usuario_id: usuarioId,
          demanda_id: atualizada.id,
          tipo: "demanda_status_alterado",
          mensagem: `Demanda "${atualizada.titulo}" mudou para o status "${status}".`,
        });
      }
    }

    if (!estaAtrasada(atualizada.prazo, atualizada.status)) {
      await demandaRepository.limparAtrasoNotificado(atualizada.id);
    }

    return atualizada;
  },

  async excluir(id: string): Promise<void> {
    const atual = await demandaRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");
    await demandaRepository.excluir(id);
  },

  // Reordena os cards do Kanban. Só mexe em `ordem`; troca de coluna continua via alterarStatus.
  async reordenar(itens: unknown): Promise<void> {
    if (!Array.isArray(itens)) throw new HttpError(400, "Payload inválido");
    const limpos = itens.map((it) => {
      const id = String((it as { id?: unknown })?.id ?? "");
      const ordem = Number((it as { ordem?: unknown })?.ordem);
      if (!id || Number.isNaN(ordem)) throw new HttpError(400, "Item de reordenação inválido");
      return { id, ordem };
    });
    await demandaRepository.reordenar(limpos);
  },

  // Notifica o responsável de cada demanda que entrou em atraso (uma vez por atraso)
  async notificarAtrasadas(): Promise<number> {
    const atrasadas = await demandaRepository.listarAtrasadasNaoNotificadas();
    for (const d of atrasadas) {
      await notificacaoService.notificar({
        usuario_id: d.responsavel_id,
        demanda_id: d.id,
        tipo: "demanda_atrasada",
        mensagem: `A demanda "${d.titulo}" está atrasada e precisa de atenção.`,
      });
      await demandaRepository.marcarAtrasoNotificado(d.id);
    }
    return atrasadas.length;
  },
};
