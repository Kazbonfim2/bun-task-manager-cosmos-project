import { AlertTriangle, CheckCircle2, CheckSquare, CircleDot, Clock, type LucideIcon } from "lucide-react";

export type ItemStatus = {
  label: string;
  value: string;
  icone?: LucideIcon;
  corTexto?: string;
  corBg?: string;
  corBorda?: string;
};

export function normalizarStatus(status: string): string {
  if (status === "aberta") return "a_fazer";
  if (status === "em_andamento") return "em_progresso";
  if (status === "concluida") return "feito";
  return status;
}

export const STATUS_ITENS: readonly ItemStatus[] = [
  {
    label: "A fazer",
    value: "a_fazer",
    icone: CircleDot,
    corTexto: "text-blue-500 dark:text-blue-400",
    corBg: "bg-blue-500/10",
    corBorda: "border-blue-500/30",
  },
  {
    label: "Em progresso",
    value: "em_progresso",
    icone: Clock,
    corTexto: "text-amber-500 dark:text-amber-400",
    corBg: "bg-amber-500/10",
    corBorda: "border-amber-500/30",
  },
  {
    label: "Feito",
    value: "feito",
    icone: CheckCircle2,
    corTexto: "text-emerald-500 dark:text-emerald-400",
    corBg: "bg-emerald-500/10",
    corBorda: "border-emerald-500/30",
  },
  {
    label: "Aprovado",
    value: "aprovado",
    icone: CheckSquare,
    corTexto: "text-purple-500 dark:text-purple-400",
    corBg: "bg-purple-500/10",
    corBorda: "border-purple-500/30",
  },
];

export const FILTRO_STATUS_ITENS: readonly ItemStatus[] = [
  { label: "Todos os status", value: "todos" },
  ...STATUS_ITENS,
  {
    label: "Atrasadas",
    value: "atrasadas",
    icone: AlertTriangle,
    corTexto: "text-destructive dark:text-red-400",
    corBg: "bg-destructive/10",
    corBorda: "border-destructive/30",
  },
];

export function hojeISO(): string {
  const data = new Date();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function demandaAtrasada(prazo: string, status: string): boolean {
  const normal = normalizarStatus(status);
  return normal !== "feito" && normal !== "aprovado" && normal !== "concluida" && prazo.slice(0, 10) < hojeISO();
}
