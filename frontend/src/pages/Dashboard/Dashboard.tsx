import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { type ItemSelect } from "@/components/SelectSimples";
import {
  api,
  type Demanda,
  type Projeto,
  type Usuario,
} from "@/lib/api";
import { demandaAtrasada, STATUS_ITENS } from "@/lib/status";
import { DashboardCards } from "./components/DashboardCards";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardPagination } from "./components/DashboardPagination";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { DemandasGrid } from "./components/DemandasGrid";
import { DemandasTabela } from "./components/DemandasTabela";
import { DialogDemanda, type FormDemandaData } from "./components/DialogDemanda";
import { DialogProjeto } from "./components/DialogProjeto";

const FILTRO_TODOS: ItemSelect = { label: "Todos os responsáveis", value: "todos" };

const FORM_VAZIO: FormDemandaData = {
  descricao: "",
  projeto_id: "",
  responsavel_id: "",
  prazo: "",
  status: "aberta",
};

export function Dashboard() {
  const navigate = useNavigate();

  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modoVisualizacao, setModoVisualizacao] = useState<"lista" | "cards">("lista");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [dialogDemanda, setDialogDemanda] = useState(false);
  const [dialogProjeto, setDialogProjeto] = useState(false);
  const [editando, setEditando] = useState<Demanda | null>(null);
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

  async function carregarDemandas() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroResponsavel !== "todos") params.set("responsavel_id", filtroResponsavel);
      const query = params.toString();
      const dados = await api<Demanda[]>(`/demandas${query ? `?${query}` : ""}`);
      setDemandas(dados);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarListas().catch((falha: unknown) => {
      setErro(falha instanceof Error ? falha.message : "Falha ao carregar");
    });
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
    carregarDemandas().catch((falha: unknown) => {
      setErro(falha instanceof Error ? falha.message : "Falha ao carregar");
    });
  }, [filtroResponsavel]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, busca]);

  const total = demandas.length;
  const abertas = demandas.filter((item) => item.status !== "concluida").length;
  const atrasadas = demandas.filter((item) => demandaAtrasada(item.prazo, item.status)).length;

  function abrirNovaDemanda() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErro("");
    setDialogDemanda(true);
  }

  function abrirEdicao(demanda: Demanda) {
    setEditando(demanda);
    setForm({
      descricao: demanda.descricao,
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
      await carregarDemandas();
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
      await carregarDemandas();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao excluir demanda");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarProjeto(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      await api("/projetos", {
        method: "POST",
        body: JSON.stringify({
          nome: projetoNome,
          descricao: projetoDescricao || null,
        }),
      });
      setProjetoNome("");
      setProjetoDescricao("");
      setDialogProjeto(false);
      await carregarListas();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao criar projeto");
    } finally {
      setSalvando(false);
    }
  }

  async function trocarStatus(id: string, status: string) {
    try {
      await api(`/demandas/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await carregarDemandas();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao alterar status");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      {/* // Cabeçalho com saudação dinâmica e efeito de digitação (typewriter) */}
      <DashboardHeader />

      {/* // Cards para exibição de totais de demandas em aberto, concluídas e atrasadas */}
      <DashboardCards
        total={total}
        abertas={abertas}
        atrasadas={atrasadas}
        onFiltrarStatus={setFiltroStatus}
      />

      {/* // Seção principal de listagem de demandas, filtros e ações */}
      <section className="flex flex-col gap-4">
        {/* // Barra de ferramentas superior: filtros, alternador de visualização, busca e criação */}
        <DashboardToolbar
          itensResponsavel={itensResponsavel}
          filtroResponsavel={filtroResponsavel}
          onMudarFiltroResponsavel={setFiltroResponsavel}
          filtroStatus={filtroStatus}
          onMudarFiltroStatus={setFiltroStatus}
          modoVisualizacao={modoVisualizacao}
          onMudarModoVisualizacao={setModoVisualizacao}
          busca={busca}
          onMudarBusca={setBusca}
          onAbrirNovoProjeto={() => setDialogProjeto(true)}
          onAbrirNovaDemanda={abrirNovaDemanda}
        />

        {/* // Exibição de mensagem de erro global da dashboard */}
        {erro && !dialogDemanda && !dialogProjeto ? (
          <p className="text-destructive text-sm">{erro}</p>
        ) : null}

        {/* // Exibição: mobile sempre em cards; desktop respeita a alternância entre tabela e cards */}
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

        {/* // Rodapé fixo de paginação com resumo numérico de itens e controles */}
        <DashboardPagination
          totalItens={demandasFiltradas.length}
          paginaAtual={paginaAtual}
          itensPorPagina={ITENS_POR_PAGINA}
          totalPaginas={totalPaginas}
          onMudarPagina={setPaginaAtual}
        />
      </section>

      {/* // Diálogo modal para criar ou editar demanda (com ação de excluir) */}
      <DialogDemanda
        aberto={dialogDemanda}
        onOpenChange={setDialogDemanda}
        editando={editando}
        form={form}
        setForm={setForm}
        itensProjeto={itensProjeto}
        itensUsuario={itensUsuario}
        salvando={salvando}
        erro={erro}
        onSalvar={salvarDemanda}
        onExcluir={excluirDemanda}
      />

      {/* // Diálogo modal para criação de novo projeto */}
      <DialogProjeto
        aberto={dialogProjeto}
        onOpenChange={setDialogProjeto}
        nome={projetoNome}
        setNome={setProjetoNome}
        descricao={projetoDescricao}
        setDescricao={setProjetoDescricao}
        salvando={salvando}
        erro={erro}
        onSalvar={salvarProjeto}
      />
    </main>
  );
}
