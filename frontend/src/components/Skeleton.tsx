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
        <div key={i} className="rounded-2xl bg-muted/72 p-1">
          <div className="rounded-xl border bg-card p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className="size-6 rounded-full" />
                </div>
                <Skeleton className="h-3 w-14" />
              </div>
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
          <div className="p-2 px-2.5">
            <Skeleton className="h-7 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
