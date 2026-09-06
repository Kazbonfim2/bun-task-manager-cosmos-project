export const STATUS_DEMANDA = ["aberta", "em_andamento", "concluida"] as const;

export type StatusDemanda = (typeof STATUS_DEMANDA)[number];

export type Demanda = {
  id: string;
  descricao: string;
  projeto_id: string;
  responsavel_id: string;
  criado_por_id: string;
  prazo: string;
  status: StatusDemanda;
  criado_em: string;
  atualizado_em: string;
};

export type DemandaComNomes = Demanda & {
  projeto_nome: string;
  responsavel_nome: string;
};

export type NovaDemanda = {
  descricao: string;
  projeto_id: string;
  responsavel_id: string;
  prazo: string;
  status: StatusDemanda;
};

export type FiltroDemanda = {
  responsavel_id?: string;
  status?: string;
};
