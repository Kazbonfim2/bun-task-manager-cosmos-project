import { db } from "../database/connection";
import type { Usuario } from "./usuario.types";

export class UsuarioRepository {
  criar(usuario: Usuario): Usuario {
    db.query(
      `INSERT INTO usuarios (id, nome_completo, email, senha_hash, criado_em)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(
      usuario.id,
      usuario.nome_completo,
      usuario.email,
      usuario.senha_hash,
      usuario.criado_em,
    );
    return usuario;
  }

  buscarPorEmail(email: string): Usuario | null {
    return (
      db
        .query("SELECT * FROM usuarios WHERE email = ?")
        .get(email) as Usuario | null
    );
  }

  buscarPorId(id: string): Usuario | null {
    return db.query("SELECT * FROM usuarios WHERE id = ?").get(id) as Usuario | null;
  }

  listar(): Usuario[] {
    return db
      .query("SELECT * FROM usuarios ORDER BY nome_completo ASC")
      .all() as Usuario[];
  }
}
