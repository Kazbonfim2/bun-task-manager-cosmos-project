import React from "react";
import type { Usuario } from "@/lib/api";

interface TextoComMencoesProps {
  texto: string;
  usuarios?: Usuario[];
  className?: string;
}

export function TextoComMencoes({ texto, usuarios = [], className }: TextoComMencoesProps) {
  if (!texto) return null;

  // Monta regex com nomes dos usuários cadastrados + fallback genérico para @palavra
  const padroesNomes = usuarios
    .map((u) => u.nome_completo.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);

  const padraoMencoes = padroesNomes.length > 0
    ? `@(?:${padroesNomes.join("|")})|@[a-zA-Z0-9_.-]+`
    : `@[a-zA-Z0-9_.-]+`;

  // Menções + links externos (http/https) no mesmo tokenizador
  // ponytail: regex de URL simples; pontuação final grudada no link entra na URL
  const padraoLink = `https?:\\/\\/[^\\s]+`;
  const regex = new RegExp(`(${padraoMencoes}|${padraoLink})`, "gi");
  const partes = texto.split(regex);

  let contadorLink = 0;

  return (
    <span className={className}>
      {partes.map((parte, index) => {
        if (parte && /^https?:\/\//i.test(parte)) {
          contadorLink++;
          return (
            <a
              key={index}
              href={parte}
              target="_blank"
              rel="noopener noreferrer"
              title={parte}
              className="inline-flex items-center rounded-md bg-blue-500/10 px-1.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2 transition-colors hover:bg-blue-500/20"
            >
              link-{contadorLink}
            </a>
          );
        }
        if (parte && parte.startsWith("@") && parte.length > 1) {
          return (
            <span
              key={index}
              className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              {parte}
            </span>
          );
        }
        return <React.Fragment key={index}>{parte}</React.Fragment>;
      })}
    </span>
  );
}
