import { Check, CheckCircle2, CircleDot, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
    id: "aberta",
    ordem: 1,
    label: "Aberta",
    subtitulo: "Aguardando início",
    icone: CircleDot,
  },
  {
    id: "em_andamento",
    ordem: 2,
    label: "Em andamento",
    subtitulo: "Tratamento ativo",
    icone: Clock,
  },
  {
    id: "concluida",
    ordem: 3,
    label: "Concluída",
    subtitulo: "Finalizada",
    icone: CheckCircle2,
  },
];

export function StatusPipeline({
  statusAtual,
  alterando = false,
  onTrocarStatus,
}: StatusPipelineProps) {
  const indiceAtual = ETAPAS.findIndex((e) => e.id === statusAtual);

  return (
    <div className="w-full rounded-xl border bg-card/80 p-3 sm:p-4 shadow-xs" role="region" aria-label="Pipeline de Status">
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

      <div className="relative flex items-center justify-between gap-1 sm:gap-2">
        {ETAPAS.map((etapa, idx) => {
          const isAtivo = etapa.id === statusAtual;
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
                  "group relative z-10 flex flex-1 flex-col items-start gap-1 rounded-lg p-2 sm:p-2.5 text-left transition-all cursor-pointer select-none",
                  "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isAtivo
                    ? "bg-primary/5 border border-primary/20 shadow-xs"
                    : isPassado
                    ? "opacity-90 hover:opacity-100"
                    : "opacity-60 hover:opacity-90",
                  alterando ? "pointer-events-none opacity-50" : ""
                )}
                title={`Alterar para status: ${etapa.label}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                      isAtivo
                        ? "bg-primary text-primary-foreground shadow-xs ring-4 ring-primary/15"
                        : isPassado
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20 group-hover:text-foreground"
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
                    "hidden sm:block h-0.5 w-6 sm:w-10 lg:w-16 shrink-0 transition-colors duration-300",
                    isPassado || (isAtivo && idx < indiceAtual)
                      ? "bg-emerald-500"
                      : indiceAtual > idx
                      ? "bg-primary"
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
