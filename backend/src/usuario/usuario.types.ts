export type Usuario = {
  id: string;
  nome_completo: string;
  email: string;
  senha_hash: string;
  pergunta_secreta?: string | null;
  resposta_secreta_hash?: string | null;
  criado_em: string;
};

export type UsuarioPublico = Omit<Usuario, "senha_hash" | "resposta_secreta_hash">;

export type NovoUsuario = {
  nome_completo: string;
  email: string;
  senha: string;
  pergunta_secreta: string;
  resposta_secreta: string;
  grupo_nome?: string;
  codigo_convite?: string;
};
