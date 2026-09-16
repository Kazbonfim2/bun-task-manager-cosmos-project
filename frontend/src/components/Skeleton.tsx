import { cn } from "@/lib/utils";

// Bloco base de carregamento (shimmer via animate-pulse do Tailwind).
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted/70", className)} />;
}

// Grade de cartões de grupo em carregamento (usada na tela de Configurações).
export function GruposSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-3.5 bg-card space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-7 w-full" />
        </div>
      ))}
    </div>
  );
}
