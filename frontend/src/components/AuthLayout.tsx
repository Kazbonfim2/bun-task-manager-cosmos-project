import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";

const FRASES_TYPEWRITER = [
  "Organize suas demandas.",
  "Acompanhe seu time.",
  "Entregue projetos no prazo.",
  "Controle o fluxo de trabalho.",
];

function GithubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface AuthLayoutProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

export function AuthLayout({ titulo, subtitulo, children }: AuthLayoutProps) {
  const [fraseIdx, setFraseIdx] = useState(0);
  const [textoDigitado, setTextoDigitado] = useState("");
  const [apagando, setApagando] = useState(false);

  useEffect(() => {
    const fraseAtual = FRASES_TYPEWRITER[fraseIdx];

    if (!apagando && textoDigitado === fraseAtual) {
      const timer = setTimeout(() => setApagando(true), 2500);
      return () => clearTimeout(timer);
    }

    if (apagando && textoDigitado === "") {
      const timer = setTimeout(() => {
        setApagando(false);
        setFraseIdx((prev) => (prev + 1) % FRASES_TYPEWRITER.length);
      }, 300);
      return () => clearTimeout(timer);
    }

    const delay = apagando ? 40 : 100;
    const timer = setTimeout(() => {
      setTextoDigitado((prev) =>
        apagando ? fraseAtual.slice(0, prev.length - 1) : fraseAtual.slice(0, prev.length + 1),
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [textoDigitado, apagando, fraseIdx]);

  return (
    <main className="grid flex-1 w-full grid-cols-1 lg:grid-cols-[40%_60%] h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Painel Esquerdo (40% Desktop, oculto em Mobile) */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border/40 bg-gradient-to-br from-muted/50 via-muted/20 to-background p-6 lg:p-8 xl:p-10 text-foreground">
        <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />

        {/* Topo / Typewriter */}
        <div className="relative z-10 space-y-2">
          <h2 className="font-heading min-h-14 text-2xl xl:text-3xl font-bold tracking-tight text-foreground">
            {textoDigitado}
            <span
              className="ml-1 inline-block h-6 w-2 translate-y-0.5 bg-primary align-baseline animate-pulse"
              aria-hidden="true"
            />
          </h2>
          <p className="max-w-sm text-xs text-muted-foreground">
            Gerenciamento centralizado de demandas, prazos e responsabilidades em equipe.
          </p>
        </div>

        {/* Mockups de Cards Flutuantes */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-2">
          {/* Card 1 - Topo */}
          <Card className="pointer-events-none w-full max-w-xs -rotate-3 -translate-x-4 scale-95 border-border/60 bg-card/75 text-card-foreground opacity-80 shadow-xl backdrop-blur-md">
            <CardHeader className="gap-1.5 pb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Infraestrutura</span>
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="size-3" /> Em andamento
                </span>
              </div>
              <CardTitle className="text-xs font-semibold">
                Pipeline CI/CD automatizado
              </CardTitle>
            </CardHeader>
            <CardPanel className="flex justify-between pt-0 text-[11px] text-muted-foreground">
              <span>Resp: Carlos Lima</span>
              <span>Prazo: 10/09/2026</span>
            </CardPanel>
          </Card>

          {/* Card 2 - Destaque Centro */}
          <Card className="pointer-events-none z-10 w-full max-w-xs rotate-2 translate-x-3 -translate-y-3 border-border bg-card/95 text-card-foreground opacity-100 shadow-2xl backdrop-blur-xl">
            <CardHeader className="gap-1.5 pb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Core Backend</span>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Concluída
                </span>
              </div>
              <CardTitle className="text-xs font-semibold">
                Autenticação JWT e RBAC
              </CardTitle>
            </CardHeader>
            <CardPanel className="flex justify-between pt-0 text-[11px] text-muted-foreground">
              <span>Resp: Ana Costa</span>
              <span>Prazo: 08/09/2026</span>
            </CardPanel>
          </Card>

          {/* Card 3 - Fundo */}
          <Card className="pointer-events-none w-full max-w-xs -rotate-1 translate-x-1 -translate-y-5 scale-90 border-border/60 bg-card/65 text-card-foreground opacity-75 shadow-lg backdrop-blur-md">
            <CardHeader className="gap-1.5 pb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Design System</span>
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  <CircleDot className="size-3" /> Aberta
                </span>
              </div>
              <CardTitle className="text-xs font-semibold">
                Responsividade e tema escuro
              </CardTitle>
            </CardHeader>
            <CardPanel className="flex justify-between pt-0 text-[11px] text-muted-foreground">
              <span>Resp: Lucas Silva</span>
              <span>Prazo: 15/09/2026</span>
            </CardPanel>
          </Card>
        </div>

        {/* Rodapé do Aside / GitHub do Desenvolvedor */}
        <div className="relative z-10 pt-3 border-t border-border/40 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Desenvolvido por Kazbonfim</span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="gap-1.5 text-xs shadow-xs"
            render={
              <a
                href="https://github.com/Kazbonfim2"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GithubIcon className="size-3.5" />
            GitHub
          </Button>
        </div>
      </aside>

      {/* Painel Direito (60% Desktop, 100% Mobile) */}
      <section className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-4 sm:space-y-5">
          <div className="flex flex-col items-center text-center gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {titulo}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {subtitulo}
            </p>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
