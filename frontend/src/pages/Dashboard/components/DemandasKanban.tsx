import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  CircleDot,
  Clock,
  Edit2,
  ExternalLink,
  GripVertical,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Demanda } from "@/lib/api";
import { demandaAtrasada, normalizarStatus } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";

export interface ColunaConfig {
  id: string;
  label: string;
  icone: LucideIcon;
  corTexto: string;
  corBg: string;
  corBorda: string;
  corDot: string;
}

export const COLUNAS_KANBAN: ColunaConfig[] = [
  {
    id: "a_fazer",
    label: "A fazer",
    icone: CircleDot,
    corTexto: "text-blue-500 dark:text-blue-400",
    corBg: "bg-blue-500/10",
    corBorda: "border-blue-500/20",
    corDot: "bg-blue-500",
  },
  {
    id: "em_progresso",
    label: "Em progresso",
    icone: Clock,
    corTexto: "text-amber-500 dark:text-amber-400",
    corBg: "bg-amber-500/10",
    corBorda: "border-amber-500/20",
    corDot: "bg-amber-500",
  },
  {
    id: "feito",
    label: "Feito",
    icone: CheckCircle2,
    corTexto: "text-emerald-500 dark:text-emerald-400",
    corBg: "bg-emerald-500/10",
    corBorda: "border-emerald-500/20",
    corDot: "bg-emerald-500",
  },
  {
    id: "aprovado",
    label: "Aprovado",
    icone: CheckSquare,
    corTexto: "text-purple-500 dark:text-purple-400",
    corBg: "bg-purple-500/10",
    corBorda: "border-purple-500/20",
    corDot: "bg-purple-500",
  },
];

type ColunasState = Record<string, Demanda[]>;

interface KanbanCardProps {
  demanda: Demanda;
  isOverlay?: boolean;
  onVisualizarDemanda?: (id: string) => void;
  onEditarDemanda?: (demanda: Demanda) => void;
}

export function KanbanCard({
  demanda,
  isOverlay = false,
  onVisualizarDemanda,
  onEditarDemanda,
}: KanbanCardProps) {
  const atrasada = demandaAtrasada(demanda.prazo, demanda.status);
  const prazoFormatado = demanda.prazo.slice(0, 10);

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-xs",
        atrasada ? "border-destructive/30 bg-destructive/4" : "border-border/80 hover:border-border",
        isOverlay
          ? "border-primary shadow-xl ring-2 ring-primary/20 cursor-grabbing z-50"
          : "transition-[border-color,box-shadow] hover:shadow-md cursor-grab active:cursor-grabbing"
      )}
      onClick={() => onVisualizarDemanda?.(demanda.id)}
    >
      {/* Topo do card: Projeto + Ações */}
      <div className="flex items-center justify-between gap-1.5">
        <span
          className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate max-w-[170px]"
          title={demanda.projeto_nome}
        >
          {demanda.projeto_nome}
        </span>
        <div
          className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {onEditarDemanda && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-5.5 text-muted-foreground hover:text-foreground"
              title="Editar demanda"
              onClick={() => onEditarDemanda(demanda)}
            >
              <Edit2 className="size-3" />
            </Button>
          )}
          {onVisualizarDemanda && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-5.5 text-muted-foreground hover:text-foreground"
              title="Ver detalhes"
              onClick={() => onVisualizarDemanda(demanda.id)}
            >
              <ExternalLink className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Título com indicador de atraso e Tooltip */}
      <div className="flex items-start gap-1.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <h4
                className="font-medium text-xs sm:text-sm text-foreground line-clamp-2 leading-snug break-words flex-1 hover:underline cursor-pointer"
                title={demanda.titulo}
              >
                {demanda.titulo}
              </h4>
            }
          />
          <TooltipPopup className="max-w-xs sm:max-w-sm whitespace-normal break-words">
            <div className="font-semibold text-xs">{demanda.titulo}</div>
            {demanda.descricao ? (
              <div className="text-[11px] text-muted-foreground mt-1">{demanda.descricao}</div>
            ) : null}
          </TooltipPopup>
        </Tooltip>

        {atrasada && (
          <span className="relative flex size-2 shrink-0 mt-1" title="Demanda em atraso">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-destructive" />
          </span>
        )}
      </div>

      {/* Descrição truncada */}
      {demanda.descricao ? (
        <p
          className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words"
          title={demanda.descricao}
        >
          {demanda.descricao}
        </p>
      ) : null}

      {/* Rodapé compacto: Responsável + Prazo */}
      <div className="mt-1 flex items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <div
          className="flex items-center gap-1.5 min-w-0 max-w-[130px] truncate"
          title={`Responsável: ${demanda.responsavel_nome}`}
        >
          <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold uppercase text-muted-foreground">
            {demanda.responsavel_nome ? demanda.responsavel_nome.charAt(0) : <User className="size-2.5" />}
          </div>
          <span className="truncate">{demanda.responsavel_nome}</span>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 shrink-0 font-mono text-[10px]",
            atrasada ? "font-semibold text-destructive" : ""
          )}
          title={`Prazo: ${prazoFormatado}`}
        >
          <Calendar className="size-3" />
          <span>{prazoFormatado}</span>
        </div>
      </div>
    </div>
  );
}

