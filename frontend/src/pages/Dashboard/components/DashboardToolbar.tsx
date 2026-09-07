import {
  ChevronDown,
  Download,
  FolderPlus,
  LayoutGrid,
  List,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  itensProjeto: readonly ItemSelect[];
  filtroProjeto: string;
  onMudarFiltroProjeto: (valor: string) => void;
  filtroStatus: string;
  onMudarFiltroStatus: (valor: string) => void;
  modoVisualizacao: "lista" | "cards";
  onMudarModoVisualizacao: (modo: "lista" | "cards") => void;
  busca: string;
  onMudarBusca: (valor: string) => void;
  onAbrirNovoProjeto: () => void;
  onAbrirNovaDemanda: () => void;
  onExportarCsv: () => void;
}

export function DashboardToolbar({
  itensResponsavel,
  filtroResponsavel,
  onMudarFiltroResponsavel,
  itensProjeto,
  filtroProjeto,
  onMudarFiltroProjeto,
  filtroStatus,
  onMudarFiltroStatus,
  modoVisualizacao,
  onMudarModoVisualizacao,
  busca,
  onMudarBusca,
  onAbrirNovoProjeto,
  onAbrirNovaDemanda,
  onExportarCsv,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      {/* // Grupo 1: Filtros de Projeto, Responsável e Status em linha única minimalista */}
      <div className="flex items-end gap-2 sm:gap-3 flex-nowrap w-full lg:w-auto">
        {/* // Filtro por projeto */}
        <Field className="flex-1 sm:flex-initial sm:w-40 min-w-0">
          <FieldLabel>Projeto</FieldLabel>
          <SelectSimples
            itens={itensProjeto}
            valor={filtroProjeto}
            aoMudar={onMudarFiltroProjeto}
            placeholder="Projeto"
          />
        </Field>

        {/* // Filtro por responsável */}
        <Field className="flex-1 sm:flex-initial sm:w-40 min-w-0">
          <FieldLabel>Responsável</FieldLabel>
          <SelectSimples
            itens={itensResponsavel}
            valor={filtroResponsavel}
            aoMudar={onMudarFiltroResponsavel}
            placeholder="Responsável"
          />
        </Field>

        {/* // Filtro por status */}
        <Field className="flex-1 sm:flex-initial sm:w-36 min-w-0">
          <FieldLabel>Status</FieldLabel>
          <SelectSimples
            itens={FILTRO_STATUS_ITENS}
            valor={filtroStatus}
            aoMudar={onMudarFiltroStatus}
            placeholder="Status"
          />
        </Field>
      </div>

      {/* // Grupo 2: Ações agrupadas (Nova demanda + Dropdown com Novo Projeto & Exportar CSV, Toggle lista/cards e Busca) */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* // Split Button: Nova Demanda + Menu suspenso de ações secundárias */}
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
                  aria-label="Mais opções"
                />
              }
            >
              <ChevronDown aria-hidden="true" className="size-4" />
            </DropdownMenuTrigger>
          </Group>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAbrirNovoProjeto}>
              <FolderPlus aria-hidden="true" className="size-4" />
              Novo / Gerenciar projetos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportarCsv}>
              <Download aria-hidden="true" className="size-4" />
              Exportar CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* // Alternador de visualização lista/cards */}
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
        <InputGroup className="w-full sm:w-52 md:w-60">
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
