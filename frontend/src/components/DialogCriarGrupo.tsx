import { Check, Copy, Plus, Sparkles, Ticket } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, type Convite, type Grupo } from "@/lib/api";
import { salvarGrupoAtivo } from "@/lib/auth";

interface DialogCriarGrupoProps {
  aberto: boolean;
  onFechar: () => void;
  onCriado: (grupo: Grupo) => void;
}

export function DialogCriarGrupo({
  aberto,
  onFechar,
  onCriado,
}: DialogCriarGrupoProps) {
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultadoCriacao, setResultadoCriacao] = useState<{
    grupo: Grupo;
    convites: Convite[];
  } | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  function resetar() {
    setNome("");
    setErro("");
    setResultadoCriacao(null);
    setCopiadoId(null);
  }

  function fecharDialog() {
    resetar();
    onFechar();
  }

  async function handleCriar(e: SubmitEvent) {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro("Informe o nome do grupo de trabalho");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      const resp = await api<{ grupo: Grupo; convites: Convite[] }>("/grupos", {
        method: "POST",
        body: JSON.stringify({ nome: nomeLimpo }),
      });
      salvarGrupoAtivo(resp.grupo.id);
      setResultadoCriacao(resp);
      onCriado(resp.grupo);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao criar grupo");
    } finally {
      setSalvando(false);
    }
  }

  function copiarCodigo(convite: Convite) {
    navigator.clipboard.writeText(convite.codigo);
    setCopiadoId(convite.id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  return (
    <Dialog open={aberto} onOpenChange={(abertoState) => !abertoState && fecharDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Sparkles className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {resultadoCriacao ? "Grupo Criado com Sucesso!" : "Criar Novo Grupo"}
              </DialogTitle>
              <DialogDescription>
                {resultadoCriacao
                  ? "Seu grupo foi criado e você recebeu 05 códigos de convite."
                  : "Cadastre um grupo de trabalho e receba 05 convites para sua equipe."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {resultadoCriacao ? (
          <>
            <DialogPanel className="flex flex-col gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
                <p className="font-semibold">
                  Grupo: {resultadoCriacao.grupo.nome}
                </p>
                <p className="text-[11px] mt-0.5">
                  Compartilhe esses códigos com seus colegas para que eles participem do mesmo espaço.
                </p>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {resultadoCriacao.convites.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        #{i + 1}
                      </Badge>
                      <span className="font-mono font-bold tracking-wider text-foreground truncate">
                        {c.codigo}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => copiarCodigo(c)}
                      className="gap-1 text-xs shrink-0"
                    >
                      {copiadoId === c.id ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </DialogPanel>

            <DialogFooter>
              <Button type="button" onClick={fecharDialog} className="w-full sm:w-auto">
                Começar a Usar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleCriar} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <DialogPanel className="flex flex-col gap-4">
              <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg flex items-center gap-2.5 text-xs text-muted-foreground">
                <Ticket className="size-4 text-primary shrink-0" />
                <span>
                  Ao criar este grupo, você receberá <strong>05 convites únicos</strong> para adicionar colegas de equipe.
                </span>
              </div>

              <Field className="space-y-1.5">
                <FieldLabel htmlFor="nome_grupo" className="text-xs font-semibold">
                  Nome do Grupo / Empresa / Squad
                </FieldLabel>
                <Input
                  id="nome_grupo"
                  placeholder="Ex: Engenharia Orion, Equipe Alpha, Financeiro"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoFocus
                  required
                />
                {erro && <FieldError>{erro}</FieldError>}
              </Field>
            </DialogPanel>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fecharDialog}
                disabled={salvando}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={salvando}
                className="gap-1.5 w-full sm:w-auto"
              >
                {salvando ? <Spinner className="size-3.5" /> : <Plus className="size-3.5" />}
                {salvando ? "Criando..." : "Criar Grupo (+5 Convites)"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
