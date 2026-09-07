import { db } from "../database/connection";
import { HttpError } from "../http-error";
import { projetoRepository } from "./projeto.repository";
import type { NovoProjeto, Projeto } from "./projeto.types";

export const projetoService = {
  criar(dados: NovoProjeto): Projeto {
    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do projeto é obrigatório");

    return projetoRepository.criar({
      id: crypto.randomUUID(),
      nome,
      descricao: dados.descricao?.trim() || null,
      criado_em: new Date().toISOString(),
    });
  },

  listar(): Projeto[] {
    return projetoRepository.listar();
  },

  atualizar(id: string, dados: NovoProjeto): Projeto {
    const atual = projetoRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Projeto não encontrado");

    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do projeto é obrigatório");

    return projetoRepository.atualizar({
      ...atual,
      nome,
      descricao: dados.descricao?.trim() || null,
    });
  },

  excluir(id: string): void {
    const atual = projetoRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Projeto não encontrado");

    const vinculadas = db
      .query("SELECT COUNT(*) as total FROM demandas WHERE projeto_id = ?")
      .get(id) as { total: number };

    if (vinculadas && vinculadas.total > 0) {
      throw new HttpError(
        400,
        `Não é possível excluir: existem ${vinculadas.total} demanda(s) vinculada(s) a este projeto.`,
      );
    }

    projetoRepository.excluir(id);
  },
};
