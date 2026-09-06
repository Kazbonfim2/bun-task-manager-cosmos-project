import { Trash2 } from "lucide-react";
import type { FormEvent } from "react";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectSimples, type ItemSelect } from "@/components/SelectSimples";
import { STATUS_ITENS } from "@/lib/status";

export interface FormEdicaoDemandaData {
  descricao: string;
  projeto_id: string;
  responsavel_id: string;
  prazo: string;
  status: string;
}

interface DialogEdicaoDemandaProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  form: FormEdicaoDemandaData;
  setForm: React.Dispatch<React.SetStateAction<FormEdicaoDemandaData>>;
  itensProjeto: readonly ItemSelect[];
  itensUsuario: readonly ItemSelect[];
  salvando: boolean;
  erro: string;
  onSalvar: (evento: FormEvent<HTMLFormElement>) => void;
  onExcluir: () => void;
}

export function DialogEdicaoDemanda({
  aberto,
  onOpenChange,
  form,
  setForm,
  itensProjeto,
  itensUsuario,
  salvando,
  erro,
  onSalvar,
  onExcluir,
}: DialogEdicaoDemandaProps) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Editar demanda</DialogTitle>
          <DialogDescription>
            Atualize as informações da demanda cadastrada.
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={onSalvar}>
          <DialogPanel className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <Textarea
                name="descricao"
                required
                value={form.descricao}
                onChange={(e) => setForm((atual) => ({ ...atual, descricao: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Projeto</FieldLabel>
              <SelectSimples
                itens={itensProjeto}
                valor={form.projeto_id}
                aoMudar={(projeto_id) => setForm((atual) => ({ ...atual, projeto_id }))}
                placeholder="Selecione o projeto"
              />
            </Field>
            <Field>
              <FieldLabel>Responsável</FieldLabel>
              <SelectSimples
                itens={itensUsuario}
                valor={form.responsavel_id}
                aoMudar={(responsavel_id) =>
                  setForm((atual) => ({ ...atual, responsavel_id }))
                }
                placeholder="Selecione o responsável"
              />
            </Field>
            <Field>
              <FieldLabel>Prazo</FieldLabel>
              <Input
                type="date"
                name="prazo"
                required
                value={form.prazo}
                onChange={(e) => setForm((atual) => ({ ...atual, prazo: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <SelectSimples
                itens={STATUS_ITENS}
                valor={form.status}
                aoMudar={(status) => setForm((atual) => ({ ...atual, status }))}
                placeholder="Status"
              />
            </Field>
            {erro ? <p className="text-destructive text-sm">{erro}</p> : null}
          </DialogPanel>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              loading={salvando}
              onClick={onExcluir}
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
            <div className="flex items-center gap-2 sm:ms-auto">
              <DialogClose render={<Button type="button" variant="ghost" />}>
                Cancelar
              </DialogClose>
              <Button type="submit" loading={salvando}>
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
