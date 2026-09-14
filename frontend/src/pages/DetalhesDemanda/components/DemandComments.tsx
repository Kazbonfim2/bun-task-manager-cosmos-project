import {
  AlertTriangle,
  Check,
  CornerDownLeft,
  MessageSquare,
  MessageSquarePlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import { TextareaMencoes } from "@/components/TextareaMencoes";
import { TextoComMencoes } from "@/components/TextoComMencoes";
import { api, type Comentario, type Usuario } from "@/lib/api";
import { lerUsuario } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  formatarDataCompleta,
  obterCorAvatar,
  obterIniciais,
} from "../utils/demand-helpers";

interface DemandCommentsProps {
  demandaId: string;
}

export function DemandComments({ demandaId }: DemandCommentsProps) {
  const usuarioAtual = lerUsuario();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Criação
  const [novoTexto, setNovoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Edição
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Exclusão
  const [dialogExcluirAberto, setDialogExcluirAberto] = useState(false);
  const [comentarioParaExcluir, setComentarioParaExcluir] = useState<Comentario | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregarComentarios = useCallback(async () => {
    if (!demandaId) return;
    setCarregando(true);
    setErro("");
    try {
      const [lista, listaUsuarios] = await Promise.all([
        api<Comentario[]>(`/demandas/${demandaId}/comentarios`),
        api<Usuario[]>("/usuarios").catch(() => []),
      ]);
      setComentarios(lista);
      setUsuarios(listaUsuarios);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao carregar comentários");
    } finally {
      setCarregando(false);
    }
  }, [demandaId]);

  useEffect(() => {
    carregarComentarios();
  }, [carregarComentarios]);

  async function handleCriarComentario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const textoLimpo = novoTexto.trim();
    if (!textoLimpo || enviando) return;

    setEnviando(true);
    setErro("");
    try {
      const criado = await api<Comentario>(`/demandas/${demandaId}/comentarios`, {
        method: "POST",
        body: JSON.stringify({ texto: textoLimpo }),
      });
      setComentarios((prev) => [...prev, criado]);
      setNovoTexto("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao enviar comentário");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicao(comentario: Comentario) {
    setEditandoId(comentario.id);
    setTextoEdicao(comentario.texto);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setTextoEdicao("");
  }

  async function handleSalvarEdicao(id: string) {
    const textoLimpo = textoEdicao.trim();
    if (!textoLimpo || salvandoEdicao) return;

    setSalvandoEdicao(true);
    setErro("");
    try {
      const atualizado = await api<Comentario>(`/comentarios/${id}`, {
        method: "PUT",
        body: JSON.stringify({ texto: textoLimpo }),
      });
      setComentarios((prev) =>
        prev.map((c) => (c.id === id ? atualizado : c))
      );
      setEditandoId(null);
      setTextoEdicao("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao salvar alteração");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function abrirModalExclusao(comentario: Comentario) {
    setComentarioParaExcluir(comentario);
    setDialogExcluirAberto(true);
  }

  async function handleConfirmarExclusao() {
    if (!comentarioParaExcluir) return;
    setExcluindo(true);
    setErro("");
    try {
      await api(`/comentarios/${comentarioParaExcluir.id}`, {
        method: "DELETE",
      });
      setComentarios((prev) =>
        prev.filter((c) => c.id !== comentarioParaExcluir.id)
      );
      setDialogExcluirAberto(false);
      setComentarioParaExcluir(null);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao excluir comentário");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            <span>Comentários</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border">
              {comentarios.length}
            </span>
          </div>
          <span className="text-[11px] font-normal text-muted-foreground">
            Discussão da demanda
          </span>
        </CardTitle>
      </CardHeader>

      <CardPanel className="flex flex-col gap-6 pt-5 pb-6">
        {erro && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Lista de Comentários */}
        {carregando ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Spinner className="size-5" />
            <span className="ml-2 text-xs">Carregando comentários...</span>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-muted/20">
            <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3">
              <MessageSquare className="size-5" />
            </div>
            <p className="text-xs font-medium text-foreground">Nenhum comentário registrado</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
              Inicie a conversa sobre esta demanda compartilhando notas, atualizações ou orientações abaixo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => {
              const cores = obterCorAvatar(comentario.usuario_nome);
              const iniciais = obterIniciais(comentario.usuario_nome);
              const isAutor = usuarioAtual?.id === comentario.usuario_id;
              const foiEditado = comentario.atualizado_em !== comentario.criado_em;
              const emEdicao = editandoId === comentario.id;

              return (
                <div
                  key={comentario.id}
                  className={cn(
                    "flex flex-col sm:flex-row gap-3 rounded-xl border p-4 transition-colors",
                    isAutor ? "bg-muted/30 border-primary/20" : "bg-card border-border"
                  )}
                >
                  {/* Avatar */}
                  <div className="flex items-start gap-3 sm:gap-3 shrink-0">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full font-semibold text-xs border shadow-xs select-none",
                        cores.bg,
                        cores.text,
                        cores.border
                      )}
                    >
                      {iniciais}
                    </div>

                    <div className="sm:hidden flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-foreground">
                          {comentario.usuario_nome}
                        </span>
                        {isAutor && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium text-primary">
                            Você
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground block">
                        {formatarDataCompleta(comentario.criado_em)}
                        {foiEditado && <span className="ml-1 text-muted-foreground/75">(editado)</span>}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {/* Cabeçalho do comentário (Desktop) */}
                    <div className="hidden sm:flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-foreground">
                          {comentario.usuario_nome}
                        </span>
                        {isAutor && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium text-primary">
                            Você
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatarDataCompleta(comentario.criado_em)}
                        </span>
                        {foiEditado && (
                          <span className="text-[10px] text-muted-foreground/75 font-normal italic">
                            (editado)
                          </span>
                        )}
                      </div>

                      {/* Ações de Edição/Exclusão para o Autor */}
                      {isAutor && !emEdicao && (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => iniciarEdicao(comentario)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Editar comentário"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => abrirModalExclusao(comentario)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Excluir comentário"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Texto ou Modo de Edição */}
                    {emEdicao ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <TextareaMencoes
                          value={textoEdicao}
                          onChange={setTextoEdicao}
                          usuarios={usuarios}
                          rows={3}
                          size="sm"
                          placeholder="Edite seu comentário (digite @ para mencionar)..."
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={cancelarEdicao}
                            disabled={salvandoEdicao}
                            className="gap-1"
                          >
                            <X className="size-3" />
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            onClick={() => handleSalvarEdicao(comentario.id)}
                            loading={salvandoEdicao}
                            disabled={!textoEdicao.trim()}
                            className="gap-1"
                          >
                            <Check className="size-3" />
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          <TextoComMencoes texto={comentario.texto} usuarios={usuarios} />
                        </p>

                        {/* Ações Mobile */}
                        {isAutor && !emEdicao && (
                          <div className="sm:hidden flex items-center justify-end gap-1 pt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => iniciarEdicao(comentario)}
                              className="text-muted-foreground hover:text-foreground gap-1 h-6 px-2 text-[11px]"
                            >
                              <Pencil className="size-3" />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => abrirModalExclusao(comentario)}
                              className="text-muted-foreground hover:text-destructive gap-1 h-6 px-2 text-[11px]"
                            >
                              <Trash2 className="size-3" />
                              Excluir
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulário para Novo Comentário */}
        <form onSubmit={handleCriarComentario} className="flex flex-col gap-2.5 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <MessageSquarePlus className="size-3.5 text-primary" />
            <span>Adicionar Comentário</span>
          </div>

          <TextareaMencoes
            value={novoTexto}
            onChange={setNovoTexto}
            usuarios={usuarios}
            placeholder="Escreva seu comentário sobre esta demanda (digite @ para mencionar)..."
            rows={3}
            disabled={enviando}
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              Comentando como <strong className="text-foreground">{usuarioAtual?.nome_completo ?? "Usuário"}</strong>
            </span>

            <Button
              type="submit"
              size="sm"
              loading={enviando}
              disabled={!novoTexto.trim() || enviando}
              className="gap-1.5 self-end"
            >
              <CornerDownLeft className="size-3.5" />
              Comentar
            </Button>
          </div>
        </form>
      </CardPanel>

      {/* Modal de Confirmação de Exclusão de Comentário */}
      <Dialog open={dialogExcluirAberto} onOpenChange={setDialogExcluirAberto}>
        <DialogPopup variant="centered" className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Excluir Comentário</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Esta ação não poderá ser desfeita.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogPanel className="py-2">
            {comentarioParaExcluir && (
              <div className="rounded-lg border bg-muted/40 p-3 text-xs">
                <p className="text-muted-foreground italic line-clamp-3">
                  "{comentarioParaExcluir.texto}"
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Tem certeza de que deseja remover este comentário?
            </p>
          </DialogPanel>

          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose render={<Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" />}>
              Cancelar
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              loading={excluindo}
              onClick={handleConfirmarExclusao}
              className="gap-1.5 w-full sm:w-auto"
            >
              <Trash2 className="size-4" />
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </Card>
  );
}
