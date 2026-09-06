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
  onVisualizarDemanda: (id: string) => void;
  onTrocarStatus: (id: string, status: string) => void;
  onEditarDemanda: (demanda: Demanda) => void;
}

export function DemandasTabela({
  demandas,
  busca,
  onVisualizarDemanda,
  onTrocarStatus,
  onEditarDemanda,
}: DemandasTabelaProps) {
  return (
    <Table variant="card">
      {/* // Cabeçalho da tabela de demandas */}
      <TableHeader>
        <TableRow>
          <TableHead>Projeto</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Prazo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-end">Ações</TableHead>
        </TableRow>
      </TableHeader>
      {/* // Corpo da tabela de demandas paginadas */}
      <TableBody>
        {demandas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-muted-foreground text-center">
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
                <TableCell className="font-medium">{demanda.projeto_nome}</TableCell>
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
                <TableCell>{demanda.responsavel_nome}</TableCell>
                <TableCell>{demanda.prazo.slice(0, 10)}</TableCell>
                <TableCell className="min-w-44" onClick={(e) => e.stopPropagation()}>
                  {/* // Seletor rápido de status em linha */}
                  <SelectSimples
                    itens={STATUS_ITENS}
                    valor={demanda.status}
                    aoMudar={(status) => onTrocarStatus(demanda.id, status)}
                    placeholder="Status"
                  />
                </TableCell>
                <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
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
