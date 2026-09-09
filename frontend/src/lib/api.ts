import { lerToken, limparSessao } from "./auth";

type ErroApi = { erro?: string };

export async function api<T>(path: string, opcoes: RequestInit = {}): Promise<T> {
  const headers = new Headers(opcoes.headers);
  if (!headers.has("Content-Type") && opcoes.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = lerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(`/api${path}`, { ...opcoes, headers });
  const corpo = (await resposta.json().catch(() => ({}))) as ErroApi & T;

  if (resposta.status === 401) {
    limparSessao();
    if (!path.startsWith("/auth/")) {
      window.location.assign("/login");
    }
    throw new Error(corpo.erro ?? "Não autorizado");
  }
  if (!resposta.ok) {
    throw new Error(corpo.erro ?? "Erro na requisição");
  }
  return corpo as T;
}

export type Usuario = {
  id: string;
  nome_completo: string;
  email: string;
};

export type Projeto = {
  id: string;
  nome: string;
  descricao: string | null;
  criado_em?: string;
  total_demandas?: number;
  demandas_abertas?: number;
  demandas_em_andamento?: number;
  demandas_concluidas?: number;
};

export type Demanda = {
  id: string;
  descricao: string;
  projeto_id: string;
  responsavel_id: string;
  criado_por_id: string;
  prazo: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
  projeto_nome: string;
  responsavel_nome: string;
};

export type RespostaAuth = {
  token: string;
  usuario: Usuario;
};

export type Notificacao = {
  id: string;
  usuario_id: string;
  demanda_id?: string | null;
  tipo: string;
  mensagem: string;
  lida: boolean;
  criado_em: string;
};
