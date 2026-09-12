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

  const padraoRegex = padroesNomes.length > 0
    ? `(@(?:${padroesNomes.join("|")})|@[a-zA-Z0-9_.-]+)`
    : `(@[a-zA-Z0-9_.-]+)`;

  const regex = new RegExp(padraoRegex, "gi");
  const partes = texto.split(regex);

  return (
    <span className={className}>
      {partes.map((parte, index) => {
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
