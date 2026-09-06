import { useEffect, useMemo, useState } from "react";
import { lerUsuario } from "@/lib/auth";
import { cn } from "@/lib/utils";

function obterFraseDinamica(nome?: string): string {
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const prefixo = nome ? `${saudacao}, ${nome}` : saudacao;

  const frases = [
    `${prefixo}, o que vamos agendar hoje?`,
    `${prefixo}, quais são seus planos para hoje?`,
    `${prefixo}, pronto para organizar o fluxo de demandas?`,
    `${prefixo}, quais prioridades vamos atacar agora?`,
    `${prefixo}, o que vamos construir hoje?`,
    `${prefixo}, foco no que importa: o que vamos resolver hoje?`,
    `Tudo pronto${nome ? `, ${nome}` : ""}. O que vamos planejar hoje?`,
  ];

  return frases[Math.floor(Math.random() * frases.length)];
}

export function DashboardHeader() {
  const usuarioLogado = useMemo(() => lerUsuario(), []);
  const fraseDinamica = useMemo(
    () => obterFraseDinamica(usuarioLogado?.nome_completo?.split(" ")[0]),
    [usuarioLogado],
  );
  const [textoDigitado, setTextoDigitado] = useState("");

  useEffect(() => {
    let indice = 0;
    setTextoDigitado("");
    const timer = setInterval(() => {
      indice += 1;
      setTextoDigitado(fraseDinamica.slice(0, indice));
      if (indice >= fraseDinamica.length) clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [fraseDinamica]);

  return (
    <header className="pt-2">
      <h1 className="font-heading min-h-11 text-4xl font-bold tracking-tight text-foreground">
        {textoDigitado}
        <span
          className={cn(
            "ml-1 inline-block h-8 w-2.5 translate-y-1 bg-primary align-baseline",
            textoDigitado.length < fraseDinamica.length ? "opacity-100" : "animate-pulse",
          )}
          aria-hidden="true"
        />
      </h1>
    </header>
  );
}
