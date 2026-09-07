import { LogOut, Moon, Snowflake, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { lerUsuario, limparSessao } from "@/lib/auth";

function obterIniciais(nome?: string, email?: string): string {
  const chave = (nome || email || "U").trim();
  const partes = chave.split(" ").filter(Boolean);
  return partes.length > 1
    ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
    : chave.slice(0, 2).toUpperCase();
}

export function Navbar() {
  useLocation();
  const usuario = lerUsuario();
  const [escuro, setEscuro] = useState(() => {
    return (
      localStorage.getItem("tema") === "dark" ||
      (!("tema" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    localStorage.setItem("tema", escuro ? "dark" : "light");
  }, [escuro]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <Snowflake className="size-6 text-primary shrink-0 animate-sway" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="font-heading text-lg sm:text-xl font-semibold leading-none truncate">
              PolarisTasks
            </h1>
            <p className="text-muted-foreground text-xs hidden sm:block">
              Sistema Gerenciador de Demandas v0.1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {usuario ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="size-8 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold select-none shadow-xs"
                aria-hidden="true"
              >
                {obterIniciais(usuario.nome_completo, usuario.email)}
              </div>
              <div className="hidden min-w-0 sm:flex flex-col text-left">
                <span className="truncate text-xs font-semibold leading-tight text-foreground max-w-36">
                  {usuario.nome_completo}
                </span>
                <span className="truncate text-[11px] leading-tight text-muted-foreground max-w-36">
                  {usuario.email}
                </span>
              </div>
            </div>
          ) : null}

          {usuario ? (
            <div className="h-4 w-px bg-border shrink-0" aria-hidden="true" />
          ) : null}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setEscuro((prev) => !prev)}
              aria-label="Alternar tema"
              title={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
            >
              {escuro ? (
                <Sun className="size-4 text-amber-500" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>

            {usuario ? (
              <>
                <div className="h-4 w-px bg-border shrink-0" aria-hidden="true" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    limparSessao();
                    window.location.assign("/login");
                  }}
                  title="Encerrar sessão"
                  className="gap-1.5"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
