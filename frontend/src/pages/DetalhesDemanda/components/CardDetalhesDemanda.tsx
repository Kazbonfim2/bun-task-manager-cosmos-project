import type { Demanda } from "@/lib/api";
import { DemandOverview } from "./DemandOverview";

interface CardDetalhesDemandaProps {
  demanda: Demanda;
  onTrocarStatus: (status: string) => void;
  alterandoStatus?: boolean;
}

export function CardDetalhesDemanda({
  demanda,
  onTrocarStatus,
  alterandoStatus = false,
}: CardDetalhesDemandaProps) {
  return (
    <DemandOverview
      demanda={demanda}
      onTrocarStatus={onTrocarStatus}
      alterandoStatus={alterandoStatus}
    />
  );
}
