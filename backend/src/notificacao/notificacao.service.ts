import { EventEmitter } from "node:events";
import { db } from "../database/connection";

export interface EventoNotificacao {
  usuario_id: string;
  demanda_id?: string;
  tipo: "demanda_criada" | "demanda_status_alterado" | "demanda_comentario" | string;
  mensagem: string;
}

export interface Notificacao extends EventoNotificacao {
  id: string;
  lida: boolean;
  criado_em: string;
}

// Barramento nativo de eventos para acoplamento com WebSockets, SSE, Webhooks, etc.
export const notificacaoEvents = new EventEmitter();

export const notificacaoService = {
  async notificar(evento: EventoNotificacao): Promise<Notificacao> {
    const agora = new Date().toISOString();
    const notificacao: Notificacao = {
      id: crypto.randomUUID(),
      ...evento,
      lida: false,
      criado_em: agora,
    };

    await db.execute({
      sql: `
        INSERT INTO notificacoes (id, usuario_id, demanda_id, tipo, mensagem, lida, criado_em)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `,
      args: [
        notificacao.id,
        notificacao.usuario_id,
        notificacao.demanda_id ?? null,
        notificacao.tipo,
        notificacao.mensagem,
        notificacao.criado_em,
      ],
    });

    notificacaoEvents.emit("notificacao", notificacao);
    notificacaoEvents.emit(notificacao.tipo, notificacao);

    return notificacao;
  },

  async listarPorUsuario(usuarioId: string): Promise<Notificacao[]> {
    const res = await db.execute({
      sql: `
        SELECT id, usuario_id, demanda_id, tipo, mensagem, lida, criado_em
        FROM notificacoes
        WHERE usuario_id = ?
        ORDER BY criado_em DESC
      `,
      args: [usuarioId],
    });

    return (res.rows as unknown as Array<Omit<Notificacao, "lida"> & { lida: number }>).map((r) => ({
      ...r,
      lida: Boolean(r.lida),
    }));
  },

  async marcarComoLida(id: string, usuarioId: string): Promise<void> {
    await db.execute({
      sql: `
        DELETE FROM notificacoes
        WHERE id = ? AND usuario_id = ?
      `,
      args: [id, usuarioId],
    });
  },

  async marcarTodasComoLidas(usuarioId: string): Promise<void> {
    await db.execute({
      sql: `
        DELETE FROM notificacoes
        WHERE usuario_id = ?
      `,
      args: [usuarioId],
    });
  },
};
