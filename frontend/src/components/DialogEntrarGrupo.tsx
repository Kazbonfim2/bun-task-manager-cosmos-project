import { LogIn, Ticket } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, type Grupo } from "@/lib/api";
import { salvarGrupoAtivo } from "@/lib/auth";

interface DialogEntrarGrupoProps {
  aberto: boolean;
  onFechar: () => void;
  onEntrou: (grupo: Grupo) => void;
}

export function DialogEntrarGrupo({
  aberto,
  onFechar,
  onEntrou,
}: DialogEntrarGrupoProps) {
  const [codigo, setCodigo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function resetar() {
    setCodigo("");
    setErro("");
  }

  function fecharDialog() {
    resetar();
    onFechar();
  }

  async function handleEntrar(e: SubmitEvent) {
    e.preventDefault();
    const codigoLimpo = codigo.trim().toUpperCase();
    if (!codigoLimpo) {
      setErro("Informe o código de convite");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      const resp = await api<{ grupo: Grupo; mensagem: string }>("/grupos/convites/aceitar", {
        method: "POST",
        body: JSON.stringify({ codigo: codigoLimpo }),
      });
      salvarGrupoAtivo(resp.grupo.id);
      fecharDialog();
      onEntrou(resp.grupo);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Código de convite inválido ou expirado");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(abertoState) => !abertoState && fecharDialog()}>
      <DialogContent className="max-w-md w-full p-6 sm:p-7">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Ticket className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold">
                Entrar com Convite
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Digite o código de convite que você recebeu de outro usuário
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleEntrar} className="mt-4 space-y-4">
          <Field className="space-y-1.5">
            <FieldLabel htmlFor="codigo_convite" className="text-xs font-semibold">
              Código de Convite
            </FieldLabel>
            <Input
              id="codigo_convite"
              placeholder="Ex: ORION-A83F-9BC2"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="font-mono tracking-wider uppercase text-center text-sm font-semibold"
              autoFocus
              required
            />
            {erro && <FieldError>{erro}</FieldError>}
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={fecharDialog} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={salvando} className="gap-1.5">
              {salvando ? <Spinner className="size-3.5" /> : <LogIn className="size-3.5" />}
              {salvando ? "Entrando..." : "Entrar no Grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
