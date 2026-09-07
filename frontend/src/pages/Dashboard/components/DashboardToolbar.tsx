import { ChevronDown, FolderPlus, LayoutGrid, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Group } from "@/components/ui/group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
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
      {/* // Grupo 1: Filtros de Responsável e Status */}
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
      </div>

      {/* // Grupo 2: Ações agrupadas (Split Button de criação, ToggleGroup lista/cards) e Busca */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* // Split Button: Ação principal (Nova demanda) + Menu secundário (Novo projeto) */}
        <DropdownMenu>
          <Group className="w-full sm:w-auto">
            <Button
              type="button"
              onClick={onAbrirNovaDemanda}
              className="flex-1 sm:flex-initial"
            >
              <Plus aria-hidden="true" />
              Nova demanda
            </Button>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  className="px-2 border-s border-primary-foreground/20"
                  aria-label="Mais opções de criação"
                />
              }
            >
              <ChevronDown aria-hidden="true" className="size-4" />
            </DropdownMenuTrigger>
          </Group>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAbrirNovoProjeto}>
              <FolderPlus aria-hidden="true" className="size-4" />
              Novo projeto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* // ToggleGroup de alternância de visualização (pill/segmented control) */}
        <ToggleGroup
          type="single"
          value={modoVisualizacao}
          onValueChange={(valor) => {
            if (valor) onMudarModoVisualizacao(valor as "lista" | "cards");
          }}
          className="hidden sm:inline-flex"
          aria-label="Modo de visualização"
        >
          <ToggleGroupItem
            value="lista"
            aria-label="Visualização em lista"
            title="Visualização em lista"
          >
            <List aria-hidden="true" className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="cards"
            aria-label="Visualização em cards"
            title="Visualização em cards"
          >
            <LayoutGrid aria-hidden="true" className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>

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
