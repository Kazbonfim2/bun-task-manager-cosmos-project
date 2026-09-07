import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { SelectSimples, type ItemSelect } from "@/components/SelectSimples";
import { FILTRO_STATUS_ITENS } from "@/lib/status";

interface DashboardToolbarProps {
  itensResponsavel: readonly ItemSelect[];
  filtroResponsavel: string;
  onMudarFiltroResponsavel: (valor: string) => void;
  filtroStatus: string;
  onMudarFiltroStatus: (valor: string) => void;
  modoVisualizacao: "lista" | "cards";
  onMudarModoVisualizacao: (modo: "lista" | "cards") => void;
  busca: string;
  onMudarBusca: (valor: string) => void;
  onAbrirNovoProjeto: () => void;
  onAbrirNovaDemanda: () => void;
}

export function DashboardToolbar({
  itensResponsavel,
  filtroResponsavel,
  onMudarFiltroResponsavel,
  filtroStatus,
  onMudarFiltroStatus,
  modoVisualizacao,
  onMudarModoVisualizacao,
  busca,
  onMudarBusca,
  onAbrirNovoProjeto,
  onAbrirNovaDemanda,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      {/* // Grupo 1: Filtros de Responsável, Status e Toggle de Visualização */}
      <div className="flex flex-wrap items-end gap-2.5 sm:gap-3">
        {/* // Filtro por responsável */}
        <Field className="flex-1 min-w-[130px] sm:flex-initial sm:w-48">
          <FieldLabel>Responsável</FieldLabel>
          <SelectSimples
            itens={itensResponsavel}
            valor={filtroResponsavel}
            aoMudar={onMudarFiltroResponsavel}
            placeholder="Responsável"
          />
        </Field>

        {/* // Filtro por status */}
        <Field className="flex-1 min-w-[120px] sm:flex-initial sm:w-44">
          <FieldLabel>Status</FieldLabel>
          <SelectSimples
            itens={FILTRO_STATUS_ITENS}
            valor={filtroStatus}
            aoMudar={onMudarFiltroStatus}
            placeholder="Status"
          />
        </Field>

        {/* // Alternador de modo de visualização (lista em tabela ou grade de cards) */}
        <div className="flex items-center rounded-lg border bg-muted p-0.5 shrink-0 h-9">
          <Button
            type="button"
            variant={modoVisualizacao === "lista" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2.5"
            onClick={() => onMudarModoVisualizacao("lista")}
            title="Visualização em lista"
            aria-label="Visualização em lista"
          >
            <List aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant={modoVisualizacao === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2.5"
            onClick={() => onMudarModoVisualizacao("cards")}
            title="Visualização em cards"
            aria-label="Visualização em cards"
          >
            <LayoutGrid aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>

      {/* // Grupo 2: Ações de criação (Novo projeto, Nova demanda) e Campo de Busca */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* // Botões de criação */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={onAbrirNovoProjeto}
            className="w-full sm:w-auto"
          >
            Novo projeto
          </Button>

          <Button
            type="button"
            onClick={onAbrirNovaDemanda}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden="true" />
            Nova demanda
          </Button>
        </div>

        {/* // Campo de busca em tempo real */}
        <InputGroup className="w-full sm:w-56 md:w-64">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="size-4" aria-hidden="true" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Buscar demandas..."
            value={busca}
            onChange={(evento) => onMudarBusca(evento.target.value)}
            aria-label="Buscar demandas"
          />
        </InputGroup>
      </div>
    </div>
  );
}
