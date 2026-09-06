import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Folder,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  api,
  type Demanda,
  type Projeto,
  type Usuario,
} from "@/lib/api";
import {
  demandaAtrasada,
  STATUS_ITENS,
  type ItemStatus,
} from "@/lib/status";
import { cn } from "@/lib/utils";

function formatarData(dataIso?: string) {
  if (!dataIso) return "—";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return dataIso.slice(0, 10);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarPrazo(prazoIso?: string) {
  if (!prazoIso) return "—";
  const dataStr = prazoIso.slice(0, 10);
  const partes = dataStr.split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return dataStr;
}

export function DetalhesDemanda() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [demanda, setDemanda] = useState<Demanda | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [dialogEdicao, setDialogEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [form, setForm] = useState({
    descricao: "",
    projeto_id: "",
    responsavel_id: "",
    prazo: "",
    status: "aberta",
  });

  async function carregarDados() {
    if (!id) return;
    setCarregando(true);
    setErro("");
    try {
      const [dadosDemanda, listaProjetos, listaUsuarios] = await Promise.all([
        api<Demanda>(`/demandas/${id}`),
        api<Projeto[]>("/projetos"),
        api<Usuario[]>("/usuarios"),
      ]);
      setDemanda(dadosDemanda);
      setProjetos(listaProjetos);
      setUsuarios(listaUsuarios);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Demanda não encontrada");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [id]);

  function abrirEdicao() {
    if (!demanda) return;
    setForm({
      descricao: demanda.descricao,
      projeto_id: demanda.projeto_id,
      responsavel_id: demanda.responsavel_id,
      prazo: demanda.prazo.slice(0, 10),
      status: demanda.status,
    });
    setDialogEdicao(true);
  }

  async function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!demanda) return;
    setSalvando(true);
    setErro("");
    try {
      const atualizada = await api<Demanda>(`/demandas/${demanda.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setDemanda(atualizada);
      setDialogEdicao(false);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao atualizar demanda");
    } finally {
      setSalvando(false);
    }
  }

  async function trocarStatus(novoStatus: string) {
    if (!demanda) return;
    try {
      const atualizada = await api<Demanda>(`/demandas/${demanda.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      setDemanda(atualizada);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao alterar status");
    }
  }

  async function excluirDemanda() {
    if (!demanda) return;
    setSalvando(true);
    try {
      await api(`/demandas/${demanda.id}`, { method: "DELETE" });
      navigate("/");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao excluir demanda");
      setSalvando(false);
    }
  }

  function copiarId() {
    if (!demanda) return;
    navigator.clipboard.writeText(demanda.id);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (carregando) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <Card className="p-8 text-center text-muted-foreground">
          Carregando detalhes da demanda...
        </Card>
      </main>
    );
  }

  if (erro || !demanda) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 p-4 pt-12 text-center sm:p-6">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="size-8" />
        </div>
        <h1 className="text-2xl font-bold">Demanda não encontrada</h1>
        <p className="text-muted-foreground text-sm max-w-md">
          {erro || "A demanda solicitada não existe ou foi excluída."}
        </p>
        <Button onClick={() => navigate("/")} variant="secondary">
          <ArrowLeft className="size-4" />
          Voltar para o Dashboard
        </Button>
      </main>
    );
  }

  const atrasada = demandaAtrasada(demanda.prazo, demanda.status);
  const statusAtual = STATUS_ITENS.find((s) => s.value === demanda.status);
  const StatusIcone = statusAtual?.icone;

  const itensProjeto = projetos.map((item) => ({ label: item.nome, value: item.id }));
  const itensUsuario = usuarios.map((item) => ({ label: item.nome_completo, value: item.id }));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      {/* // Navegação em Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>Demandas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-48 truncate sm:max-w-xs">
              {demanda.projeto_nome}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* // Barra de ações superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={abrirEdicao} className="gap-1.5">
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={excluirDemanda}
            loading={salvando}
            className="gap-1.5"
          >
            <Trash2 className="size-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* // Card principal de detalhes da demanda */}
      <Card className={cn(atrasada ? "border-destructive/30 bg-destructive/5" : "")}>
        <CardHeader className="gap-3 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {statusAtual ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border",
                  statusAtual.corBg,
                  statusAtual.corTexto,
                  statusAtual.corBorda,
                )}
              >
                {StatusIcone ? <StatusIcone className="size-3.5 shrink-0" aria-hidden="true" /> : null}
                {statusAtual.label}
              </span>
            ) : null}
            {atrasada ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="size-3" />
                Atrasada
              </Badge>
            ) : null}
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold leading-snug">
            {demanda.descricao}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs">
            <span>ID:</span>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
              {demanda.id}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={copiarId}
              title="Copiar ID"
            >
              {copiado ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            </Button>
          </CardDescription>
        </CardHeader>

        <CardPanel className="flex flex-col gap-6 pt-2">
          {/* // Grid de informações principais */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* // Projeto */}
            <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Folder className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Projeto</span>
                <span className="font-semibold text-foreground text-base">
                  {demanda.projeto_nome}
                </span>
              </div>
            </div>

            {/* // Responsável */}
            <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <User className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Responsável</span>
                <span className="font-semibold text-foreground text-base">
                  {demanda.responsavel_nome}
                </span>
              </div>
            </div>

            {/* // Prazo */}
            <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
              <div
                className={cn(
                  "rounded-lg p-2.5",
                  atrasada ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                )}
              >
                <Calendar className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Prazo limite</span>
                <span
                  className={cn(
                    "font-semibold text-base",
                    atrasada ? "text-destructive" : "text-foreground",
                  )}
                >
                  {formatarPrazo(demanda.prazo)}
                </span>
              </div>
            </div>

            {/* // Alteração rápida de status */}
            <div className="flex items-start gap-3 rounded-xl border bg-card/60 p-4 shadow-xs">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Clock className="size-5" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-muted-foreground text-xs">Alterar Status</span>
                <Select
                  items={[...STATUS_ITENS]}
                  value={statusAtual ?? null}
                  isItemEqualToValue={(a, b) => a.value === b.value}
                  onValueChange={(item) => {
                    if (item && typeof item === "object" && "value" in item) {
                      trocarStatus((item as ItemStatus).value);
                    }
                  }}
                >
                  <SelectTrigger className="h-8">
                    <div className="flex items-center gap-1.5 truncate">
                      {StatusIcone ? (
                        <StatusIcone
                          className={cn("size-3.5 shrink-0", statusAtual?.corTexto)}
                          aria-hidden="true"
                        />
                      ) : null}
                      <SelectValue placeholder="Status">
                        {statusAtual?.label}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectPopup>
                    {STATUS_ITENS.map((item) => {
                      const Icone = item.icone;
                      return (
                        <SelectItem key={item.value} value={item}>
                          <div className="flex items-center gap-1.5">
                            {Icone ? (
                              <Icone
                                className={cn("size-3.5 shrink-0", item.corTexto)}
                                aria-hidden="true"
                              />
                            ) : null}
                            <span>{item.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectPopup>
                </Select>
              </div>
            </div>
          </div>

          {/* // Metadados de auditoria */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-muted-foreground text-xs">
            <span>Criado em: {formatarData(demanda.criado_em)}</span>
            <span>Última atualização: {formatarData(demanda.atualizado_em)}</span>
          </div>
        </CardPanel>
      </Card>

      {/* // Modal de edição de demanda */}
      <Dialog open={dialogEdicao} onOpenChange={setDialogEdicao}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Editar demanda</DialogTitle>
            <DialogDescription>
              Atualize as informações da demanda cadastrada.
            </DialogDescription>
          </DialogHeader>
          <form className="contents" onSubmit={salvarEdicao}>
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
                <Select
                  items={itensProjeto}
                  value={itensProjeto.find((p) => p.value === form.projeto_id) ?? null}
                  isItemEqualToValue={(a, b) => a.value === b.value}
                  onValueChange={(item) =>
                    item && setForm((atual) => ({ ...atual, projeto_id: item.value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectPopup>
                    {itensProjeto.map((p) => (
                      <SelectItem key={p.value} value={p}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Responsável</FieldLabel>
                <Select
                  items={itensUsuario}
                  value={itensUsuario.find((u) => u.value === form.responsavel_id) ?? null}
                  isItemEqualToValue={(a, b) => a.value === b.value}
                  onValueChange={(item) =>
                    item && setForm((atual) => ({ ...atual, responsavel_id: item.value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectPopup>
                    {itensUsuario.map((u) => (
                      <SelectItem key={u.value} value={u}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
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
                <Select
                  items={[...STATUS_ITENS]}
                  value={STATUS_ITENS.find((s) => s.value === form.status) ?? null}
                  isItemEqualToValue={(a, b) => a.value === b.value}
                  onValueChange={(item) =>
                    item && setForm((atual) => ({ ...atual, status: item.value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectPopup>
                    {STATUS_ITENS.map((s) => (
                      <SelectItem key={s.value} value={s}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </Field>
              {erro ? <p className="text-destructive text-sm">{erro}</p> : null}
            </DialogPanel>
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                loading={salvando}
                onClick={excluirDemanda}
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
    </main>
  );
}
