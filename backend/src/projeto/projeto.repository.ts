import { db } from "../database/connection";
import type { Projeto } from "./projeto.types";

export const projetoRepository = {
  criar(projeto: Projeto): Projeto {
    db.query(
      `INSERT INTO projetos (id, nome, descricao, criado_em) VALUES (?, ?, ?, ?)`,
    ).run(projeto.id, projeto.nome, projeto.descricao, projeto.criado_em);
    return projeto;
  },

  buscarPorId(id: string): Projeto | null {
    return db.query("SELECT * FROM projetos WHERE id = ?").get(id) as Projeto | null;
  },

  listar(): Projeto[] {
    return db
      .query(`
        SELECT
          p.id,
          p.nome,
          p.descricao,
          p.criado_em,
          COUNT(d.id) AS total_demandas,
          SUM(CASE WHEN d.status = 'aberta' THEN 1 ELSE 0 END) AS demandas_abertas,
          SUM(CASE WHEN d.status = 'em_andamento' THEN 1 ELSE 0 END) AS demandas_em_andamento,
          SUM(CASE WHEN d.status = 'concluida' THEN 1 ELSE 0 END) AS demandas_concluidas
        FROM projetos p
        LEFT JOIN demandas d ON d.projeto_id = p.id
        GROUP BY p.id
        ORDER BY p.nome ASC
      `)
      .all() as Projeto[];
  },

  atualizar(projeto: Projeto): Projeto {
    db.query("UPDATE projetos SET nome = ?, descricao = ? WHERE id = ?").run(
      projeto.nome,
      projeto.descricao,
      projeto.id,
    );
    return projeto;
  },

  excluir(id: string): void {
    db.query("DELETE FROM projetos WHERE id = ?").run(id);
  },
};
