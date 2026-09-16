import { Check, Copy, Ticket, Users } from "lucide-react";
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
import { api, type Convite, type Grupo, type MembroGrupo } from "@/lib/api";
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
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    Entrou em {new Date(m.entrou_em).toLocaleDateString("pt-BR")}
                  </span>
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
    </Dialog>
  );
}
