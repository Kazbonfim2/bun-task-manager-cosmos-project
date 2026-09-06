const TOKEN_KEY = "orion_token";
const USUARIO_KEY = "orion_usuario";

export type UsuarioSessao = {
  id: string;
  nome_completo: string;
  email: string;
};

export function salvarSessao(token: string, usuario: UsuarioSessao): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function limparSessao(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export function lerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function lerUsuario(): UsuarioSessao | null {
  const bruto = localStorage.getItem(USUARIO_KEY);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as UsuarioSessao;
  } catch {
    return null;
  }
}
