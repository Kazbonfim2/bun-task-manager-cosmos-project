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
    return db.query("SELECT * FROM projetos ORDER BY nome ASC").all() as Projeto[];
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
