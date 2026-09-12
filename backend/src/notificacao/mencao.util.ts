export interface UsuarioReferencia {
  id: string;
  nome_completo: string;
  email: string;
}

export function extrairMencoes(
  texto: string | null | undefined,
  usuarios: UsuarioReferencia[]
): string[] {
  if (!texto || !texto.includes("@")) return [];

  const idsMencionados = new Set<string>();

  for (const u of usuarios) {
    const nomeCompleto = u.nome_completo.trim();
    const primeiroNome = nomeCompleto.split(" ")[0];
    const emailPrefix = u.email.split("@")[0];

    const escapes = [
      nomeCompleto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      primeiroNome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      u.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      emailPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    ];

    const regex = new RegExp(`@(?:${escapes.join("|")})(?:\\b|$)`, "i");

    if (regex.test(texto)) {
      idsMencionados.add(u.id);
    }
  }

  return Array.from(idsMencionados);
}
