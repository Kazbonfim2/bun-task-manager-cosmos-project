import { AlertTriangle, CircleDot, ClipboardList } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardCardsProps {
  total: number;
  abertas: number;
  atrasadas: number;
  onFiltrarStatus: (status: string) => void;
}

export function DashboardCards({
  total,
  abertas,
  atrasadas,
  onFiltrarStatus,
}: DashboardCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {/* 1. Card de total de demandas */}
      <ScrollReveal direction="up" delay={0} duration={400}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Card
                className="transition-transform duration-200 md:hover:-translate-y-1 md:hover:cursor-pointer"
                onClick={() => onFiltrarStatus("todos")}
              >
                <CardHeader>
                  <CardDescription>Total</CardDescription>
                  <CardTitle className="text-3xl">{total}</CardTitle>
                  <CardAction>
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                      <ClipboardList className="size-5" aria-hidden="true" />
                    </div>
                  </CardAction>
                </CardHeader>
              </Card>
            }
          />
          <TooltipPopup>Clique para ver todas as demandas</TooltipPopup>
        </Tooltip>
      </ScrollReveal>

      {/* 2. Card de demandas em aberto */}
      <ScrollReveal direction="up" delay={80} duration={400}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Card
                className="transition-transform duration-200 md:hover:-translate-y-1 md:hover:cursor-pointer"
                onClick={() => onFiltrarStatus("aberta")}
              >
                <CardHeader>
                  <CardDescription>Abertas</CardDescription>
                  <CardTitle className="text-3xl">{abertas}</CardTitle>
                  <CardAction>
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                      <CircleDot className="size-5" aria-hidden="true" />
                    </div>
                  </CardAction>
                </CardHeader>
              </Card>
            }
          />
          <TooltipPopup>Clique para filtrar apenas demandas em aberto</TooltipPopup>
        </Tooltip>
      </ScrollReveal>

      {/* 3. Card de demandas atrasadas */}
      <ScrollReveal direction="up" delay={160} duration={400}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Card
                className="transition-transform duration-200 md:hover:-translate-y-1 md:hover:cursor-pointer"
                onClick={() => onFiltrarStatus("atrasadas")}
              >
                <CardHeader>
                  <CardDescription>Atrasadas</CardDescription>
                  <CardTitle className="text-3xl">{atrasadas}</CardTitle>
                  <CardAction>
                    <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                      <AlertTriangle className="size-5" aria-hidden="true" />
                    </div>
                  </CardAction>
                </CardHeader>
              </Card>
            }
          />
          <TooltipPopup>Clique para filtrar apenas demandas atrasadas</TooltipPopup>
        </Tooltip>
      </ScrollReveal>
    </section>
  );
}
