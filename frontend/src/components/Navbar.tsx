import {
  Bell,
  Building2,
  Check,
  CheckCheck,
  ChevronDown,
  LogOut,
  Moon,
  Plus,
  Snowflake,
  Sun,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, type Grupo, type Notificacao } from "@/lib/api";
import {
  lerGrupoAtivo,
  lerUsuario,
  limparSessao,
  salvarGrupoAtivo,
} from "@/lib/auth";
import { DialogCriarGrupo } from "./DialogCriarGrupo";
import { DialogEntrarGrupo } from "./DialogEntrarGrupo";
import { DialogGerenciarGrupo } from "./DialogGerenciarGrupo";

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
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoAtivo, setGrupoAtivo] = useState<Grupo | null>(null);

  const [dialogGerenciar, setDialogGerenciar] = useState(false);
  const [dialogCriar, setDialogCriar] = useState(false);
  const [dialogEntrar, setDialogEntrar] = useState(false);

  const [escuro, setEscuro] = useState(() => {
    return (
      localStorage.getItem("tema") === "dark" ||
      (!("tema" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  async function carregarGrupos() {
    if (!usuario) return;
    try {
      const lista = await api<Grupo[]>("/grupos");
      setGrupos(lista);

      const idSalvo = lerGrupoAtivo();
      const encontrado = lista.find((g) => g.id === idSalvo);
      if (encontrado) {
        setGrupoAtivo(encontrado);
      } else if (lista.length > 0) {
        salvarGrupoAtivo(lista[0].id);
        setGrupoAtivo(lista[0]);
      } else {
        setGrupoAtivo(null);
      }
    } catch {
      // Silencioso
    }
  }

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
    carregarGrupos();
    carregarNotificacoes();

    const onFocus = () => {
      carregarGrupos();
      carregarNotificacoes();
    };

    const onGrupoAlterado = () => {
      carregarGrupos();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("orion:grupo-alterado", onGrupoAlterado);

    const intervalo = setInterval(carregarNotificacoes, 15_000);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("orion:grupo-alterado", onGrupoAlterado);
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

  function selecionarGrupo(g: Grupo) {
    salvarGrupoAtivo(g.id);
    setGrupoAtivo(g);
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer focus:outline-hidden"
            >
              <Snowflake
                className="size-6 text-primary shrink-0 animate-sway"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <span className="text-sm font-semibold tracking-tight text-foreground block truncate">
                  Orion
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:block">
                  Gestão de Demandas
                </span>
              </div>
            </button>

            {/* Seletor de Grupo de Trabalho (Workspace Tenancy) */}
            {usuario && (
              <div className="flex items-center gap-1">
                <div className="h-4 w-px bg-border shrink-0 mx-1" aria-hidden="true" />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="h-8 max-w-48 sm:max-w-64 gap-1.5 px-2.5 font-medium border-border/80 bg-muted/30 hover:bg-muted/70 shadow-2xs"
                      />
                    }
                  >
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <span className="truncate text-xs text-foreground font-semibold">
                      {grupoAtivo ? grupoAtivo.nome : "Selecionar Grupo"}
                    </span>
                    <ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="w-64 p-1.5">
                    <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">
                      Seus Grupos de Trabalho
                    </DropdownMenuLabel>

                    {grupos.map((g) => {
                      const ehAtivo = grupoAtivo?.id === g.id;
                      return (
                        <DropdownMenuItem
                          key={g.id}
                          onClick={() => selecionarGrupo(g)}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                            <span className={`truncate ${ehAtivo ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                              {g.nome}
                            </span>
                          </div>
                          {ehAtivo && <Check className="size-3.5 text-primary shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}

                    {grupos.length === 0 && (
                      <div className="px-2 py-2 text-xs text-muted-foreground text-center">
                        Nenhum grupo vinculado
                      </div>
                    )}

                    <DropdownMenuSeparator />

                    {grupoAtivo && (
                      <DropdownMenuItem
                        onClick={() => setDialogGerenciar(true)}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs text-foreground font-medium"
                      >
                        <Users className="size-3.5 text-primary" />
                        <span>Gerenciar Grupo & Convites</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => setDialogCriar(true)}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs text-primary font-medium"
                    >
                      <Plus className="size-3.5" />
                      <span>Criar Novo Grupo (+5 convites)</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setDialogEntrar(true)}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground font-medium"
                    >
                      <Ticket className="size-3.5" />
                      <span>Entrar com Código de Convite</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
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

      {/* Modais de Tenancy / Grupos */}
      <DialogGerenciarGrupo
        aberto={dialogGerenciar}
        onFechar={() => setDialogGerenciar(false)}
        grupo={grupoAtivo}
      />

      <DialogCriarGrupo
        aberto={dialogCriar}
        onFechar={() => setDialogCriar(false)}
        onCriado={(novo) => {
          setGrupoAtivo(novo);
          carregarGrupos();
        }}
      />

      <DialogEntrarGrupo
        aberto={dialogEntrar}
        onFechar={() => setDialogEntrar(false)}
        onEntrou={(novo) => {
          setGrupoAtivo(novo);
          carregarGrupos();
        }}
      />
    </>
  );
}

