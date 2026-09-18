import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { SelectSimples } from "@/components/SelectSimples";
import type { Demanda } from "@/lib/api";
import { demandaAtrasada, STATUS_ITENS } from "@/lib/status";
import { cn } from "@/lib/utils";

interface DemandasGridProps {
  demandas: Demanda[];
  busca: string;
  carregando?: boolean;
  onVisualizarDemanda: (id: string) => void;
  onTrocarStatus: (id: string, status: string) => void;
  onEditarDemanda: (demanda: Demanda) => void;
}

export function DemandasGrid({
  demandas,
  busca,
  carregando,
  onVisualizarDemanda,
  onTrocarStatus,
  onEditarDemanda,
}: DemandasGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {carregando ? (
        <div className="col-span-full flex min-h-48 items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground text-sm">
          Carregando demandas...
        </div>
      ) : demandas.length === 0 ? (
        <div className="col-span-full flex min-h-48 items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground text-sm">
          {busca ? "Nenhuma demanda encontrada para a busca." : "Nenhuma demanda nesta lista."}
        </div>
      ) : (
        demandas.map((demanda) => {
          const atrasada = demandaAtrasada(demanda.prazo, demanda.status);
          const statusInfo = STATUS_ITENS.find((s) => s.value === demanda.status);
          const StatusIcone = statusInfo?.icone;

          return (
            /* // Card individual de demanda */
            <Card
              key={demanda.id}
              className={cn(
                "flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                atrasada ? "border-destructive/40 bg-destructive/5" : "",
              )}
              onClick={() => onVisualizarDemanda(demanda.id)}
            >
              <CardHeader className="gap-2 pb-3">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <span
                    className="text-muted-foreground min-w-0 flex-1 truncate text-xs font-medium"
                    title={demanda.projeto_nome}
                  >
                    {demanda.projeto_nome}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {statusInfo ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
                          statusInfo.corBg,
                          statusInfo.corTexto,
                          statusInfo.corBorda,
                        )}
                      >
                        {StatusIcone ? (
                          <StatusIcone className="size-3 shrink-0" aria-hidden="true" />
                        ) : null}
                        {statusInfo.label}
                      </span>
                    ) : null}
                  </div>
                </div>
                <CardTitle
                  className="line-clamp-2 min-h-[2.5rem] break-words text-base font-medium leading-snug hover:underline"
                  title={demanda.titulo}
                >
                  <span>{demanda.titulo}</span>
                  {atrasada && (
                    <span className="relative inline-flex size-2 shrink-0 align-middle ml-1.5 -translate-y-0.5" title="Demanda em atraso">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-destructive" />
                    </span>
                  )}
                </CardTitle>
                {demanda.descricao ? (
                  <p
                    className="line-clamp-2 text-xs text-muted-foreground"
                    title={demanda.descricao}
                  >
                    {demanda.descricao}
                  </p>
                ) : null}
              </CardHeader>
              <CardPanel className="flex flex-col gap-3 pt-0">
                <div className="text-muted-foreground flex flex-col gap-1 text-xs">
                  <div className="truncate" title={demanda.responsavel_nome}>
                    <span className="text-foreground font-medium">Responsável:</span>{" "}
                    {demanda.responsavel_nome}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">Prazo:</span>{" "}
                    {demanda.prazo.slice(0, 10)}
                  </div>
                </div>
                <div
                  className="flex items-center justify-between gap-2 border-t pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex-1 min-w-0">
                    {/* // Seletor de status dentro do card */}
                    <SelectSimples
                      itens={STATUS_ITENS}
                      valor={demanda.status}
                      aoMudar={(status) => onTrocarStatus(demanda.id, status)}
                      placeholder="Status"
                    />
                  </div>
                  {/* // Botão de edição dentro do card */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEditarDemanda(demanda)}
                  >
                    Editar
                  </Button>
                </div>
              </CardPanel>
            </Card>
          );
        })
      )}
    </div>
  );
}
