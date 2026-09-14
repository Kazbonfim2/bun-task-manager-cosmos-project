export interface Grupo {
  id: string;
  nome: string;
  dono_id: string;
  criado_em: string;
}

export interface GrupoComDetalhes extends Grupo {
  dono_nome?: string;
  total_membros?: number;
  total_projetos?: number;
  total_demandas?: number;
  convites_disponiveis?: number;
}

export interface MembroGrupo {
  usuario_id: string;
  nome_completo: string;
  email: string;
  entrou_em: string;
  eh_dono: boolean;
}

export interface Convite {
  id: string;
  grupo_id: string;
  grupo_nome?: string;
  codigo: string;
  criado_por_id: string;
  usado_por_id: string | null;
  usado_por_nome?: string | null;
  criado_em: string;
  usado_em: string | null;
  status: "disponivel" | "usado";
}

export interface NovoGrupo {
  nome: string;
}
