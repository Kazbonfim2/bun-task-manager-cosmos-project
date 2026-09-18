import { useEffect, useMemo, useRef, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { type ItemSelect } from "@/components/SelectSimples";
import {
  api,
  type Demanda,
  type Projeto,
  type Usuario,
} from "@/lib/api";
import { invalidarCache, useCachedFetch } from "@/hooks/useCachedFetch";
import { demandaAtrasada, STATUS_ITENS } from "@/lib/status";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Kanban, ListFilter, SquareDashed } from "lucide-react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { DashboardCards } from "./components/DashboardCards";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardPagination } from "./components/DashboardPagination";
import { DashboardProjects } from "./components/DashboardProjects";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { DemandasGrid } from "./components/DemandasGrid";
import { DemandasKanban } from "./components/DemandasKanban";
import { DemandasTabela } from "./components/DemandasTabela";
import { DialogDemanda, type FormDemandaData } from "./components/DialogDemanda";
import { DialogProjeto } from "./components/DialogProjeto";

const FILTRO_TODOS: ItemSelect = { label: "Todos os responsáveis", value: "todos" };
const FILTRO_PROJETO_TODOS: ItemSelect = { label: "Todos os projetos", value: "todos" };

const FORM_VAZIO: FormDemandaData = {
  titulo: "",
  descricao: "",
  projeto_id: "",
  responsavel_id: "",
  prazo: "",
  status: "a_fazer",
};

