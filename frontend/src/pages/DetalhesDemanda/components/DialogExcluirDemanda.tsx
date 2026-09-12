import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogExcluirDemandaProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  demandaId: string;
  demandaTitulo: string;
  demandaDescricao?: string;
  excluindo: boolean;
  onConfirmar: () => void;
}

export function DialogExcluirDemanda({
  aberto,
  onOpenChange,
  demandaId,
  demandaTitulo,
  demandaDescricao,
  excluindo,
  onConfirmar,
}: DialogExcluirDemandaProps) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Excluir Demanda</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Esta ação é permanente e não poderá ser desfeita.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogPanel className="py-2">
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Código:</span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                {demandaId}
              </code>
            </div>
            <p className="text-muted-foreground line-clamp-2">
              <span className="font-semibold text-foreground">Título: </span>
              {demandaTitulo}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Tem certeza de que deseja remover esta demanda do sistema? Todas as notificações e históricos vinculados serão descartados.
          </p>
        </DialogPanel>

        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose render={<Button type="button" variant="outline" size="sm" />}>
            Cancelar
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            loading={excluindo}
            onClick={onConfirmar}
            className="gap-1.5"
          >
            <Trash2 className="size-4" />
            Confirmar Exclusão
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
