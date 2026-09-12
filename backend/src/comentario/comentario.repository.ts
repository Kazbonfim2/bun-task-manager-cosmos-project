import { db } from "../database/connection";
import type { Comentario, ComentarioComAutor } from "./comentario.types";

const SELECT_COM_AUTOR = `
  SELECT
    c.*,
    COALESCE(u.nome_completo, 'Usuário') AS usuario_nome,
    COALESCE(u.email, '') AS usuario_email
  FROM comentarios c
  LEFT JOIN usuarios u ON u.id = c.usuario_id
`;

export const comentarioRepository = {
  criar(comentario: Comentario): ComentarioComAutor {
    db.query(
      `INSERT INTO comentarios (
        id, demanda_id, usuario_id, texto, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      comentario.id,
      comentario.demanda_id,
      comentario.usuario_id,
      comentario.texto,
      comentario.criado_em,
      comentario.atualizado_em
    );
    return this.buscarPorId(comentario.id) as ComentarioComAutor;
  },

  buscarPorId(id: string): ComentarioComAutor | null {
    return db
      .query(`${SELECT_COM_AUTOR} WHERE c.id = ?`)
      .get(id) as ComentarioComAutor | null;
  },

  listarPorDemanda(demandaId: string): ComentarioComAutor[] {
    return db
      .query(`${SELECT_COM_AUTOR} WHERE c.demanda_id = ? ORDER BY c.criado_em ASC`)
      .all(demandaId) as ComentarioComAutor[];
  },

  atualizar(id: string, texto: string, atualizadoEm: string): ComentarioComAutor {
    db.query(
      `UPDATE comentarios SET texto = ?, atualizado_em = ? WHERE id = ?`
    ).run(texto, atualizadoEm, id);
    return this.buscarPorId(id) as ComentarioComAutor;
  },

  excluir(id: string): void {
    db.query(`DELETE FROM comentarios WHERE id = ?`).run(id);
  },
};
