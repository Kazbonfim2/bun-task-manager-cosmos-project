import { db } from "../database/connection";
import type { Usuario } from "./usuario.types";

export const usuarioRepository = {
  async criar(usuario: Usuario): Promise<Usuario> {
    await db.execute({
      sql: `INSERT INTO usuarios (id, nome_completo, email, senha_hash, pergunta_secreta, resposta_secreta_hash, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        usuario.id,
        usuario.nome_completo,
        usuario.email,
        usuario.senha_hash,
        usuario.pergunta_secreta ?? null,
        usuario.resposta_secreta_hash ?? null,
        usuario.criado_em,
      ],
    });
    return usuario;
  },

  async atualizarSenha(id: string, senha_hash: string): Promise<void> {
    await db.execute({
      sql: "UPDATE usuarios SET senha_hash = ? WHERE id = ?",
      args: [senha_hash, id],
    });
  },

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const res = await db.execute({
      sql: "SELECT * FROM usuarios WHERE email = ?",
      args: [email],
    });
    return (res.rows[0] as unknown as Usuario) ?? null;
  },

  async buscarPorId(id: string): Promise<Usuario | null> {
    const res = await db.execute({
      sql: "SELECT * FROM usuarios WHERE id = ?",
      args: [id],
    });
    return (res.rows[0] as unknown as Usuario) ?? null;
  },

  async listar(grupoId?: string): Promise<Usuario[]> {
    if (grupoId) {
      const res = await db.execute({
        sql: `
          SELECT u.* FROM usuarios u
          JOIN grupo_membros gm ON gm.usuario_id = u.id
          WHERE gm.grupo_id = ?
          ORDER BY u.nome_completo ASC
        `,
        args: [grupoId],
      });
      return res.rows as unknown as Usuario[];
    }
    const res = await db.execute("SELECT * FROM usuarios ORDER BY nome_completo ASC");
    return res.rows as unknown as Usuario[];
  },
};
