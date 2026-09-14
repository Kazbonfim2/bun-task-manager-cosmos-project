import { db } from "../database/connection";
import type { Usuario } from "./usuario.types";

export const usuarioRepository = {
  criar(usuario: Usuario): Usuario {
    db.query(
      `INSERT INTO usuarios (id, nome_completo, email, senha_hash, pergunta_secreta, resposta_secreta_hash, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      usuario.id,
      usuario.nome_completo,
      usuario.email,
      usuario.senha_hash,
      usuario.pergunta_secreta ?? null,
      usuario.resposta_secreta_hash ?? null,
      usuario.criado_em,
    );
    return usuario;
  },

  atualizarSenha(id: string, senha_hash: string): void {
    db.query("UPDATE usuarios SET senha_hash = ? WHERE id = ?").run(senha_hash, id);
  },

  buscarPorEmail(email: string): Usuario | null {
    return (
      db
        .query("SELECT * FROM usuarios WHERE email = ?")
        .get(email) as Usuario | null
    );
  },

  buscarPorId(id: string): Usuario | null {
    return db.query("SELECT * FROM usuarios WHERE id = ?").get(id) as Usuario | null;
  },

  listar(grupoId?: string): Usuario[] {
    if (grupoId) {
      return db
        .query(`
          SELECT u.* FROM usuarios u
          JOIN grupo_membros gm ON gm.usuario_id = u.id
          WHERE gm.grupo_id = ?
          ORDER BY u.nome_completo ASC
        `)
        .all(grupoId) as Usuario[];
    }
    return db
      .query("SELECT * FROM usuarios ORDER BY nome_completo ASC")
      .all() as Usuario[];
  },
};

