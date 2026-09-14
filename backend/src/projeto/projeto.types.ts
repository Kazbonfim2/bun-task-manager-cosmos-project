export type Projeto = {
  id: string;
  nome: string;
  descricao: string | null;
  grupo_id?: string | null;
  criado_em: string;
  total_demandas?: number;
  demandas_abertas?: number;
  demandas_em_andamento?: number;
  demandas_concluidas?: number;
};

export type NovoProjeto = {
  nome: string;
  descricao?: string | null;
  grupo_id?: string;
};


