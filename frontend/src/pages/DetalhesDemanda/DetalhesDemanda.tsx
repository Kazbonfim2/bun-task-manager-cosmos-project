import { AlertTriangle, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ItemSelect } from "@/components/SelectSimples";
import {
  api,
  type Demanda,
  type Projeto,
  type Usuario,
} from "@/lib/api";
import { CardDetalhesDemanda } from "./components/CardDetalhesDemanda";
import {
  DialogDemanda,
  type FormDemandaData,
} from "@/pages/Dashboard/components/DialogDemanda";

const FORM_VAZIO: FormDemandaData = {
  descricao: "",
  projeto_id: "",
  responsavel_id: "",
  prazo: "",
  status: "aberta",
};

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

  const [form, setForm] = useState<FormDemandaData>(FORM_VAZIO);

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

  async function salvarEdicao(evento: SubmitEvent<HTMLFormElement>) {
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

  const itensProjeto: ItemSelect[] = projetos.map((item) => ({ label: item.nome, value: item.id }));
  const itensUsuario: ItemSelect[] = usuarios.map((item) => ({ label: item.nome_completo, value: item.id }));

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
      <CardDetalhesDemanda
        demanda={demanda}
        onTrocarStatus={trocarStatus}
      />

      {/* // Modal de edição de demanda */}
      <DialogDemanda
        aberto={dialogEdicao}
        onOpenChange={setDialogEdicao}
        editando={demanda}
        form={form}
        setForm={setForm}
        itensProjeto={itensProjeto}
        itensUsuario={itensUsuario}
        salvando={salvando}
        erro={erro}
        onSalvar={salvarEdicao}
        onExcluir={excluirDemanda}
      />
    </main>
  );
}
