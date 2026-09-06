import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DashboardPaginationProps {
  totalItens: number;
  paginaAtual: number;
  itensPorPagina: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

export function DashboardPagination({
  totalItens,
  paginaAtual,
  itensPorPagina,
  totalPaginas,
  onMudarPagina,
}: DashboardPaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
      <p className="text-muted-foreground text-xs">
        Mostrando {totalItens === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1} a{" "}
        {Math.min(paginaAtual * itensPorPagina, totalItens)} de {totalItens} demandas
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={paginaAtual <= 1 ? "pointer-events-none opacity-50" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (paginaAtual > 1) onMudarPagina(paginaAtual - 1);
              }}
            />
          </PaginationItem>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <PaginationItem key={num}>
              <PaginationLink
                href="#"
                isActive={num === paginaAtual}
                onClick={(e) => {
                  e.preventDefault();
                  onMudarPagina(num);
                }}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              className={paginaAtual >= totalPaginas ? "pointer-events-none opacity-50" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (paginaAtual < totalPaginas) onMudarPagina(paginaAtual + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
