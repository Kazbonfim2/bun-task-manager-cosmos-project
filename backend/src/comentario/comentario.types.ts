export type Comentario = {
  id: string;
  demanda_id: string;
  usuario_id: string;
  texto: string;
  criado_em: string;
  atualizado_em: string;
};

export type ComentarioComAutor = Comentario & {
  usuario_nome: string;
  usuario_email: string;
};

export type NovoComentario = {
  texto: string;
};
