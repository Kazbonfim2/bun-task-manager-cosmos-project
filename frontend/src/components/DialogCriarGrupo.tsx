import { Check, Copy, Plus, Sparkles, Ticket } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Badge } from "@/components/ui/badge";
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
      <DialogContent className="max-w-md w-full p-6 sm:p-7">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold">
                {resultadoCriacao ? "Grupo Criado com Sucesso!" : "Criar Novo Grupo"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {resultadoCriacao
                  ? "Seu grupo foi criado e você recebeu 05 códigos de convite."
                  : "Cadastre um grupo de trabalho e receba 05 convites para sua equipe."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {resultadoCriacao ? (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
              <p className="font-semibold">
                Grupo: {resultadoCriacao.grupo.nome}
              </p>
              <p className="text-[11px] mt-0.5">
                Compartilhe esses códigos com seus colegas para que eles participem do mesmo espaço.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {resultadoCriacao.convites.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      #{i + 1}
                    </Badge>
                    <span className="font-mono font-bold tracking-wider text-foreground">
                      {c.codigo}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => copiarCodigo(c)}
                    className="gap-1 text-xs"
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

            <div className="flex justify-end pt-3 border-t">
              <Button type="button" onClick={fecharDialog} className="w-full">
                Começar a Usar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCriar} className="mt-4 space-y-4">
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

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={fecharDialog} disabled={salvando}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={salvando} className="gap-1.5">
                {salvando ? <Spinner className="size-3.5" /> : <Plus className="size-3.5" />}
                {salvando ? "Criando..." : "Criar Grupo (+5 Convites)"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