function SortableKanbanCard({
  demanda,
  onVisualizarDemanda,
  onEditarDemanda,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: demanda.id,
    data: {
      type: "Demanda",
      demanda,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // O card fonte fica esmaecido (mesma altura, sem placeholder falso); quem segue o cursor é o DragOverlay.
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      <KanbanCard
        demanda={demanda}
        onVisualizarDemanda={onVisualizarDemanda}
        onEditarDemanda={onEditarDemanda}
      />
    </div>
  );
}

interface KanbanColumnProps {
  coluna: ColunaConfig;
  demandas: Demanda[];
  onVisualizarDemanda: (id: string) => void;
  onEditarDemanda: (demanda: Demanda) => void;
}

function KanbanColumn({
  coluna,
  demandas,
  onVisualizarDemanda,
  onEditarDemanda,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: coluna.id,
    data: {
      type: "Coluna",
      colunaId: coluna.id,
    },
  });

  const ids = useMemo(() => demandas.map((d) => d.id), [demandas]);
  const Icone = coluna.icone;

  return (
    <div className="flex flex-1 min-w-[260px] max-w-full flex-col rounded-2xl border border-border/80 bg-muted/20 p-3 shadow-xs">
      {/* Cabeçalho da coluna */}
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-lg border",
              coluna.corBg,
              coluna.corTexto,
              coluna.corBorda
            )}
          >
            <Icone className="size-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider truncate">
            {coluna.label}
          </h3>
        </div>
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold border",
            coluna.corBg,
            coluna.corTexto,
            coluna.corBorda
          )}
        >
          {demandas.length}
        </span>
      </div>

      {/* Área Droppable da coluna */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2.5 min-h-[360px] rounded-xl p-1 transition-colors",
          isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-dashed" : ""
        )}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {demandas.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
              <GripVertical className="size-4 mb-1 opacity-40" />
              <span>Nenhuma demanda</span>
              <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                Arraste um card para esta etapa
              </span>
            </div>
          ) : (
            demandas.map((demanda) => (
              <SortableKanbanCard
                key={demanda.id}
                demanda={demanda}
                onVisualizarDemanda={onVisualizarDemanda}
                onEditarDemanda={onEditarDemanda}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

interface DemandasKanbanProps {
  demandas: Demanda[];
  carregando?: boolean;
  onVisualizarDemanda: (id: string) => void;
  onTrocarStatus: (id: string, status: string) => void;
  onReordenar: (itens: { id: string; ordem: number }[]) => void;
  onEditarDemanda: (demanda: Demanda) => void;
}

export function DemandasKanban({
  demandas,
  carregando = false,
  onVisualizarDemanda,
  onTrocarStatus,
  onReordenar,
  onEditarDemanda,
}: DemandasKanbanProps) {
  const [activeDemanda, setActiveDemanda] = useState<Demanda | null>(null);
  const statusOrigemRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mapeia demandas por coluna, ordenando cada uma pela `ordem` persistida (sort estável mantém empates).
  const colunasData = useMemo<ColunasState>(() => {
    const mapa: ColunasState = {
      a_fazer: [],
      em_progresso: [],
      feito: [],
      aprovado: [],
    };

    for (const d of demandas) {
      const statusNormalizado = normalizarStatus(d.status);
      (mapa[statusNormalizado] ?? mapa.a_fazer).push(d);
    }

    for (const chave of Object.keys(mapa)) {
      mapa[chave].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    }

    return mapa;
  }, [demandas]);

  // Estado local para preview fluido durante o drag; ressincroniza com o servidor fora do arraste.
  const [colunas, setColunas] = useState<ColunasState>(colunasData);
  useEffect(() => {
    if (!activeDemanda) setColunas(colunasData);
  }, [colunasData, activeDemanda]);

  function acharColuna(id: string): string | undefined {
    if (colunas[id]) return id; // é o id de uma coluna
    return Object.keys(colunas).find((chave) => colunas[chave].some((d) => d.id === id));
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const demanda = demandas.find((d) => d.id === id);
    if (demanda) {
      setActiveDemanda(demanda);
      statusOrigemRef.current = normalizarStatus(demanda.status);
    }
  }

  // Move o card entre colunas ao vivo (padrão multi-container do dnd-kit).
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const colAtiva = acharColuna(activeId);
    const colOver = acharColuna(overId);
    if (!colAtiva || !colOver || colAtiva === colOver) return;

    setColunas((prev) => {
      const ativos = prev[colAtiva];
      const sobre = prev[colOver];
      const idxAtivo = ativos.findIndex((d) => d.id === activeId);
      if (idxAtivo < 0) return prev;
      const item = ativos[idxAtivo];
      const idxOver = sobre.findIndex((d) => d.id === overId);
      const insercao = idxOver >= 0 ? idxOver : sobre.length;
      return {
        ...prev,
        [colAtiva]: ativos.filter((d) => d.id !== activeId),
        [colOver]: [...sobre.slice(0, insercao), item, ...sobre.slice(insercao)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const origem = statusOrigemRef.current;
    setActiveDemanda(null);
    statusOrigemRef.current = null;
    if (!over || !origem) return;

    const activeId = String(active.id);
    const destino = acharColuna(activeId);
    if (!destino) return;

    // Reordenação dentro da coluna final (handleDragOver já tratou a troca entre colunas).
    let novasColunas = colunas;
    const overId = String(over.id);
    const lista = colunas[destino];
    const from = lista.findIndex((d) => d.id === activeId);
    const to = lista.findIndex((d) => d.id === overId);
    if (from !== -1 && to !== -1 && from !== to) {
      novasColunas = { ...colunas, [destino]: arrayMove(lista, from, to) };
      setColunas(novasColunas);
    }

    // Persiste: troca de coluna via status (mantém notificações) + nova ordem das colunas afetadas.
    if (destino !== origem) {
      onTrocarStatus(activeId, destino);
    }

    const afetadas = destino === origem ? [destino] : [origem, destino];
    const itens: { id: string; ordem: number }[] = [];
    for (const col of afetadas) {
      (novasColunas[col] ?? []).forEach((d, i) => itens.push({ id: d.id, ordem: i }));
    }
    onReordenar(itens);
  }

  function handleDragCancel() {
    setActiveDemanda(null);
    statusOrigemRef.current = null;
    setColunas(colunasData);
  }

  if (carregando) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-dashed text-center text-muted-foreground text-sm">
        Carregando demandas do Kanban...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-start w-full overflow-x-auto pb-4">
        {COLUNAS_KANBAN.map((coluna) => (
          <KanbanColumn
            key={coluna.id}
            coluna={coluna}
            demandas={colunas[coluna.id] ?? []}
            onVisualizarDemanda={onVisualizarDemanda}
            onEditarDemanda={onEditarDemanda}
          />
        ))}
      </div>

      {/* Portal para body: neutraliza ancestrais com transform (ex.: ScrollReveal),
          senão o position:fixed do overlay fica relativo a eles e desalinha do cursor. */}
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeDemanda ? (
            <KanbanCard demanda={activeDemanda} isOverlay />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}
