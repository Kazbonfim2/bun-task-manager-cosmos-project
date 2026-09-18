import { Check, CheckCircle2, CheckSquare, CircleDot, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizarStatus } from "@/lib/status";

interface StatusPipelineProps {
  statusAtual: string;
  alterando?: boolean;
  onTrocarStatus: (status: string) => void;
}

interface Etapa {
  id: string;
  ordem: number;
  label: string;
  subtitulo: string;
  icone: typeof CircleDot;
}

const ETAPAS: Etapa[] = [
  {
    id: "a_fazer",
    ordem: 1,
    label: "A fazer",
    subtitulo: "Aguardando início",
    icone: CircleDot,
  },
  {
    id: "em_progresso",
    ordem: 2,
    label: "Em progresso",
    subtitulo: "Tratamento ativo",
    icone: Clock,
  },
  {
    id: "feito",
    ordem: 3,
    label: "Feito",
    subtitulo: "Concluída",
    icone: CheckCircle2,
  },
  {
    id: "aprovado",
    ordem: 4,
    label: "Aprovado",
    subtitulo: "Aprovado",
    icone: CheckSquare,
  },
];

export function StatusPipeline({
  statusAtual,
  alterando = false,
  onTrocarStatus,
}: StatusPipelineProps) {
  const statusNormalizado = normalizarStatus(statusAtual);
  const indiceAtual = ETAPAS.findIndex((e) => e.id === statusNormalizado);

  return (
    <div className="w-full rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs" role="region" aria-label="Pipeline de Status">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Ciclo de Vida
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            — clique em uma etapa para alterar o status
          </span>
        </div>
        {alterando && (
          <span className="text-[11px] font-medium text-primary animate-pulse">
            Atualizando status...
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto">
        {ETAPAS.map((etapa, idx) => {
          const isAtivo = etapa.id === statusNormalizado;
          const isPassado = indiceAtual > idx;
          const Icone = etapa.icone;

          return (
            <div key={etapa.id} className="contents">
              {/* Botão da Etapa */}
              <button
                type="button"
                disabled={alterando}
                onClick={() => onTrocarStatus(etapa.id)}
                className={cn(
                  "group relative z-10 flex flex-1 flex-col items-start gap-1 rounded-lg border p-2 sm:p-2.5 text-left transition-all cursor-pointer select-none min-w-[110px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isAtivo
                    ? "border-primary bg-primary/5 shadow-xs"
                    : isPassado
                    ? "border-border bg-card hover:bg-muted/50"
                    : "border-transparent hover:border-border hover:bg-muted/40 opacity-70 hover:opacity-100",
                  alterando ? "pointer-events-none opacity-50" : ""
                )}
                title={`Alterar para status: ${etapa.label}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all border",
                      isAtivo
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : isPassado
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-muted text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {isPassado ? (
                      <Check className="size-3.5 sm:size-4 stroke-[2.5]" />
                    ) : (
                      <Icone className="size-3.5 sm:size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-xs font-semibold leading-none",
                        isAtivo
                          ? "text-primary"
                          : isPassado
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {etapa.label}
                    </span>
                    <span className="hidden sm:block truncate text-[10px] text-muted-foreground mt-0.5">
                      {etapa.subtitulo}
                    </span>
                  </div>
                </div>
              </button>

              {/* Linha conectora entre etapas */}
              {idx < ETAPAS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "hidden sm:block h-0.5 w-4 sm:w-8 lg:w-12 shrink-0 transition-colors duration-300",
                    isPassado
                      ? "bg-emerald-500/40"
                      : isAtivo
                      ? "bg-primary/30"
                      : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
