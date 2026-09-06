import { HttpError } from "../http-error";
import { ProjetoRepository } from "../projeto/projeto.repository";
import { UsuarioRepository } from "../usuario/usuario.repository";
import { DemandaRepository } from "./demanda.repository";
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

export class DemandaService {
  constructor(
    private repository: DemandaRepository,
    private projetoRepository: ProjetoRepository,
    private usuarioRepository: UsuarioRepository,
  ) {}

  listar(filtro: FiltroDemanda): DemandaComNomes[] {
    if (filtro.status && !ehStatus(filtro.status)) {
      throw new HttpError(400, "Status inválido");
    }
    return this.repository.listar(filtro);
  }

  buscarPorId(id: string): DemandaComNomes {
    const demanda = this.repository.buscarPorId(id);
    if (!demanda) throw new HttpError(404, "Demanda não encontrada");
    return demanda;
  }

  criar(dados: NovaDemanda, criadoPorId: string): DemandaComNomes {
    const descricao = dados.descricao?.trim();
    if (!descricao) throw new HttpError(400, "Descrição é obrigatória");
    if (!dados.projeto_id) throw new HttpError(400, "Projeto é obrigatório");
    if (!dados.responsavel_id) throw new HttpError(400, "Responsável é obrigatório");
    if (!ehStatus(dados.status)) throw new HttpError(400, "Status inválido");
    if (!this.projetoRepository.buscarPorId(dados.projeto_id)) {
      throw new HttpError(400, "Projeto não encontrado");
    }
    if (!this.usuarioRepository.buscarPorId(dados.responsavel_id)) {
      throw new HttpError(400, "Responsável não encontrado");
    }

    const agora = new Date().toISOString();
    return this.repository.criar({
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
  }

  atualizar(id: string, dados: NovaDemanda): DemandaComNomes {
    const atual = this.repository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");

    const descricao = dados.descricao?.trim();
    if (!descricao) throw new HttpError(400, "Descrição é obrigatória");
    if (!dados.projeto_id) throw new HttpError(400, "Projeto é obrigatório");
    if (!dados.responsavel_id) throw new HttpError(400, "Responsável é obrigatório");
    if (!ehStatus(dados.status)) throw new HttpError(400, "Status inválido");
    if (!this.projetoRepository.buscarPorId(dados.projeto_id)) {
      throw new HttpError(400, "Projeto não encontrado");
    }
    if (!this.usuarioRepository.buscarPorId(dados.responsavel_id)) {
      throw new HttpError(400, "Responsável não encontrado");
    }

    return this.repository.atualizar({
      ...atual,
      descricao,
      projeto_id: dados.projeto_id,
      responsavel_id: dados.responsavel_id,
      prazo: validarPrazo(dados.prazo),
      status: dados.status,
      atualizado_em: new Date().toISOString(),
    });
  }

  alterarStatus(id: string, status: string): DemandaComNomes {
    const atual = this.repository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");
    if (!ehStatus(status)) throw new HttpError(400, "Status inválido");

    return this.repository.atualizar({
      ...atual,
      status,
      atualizado_em: new Date().toISOString(),
    });
  }

  excluir(id: string): void {
    const atual = this.repository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Demanda não encontrada");
    this.repository.excluir(id);
  }
}
