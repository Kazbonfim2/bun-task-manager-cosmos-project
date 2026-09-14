import {
  ChevronDown,
  Download,
  FolderPlus,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
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
  const temFiltroAtivo =
    filtroResponsavel !== "todos" ||
    filtroProjeto !== "todos" ||
    filtroStatus !== "todos" ||
    busca.trim().length > 0;

  const totalFiltrosDropdownAtivos =
    (filtroResponsavel !== "todos" ? 1 : 0) +
    (filtroProjeto !== "todos" ? 1 : 0) +
    (filtroStatus !== "todos" ? 1 : 0);

  function limparTodosFiltros() {
    onMudarFiltroProjeto("todos");
    onMudarFiltroResponsavel("todos");
    onMudarFiltroStatus("todos");
    onMudarBusca("");
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
        {/* // Seção de Filtros: Mobile-first responsive grid com cabeçalho de contagem e botão de reset */}
        <div className="order-2 flex flex-col gap-2 w-full lg:order-1 lg:w-auto">
          {/* // Cabeçalho de filtros para telas mobile */}
          <div className="flex items-center justify-between sm:hidden">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Filtros</span>
              {totalFiltrosDropdownAtivos > 0 ? (
                <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px] font-medium">
                  {totalFiltrosDropdownAtivos} {totalFiltrosDropdownAtivos === 1 ? "ativo" : "ativos"}
                </Badge>
              ) : null}
            </div>

            {temFiltroAtivo ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={limparTodosFiltros}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                title="Limpar filtros"
                aria-label="Limpar todos os filtros"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          {/* // Grid de selects: 1 coluna no mobile portrait (<480px), 3 colunas em landscape (>=480px) ou inline flex em desktop */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-2.5 sm:flex sm:items-end sm:gap-3 w-full lg:w-auto">
            {/* // Filtro por projeto */}
            <Field className="w-full sm:w-44 min-w-0">
              <FieldLabel className="text-xs">Projeto</FieldLabel>
              <SelectSimples
                itens={itensProjeto}
                valor={filtroProjeto}
                aoMudar={onMudarFiltroProjeto}
                placeholder="Projeto"
              />
            </Field>

            {/* // Filtro por responsável */}
            <Field className="w-full sm:w-44 min-w-0">
              <FieldLabel className="text-xs">Responsável</FieldLabel>
              <SelectSimples
                itens={itensResponsavel}
                valor={filtroResponsavel}
                aoMudar={onMudarFiltroResponsavel}
                placeholder="Responsável"
              />
            </Field>

            {/* // Filtro por status */}
            <Field className="w-full sm:w-36 min-w-0">
              <FieldLabel className="text-xs">Status</FieldLabel>
              <SelectSimples
                itens={FILTRO_STATUS_ITENS}
                valor={filtroStatus}
                aoMudar={onMudarFiltroStatus}
                placeholder="Status"
              />
            </Field>

            {/* // Botão de limpar filtros em desktop/tablet */}
            {temFiltroAtivo ? (
              <div className="hidden sm:flex sm:items-center">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={limparTodosFiltros}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label="Limpar todos os filtros"
                      />
                    }
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipPopup>Limpar filtros</TooltipPopup>
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>

        {/* // Seção de Ações e Busca: No mobile tem destaque prioritário, no desktop alinha à direita */}
        <div className="order-1 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end lg:order-2">
          {/* // Split Button: Nova Demanda + Dropdown de ações secundárias */}
          <DropdownMenu>
            <Group className="w-full sm:w-auto">
              <Button
                type="button"
                onClick={onAbrirNovaDemanda}
                className="flex-1 sm:flex-initial"
              >
                <Plus aria-hidden="true" className="size-4" />
                Nova demanda
              </Button>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    className="px-2 border-s border-primary-foreground/20"
                    aria-label="Mais opções de cadastro e exportação"
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

          {/* // Alternador de visualização lista/cards (exibido apenas a partir de telas sm) */}
          <ToggleGroup
            type="single"
            value={modoVisualizacao}
            onValueChange={(valor) => {
              if (valor) onMudarModoVisualizacao(valor as "lista" | "cards");
            }}
            className="hidden sm:inline-flex shrink-0"
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

          {/* // Campo de busca em tempo real com botão de limpeza rápida */}
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
            {busca ? (
              <InputGroupAddon align="inline-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onMudarBusca("")}
                  className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Limpar termo de busca"
                  title="Limpar busca"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </Button>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </div>
      </div>
    </div>
  );
}
