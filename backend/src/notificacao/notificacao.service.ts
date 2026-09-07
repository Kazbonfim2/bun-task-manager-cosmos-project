import { EventEmitter } from "node:events";
import { db } from "../database/connection";

export interface EventoNotificacao {
  usuario_id: string;
  demanda_id?: string;
  tipo: "demanda_criada" | "demanda_status_alterado" | string;
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
  notificar(evento: EventoNotificacao): Notificacao {
    const agora = new Date().toISOString();
    const notificacao: Notificacao = {
      id: crypto.randomUUID(),
      ...evento,
      lida: false,
      criado_em: agora,
    };

    db.prepare(`
      INSERT INTO notificacoes (id, usuario_id, demanda_id, tipo, mensagem, lida, criado_em)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(
      notificacao.id,
      notificacao.usuario_id,
      notificacao.demanda_id ?? null,
      notificacao.tipo,
      notificacao.mensagem,
      notificacao.criado_em
    );

    notificacaoEvents.emit("notificacao", notificacao);
    notificacaoEvents.emit(notificacao.tipo, notificacao);

    return notificacao;
  },

  listarPorUsuario(usuarioId: string): Notificacao[] {
    const rows = db.prepare(`
      SELECT id, usuario_id, demanda_id, tipo, mensagem, lida, criado_em
      FROM notificacoes
      WHERE usuario_id = ?
      ORDER BY criado_em DESC
    `).all(usuarioId) as Array<Omit<Notificacao, "lida"> & { lida: number }>;

    return rows.map((r) => ({ ...r, lida: Boolean(r.lida) }));
  },

  marcarComoLida(id: string, usuarioId: string): void {
    db.prepare(`
      UPDATE notificacoes SET lida = 1
      WHERE id = ? AND usuario_id = ?
    `).run(id, usuarioId);
  },

  marcarTodasComoLidas(usuarioId: string): void {
    db.prepare(`
      UPDATE notificacoes SET lida = 1
      WHERE usuario_id = ?
    `).run(usuarioId);
  },
};
