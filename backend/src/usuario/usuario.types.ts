export type Usuario = {
  id: string;
  nome_completo: string;
  email: string;
  senha_hash: string;
  criado_em: string;
};

export type UsuarioPublico = Omit<Usuario, "senha_hash">;

export type NovoUsuario = {
  nome_completo: string;
  email: string;
  senha: string;
};
