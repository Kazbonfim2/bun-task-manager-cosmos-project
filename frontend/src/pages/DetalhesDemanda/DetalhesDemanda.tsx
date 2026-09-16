import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ItemSelect } from "@/components/SelectSimples";
import {
  api,
  type Demanda,
  type Projeto,
  type Usuario,
} from "@/lib/api";
import {
  DialogDemanda,
  type FormDemandaData,
} from "@/pages/Dashboard/components/DialogDemanda";
import { DemandHeader } from "./components/DemandHeader";
import { DemandOverview } from "./components/DemandOverview";
import { DemandSidebar } from "./components/DemandSidebar";
import { DemandTimeline } from "./components/DemandTimeline";
import { DemandComments } from "./components/DemandComments";
import { DetalhesDemandaSkeleton } from "./components/DetalhesDemandaSkeleton";
import { DialogExcluirDemanda } from "./components/DialogExcluirDemanda";

const FORM_VAZIO: FormDemandaData = {
  titulo: "",
  descricao: "",
  projeto_id: "",
  responsavel_id: "",
  prazo: "",
  status: "aberta",
};

export function DetalhesDemanda() {
  const params = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Suporte flexível para /demandas/:id, /demanda/:id ou /demanda?id=...
  const id = params.id || searchParams.get("id") || "";

  const [demanda, setDemanda] = useState<Demanda | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [dialogEdicao, setDialogEdicao] = useState(false);
  const [dialogExclusao, setDialogExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(false);

  const [form, setForm] = useState<FormDemandaData>(FORM_VAZIO);

  const carregarDados = useCallback(async () => {
    if (!id) {
      setErro("Identificador da demanda não fornecido.");
      setCarregando(false);
      return;
    }
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
  }, [id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function abrirEdicao() {
    if (!demanda) return;
    setForm({
      titulo: demanda.titulo,
      descricao: demanda.descricao || "",
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
    if (!demanda || demanda.status === novoStatus || alterandoStatus) return;
    setAlterandoStatus(true);
    try {
      const atualizada = await api<Demanda>(`/demandas/${demanda.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      setDemanda(atualizada);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao alterar status");
    } finally {
      setAlterandoStatus(false);
    }
  }

  async function confirmarExclusao() {
    if (!demanda) return;
    setSalvando(true);
    try {
      await api(`/demandas/${demanda.id}`, { method: "DELETE" });
      setDialogExclusao(false);
      navigate("/dashboard");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao excluir demanda");
      setSalvando(false);
    }
  }

  if (carregando) {
    return <DetalhesDemandaSkeleton />;
  }

  if (erro || !demanda) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 p-4 pt-16 text-center sm:p-6">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive ring-8 ring-destructive/5">
          <AlertTriangle className="size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Demanda não encontrada</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {erro || "A demanda solicitada não existe, foi removida ou o código informado está incorreto."}
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard")} variant="secondary" className="gap-2">
          <ArrowLeft className="size-4" />
          Voltar para o Dashboard
        </Button>
      </main>
    );
  }

  const itensProjeto: ItemSelect[] = projetos.map((item) => ({
    label: item.nome,
    value: item.id,
  }));
  const itensUsuario: ItemSelect[] = usuarios.map((item) => ({
    label: item.nome_completo,
    value: item.id,
  }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      {/* Cabeçalho de Navegação e Ações */}
      <DemandHeader
        demanda={demanda}
        onEditar={abrirEdicao}
        onSolicitarExclusao={() => setDialogExclusao(true)}
        salvando={salvando}
      />

      {/* Grid Responsivo de 2 Colunas: Conteúdo Principal e Barra Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal (8 colunas em desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <DemandOverview
            demanda={demanda}
            alterandoStatus={alterandoStatus}
            onTrocarStatus={trocarStatus}
          />

          <DemandTimeline demanda={demanda} />

          <DemandComments demandaId={demanda.id} />
        </div>

        {/* Coluna Lateral (4 colunas em desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-20">
          <DemandSidebar
            demanda={demanda}
            usuarios={usuarios}
            alterandoStatus={alterandoStatus}
            onTrocarStatus={trocarStatus}
          />
        </div>
      </div>

      {/* Modal de Edição de Demanda */}
      <DialogDemanda
        aberto={dialogEdicao}
        onOpenChange={setDialogEdicao}
        editando={demanda}
        form={form}
        setForm={setForm}
        itensProjeto={itensProjeto}
        itensUsuario={itensUsuario}
        usuarios={usuarios}
        salvando={salvando}
        erro={erro}
        onSalvar={salvarEdicao}
        onExcluir={() => {
          setDialogEdicao(false);
          setDialogExclusao(true);
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DialogExcluirDemanda
        aberto={dialogExclusao}
        onOpenChange={setDialogExclusao}
        demandaId={demanda.id}
        demandaTitulo={demanda.titulo}
        demandaDescricao={demanda.descricao || ""}
        excluindo={salvando}
        onConfirmar={confirmarExclusao}
      />
    </main>
  );
}
