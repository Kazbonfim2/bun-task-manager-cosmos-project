import { db } from "../database/connection";
import { HttpError } from "../http-error";
import { projetoRepository } from "./projeto.repository";
import type { NovoProjeto, Projeto } from "./projeto.types";

export const projetoService = {
  async criar(dados: NovoProjeto, grupoId?: string): Promise<Projeto> {
    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do projeto é obrigatório");

    const finalGrupoId = dados.grupo_id || grupoId || null;

    return projetoRepository.criar({
      id: crypto.randomUUID(),
      nome,
      descricao: dados.descricao?.trim() || null,
      grupo_id: finalGrupoId,
      criado_em: new Date().toISOString(),
    });
  },

  async listar(grupoId?: string): Promise<Projeto[]> {
    return projetoRepository.listar(grupoId);
  },

  async atualizar(id: string, dados: NovoProjeto): Promise<Projeto> {
    const atual = await projetoRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Projeto não encontrado");

    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do projeto é obrigatório");

    return projetoRepository.atualizar({
      ...atual,
      nome,
      descricao: dados.descricao?.trim() || null,
    });
  },

  async excluir(id: string): Promise<void> {
    const atual = await projetoRepository.buscarPorId(id);
    if (!atual) throw new HttpError(404, "Projeto não encontrado");

    const res = await db.execute({
      sql: "SELECT COUNT(*) as total FROM demandas WHERE projeto_id = ?",
      args: [id],
    });
    const vinculadas = res.rows[0] as unknown as { total: number } | undefined;

    if (vinculadas && Number(vinculadas.total) > 0) {
      throw new HttpError(
        400,
        `Não é possível excluir: existem ${vinculadas.total} demanda(s) vinculada(s) a este projeto.`,
      );
    }

    await projetoRepository.excluir(id);
  },
};
