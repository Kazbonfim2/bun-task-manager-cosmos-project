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

interface DialogProjetoProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  nome: string;
  setNome: (nome: string) => void;
  descricao: string;
  setDescricao: (descricao: string) => void;
  salvando: boolean;
  erro: string;
  onSalvar: (evento: FormEvent<HTMLFormElement>) => void;
}

export function DialogProjeto({
  aberto,
  onOpenChange,
  nome,
  setNome,
  descricao,
  setDescricao,
  salvando,
  erro,
  onSalvar,
}: DialogProjetoProps) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
          <DialogDescription>Crie o projeto antes de ligar demandas a ele.</DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={onSalvar}>
          <DialogPanel className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <Input
                type="text"
                name="nome"
                required
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <Textarea
                name="descricao"
                value={descricao}
                onChange={(evento) => setDescricao(evento.target.value)}
              />
            </Field>
            {erro && aberto ? (
              <p className="text-destructive text-sm">{erro}</p>
            ) : null}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" loading={salvando}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