export function Dashboard() {
  const navigate = useNavigate();

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [filtroProjeto, setFiltroProjeto] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modoVisualizacao, setModoVisualizacao] = useState<"lista" | "cards">("lista");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [erro, setErro] = useState("");

  // Demandas com cache local (filtros de servidor: responsável e projeto)
  const demandasPath = useMemo(() => {
    const params = new URLSearchParams();
    if (filtroResponsavel !== "todos") params.set("responsavel_id", filtroResponsavel);
    if (filtroProjeto !== "todos") params.set("projeto_id", filtroProjeto);
    const query = params.toString();
    return `/demandas${query ? `?${query}` : ""}`;
  }, [filtroResponsavel, filtroProjeto]);

  const {
    data: demandasData,
    loading,
    isCached,
    refetch: recarregarDemandas,
    setData: setDemandasCache,
  } = useCachedFetch<Demanda[]>(demandasPath);
  const demandas = useMemo(() => demandasData ?? [], [demandasData]);
  const carregando = loading && !isCached;
  const [dialogDemanda, setDialogDemanda] = useState(false);
  const [dialogProjeto, setDialogProjeto] = useState(false);
  const [editando, setEditando] = useState<Demanda | null>(null);
  const [projetoEditando, setProjetoEditando] = useState<Projeto | null>(null);
  const [form, setForm] = useState<FormDemandaData>(FORM_VAZIO);
  const [projetoNome, setProjetoNome] = useState("");
  const [projetoDescricao, setProjetoDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const demandasFiltradas = useMemo(() => {
    let lista = demandas;
    if (filtroStatus === "atrasadas") {
      lista = lista.filter((d) => demandaAtrasada(d.prazo, d.status));
    } else if (filtroStatus !== "todos") {
      lista = lista.filter((d) => d.status === filtroStatus);
    }

    const termo = busca.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter((demanda) => {
      const statusLabel =
        STATUS_ITENS.find((s) => s.value === demanda.status)?.label ?? "";
      const prazoApenasData = demanda.prazo.slice(0, 10);
      const partesData = prazoApenasData.split("-");
      const prazoFormatado =
        partesData.length === 3
          ? `${partesData[2]}/${partesData[1]}/${partesData[0]}`
          : "";

      const texto = [
        demanda.titulo,
        demanda.descricao,
        demanda.projeto_nome,
        demanda.responsavel_nome,
        demanda.status,
        statusLabel,
        demanda.prazo,
        prazoApenasData,
        prazoFormatado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [demandas, filtroStatus, busca]);

  // Listagem de conteúdos - número fixo definido como 10, pode ser alterado conforme a necessidade.
  const ITENS_POR_PAGINA = 10;
  const totalPaginas = Math.max(1, Math.ceil(demandasFiltradas.length / ITENS_POR_PAGINA));

  const demandasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return demandasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [demandasFiltradas, paginaAtual]);

  // Sis. de filtros por Responsável
  const itensResponsavel = useMemo<ItemSelect[]>(
    () => [
      FILTRO_TODOS,
      ...usuarios.map((item) => ({ label: item.nome_completo, value: item.id })),
    ],
    [usuarios],
  );
  // Sis. de filtros por Projeto
  const itensProjeto = useMemo<ItemSelect[]>(
    () => projetos.map((item) => ({ label: item.nome, value: item.id })),
    [projetos],
  );
  const itensFiltroProjeto = useMemo<ItemSelect[]>(
    () => [FILTRO_PROJETO_TODOS, ...itensProjeto],
    [itensProjeto],
  );
  // Sis. de filtros por Usuário 
  const itensUsuario = useMemo<ItemSelect[]>(
    () => usuarios.map((item) => ({ label: item.nome_completo, value: item.id })),
    [usuarios],
  );

  async function carregarListas() {
    const [listaProjetos, listaUsuarios] = await Promise.all([
      api<Projeto[]>("/projetos"),
      api<Usuario[]>("/usuarios"),
    ]);
    setProjetos(listaProjetos);
    setUsuarios(listaUsuarios);
  }

  // Mantém referência estável do refetch para o listener de troca de grupo
  const recarregarDemandasRef = useRef(recarregarDemandas);
  recarregarDemandasRef.current = recarregarDemandas;

  useEffect(() => {
    carregarListas().catch((falha: unknown) => {
      setErro(falha instanceof Error ? falha.message : "Falha ao carregar");
    });

    function recarregar() {
      setFiltroResponsavel("todos");
      setFiltroProjeto("todos");
      invalidarCache("/demandas");
      carregarListas().catch((falha: unknown) => {
        setErro(falha instanceof Error ? falha.message : "Falha ao carregar");
      });
      recarregarDemandasRef.current();
    }

    window.addEventListener("orion:grupo-alterado", recarregar);
    return () => {
      window.removeEventListener("orion:grupo-alterado", recarregar);
    };
  }, []);

  // Troca de página ao mudar filtros de servidor (o cache refaz o fetch pelo path)
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroResponsavel, filtroProjeto]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, busca]);

  const total = demandas.length;
  const abertas = demandas.filter((item) => item.status !== "concluida").length;
  const atrasadas = demandas.filter((item) => demandaAtrasada(item.prazo, item.status)).length;

  function selecionarProjeto(id: string) {
    setFiltroProjeto((anterior) => (anterior === id ? "todos" : id));
  }

  function abrirNovaDemanda() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErro("");
    setDialogDemanda(true);
  }

  function abrirEdicao(demanda: Demanda) {
    setEditando(demanda);
    setForm({
      titulo: demanda.titulo,
      descricao: demanda.descricao || "",
      projeto_id: demanda.projeto_id,
      responsavel_id: demanda.responsavel_id,
      prazo: demanda.prazo.slice(0, 10),
      status: demanda.status,
    });
    setErro("");
    setDialogDemanda(true);
  }

  async function salvarDemanda(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const corpo = JSON.stringify(form);
      if (editando) {
        await api(`/demandas/${editando.id}`, { method: "PUT", body: corpo });
      } else {
        await api("/demandas", { method: "POST", body: corpo });
      }
      setDialogDemanda(false);
      invalidarCache("/demandas");
      await Promise.all([recarregarDemandas(), carregarListas()]);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao salvar demanda");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirDemanda() {
    if (!editando) return;
    setSalvando(true);
    setErro("");
    try {
      await api(`/demandas/${editando.id}`, { method: "DELETE" });
      setDialogDemanda(false);
      setEditando(null);
      invalidarCache("/demandas");
      await Promise.all([recarregarDemandas(), carregarListas()]);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao excluir demanda");
    } finally {
      setSalvando(false);
    }
  }

  function abrirModalProjeto(projeto: Projeto | null = null) {
    setProjetoEditando(projeto);
    setProjetoNome(projeto ? projeto.nome : "");
    setProjetoDescricao(projeto ? projeto.descricao || "" : "");
    setErro("");
    setDialogProjeto(true);
  }

  function selecionarProjetoParaEditar(projeto: Projeto | null) {
    setProjetoEditando(projeto);
    setProjetoNome(projeto ? projeto.nome : "");
    setProjetoDescricao(projeto ? projeto.descricao || "" : "");
    setErro("");
  }

  async function salvarProjeto(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      if (projetoEditando) {
        await api(`/projetos/${projetoEditando.id}`, {
          method: "PUT",
          body: JSON.stringify({
            nome: projetoNome,
            descricao: projetoDescricao || null,
          }),
        });
      } else {
        await api("/projetos", {
          method: "POST",
          body: JSON.stringify({
            nome: projetoNome,
            descricao: projetoDescricao || null,
          }),
        });
      }
      setProjetoNome("");
      setProjetoDescricao("");
      setProjetoEditando(null);
      setDialogProjeto(false);
      invalidarCache("/demandas");
      await carregarListas();
      await recarregarDemandas();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao salvar projeto");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProjeto() {
    if (!projetoEditando) return;
    setSalvando(true);
    setErro("");
    try {
      const idExcluido = projetoEditando.id;
      await api(`/projetos/${idExcluido}`, { method: "DELETE" });
      if (filtroProjeto === idExcluido) {
        setFiltroProjeto("todos");
      }
      setProjetoNome("");
      setProjetoDescricao("");
      setProjetoEditando(null);
      setDialogProjeto(false);
      invalidarCache("/demandas");
      await carregarListas();
      await recarregarDemandas();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao excluir projeto");
    } finally {
      setSalvando(false);
    }
  }

  function exportarCsv() {
    if (!demandasFiltradas.length) return;
    const cabecalho = ["ID", "Título", "Descrição", "Projeto", "Responsável", "Prazo", "Status"];
    const linhas = demandasFiltradas.map((d) => [
      `"${d.id}"`,
      `"${d.titulo.replace(/"/g, '""')}"`,
      `"${(d.descricao || "").replace(/"/g, '""')}"`,
      `"${d.projeto_nome.replace(/"/g, '""')}"`,
      `"${d.responsavel_nome.replace(/"/g, '""')}"`,
      `"${d.prazo.slice(0, 10)}"`,
      `"${d.status}"`,
    ]);
    const conteudo = [cabecalho.join(";"), ...linhas.map((l) => l.join(";"))].join("\r\n");
    const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `demandas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function trocarStatus(id: string, status: string) {
    setDemandasCache((anteriores) =>
      (anteriores ?? []).map((d) => (d.id === id ? { ...d, status } : d)),
    );
    try {
      await api(`/demandas/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      invalidarCache("/demandas");
      await carregarListas();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao alterar status");
      await recarregarDemandas();
    }
  }

  async function reordenarDemandas(itens: { id: string; ordem: number }[]) {
    if (!itens.length) return;
    const mapa = new Map(itens.map((i) => [i.id, i.ordem]));
    setDemandasCache((anteriores) =>
      (anteriores ?? []).map((d) => (mapa.has(d.id) ? { ...d, ordem: mapa.get(d.id) } : d)),
    );
    try {
      await api("/demandas/reordenar", { method: "PATCH", body: JSON.stringify({ itens }) });
      invalidarCache("/demandas");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao reordenar demandas");
      await recarregarDemandas();
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      {/* 1. Cabeçalho com saudação dinâmica */}
      <ScrollReveal direction="down" duration={350}>
        <DashboardHeader />
      </ScrollReveal>

      {/* 2. Cards para exibição de totais de demandas em aberto, concluídas e atrasadas */}
      <DashboardCards
        total={total}
        abertas={abertas}
        atrasadas={atrasadas}
        onFiltrarStatus={setFiltroStatus}
      />

      {/* 3. Seção visual de Projetos */}
      <ScrollReveal direction="up" delay={80} duration={350}>
        <DashboardProjects
          projetos={projetos}
          filtroProjeto={filtroProjeto}
          onSelecionarProjeto={selecionarProjeto}
          onNovoProjeto={() => abrirModalProjeto(null)}
        />
      </ScrollReveal>

      {/* 4. Seção principal com Tabs (Demandas, Kanban e Nova Aba em branco) */}
      <ScrollReveal direction="up" delay={140} duration={400} className="flex flex-col gap-4">
        <Tabs defaultValue="demandas" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-2">
            <TabsList>
              <TabsTab value="demandas" className="flex items-center gap-1.5">
                <ListFilter className="size-4" />
                <span>Demandas</span>
              </TabsTab>
              <TabsTab value="kanban" className="flex items-center gap-1.5">
                <Kanban className="size-4" />
                <span>Kanban</span>
              </TabsTab>
              <TabsTab value="em-branco" className="flex items-center gap-1.5">
                <SquareDashed className="size-4" />
                <span>Nova Tab</span>
              </TabsTab>
            </TabsList>
          </div>

          {/* Tab 1: Demandas (Listagem / Grid) */}
          <TabsPanel value="demandas" className="flex flex-col gap-4">
            {/* Barra de ferramentas superior: filtros, alternador de visualização, busca e criação */}
            <DashboardToolbar
              itensResponsavel={itensResponsavel}
              filtroResponsavel={filtroResponsavel}
              onMudarFiltroResponsavel={setFiltroResponsavel}
              itensProjeto={itensFiltroProjeto}
              filtroProjeto={filtroProjeto}
              onMudarFiltroProjeto={setFiltroProjeto}
              filtroStatus={filtroStatus}
              onMudarFiltroStatus={setFiltroStatus}
              modoVisualizacao={modoVisualizacao}
              onMudarModoVisualizacao={setModoVisualizacao}
              busca={busca}
              onMudarBusca={setBusca}
              desabilitarNovaDemanda={projetos.length === 0}
              onAbrirNovoProjeto={() => abrirModalProjeto(null)}
              onAbrirNovaDemanda={abrirNovaDemanda}
              onExportarCsv={exportarCsv}
            />

            {/* Exibição de mensagem de erro global da dashboard */}
            {erro && !dialogDemanda && !dialogProjeto ? (
              <p className="text-destructive text-sm">{erro}</p>
            ) : null}

            {/* Exibição: mobile sempre em cards; desktop respeita a alternância entre tabela e cards */}
            {modoVisualizacao === "lista" ? (
              <>
                <div className="sm:hidden">
                  <DemandasGrid
                    demandas={demandasPaginadas}
                    busca={busca}
                    carregando={carregando}
                    onVisualizarDemanda={(id) => navigate(`/demandas/${id}`)}
                    onTrocarStatus={trocarStatus}
                    onEditarDemanda={abrirEdicao}
                  />
                </div>
                <div className="hidden sm:block">
                  <DemandasTabela
                    demandas={demandasPaginadas}
                    busca={busca}
                    carregando={carregando}
                    onVisualizarDemanda={(id) => navigate(`/demandas/${id}`)}
                    onTrocarStatus={trocarStatus}
                    onEditarDemanda={abrirEdicao}
                  />
                </div>
              </>
            ) : (
              <DemandasGrid
                demandas={demandasPaginadas}
                busca={busca}
                carregando={carregando}
                onVisualizarDemanda={(id) => navigate(`/demandas/${id}`)}
                onTrocarStatus={trocarStatus}
                onEditarDemanda={abrirEdicao}
              />
            )}

            {/* Rodapé fixo de paginação com resumo numérico de itens e controles */}
            <DashboardPagination
              totalItens={demandasFiltradas.length}
              paginaAtual={paginaAtual}
              itensPorPagina={ITENS_POR_PAGINA}
              totalPaginas={totalPaginas}
              onMudarPagina={setPaginaAtual}
            />
          </TabsPanel>

          {/* Tab 2: Kanban (4 steps com @dnd-kit) */}
          <TabsPanel value="kanban" className="flex flex-col gap-4">
            <DashboardToolbar
              itensResponsavel={itensResponsavel}
              filtroResponsavel={filtroResponsavel}
              onMudarFiltroResponsavel={setFiltroResponsavel}
              itensProjeto={itensFiltroProjeto}
              filtroProjeto={filtroProjeto}
              onMudarFiltroProjeto={setFiltroProjeto}
              filtroStatus={filtroStatus}
              onMudarFiltroStatus={setFiltroStatus}
              modoVisualizacao={modoVisualizacao}
              onMudarModoVisualizacao={setModoVisualizacao}
              busca={busca}
              onMudarBusca={setBusca}
              desabilitarNovaDemanda={projetos.length === 0}
              onAbrirNovoProjeto={() => abrirModalProjeto(null)}
              onAbrirNovaDemanda={abrirNovaDemanda}
              onExportarCsv={exportarCsv}
            />

            {erro && !dialogDemanda && !dialogProjeto ? (
              <p className="text-destructive text-sm">{erro}</p>
            ) : null}

            <DemandasKanban
              demandas={demandasFiltradas}
              carregando={carregando}
              onVisualizarDemanda={(id) => navigate(`/demandas/${id}`)}
              onTrocarStatus={trocarStatus}
              onReordenar={reordenarDemandas}
              onEditarDemanda={abrirEdicao}
            />
          </TabsPanel>

          {/* Tab 3: Nova Tab em Branco (T1) */}
          <TabsPanel value="em-branco">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center min-h-[360px]">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-xs">
                <SquareDashed className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold">Nova Tab em Branco</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Esta aba está pronta e reservada para futuras funcionalidades e visualizações personalizadas do sistema.
              </p>
            </div>
          </TabsPanel>
        </Tabs>
      </ScrollReveal>

      {/* // Diálogo modal para criar ou editar demanda (com ação de excluir) */}
      <DialogDemanda
        aberto={dialogDemanda}
        onOpenChange={setDialogDemanda}
        editando={editando}
        form={form}
        setForm={setForm}
        itensProjeto={itensProjeto}
        itensUsuario={itensUsuario}
        usuarios={usuarios}
        salvando={salvando}
        erro={erro}
        onSalvar={salvarDemanda}
        onExcluir={excluirDemanda}
      />

      {/* // Diálogo modal para criação e gestão de projetos */}
      <DialogProjeto
        aberto={dialogProjeto}
        onOpenChange={setDialogProjeto}
        projetos={projetos}
        projetoEditando={projetoEditando}
        onSelecionarParaEditar={selecionarProjetoParaEditar}
        nome={projetoNome}
        setNome={setProjetoNome}
        descricao={projetoDescricao}
        setDescricao={setProjetoDescricao}
        salvando={salvando}
        erro={erro}
        onSalvar={salvarProjeto}
        onExcluir={excluirProjeto}
      />
    </main>
  );
}
