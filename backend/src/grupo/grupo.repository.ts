import { db } from "../database/connection";
import type { Convite, Grupo, GrupoComDetalhes, MembroGrupo } from "./grupo.types";

function gerarCodigo(): string {
  const p1 = crypto.randomUUID().slice(0, 4).toUpperCase();
  const p2 = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `ORION-${p1}-${p2}`;
}

export const grupoRepository = {
  async criar(nome: string, donoId: string): Promise<{ grupo: Grupo; convites: Convite[] }> {
    const agora = new Date().toISOString();
    const grupoId = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO grupos (id, nome, dono_id, criado_em) VALUES (?, ?, ?, ?)`,
      args: [grupoId, nome, donoId, agora],
    });

    await db.execute({
      sql: `INSERT INTO grupo_membros (grupo_id, usuario_id, criado_em) VALUES (?, ?, ?)`,
      args: [grupoId, donoId, agora],
    });

    const convites: Convite[] = [];
    for (let i = 0; i < 5; i++) {
      const conviteId = crypto.randomUUID();
      const codigo = gerarCodigo();
      await db.execute({
        sql: `INSERT INTO convites (id, grupo_id, codigo, criado_por_id, criado_em) VALUES (?, ?, ?, ?, ?)`,
        args: [conviteId, grupoId, codigo, donoId, agora],
      });
      convites.push({
        id: conviteId,
        grupo_id: grupoId,
        codigo,
        criado_por_id: donoId,
        usado_por_id: null,
        criado_em: agora,
        usado_em: null,
        status: "disponivel",
      });
    }

    const grupo: Grupo = {
      id: grupoId,
      nome,
      dono_id: donoId,
      criado_em: agora,
    };

    return { grupo, convites };
  },

  async buscarPorId(id: string): Promise<GrupoComDetalhes | null> {
    const res = await db.execute({
      sql: `
        SELECT
          g.*,
          u.nome_completo AS dono_nome,
          (SELECT COUNT(*) FROM grupo_membros gm WHERE gm.grupo_id = g.id) AS total_membros,
          (SELECT COUNT(*) FROM projetos p WHERE p.grupo_id = g.id) AS total_projetos,
          (SELECT COUNT(*) FROM convites c WHERE c.grupo_id = g.id AND c.usado_por_id IS NULL) AS convites_disponiveis
        FROM grupos g
        JOIN usuarios u ON u.id = g.dono_id
        WHERE g.id = ?
      `,
      args: [id],
    });
    return (res.rows[0] as unknown as GrupoComDetalhes) ?? null;
  },

  async listarPorUsuario(usuarioId: string): Promise<GrupoComDetalhes[]> {
    const res = await db.execute({
      sql: `
        SELECT
          g.*,
          u.nome_completo AS dono_nome,
          (SELECT COUNT(*) FROM grupo_membros gm WHERE gm.grupo_id = g.id) AS total_membros,
          (SELECT COUNT(*) FROM projetos p WHERE p.grupo_id = g.id) AS total_projetos,
          (SELECT COUNT(*) FROM convites c WHERE c.grupo_id = g.id AND c.usado_por_id IS NULL) AS convites_disponiveis
        FROM grupos g
        JOIN grupo_membros gm ON gm.grupo_id = g.id
        JOIN usuarios u ON u.id = g.dono_id
        WHERE gm.usuario_id = ?
        ORDER BY g.criado_em DESC
      `,
      args: [usuarioId],
    });
    return res.rows as unknown as GrupoComDetalhes[];
  },

  async ehMembro(grupoId: string, usuarioId: string): Promise<boolean> {
    const res = await db.execute({
      sql: `SELECT 1 FROM grupo_membros WHERE grupo_id = ? AND usuario_id = ?`,
      args: [grupoId, usuarioId],
    });
    return res.rows.length > 0;
  },

  async adicionarMembro(grupoId: string, usuarioId: string): Promise<void> {
    await db.execute({
      sql: `INSERT OR IGNORE INTO grupo_membros (grupo_id, usuario_id, criado_em) VALUES (?, ?, ?)`,
      args: [grupoId, usuarioId, new Date().toISOString()],
    });
  },

  async listarMembros(grupoId: string): Promise<MembroGrupo[]> {
    const res = await db.execute({
      sql: `
        SELECT
          u.id AS usuario_id,
          u.nome_completo,
          u.email,
          gm.criado_em AS entrou_em,
          CASE WHEN g.dono_id = u.id THEN 1 ELSE 0 END AS eh_dono
        FROM grupo_membros gm
        JOIN usuarios u ON u.id = gm.usuario_id
        JOIN grupos g ON g.id = gm.grupo_id
        WHERE gm.grupo_id = ?
        ORDER BY eh_dono DESC, u.nome_completo ASC
      `,
      args: [grupoId],
    });
    return res.rows as unknown as MembroGrupo[];
  },

  async listarConvites(grupoId: string): Promise<Convite[]> {
    const res = await db.execute({
      sql: `
        SELECT
          c.id,
          c.grupo_id,
          c.codigo,
          c.criado_por_id,
          c.usado_por_id,
          u.nome_completo AS usado_por_nome,
          c.criado_em,
          c.usado_em,
          CASE WHEN c.usado_por_id IS NULL THEN 'disponivel' ELSE 'usado' END AS status
        FROM convites c
        LEFT JOIN usuarios u ON u.id = c.usado_por_id
        WHERE c.grupo_id = ?
        ORDER BY c.usado_por_id IS NOT NULL, c.criado_em ASC
      `,
      args: [grupoId],
    });
    return res.rows as unknown as Convite[];
  },

  async buscarConvitePorCodigo(codigo: string): Promise<(Convite & { grupo_nome: string }) | null> {
    const res = await db.execute({
      sql: `
        SELECT
          c.id,
          c.grupo_id,
          g.nome AS grupo_nome,
          c.codigo,
          c.criado_por_id,
          c.usado_por_id,
          c.criado_em,
          c.usado_em,
          CASE WHEN c.usado_por_id IS NULL THEN 'disponivel' ELSE 'usado' END AS status
        FROM convites c
        JOIN grupos g ON g.id = c.grupo_id
        WHERE c.codigo = ?
      `,
      args: [codigo.trim().toUpperCase()],
    });
    return (res.rows[0] as unknown as (Convite & { grupo_nome: string })) ?? null;
  },

  async usarConvite(conviteId: string, usuarioId: string): Promise<void> {
    const agora = new Date().toISOString();
    await db.execute({
      sql: `UPDATE convites SET usado_por_id = ?, usado_em = ? WHERE id = ?`,
      args: [usuarioId, agora, conviteId],
    });
  },
};
