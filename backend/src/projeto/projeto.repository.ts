import { db } from "../database/connection";
import type { Projeto } from "./projeto.types";

export const projetoRepository = {
  async criar(projeto: Projeto): Promise<Projeto> {
    await db.execute({
      sql: `INSERT INTO projetos (id, nome, descricao, grupo_id, criado_em) VALUES (?, ?, ?, ?, ?)`,
      args: [projeto.id, projeto.nome, projeto.descricao, projeto.grupo_id ?? null, projeto.criado_em],
    });
    return projeto;
  },

  async buscarPorId(id: string): Promise<Projeto | null> {
    const res = await db.execute({
      sql: "SELECT * FROM projetos WHERE id = ?",
      args: [id],
    });
    return (res.rows[0] as unknown as Projeto) ?? null;
  },

  async listar(grupoId?: string): Promise<Projeto[]> {
    const where = grupoId ? "WHERE p.grupo_id = ?" : "";
    const params = grupoId ? [grupoId] : [];
    const res = await db.execute({
      sql: `
        SELECT
          p.id,
          p.nome,
          p.descricao,
          p.grupo_id,
          p.criado_em,
          COUNT(d.id) AS total_demandas,
          SUM(CASE WHEN d.status = 'aberta' THEN 1 ELSE 0 END) AS demandas_abertas,
          SUM(CASE WHEN d.status = 'em_andamento' THEN 1 ELSE 0 END) AS demandas_em_andamento,
          SUM(CASE WHEN d.status = 'concluida' THEN 1 ELSE 0 END) AS demandas_concluidas
        FROM projetos p
        LEFT JOIN demandas d ON d.projeto_id = p.id
        ${where}
        GROUP BY p.id
        ORDER BY p.nome ASC
      `,
      args: params,
    });
    return res.rows as unknown as Projeto[];
  },

  async atualizar(projeto: Projeto): Promise<Projeto> {
    await db.execute({
      sql: "UPDATE projetos SET nome = ?, descricao = ? WHERE id = ?",
      args: [projeto.nome, projeto.descricao, projeto.id],
    });
    return projeto;
  },

  async excluir(id: string): Promise<void> {
    await db.execute({
      sql: "DELETE FROM projetos WHERE id = ?",
      args: [id],
    });
  },
};
