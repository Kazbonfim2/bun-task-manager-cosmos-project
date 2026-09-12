import { db } from "../database/connection";
import type { Demanda, DemandaComNomes, FiltroDemanda } from "./demanda.types";

const SELECT_COM_NOMES = `
  SELECT
    d.*,
    p.nome AS projeto_nome,
    u.nome_completo AS responsavel_nome
  FROM demandas d
  JOIN projetos p ON p.id = d.projeto_id
  JOIN usuarios u ON u.id = d.responsavel_id
`;

export const demandaRepository = {
  criar(demanda: Demanda): DemandaComNomes {
    db.query(
      `INSERT INTO demandas (
        id, titulo, descricao, projeto_id, responsavel_id, criado_por_id,
        prazo, status, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      demanda.id,
      demanda.titulo,
      demanda.descricao,
      demanda.projeto_id,
      demanda.responsavel_id,
      demanda.criado_por_id,
      demanda.prazo,
      demanda.status,
      demanda.criado_em,
      demanda.atualizado_em,
    );
    return this.buscarPorId(demanda.id) as DemandaComNomes;
  },

  buscarPorId(id: string): DemandaComNomes | null {
    return db
      .query(`${SELECT_COM_NOMES} WHERE d.id = ?`)
      .get(id) as DemandaComNomes | null;
  },

  listar(filtro: FiltroDemanda): DemandaComNomes[] {
    const condicoes: string[] = [];
    const params: string[] = [];

    if (filtro.responsavel_id) {
      condicoes.push("d.responsavel_id = ?");
      params.push(filtro.responsavel_id);
    }
    if (filtro.projeto_id) {
      condicoes.push("d.projeto_id = ?");
      params.push(filtro.projeto_id);
    }
    if (filtro.status === "atrasadas") {
      const hoje = new Date().toISOString().slice(0, 10);
      condicoes.push("d.status != 'concluida' AND d.prazo < ?");
      params.push(hoje);
    } else if (filtro.status) {
      condicoes.push("d.status = ?");
      params.push(filtro.status);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
    return db
      .query(`${SELECT_COM_NOMES} ${where} ORDER BY d.prazo ASC`)
      .all(...params) as DemandaComNomes[];
  },

  atualizar(demanda: Demanda): DemandaComNomes {
    db.query(
      `UPDATE demandas SET
        titulo = ?, descricao = ?, projeto_id = ?, responsavel_id = ?,
        prazo = ?, status = ?, atualizado_em = ?
      WHERE id = ?`,
    ).run(
      demanda.titulo,
      demanda.descricao,
      demanda.projeto_id,
      demanda.responsavel_id,
      demanda.prazo,
      demanda.status,
      demanda.atualizado_em,
      demanda.id,
    );
    return this.buscarPorId(demanda.id) as DemandaComNomes;
  },

  excluir(id: string): void {
    db.query(`DELETE FROM demandas WHERE id = ?`).run(id);
  },
};
