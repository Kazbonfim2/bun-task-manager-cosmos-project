import { AlertTriangle, CircleDot, ClipboardList } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      {/* // Card de total de demandas cadastradas */}
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

      {/* // Card de demandas em aberto */}
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

      {/* // Card de demandas atrasadas com prazo vencido */}
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
    </section>
  );
}
