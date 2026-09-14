import { Check, Copy, Crown, Share2, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type Convite, type Grupo, type MembroGrupo } from "@/lib/api";

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

  function copiarCodigo(convite: Convite) {
    navigator.clipboard.writeText(convite.codigo);
    setCopiadoId(convite.id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  function copiarConviteCompleto(convite: Convite) {
    const texto = `Participe do grupo "${grupo?.nome}" no Orion!\nCódigo de convite: ${convite.codigo}`;
    navigator.clipboard.writeText(texto);
    setCopiadoId(`full-${convite.id}`);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  const disponiveis = convites.filter((c) => c.status === "disponivel").length;

  return (
    <Dialog open={aberto} onOpenChange={(abertoState) => !abertoState && onFechar()}>
      <DialogContent className="max-w-xl w-full p-6 sm:p-7">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold">
                {grupo?.nome ?? "Grupo de Trabalho"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Gerencie membros da equipe e compartilhe os códigos de convite
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-2 border-b mt-3 pb-2">
          <button
            type="button"
            onClick={() => setAbaAtiva("convites")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              abaAtiva === "convites"
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
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              abaAtiva === "membros"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Users className="size-3.5" />
            Membros ({membros.length})
          </button>
        </div>

        <div className="mt-4 min-h-60 max-h-80 overflow-y-auto pr-1">
          {carregando ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Carregando informações do grupo...
            </div>
          ) : abaAtiva === "convites" ? (
            <div className="space-y-3">
              <div className="bg-muted/40 p-3 rounded-lg border text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Cada grupo recebe <strong>05 convites</strong> exclusivos. Os convites usados não podem ser reutilizados.
                </span>
                <Badge variant={disponiveis > 0 ? "default" : "secondary"} className="shrink-0 ml-2">
                  {disponiveis}/5 disponíveis
                </Badge>
              </div>

              {convites.map((c, index) => {
                const ehCopiado = copiadoId === c.id || copiadoId === `full-${c.id}`;
                const usado = c.status === "usado";

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      usado
                        ? "bg-muted/30 border-dashed border-border/80 opacity-70"
                        : "bg-card border-border hover:border-primary/40 shadow-xs"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
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
                      <p className="text-[11px] text-muted-foreground mt-0.5">
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
                          {copiadoId === c.id ? (
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => copiarConviteCompleto(c)}
                          title="Copiar mensagem completa de convite"
                        >
                          <Share2 className="size-3.5" />
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
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {m.nome_completo}
                      </span>
                      {m.eh_dono && (
                        <Badge variant="default" className="text-[10px] gap-1 px-1.5 py-0 h-4 bg-amber-500 hover:bg-amber-600">
                          <Crown className="size-2.5" />
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
        </div>

        <div className="flex justify-end pt-3 border-t mt-4">
          <Button type="button" variant="outline" size="sm" onClick={onFechar}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
