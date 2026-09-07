import { Bell, CheckCheck, LogOut, Moon, Snowflake, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, type Notificacao } from "@/lib/api";
import { lerUsuario, limparSessao } from "@/lib/auth";

function obterIniciais(nome?: string, email?: string): string {
  const chave = (nome || email || "U").trim();
  const partes = chave.split(" ").filter(Boolean);
  return partes.length > 1
    ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
    : chave.slice(0, 2).toUpperCase();
}

function formatarTempo(iso: string): string {
  try {
    const data = new Date(iso);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function Navbar() {
  useLocation();
  const navigate = useNavigate();
  const usuario = lerUsuario();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [escuro, setEscuro] = useState(() => {
    return (
      localStorage.getItem("tema") === "dark" ||
      (!("tema" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  async function carregarNotificacoes() {
    if (!usuario) return;
    try {
      const lista = await api<Notificacao[]>("/notificacoes");
      setNotificacoes(lista);
    } catch {
      // Silencioso para não poluir UI
    }
  }

  useEffect(() => {
    if (!usuario) return;
    carregarNotificacoes();
    const intervalo = setInterval(carregarNotificacoes, 30_000);
    return () => clearInterval(intervalo);
  }, [usuario?.id]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    localStorage.setItem("tema", escuro ? "dark" : "light");
  }, [escuro]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  async function marcarTodasLidas() {
    try {
      await api("/notificacoes/ler-todas", { method: "PATCH" });
      setNotificacoes((anteriores) =>
        anteriores.map((n) => ({ ...n, lida: true }))
      );
    } catch {
      // Ignorar falha
    }
  }

  async function abrirNotificacao(notificacao: Notificacao) {
    if (!notificacao.lida) {
      setNotificacoes((anteriores) =>
        anteriores.map((n) =>
          n.id === notificacao.id ? { ...n, lida: true } : n
        )
      );
      api(`/notificacoes/${notificacao.id}/lida`, { method: "PATCH" }).catch(
        () => {}
      );
    }
    if (notificacao.demanda_id) {
      navigate(`/demandas/${notificacao.demanda_id}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <Snowflake className="size-6 text-primary shrink-0 animate-sway" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="font-heading text-lg sm:text-xl font-semibold leading-none truncate">
              PolarisTasks
            </h1>
            {/* <p className="text-muted-foreground text-xs hidden sm:block">
              Sistema Gerenciador de Demandas v0.1
            </p> */}
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
            {usuario ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="relative"
                      aria-label={`Notificações (${naoLidas} não lidas)`}
                      title="Notificações"
                    />
                  }
                >
                  <Bell className="size-4" aria-hidden="true" />
                  {naoLidas > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                      {naoLidas > 9 ? "9+" : naoLidas}
                    </span>
                  ) : null}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
                  <div className="flex items-center justify-between p-3 border-b">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                      Notificações
                    </DropdownMenuLabel>
                    {naoLidas > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={marcarTodasLidas}
                        className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7 px-2"
                      >
                        <CheckCheck className="size-3.5" />
                        Ler todas
                      </Button>
                    ) : null}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                    {notificacoes.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      notificacoes.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          onClick={() => abrirNotificacao(n)}
                          className={`flex flex-col items-start gap-1 p-3 cursor-pointer text-left ${
                            !n.lida ? "bg-primary/5 font-medium" : "opacity-80"
                          }`}
                        >
                          <div className="flex w-full items-start justify-between gap-2">
                            <span className="text-xs text-foreground leading-snug">
                              {n.mensagem}
                            </span>
                            {!n.lida ? (
                              <span className="size-2 shrink-0 rounded-full bg-primary mt-1" />
                            ) : null}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {formatarTempo(n.criado_em)}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

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
