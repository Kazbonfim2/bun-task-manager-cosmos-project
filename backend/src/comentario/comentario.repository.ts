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
  async criar(comentario: Comentario): Promise<ComentarioComAutor> {
    await db.execute({
      sql: `INSERT INTO comentarios (
        id, demanda_id, usuario_id, texto, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        comentario.id,
        comentario.demanda_id,
        comentario.usuario_id,
        comentario.texto,
        comentario.criado_em,
        comentario.atualizado_em,
      ],
    });
    return (await this.buscarPorId(comentario.id)) as ComentarioComAutor;
  },

  async buscarPorId(id: string): Promise<ComentarioComAutor | null> {
    const res = await db.execute({
      sql: `${SELECT_COM_AUTOR} WHERE c.id = ?`,
      args: [id],
    });
    return (res.rows[0] as unknown as ComentarioComAutor) ?? null;
  },

  async listarPorDemanda(demandaId: string): Promise<ComentarioComAutor[]> {
    const res = await db.execute({
      sql: `${SELECT_COM_AUTOR} WHERE c.demanda_id = ? ORDER BY c.criado_em ASC`,
      args: [demandaId],
    });
    return res.rows as unknown as ComentarioComAutor[];
  },

  async atualizar(id: string, texto: string, atualizadoEm: string): Promise<ComentarioComAutor> {
    await db.execute({
      sql: `UPDATE comentarios SET texto = ?, atualizado_em = ? WHERE id = ?`,
      args: [texto, atualizadoEm, id],
    });
    return (await this.buscarPorId(id)) as ComentarioComAutor;
  },

  async excluir(id: string): Promise<void> {
    await db.execute({
      sql: `DELETE FROM comentarios WHERE id = ?`,
      args: [id],
    });
  },
};
