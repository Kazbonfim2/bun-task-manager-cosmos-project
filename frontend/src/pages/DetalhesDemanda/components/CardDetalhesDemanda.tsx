import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Copy,
  Folder,
  User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { SelectSimples } from "@/components/SelectSimples";
import type { Demanda } from "@/lib/api";
import { demandaAtrasada, STATUS_ITENS } from "@/lib/status";
import { cn } from "@/lib/utils";

function formatarData(dataIso?: string) {
  if (!dataIso) return "—";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return dataIso.slice(0, 10);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarPrazo(prazoIso?: string) {
  if (!prazoIso) return "—";
  const dataStr = prazoIso.slice(0, 10);
  const partes = dataStr.split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return dataStr;
}

interface CardDetalhesDemandaProps {
  demanda: Demanda;
  onTrocarStatus: (status: string) => void;
}

export function CardDetalhesDemanda({
  demanda,
  onTrocarStatus,
}: CardDetalhesDemandaProps) {
  const [copiado, setCopiado] = useState(false);

  function copiarId() {
    navigator.clipboard.writeText(demanda.id);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const atrasada = demandaAtrasada(demanda.prazo, demanda.status);
  const statusAtual = STATUS_ITENS.find((s) => s.value === demanda.status);
  const StatusIcone = statusAtual?.icone;

  return (
    <Card className={cn(atrasada ? "border-destructive/30 bg-destructive/5" : "")}>
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {statusAtual ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border",
                statusAtual.corBg,
                statusAtual.corTexto,
                statusAtual.corBorda,
              )}
            >
              {StatusIcone ? <StatusIcone className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {statusAtual.label}
            </span>
          ) : null}
          {atrasada ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Atrasada
            </Badge>
          ) : null}
        </div>

        <CardTitle className="text-2xl sm:text-3xl font-bold leading-snug">
          {demanda.descricao}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          <span>ID:</span>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
            {demanda.id}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={copiarId}
            title="Copiar ID"
          >
            {copiado ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          </Button>
        </CardDescription>
      </CardHeader>

      <CardPanel className="flex flex-col gap-6 pt-2">
        {/* // Grid de informações principais */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* // Projeto */}
          <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Folder className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Projeto</span>
              <span className="font-semibold text-foreground text-base">
                {demanda.projeto_nome}
              </span>
            </div>
          </div>

          {/* // Responsável */}
          <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <User className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Responsável</span>
              <span className="font-semibold text-foreground text-base">
                {demanda.responsavel_nome}
              </span>
            </div>
          </div>

          {/* // Prazo */}
          <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
            <div
              className={cn(
                "rounded-lg p-2.5",
                atrasada ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              <Calendar className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Prazo limite</span>
              <span
                className={cn(
                  "font-semibold text-base",
                  atrasada ? "text-destructive" : "text-foreground",
                )}
              >
                {formatarPrazo(demanda.prazo)}
              </span>
            </div>
          </div>

          {/* // Alteração rápida de status */}
          <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Clock className="size-5" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-muted-foreground text-xs">Alterar Status</span>
              <SelectSimples
                itens={STATUS_ITENS}
                valor={demanda.status}
                aoMudar={onTrocarStatus}
                placeholder="Status"
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* // Metadados de auditoria */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-muted-foreground text-xs">
          <span>Criado em: {formatarData(demanda.criado_em)}</span>
          <span>Última atualização: {formatarData(demanda.atualizado_em)}</span>
        </div>
      </CardPanel>
    </Card>
  );
}
