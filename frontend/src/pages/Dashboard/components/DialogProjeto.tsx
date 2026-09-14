import { Trash2 } from "lucide-react";
import type { SubmitEvent } from "react";
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
import type { Projeto } from "@/lib/api";

interface DialogProjetoProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  projetos: Projeto[];
  projetoEditando: Projeto | null;
  onSelecionarParaEditar: (projeto: Projeto | null) => void;
  nome: string;
  setNome: (nome: string) => void;
  descricao: string;
  setDescricao: (descricao: string) => void;
  salvando: boolean;
  erro: string;
  onSalvar: (evento: SubmitEvent<HTMLFormElement>) => void;
  onExcluir: () => void;
}

export function DialogProjeto({
  aberto,
  onOpenChange,
  projetos,
  projetoEditando,
  onSelecionarParaEditar,
  nome,
  setNome,
  descricao,
  setDescricao,
  salvando,
  erro,
  onSalvar,
  onExcluir,
}: DialogProjetoProps) {
  const itensSelecao: ItemSelect[] = [
    { label: "+ Criar novo projeto", value: "__novo__" },
    ...projetos.map((p) => ({ label: `Editar: ${p.nome}`, value: p.id })),
  ];

  function aoMudarSelecao(valor: string) {
    if (valor === "__novo__") {
      onSelecionarParaEditar(null);
    } else {
      const selecionado = projetos.find((p) => p.id === valor) ?? null;
      onSelecionarParaEditar(selecionado);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>
            {projetoEditando ? "Editar projeto" : "Novo projeto"}
          </DialogTitle>
          <DialogDescription>
            {projetoEditando
              ? "Atualize os dados do projeto ou exclua-o se não houver demandas."
              : "Crie o projeto antes de ligar demandas a ele."}
          </DialogDescription>
        </DialogHeader>

        {projetos.length > 0 ? (
          <div className="px-4 pt-2 sm:px-6">
            <Field>
              <FieldLabel className="text-xs text-muted-foreground">
                Ação
              </FieldLabel>
              <SelectSimples
                itens={itensSelecao}
                valor={projetoEditando ? projetoEditando.id : "__novo__"}
                aoMudar={aoMudarSelecao}
                placeholder="Selecione..."
              />
            </Field>
          </div>
        ) : null}

        <form className="flex flex-col flex-1 min-h-0 overflow-hidden" onSubmit={onSalvar}>
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
          <DialogFooter className="sm:justify-between">
            {projetoEditando ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onExcluir}
                loading={salvando}
                className="gap-1.5 w-full sm:w-auto"
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
            ) : null}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ms-auto">
              <DialogClose render={<Button type="button" variant="ghost" className="flex-1 sm:flex-initial" />}>
                Cancelar
              </DialogClose>
              <Button type="submit" loading={salvando} className="flex-1 sm:flex-initial">
                {projetoEditando ? "Salvar alterações" : "Criar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
