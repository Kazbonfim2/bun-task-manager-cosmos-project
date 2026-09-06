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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      {/* // Filtros por responsável e status */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* // Filtro por responsável */}
        <Field className="w-full sm:w-52">
          <FieldLabel>Responsável</FieldLabel>
          <SelectSimples
            itens={itensResponsavel}
            valor={filtroResponsavel}
            aoMudar={onMudarFiltroResponsavel}
            placeholder="Responsável"
          />
        </Field>
        {/* // Filtro por status */}
        <Field className="w-full sm:w-52">
          <FieldLabel>Status</FieldLabel>
          <SelectSimples
            itens={FILTRO_STATUS_ITENS}
            valor={filtroStatus}
            aoMudar={onMudarFiltroStatus}
            placeholder="Status"
          />
        </Field>
      </div>

      {/* // Ações da barra de ferramentas: alternador de modo, botões e campo de busca */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* // Grupo de botões de ação e alternador */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* // Alternador de modo de visualização (lista em tabela ou grade de cards) */}
          <div className="flex items-center rounded-lg border bg-muted p-0.5 shrink-0">
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

          {/* // Botão para abertura do diálogo de criação de novo projeto */}
          <Button
            type="button"
            variant="outline"
            onClick={onAbrirNovoProjeto}
            className="flex-1 sm:flex-initial"
          >
            Novo projeto
          </Button>

          {/* // Botão para abertura do diálogo de criação de nova demanda */}
          <Button
            type="button"
            onClick={onAbrirNovaDemanda}
            className="flex-1 sm:flex-initial"
          >
            <Plus aria-hidden="true" />
            Nova demanda
          </Button>
        </div>

        {/* // Campo de busca em tempo real por entidade demanda */}
        <InputGroup className="w-full sm:w-60">
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
