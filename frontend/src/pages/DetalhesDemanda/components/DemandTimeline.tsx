import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  FileCheck,
  History,
} from "lucide-react";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import type { Demanda } from "@/lib/api";
import { STATUS_ITENS } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  calcularStatusPrazo,
  formatarDataCompleta,
  formatarPrazoExtenso,
} from "../utils/demand-helpers";

interface DemandTimelineProps {
  demanda: Demanda;
}

export function DemandTimeline({ demanda }: DemandTimelineProps) {
  const statusInfo = STATUS_ITENS.find((s) => s.value === demanda.status);
  const infoPrazo = calcularStatusPrazo(demanda.prazo, demanda.status);

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <span>Rastreabilidade & Linha do Tempo</span>
          </div>
          <span className="text-[11px] font-normal text-muted-foreground">
            Auditoria de eventos
          </span>
        </CardTitle>
      </CardHeader>

      <CardPanel className="pt-5 pb-6">
        <div className="relative space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-px before:bg-border">
          {/* Evento 1: Criação da Demanda */}
          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs ring-4 ring-card">
              <CircleDot className="size-3.5" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5 flex flex-col gap-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Demanda Registrada no Sistema
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatarDataCompleta(demanda.criado_em)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cadastrada para o projeto <strong className="text-foreground">{demanda.projeto_nome}</strong> com responsabilidade atribuída a <strong className="text-foreground">{demanda.responsavel_nome}</strong>.
              </p>
            </div>
          </div>

          {/* Evento 2: Status do Ciclo de Vida */}
          <div className="relative flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border shadow-xs ring-4 ring-card",
                statusInfo?.corBg || "bg-muted",
                statusInfo?.corTexto || "text-foreground",
                statusInfo?.corBorda || "border-border"
              )}
            >
              {demanda.status === "concluida" ? (
                <CheckCircle2 className="size-3.5" />
              ) : demanda.status === "em_andamento" ? (
                <Clock className="size-3.5" />
              ) : (
                <CircleDot className="size-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5 flex flex-col gap-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Status Atual: {statusInfo?.label}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatarDataCompleta(demanda.atualizado_em)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {demanda.status === "concluida"
                  ? "A demanda foi marcada como concluída e finalizada no fluxo de trabalho."
                  : demanda.status === "em_andamento"
                  ? `Demanda em tratamento ativo por ${demanda.responsavel_nome}.`
                  : "Demanda aberta no fluxo inicial aguardando atendimento."}
              </p>
            </div>
          </div>

          {/* Evento 3: Prazo Acordado / SLA */}
          <div className="relative flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border shadow-xs ring-4 ring-card",
                infoPrazo.tipo === "atrasada"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                  : infoPrazo.tipo === "concluida"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              )}
            >
              {infoPrazo.tipo === "atrasada" ? (
                <AlertTriangle className="size-3.5" />
              ) : infoPrazo.tipo === "concluida" ? (
                <FileCheck className="size-3.5" />
              ) : (
                <Calendar className="size-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5 flex flex-col gap-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Prazo de Conclusão Acordado
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit shrink-0",
                    infoPrazo.badgeClasse
                  )}
                >
                  {infoPrazo.badgeTexto}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Data estipulada para entrega: <strong className="text-foreground">{formatarPrazoExtenso(demanda.prazo)}</strong> ({infoPrazo.texto}).
              </p>
            </div>
          </div>
        </div>
      </CardPanel>
    </Card>
  );
}
