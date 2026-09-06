import { CheckCircle2, CircleDot, Clock, type LucideIcon } from "lucide-react";

export type ItemStatus = {
  label: string;
  value: string;
  icone?: LucideIcon;
  corTexto?: string;
  corBg?: string;
  corBorda?: string;
};

export const STATUS_ITENS: readonly ItemStatus[] = [
  {
    label: "Aberta",
    value: "aberta",
    icone: CircleDot,
    corTexto: "text-blue-500 dark:text-blue-400",
    corBg: "bg-blue-500/10",
    corBorda: "border-blue-500/30",
  },
  {
    label: "Em andamento",
    value: "em_andamento",
    icone: Clock,
    corTexto: "text-amber-500 dark:text-amber-400",
    corBg: "bg-amber-500/10",
    corBorda: "border-amber-500/30",
  },
  {
    label: "Concluída",
    value: "concluida",
    icone: CheckCircle2,
    corTexto: "text-emerald-500 dark:text-emerald-400",
    corBg: "bg-emerald-500/10",
    corBorda: "border-emerald-500/30",
  },
];

export const FILTRO_STATUS_ITENS: readonly ItemStatus[] = [
  { label: "Todos os status", value: "todos" },
  ...STATUS_ITENS,
];

export function hojeISO(): string {
  const data = new Date();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function demandaAtrasada(prazo: string, status: string): boolean {
  return status !== "concluida" && prazo < hojeISO();
}
