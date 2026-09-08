import { Card, CardHeader, CardPanel } from "@/components/ui/card";

export function DetalhesDemandaSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 animate-pulse">
      {/* Breadcrumb e Top bar skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 rounded bg-muted/80" />
          <div className="h-6 w-24 rounded-full bg-muted/80" />
        </div>
        <div className="flex items-center justify-between border-b pb-4">
          <div className="h-8 w-36 rounded-md bg-muted/80" />
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-md bg-muted/80" />
            <div className="h-8 w-20 rounded-md bg-muted/80" />
            <div className="h-8 w-20 rounded-md bg-muted/80" />
          </div>
        </div>
      </div>

      {/* Grid de 2 colunas skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal (Esquerda - 8 colunas) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card Principal */}
          <Card className="border">
            <div className="h-1.5 w-full bg-muted/60" />
            <CardHeader className="gap-4 pb-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="h-6 w-24 rounded-md bg-muted/80" />
                  <div className="h-6 w-20 rounded-md bg-muted/80" />
                </div>
                <div className="h-5 w-16 rounded bg-muted/80" />
              </div>
              <div className="h-8 w-3/4 rounded bg-muted/80 mt-1" />
            </CardHeader>
            <CardPanel className="flex flex-col gap-6 pt-2">
              <div className="h-16 w-full rounded-xl bg-muted/60" />
              <div className="h-24 w-full rounded-xl bg-muted/60" />
              <div className="h-12 w-full rounded-xl bg-muted/60" />
            </CardPanel>
          </Card>

          {/* Timeline Skeleton */}
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <div className="h-5 w-48 rounded bg-muted/80" />
            </CardHeader>
            <CardPanel className="pt-4 pb-6 space-y-6 pl-6">
              <div className="h-14 w-full rounded-lg bg-muted/50" />
              <div className="h-14 w-full rounded-lg bg-muted/50" />
              <div className="h-14 w-full rounded-lg bg-muted/50" />
            </CardPanel>
          </Card>
        </div>

        {/* Coluna Lateral (Direita - 4 colunas) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <div className="h-5 w-36 rounded bg-muted/80" />
            </CardHeader>
            <CardPanel className="flex flex-col gap-4 pt-4">
              <div className="h-10 w-full rounded-lg bg-muted/60" />
              <div className="h-14 w-full rounded-lg bg-muted/60" />
              <div className="h-12 w-full rounded-lg bg-muted/60" />
              <div className="h-12 w-full rounded-lg bg-muted/60" />
              <div className="h-10 w-full rounded-lg bg-muted/60" />
            </CardPanel>
          </Card>

          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <div className="h-5 w-32 rounded bg-muted/80" />
            </CardHeader>
            <CardPanel className="flex flex-col gap-3 pt-4">
              <div className="h-12 w-full rounded-lg bg-muted/60" />
              <div className="h-12 w-full rounded-lg bg-muted/60" />
            </CardPanel>
          </Card>
        </div>
      </div>
    </main>
  );
}
