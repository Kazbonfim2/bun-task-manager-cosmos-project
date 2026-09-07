import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { SelectSimples } from "@/components/SelectSimples";
import type { Demanda } from "@/lib/api";
import { demandaAtrasada, STATUS_ITENS } from "@/lib/status";
import { cn } from "@/lib/utils";

interface DemandasTabelaProps {
  demandas: Demanda[];
  busca: string;
  carregando?: boolean;
  onVisualizarDemanda: (id: string) => void;
  onTrocarStatus: (id: string, status: string) => void;
  onEditarDemanda: (demanda: Demanda) => void;
}

export function DemandasTabela({
  demandas,
  busca,
  carregando,
  onVisualizarDemanda,
  onTrocarStatus,
  onEditarDemanda,
}: DemandasTabelaProps) {
  return (
    <Table variant="card" className="min-w-[680px]">
      {/* // Cabeçalho da tabela de demandas */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-36">Projeto</TableHead>
          <TableHead className="min-w-[200px] max-w-xs">Descrição</TableHead>
          <TableHead className="w-32">Responsável</TableHead>
          <TableHead className="w-28">Prazo</TableHead>
          <TableHead className="w-44">Status</TableHead>
          <TableHead className="w-20 text-end">Ações</TableHead>
        </TableRow>
      </TableHeader>
      {/* // Corpo da tabela de demandas paginadas */}
      <TableBody>
        {carregando ? (
          <TableRow>
            <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
              Carregando demandas...
            </TableCell>
          </TableRow>
        ) : demandas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
              {busca ? "Nenhuma demanda encontrada para a busca." : "Nenhuma demanda nesta lista."}
            </TableCell>
          </TableRow>
        ) : (
          demandas.map((demanda) => {
            const atrasada = demandaAtrasada(demanda.prazo, demanda.status);
            return (
              <TableRow
                key={demanda.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  atrasada ? "bg-destructive/6" : undefined,
                )}
                onClick={() => onVisualizarDemanda(demanda.id)}
              >
                <TableCell className="max-w-[144px]">
                  <span className="block truncate font-medium" title={demanda.projeto_nome}>
                    {demanda.projeto_nome}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs md:max-w-sm">
                  <div className="flex flex-col gap-1">
                    {/* // Tooltip com descrição completa ao fazer hover */}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="block truncate cursor-pointer font-medium hover:underline">
                            {demanda.descricao}
                          </span>
                        }
                      />
                      <TooltipPopup className="max-w-xs sm:max-w-sm whitespace-normal break-words">
                        {demanda.descricao}
                      </TooltipPopup>
                    </Tooltip>
                    {atrasada ? (
                      <Badge variant="destructive" className="w-fit">
                        Atrasada
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-[128px]">
                  <span className="block truncate" title={demanda.responsavel_nome}>
                    {demanda.responsavel_nome}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">{demanda.prazo.slice(0, 10)}</TableCell>
                <TableCell className="w-44" onClick={(e) => e.stopPropagation()}>
                  {/* // Seletor rápido de status em linha */}
                  <SelectSimples
                    itens={STATUS_ITENS}
                    valor={demanda.status}
                    aoMudar={(status) => onTrocarStatus(demanda.id, status)}
                    placeholder="Status"
                  />
                </TableCell>
                <TableCell className="w-20 text-end" onClick={(e) => e.stopPropagation()}>
                  {/* // Botão de edição da demanda */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEditarDemanda(demanda)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
