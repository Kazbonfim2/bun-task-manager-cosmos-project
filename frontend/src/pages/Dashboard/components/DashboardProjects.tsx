import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderPlus,
  Layers,
  Plus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import type { Projeto } from "@/lib/api";
import { cn } from "@/lib/utils";

function ProgressBarSegmentada({
  total,
  abertas,
  andamento,
  concluidas,
}: {
  total: number;
  abertas: number;
  andamento: number;
  concluidas: number;
}) {
  if (total === 0) {
    return <div className="h-1.5 w-full rounded-full bg-muted/60" />;
  }

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/60 gap-0.5">
      {abertas > 0 && (
        <div
          className="bg-blue-500 transition-all"
          style={{ width: `${(abertas / total) * 100}%` }}
        />
      )}
      {andamento > 0 && (
        <div
          className="bg-amber-500 transition-all"
          style={{ width: `${(andamento / total) * 100}%` }}
        />
      )}
      {concluidas > 0 && (
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${(concluidas / total) * 100}%` }}
        />
      )}
    </div>
  );
}

interface DashboardProjectsProps {
  projetos: Projeto[];
  filtroProjeto: string;
  onSelecionarProjeto: (id: string) => void;
  onNovoProjeto: () => void;
}

const CHAVE_STORAGE_EXPANDIDO = "orion:projetos-expandido";

export function DashboardProjects({
  projetos,
  filtroProjeto,
  onSelecionarProjeto,
  onNovoProjeto,
}: DashboardProjectsProps) {
  const [expandido, setExpandido] = useState(() => {
    const salvo = localStorage.getItem(CHAVE_STORAGE_EXPANDIDO);
    return salvo !== null ? salvo === "true" : true;
  });

  function alternarExpansao() {
    setExpandido((prev) => {
      const proximo = !prev;
      localStorage.setItem(CHAVE_STORAGE_EXPANDIDO, String(proximo));
      return proximo;
    });
  }

  const totaisGerais = useMemo(() => {
    let total = 0;
    let abertas = 0;
    let andamento = 0;
    let concluidas = 0;

    for (const p of projetos) {
      total += p.total_demandas ?? 0;
      abertas += p.demandas_abertas ?? 0;
      andamento += p.demandas_em_andamento ?? 0;
      concluidas += p.demandas_concluidas ?? 0;
    }

    return { total, abertas, andamento, concluidas };
  }, [projetos]);

  const projetoAtivo = useMemo(
    () => (filtroProjeto !== "todos" ? projetos.find((p) => p.id === filtroProjeto) : null),
    [projetos, filtroProjeto],
  );

  return (
    <section className="flex flex-col gap-3" aria-label="Seção de projetos">
      {/* // Cabeçalho da seção com título, badges e controle de expansão */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 font-heading text-sm font-semibold tracking-tight text-foreground">
            <Folder className="size-4 text-muted-foreground" aria-hidden="true" />
            <span>Projetos</span>
          </div>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
            {projetos.length}
          </Badge>

          {/* // Indicador visual de filtro ativo quando um projeto específico estiver selecionado */}
          {projetoAtivo ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs font-medium border-primary/30 bg-primary/5 text-primary"
            >
              <span className="text-muted-foreground font-normal">Filtrado por:</span>
              <span className="max-w-[140px] truncate sm:max-w-xs">{projetoAtivo.nome}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelecionarProjeto("todos");
                }}
                className="ml-0.5 rounded-xs p-0.5 hover:bg-muted hover:text-destructive transition-colors cursor-pointer"
                title="Remover filtro de projeto"
                aria-label={`Remover filtro de projeto ${projetoAtivo.nome}`}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {/* // Botão para alternar entre expandido e recolhido */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={alternarExpansao}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            aria-expanded={expandido}
            aria-controls="dashboard-projetos-grid"
            aria-label={expandido ? "Recolher seção de projetos" : "Expandir seção de projetos"}
          >
            <span>{expandido ? "Recolher" : "Expandir"}</span>
            {expandido ? (
              <ChevronUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* // Grid de cards de projetos exibido apenas se a seção estiver expandida */}
      {expandido ? (
        <div
          id="dashboard-projetos-grid"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* // Card: Todos os projetos */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Card
                  render={
                    <button
                      type="button"
                      onClick={() => onSelecionarProjeto("todos")}
                      aria-pressed={filtroProjeto === "todos"}
                      aria-label="Exibir todas as demandas de todos os projetos"
                    />
                  }
                  className={cn(
                    "flex flex-col justify-between p-4 text-start transition-all duration-200 cursor-pointer",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    filtroProjeto === "todos"
                      ? "opacity-100 shadow-xs border-border bg-card"
                      : "opacity-50 hover:opacity-100 hover:bg-muted/30 border-border/60 hover:border-border",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "rounded-md p-1.5 shrink-0",
                            filtroProjeto === "todos"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Layers className="size-4" aria-hidden="true" />
                        </div>
                        <span className="font-semibold text-sm truncate text-foreground">
                          Todos os projetos
                        </span>
                      </div>
                      {filtroProjeto === "todos" ? (
                        <Badge
                          variant="default"
                          className="h-4.5 px-1.5 text-[10px] gap-0.5 shrink-0"
                        >
                          <Check className="size-3" aria-hidden="true" />
                          Ativo
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      Visualizar todas as demandas
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 border-t pt-2.5">
                    <span className="text-xs font-semibold text-foreground">
                      {totaisGerais.total} {totaisGerais.total === 1 ? "demanda" : "demandas"}
                    </span>
                    <ProgressBarSegmentada
                      total={totaisGerais.total}
                      abertas={totaisGerais.abertas}
                      andamento={totaisGerais.andamento}
                      concluidas={totaisGerais.concluidas}
                    />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                        {totaisGerais.abertas} abertas
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                        {totaisGerais.andamento} andamento
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        {totaisGerais.concluidas} concluídas
                      </span>
                    </div>
                  </div>
                </Card>
              }
            />
            <TooltipPopup>Clique para ver demandas de todos os projetos</TooltipPopup>
          </Tooltip>

          {/* // Cards individuais de cada projeto cadastrado */}
          {projetos.map((projeto) => {
            const selecionado = filtroProjeto === projeto.id;
            const totalDemandas = projeto.total_demandas ?? 0;
            const abertas = projeto.demandas_abertas ?? 0;
            const andamento = projeto.demandas_em_andamento ?? 0;
            const concluidas = projeto.demandas_concluidas ?? 0;

            return (
              <Tooltip key={projeto.id}>
                <TooltipTrigger
                  render={
                    <Card
                      render={
                        <button
                          type="button"
                          onClick={() => onSelecionarProjeto(projeto.id)}
                          aria-pressed={selecionado}
                          aria-label={`Filtrar demandas pelo projeto ${projeto.nome}`}
                        />
                      }
                      className={cn(
                        "flex flex-col justify-between p-4 text-start transition-all duration-200 cursor-pointer",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        selecionado
                          ? "opacity-100 shadow-xs border-border bg-card"
                          : "opacity-50 hover:opacity-100 hover:bg-muted/30 border-border/60 hover:border-border",
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className={cn(
                                "rounded-md p-1.5 shrink-0",
                                selecionado
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Folder className="size-4" aria-hidden="true" />
                            </div>
                            <span
                              className="font-semibold text-sm truncate text-foreground"
                              title={projeto.nome}
                            >
                              {projeto.nome}
                            </span>
                          </div>
                          {selecionado ? (
                            <Badge
                              variant="default"
                              className="h-4.5 px-1.5 text-[10px] gap-0.5 shrink-0"
                            >
                              <Check className="size-3" aria-hidden="true" />
                              Ativo
                            </Badge>
                          ) : null}
                        </div>
                        {projeto.descricao ? (
                          <p
                            className="text-xs text-muted-foreground line-clamp-2 mt-0.5"
                            title={projeto.descricao}
                          >
                            {projeto.descricao}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground/60 italic line-clamp-1 mt-0.5">
                            Sem descrição
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col gap-2 border-t pt-2.5">
                        <span className="text-xs font-semibold text-foreground">
                          {totalDemandas} {totalDemandas === 1 ? "demanda" : "demandas"}
                        </span>
                        <ProgressBarSegmentada
                          total={totalDemandas}
                          abertas={abertas}
                          andamento={andamento}
                          concluidas={concluidas}
                        />
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                            {abertas} abertas
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                            {andamento} andamento
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            {concluidas} concluídas
                          </span>
                        </div>
                      </div>
                    </Card>
                  }
                />
                <TooltipPopup>
                  {selecionado
                    ? `Projeto ativo: ${projeto.nome}. Clique para desselecionar.`
                    : `Clique para filtrar demandas por ${projeto.nome}`}
                </TooltipPopup>
              </Tooltip>
            );
          })}

          {/* // Card vazio (mesma estética) para criar o primeiro projeto */}
          {projetos.length === 0 ? (
            <Card
              render={
                <button
                  type="button"
                  onClick={onNovoProjeto}
                  aria-label="Criar primeiro projeto"
                />
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 text-center transition-all duration-200 cursor-pointer",
                "border-dashed border-border/70 bg-muted/10 hover:bg-muted/30 hover:border-primary/40",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
                <FolderPlus className="size-4" aria-hidden="true" />
              </div>
              <span className="font-semibold text-sm text-foreground">Nenhum projeto criado</span>
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Plus className="size-3.5" aria-hidden="true" />
                Criar projeto
              </span>
            </Card>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
