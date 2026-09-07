export type Projeto = {
  id: string;
  nome: string;
  descricao: string | null;
  criado_em: string;
};

export type NovoProjeto = {
  nome: string;
  descricao?: string | null;
};
