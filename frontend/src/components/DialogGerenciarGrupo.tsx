import { AlertCircle, AlertTriangle, Check, Copy, Ticket, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { api, type Convite, type Grupo, type MembroGrupo } from "@/lib/api";
import { lerUsuario } from "@/lib/auth";
import { copiarTexto } from "@/lib/utils";

interface DialogGerenciarGrupoProps {
  aberto: boolean;
  onFechar: () => void;
  grupo: Grupo | null;
}

export function DialogGerenciarGrupo({
  aberto,
  onFechar,
  grupo,
}: DialogGerenciarGrupoProps) {
  const [abaAtiva, setAbaAtiva] = useState<"convites" | "membros">("convites");
  const [convites, setConvites] = useState<Convite[]>([]);
  const [membros, setMembros] = useState<MembroGrupo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [membroExcluir, setMembroExcluir] = useState<MembroGrupo | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemover, setErroRemover] = useState("");

  const ehDono = !!grupo && lerUsuario()?.id === grupo.dono_id;

  useEffect(() => {
    if (!aberto || !grupo?.id) return;
    async function carregarDados() {
      setCarregando(true);
      try {
        const [listaConvites, listaMembros] = await Promise.all([
          api<Convite[]>(`/grupos/${grupo!.id}/convites`),
          api<MembroGrupo[]>(`/grupos/${grupo!.id}/membros`),
        ]);
        setConvites(listaConvites);
        setMembros(listaMembros);
      } catch (e) {
        console.error("Erro ao carregar dados do grupo", e);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [aberto, grupo?.id]);

  async function copiarCodigo(convite: Convite) {
    if (await copiarTexto(convite.codigo)) {
      setCopiadoId(convite.id);
      setTimeout(() => setCopiadoId(null), 2000);
    }
  }

  async function removerMembro() {
    if (!membroExcluir || !grupo) return;
    setRemovendo(true);
    setErroRemover("");
    try {
      await api(`/grupos/${grupo.id}/membros/${membroExcluir.usuario_id}`, { method: "DELETE" });
      setMembros((atuais) => atuais.filter((m) => m.usuario_id !== membroExcluir.usuario_id));
      setMembroExcluir(null);
      window.dispatchEvent(new CustomEvent("orion:grupo-alterado"));
    } catch (falha) {
      setErroRemover(falha instanceof Error ? falha.message : "Falha ao remover membro");
    } finally {
      setRemovendo(false);
    }
  }

  const disponiveis = convites.filter((c) => c.status === "disponivel").length;

  return (
    <Dialog open={aberto} onOpenChange={(abertoState) => !abertoState && onFechar()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Users className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {grupo?.nome ?? "Grupo de Trabalho"}
              </DialogTitle>
              <DialogDescription>
                Gerencie membros da equipe e compartilhe os códigos de convite
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-2 border-b px-4 sm:px-6 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setAbaAtiva("convites")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${abaAtiva === "convites"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Ticket className="size-3.5" />
            Convites ({disponiveis} disponíveis)
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("membros")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${abaAtiva === "membros"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Users className="size-3.5" />
            Membros ({membros.length})
          </button>
        </div>

        <DialogPanel className="pt-3">
          {carregando ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Carregando informações do grupo...
            </div>
          ) : abaAtiva === "convites" ? (
            <div className="space-y-3">
              <div className="bg-muted/40 p-3 rounded-lg border text-xs text-muted-foreground flex items-center justify-between gap-2">
                <span>
                  Cada grupo recebe <strong>05 convites</strong> exclusivos.
                </span>
                <Badge variant={disponiveis > 0 ? "default" : "secondary"} className="shrink-0">
                  {disponiveis}/5 disponíveis
                </Badge>
              </div>

              {convites.map((c, index) => {
                const ehCopiado = copiadoId === c.id;
                const usado = c.status === "usado";

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all gap-2 ${usado
                      ? "bg-muted/30 border-dashed border-border/80 opacity-70"
                      : "bg-card border-border hover:border-primary/40 shadow-xs"
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold tracking-wider text-foreground">
                          {c.codigo}
                        </span>
                        {usado ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            Utilizado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 h-4">
                            Disponível
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {usado
                          ? `Usado por ${c.usado_por_nome || "Membro"} em ${new Date(c.usado_em || c.criado_em).toLocaleDateString("pt-BR")}`
                          : `Convite #${index + 1} para novo integrante`}
                      </p>
                    </div>

                    {!usado && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => copiarCodigo(c)}
                          className="gap-1 text-xs"
                          title="Copiar apenas o código"
                        >
                          {ehCopiado ? (
                            <>
                              <Check className="size-3 text-emerald-500" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {membros.map((m) => (
                <div
                  key={m.usuario_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {m.nome_completo}
                      </span>
                      {m.eh_dono && (
                        <Badge variant="default" className="text-[10px] gap-1 px-1.5 py-0 h-4 bg-amber-500 hover:bg-amber-600 shrink-0">
                          Dono
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      Entrou em {new Date(m.entrou_em).toLocaleDateString("pt-BR")}
                    </span>
                    {/* Só o dono remove membros; o próprio dono não pode ser removido */}
                    {ehDono && !m.eh_dono && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => {
                          setErroRemover("");
                          setMembroExcluir(m);
                        }}
                        title="Remover membro"
                        aria-label={`Remover ${m.nome_completo} do grupo`}
                        className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogPanel>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onFechar} className="w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirmação de remoção de membro (ação destrutiva, só dono) */}
      <Dialog
        open={!!membroExcluir}
        onOpenChange={(aberto) => !aberto && !removendo && setMembroExcluir(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <DialogTitle>Remover membro</DialogTitle>
                <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogPanel className="space-y-3">
            <p className="text-sm text-foreground">
              Remover <strong>{membroExcluir?.nome_completo}</strong> do grupo{" "}
              <strong>{grupo?.nome}</strong>? Os projetos e demandas do grupo não são afetados. O
              membro será notificado.
            </p>
            {erroRemover && (
              <div className="flex items-center gap-2 rounded-lg p-3 text-xs border bg-destructive/10 border-destructive/20 text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{erroRemover}</span>
              </div>
            )}
          </DialogPanel>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMembroExcluir(null)}
              disabled={removendo}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removerMembro}
              disabled={removendo}
              className="w-full sm:w-auto gap-1.5"
            >
              {removendo ? (
                <>
                  <Spinner className="size-3.5" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  Remover
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
