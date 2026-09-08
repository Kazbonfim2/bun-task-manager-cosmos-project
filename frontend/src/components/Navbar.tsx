import { Bell, Check, CheckCheck, LogOut, Moon, Snowflake, Sun } from "lucide-react";
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
  const location = useLocation();
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
    const onFocus = () => carregarNotificacoes();
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);
    const intervalo = setInterval(carregarNotificacoes, 15_000);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, [usuario?.id, location.key]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    localStorage.setItem("tema", escuro ? "dark" : "light");
  }, [escuro]);

  const naoLidas = notificacoes.length;

  async function marcarTodasLidas() {
    setNotificacoes([]);
    try {
      await api("/notificacoes/ler-todas", { method: "PATCH" });
    } catch {
      // Ignorar falha
    }
  }

  async function marcarComoLida(id: string) {
    setNotificacoes((anteriores) => anteriores.filter((n) => n.id !== id));
    try {
      await api(`/notificacoes/${id}`, { method: "DELETE" });
    } catch {
      // Ignorar falha
    }
  }

  async function abrirNotificacao(notificacao: Notificacao) {
    marcarComoLida(notificacao.id);
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
            <span className="text-sm font-semibold tracking-tight text-foreground block truncate">
              Orion
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Gestão de Demandas
            </span>
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
                    aria-label={`Notificações (${naoLidas} não lidas)`}
                    title="Notificações"
                  />
                }
              >
                <Bell
                  className={`size-4 origin-top transition-colors ${
                    naoLidas > 0
                      ? "text-yellow-500 fill-yellow-500/20 dark:text-yellow-400 dark:fill-yellow-400/20 animate-bell"
                      : ""
                  }`}
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
                <div className="flex items-center justify-between p-3 border-b">
                  <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                    Notificações
                  </DropdownMenuLabel>
                  {notificacoes.length > 0 ? (
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
                      <div
                        key={n.id}
                        className="flex items-start justify-between gap-2 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => abrirNotificacao(n)}
                          className="flex flex-col items-start gap-1 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <span className="text-xs text-foreground leading-snug">
                            {n.mensagem}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatarTempo(n.criado_em)}
                          </span>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => marcarComoLida(n.id)}
                          className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                          title="Marcar como lida"
                          aria-label="Marcar como lida"
                        >
                          <Check className="size-3.5" />
                        </Button>
                      </div>
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
