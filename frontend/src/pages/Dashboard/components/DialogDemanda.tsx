import { Trash2 } from "lucide-react";
import type { SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { TextareaMencoes } from "@/components/TextareaMencoes";
import { SelectSimples, type ItemSelect } from "@/components/SelectSimples";
import type { Demanda, Usuario } from "@/lib/api";
import { STATUS_ITENS } from "@/lib/status";

export interface FormDemandaData {
  titulo: string;
  descricao: string;
  projeto_id: string;
  responsavel_id: string;
  prazo: string;
  status: string;
}

interface DialogDemandaProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  editando: Demanda | null;
  form: FormDemandaData;
  setForm: React.Dispatch<React.SetStateAction<FormDemandaData>>;
  itensProjeto: readonly ItemSelect[];
  itensUsuario: readonly ItemSelect[];
  usuarios?: Usuario[];
  salvando: boolean;
  erro: string;
  onSalvar: (evento: SubmitEvent<HTMLFormElement>) => void;
  onExcluir: () => void;
}

export function DialogDemanda({
  aberto,
  onOpenChange,
  editando,
  form,
  setForm,
  itensProjeto,
  itensUsuario,
  usuarios,
  salvando,
  erro,
  onSalvar,
  onExcluir,
}: DialogDemandaProps) {
  const listaUsuarios: Usuario[] =
    usuarios ??
    itensUsuario.map((item) => ({
      id: item.value,
      nome_completo: item.label,
      email: "",
    }));

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{editando ? "Editar demanda" : "Nova demanda"}</DialogTitle>
          <DialogDescription>
            Projeto e responsável vêm das listas cadastradas.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col flex-1 min-h-0 overflow-hidden" onSubmit={onSalvar}>
          <DialogPanel className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Título</FieldLabel>
              <Input
                name="titulo"
                required
                placeholder="Título da demanda"
                value={form.titulo}
                onChange={(evento) =>
                  setForm((atual) => ({ ...atual, titulo: evento.target.value }))
                }
              />
            </Field>
            <Field>
              <FieldLabel>Descrição (opcional)</FieldLabel>
              <TextareaMencoes
                name="descricao"
                placeholder="Descrição detalhada da demanda (digite @ para mencionar)"
                value={form.descricao}
                onChange={(descricao) =>
                  setForm((atual) => ({ ...atual, descricao }))
                }
                usuarios={listaUsuarios}
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
              <DatePicker
                name="prazo"
                required
                value={form.prazo}
                onChange={(prazo) =>
                  setForm((atual) => ({ ...atual, prazo }))
                }
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
            {erro && aberto ? (
              <p className="text-destructive text-sm">{erro}</p>
            ) : null}
          </DialogPanel>
          <DialogFooter className="sm:justify-between">
            {editando ? (
              <Button
                type="button"
                variant="destructive"
                loading={salvando}
                onClick={onExcluir}
                className="w-full sm:w-auto"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Excluir
              </Button>
            ) : null}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ms-auto">
              <DialogClose render={<Button type="button" variant="ghost" className="flex-1 sm:flex-initial" />}>
                Cancelar
              </DialogClose>
              <Button type="submit" loading={salvando} className="flex-1 sm:flex-initial">
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
