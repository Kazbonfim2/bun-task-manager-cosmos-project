import { LogOut, Moon, Snowflake, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { lerUsuario, limparSessao } from "@/lib/auth";

export function Navbar() {
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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Snowflake className="size-4.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-lg sm:text-xl font-semibold leading-none truncate">PolarisTasks</h1>
            <p className="text-muted-foreground text-xs hidden sm:block">Sistema Gerenciador de Demandas v0.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setEscuro((prev) => !prev)}
            aria-label="Alternar tema"
            title={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
          >
            {escuro ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </Button>

          {usuario ? (
            <>
              <span className="text-muted-foreground text-sm hidden sm:inline truncate max-w-40">
                {usuario.nome_completo}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  limparSessao();
                  window.location.assign("/login");
                }}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sair
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
