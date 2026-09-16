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
  async criar(demanda: Demanda): Promise<DemandaComNomes> {
    await db.execute({
      sql: `INSERT INTO demandas (
        id, titulo, descricao, projeto_id, responsavel_id, criado_por_id,
        prazo, status, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
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
      ],
    });
    return (await this.buscarPorId(demanda.id)) as DemandaComNomes;
  },

  async buscarPorId(id: string): Promise<DemandaComNomes | null> {
    const res = await db.execute({
      sql: `${SELECT_COM_NOMES} WHERE d.id = ?`,
      args: [id],
    });
    return (res.rows[0] as unknown as DemandaComNomes) ?? null;
  },

  async listar(filtro: FiltroDemanda): Promise<DemandaComNomes[]> {
    const condicoes: string[] = [];
    const params: any[] = [];

    if (filtro.responsavel_id) {
      condicoes.push("d.responsavel_id = ?");
      params.push(filtro.responsavel_id);
    }
    if (filtro.projeto_id) {
      condicoes.push("d.projeto_id = ?");
      params.push(filtro.projeto_id);
    }
    if (filtro.grupo_id) {
      condicoes.push("p.grupo_id = ?");
      params.push(filtro.grupo_id);
    }
    if (filtro.busca?.trim()) {
      condicoes.push("(d.titulo LIKE ? OR d.descricao LIKE ?)");
      const termo = `%${filtro.busca.trim()}%`;
      params.push(termo, termo);
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
    const limite = Math.min(Math.max(Number(filtro.limite) || 50, 1), 100);
    const pagina = Math.max(Number(filtro.pagina) || 1, 1);
    const offset = (pagina - 1) * limite;

    params.push(limite, offset);

    const res = await db.execute({
      sql: `${SELECT_COM_NOMES} ${where} ORDER BY d.prazo ASC LIMIT ? OFFSET ?`,
      args: params,
    });
    return res.rows as unknown as DemandaComNomes[];
  },

  async atualizar(demanda: Demanda): Promise<DemandaComNomes> {
    await db.execute({
      sql: `UPDATE demandas SET
        titulo = ?, descricao = ?, projeto_id = ?, responsavel_id = ?,
        prazo = ?, status = ?, atualizado_em = ?
      WHERE id = ?`,
      args: [
        demanda.titulo,
        demanda.descricao,
        demanda.projeto_id,
        demanda.responsavel_id,
        demanda.prazo,
        demanda.status,
        demanda.atualizado_em,
        demanda.id,
      ],
    });
    return (await this.buscarPorId(demanda.id)) as DemandaComNomes;
  },

  async excluir(id: string): Promise<void> {
    await db.execute({
      sql: "DELETE FROM comentarios WHERE demanda_id = ?",
      args: [id],
    });
    await db.execute({
      sql: "DELETE FROM notificacoes WHERE demanda_id = ?",
      args: [id],
    });
    await db.execute({
      sql: "DELETE FROM demandas WHERE id = ?",
      args: [id],
    });
  },

  // Demandas atrasadas (prazo < hoje, não concluídas) que ainda não geraram notificação de atraso
  async listarAtrasadasNaoNotificadas(): Promise<Array<{ id: string; titulo: string; responsavel_id: string }>> {
    const hoje = new Date().toISOString().slice(0, 10);
    const res = await db.execute({
      sql: `SELECT id, titulo, responsavel_id FROM demandas
            WHERE status != 'concluida' AND prazo < ? AND atraso_notificado_em IS NULL`,
      args: [hoje],
    });
    return res.rows as unknown as Array<{ id: string; titulo: string; responsavel_id: string }>;
  },

  async marcarAtrasoNotificado(id: string): Promise<void> {
    await db.execute({
      sql: "UPDATE demandas SET atraso_notificado_em = ? WHERE id = ?",
      args: [new Date().toISOString(), id],
    });
  },

  // Rearma o alerta de atraso quando a demanda deixa de estar atrasada
  async limparAtrasoNotificado(id: string): Promise<void> {
    await db.execute({
      sql: "UPDATE demandas SET atraso_notificado_em = NULL WHERE id = ?",
      args: [id],
    });
  },
};
