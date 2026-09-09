import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel } from "@/components/ui/card";
import type { Demanda } from "@/lib/api";
import { STATUS_ITENS } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  calcularStatusPrazo,
  formatarPrazoExtenso,
} from "../utils/demand-helpers";
import { StatusPipeline } from "./StatusPipeline";

interface DemandOverviewProps {
  demanda: Demanda;
  alterandoStatus: boolean;
  onTrocarStatus: (status: string) => void;
}

export function DemandOverview({
  demanda,
  alterandoStatus,
  onTrocarStatus,
}: DemandOverviewProps) {
  const [copiadoTexto, setCopiadoTexto] = useState(false);

  const statusInfo = STATUS_ITENS.find((s) => s.value === demanda.status);
  const StatusIcone = statusInfo?.icone;
  const infoPrazo = calcularStatusPrazo(demanda.prazo, demanda.status);

  function copiarTextoDescricao() {
    navigator.clipboard.writeText(demanda.descricao);
    setCopiadoTexto(true);
    setTimeout(() => setCopiadoTexto(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Card Principal da Demanda */}
      <Card className="overflow-hidden border shadow-xs">
        {/* Faixa decorativa no topo de acordo com o status */}
        <div
          className={cn("h-1.5 w-full", {
            "bg-blue-500": demanda.status === "aberta" && infoPrazo.tipo !== "atrasada",
            "bg-amber-500": demanda.status === "em_andamento" && infoPrazo.tipo !== "atrasada",
            "bg-emerald-500": demanda.status === "concluida",
            "bg-red-500": infoPrazo.tipo === "atrasada",
          })}
        />

        <CardHeader className="gap-4 pb-2">
          {/* Linha de Badges de Identificação e SLA */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Badge de Status Oficial */}
              {statusInfo ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border",
                    statusInfo.corBg,
                    statusInfo.corTexto,
                    statusInfo.corBorda
                  )}
                >
                  {StatusIcone ? (
                    <StatusIcone className="size-3.5 shrink-0" aria-hidden="true" />
                  ) : null}
                  {statusInfo.label}
                </span>
              ) : null}

              {/* Badge Dinâmica de Prazo */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border",
                  infoPrazo.badgeClasse
                )}
              >
                {infoPrazo.tipo === "atrasada" && <AlertTriangle className="size-3.5 shrink-0" />}
                {infoPrazo.tipo === "concluida" && <CheckCircle2 className="size-3.5 shrink-0" />}
                {(infoPrazo.tipo === "hoje" || infoPrazo.tipo === "amanha") && (
                  <Clock className="size-3.5 shrink-0" />
                )}
                {infoPrazo.badgeTexto}
              </span>
            </div>

            {/* Código da Demanda */}
            <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border">
              #{demanda.id}
            </span>
          </div>

          {/* Título Principal / Descrição da Demanda */}
          <div className="flex items-start justify-between gap-4 pt-1">
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {demanda.descricao}
            </h1>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={copiarTextoDescricao}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              title="Copiar descrição da demanda"
              aria-label="Copiar descrição"
            >
              {copiadoTexto ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardPanel className="flex flex-col gap-6 pt-2">
          {/* Banner Contextual Inteligente */}
          {infoPrazo.tipo === "atrasada" && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 p-3.5 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">Atenção: Prazo de entrega expirado!</p>
                <p className="text-red-600/90 dark:text-red-300/90 leading-relaxed">
                  Esta demanda tinha previsão de entrega para <strong>{formatarPrazoExtenso(demanda.prazo)}</strong> e está atrasada há <strong>{Math.abs(infoPrazo.diasDiferenca)} dias</strong>. Recomendamos priorizar a execução ou atualizar a data limite.
                </p>
              </div>
            </div>
          )}

          {demanda.status === "concluida" && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">Demanda finalizada com êxito</p>
                <p className="text-emerald-600/90 dark:text-emerald-300/90 leading-relaxed">
                  Todas as etapas foram concluídas. Você pode reabrir esta demanda a qualquer momento caso novas pendências surjam.
                </p>
              </div>
            </div>
          )}

          {demanda.status === "aberta" && infoPrazo.tipo !== "atrasada" && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 p-3.5 text-xs text-blue-700 dark:text-blue-300">
              <Sparkles className="size-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">Demanda aguardando início de atendimento</p>
                <p className="text-blue-600/90 dark:text-blue-300/90 leading-relaxed">
                  Prazo previsto: <strong>{formatarPrazoExtenso(demanda.prazo)}</strong> ({infoPrazo.texto}).
                </p>
              </div>
            </div>
          )}

          {demanda.status === "em_andamento" && infoPrazo.tipo !== "atrasada" && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 p-3.5 text-xs text-amber-700 dark:text-amber-300">
              <Clock className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">Em execução ativa por {demanda.responsavel_nome}</p>
                <p className="text-amber-600/90 dark:text-amber-300/90 leading-relaxed">
                  Lembre-se de registrar a conclusão assim que as entregas forem enviadas e validadas.
                </p>
              </div>
            </div>
          )}

          {/* Stepper / Pipeline de Ciclo de Vida Interativo */}
          <StatusPipeline
            statusAtual={demanda.status}
            alterando={alterandoStatus}
            onTrocarStatus={onTrocarStatus}
          />

          {/* Barra de Transição Rápida de Etapa */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Ação Recomendada:</span>
              {demanda.status === "aberta" && "Iniciar o trabalho nesta demanda"}
              {demanda.status === "em_andamento" && "Concluir a demanda após finalização"}
              {demanda.status === "concluida" && "Demanda concluída"}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {demanda.status === "aberta" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onTrocarStatus("em_andamento")}
                  loading={alterandoStatus}
                  className="gap-1.5"
                >
                  <Play className="size-3.5 fill-current" />
                  Iniciar Atendimento
                </Button>
              )}

              {demanda.status === "em_andamento" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onTrocarStatus("aberta")}
                    loading={alterandoStatus}
                    className="gap-1.5 text-xs"
                  >
                    <RotateCcw className="size-3.5" />
                    Voltar para Aberta
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onTrocarStatus("concluida")}
                    loading={alterandoStatus}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Marcar como Concluída
                  </Button>
                </>
              )}

              {demanda.status === "concluida" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onTrocarStatus("em_andamento")}
                  loading={alterandoStatus}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Reabrir Demanda
                </Button>
              )}
            </div>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
