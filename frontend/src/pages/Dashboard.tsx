import {
  AlertTriangle,
  CircleDot,
  ClipboardList,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import {
  api,
  type Demanda,
  type Projeto,
  type Usuario,
} from "@/lib/api";
import { lerUsuario } from "@/lib/auth";
import {
  demandaAtrasada,
  FILTRO_STATUS_ITENS,
  STATUS_ITENS,
  type ItemStatus,
} from "@/lib/status";
import { cn } from "@/lib/utils";

type ItemSelect = ItemStatus;

const FILTRO_TODOS: ItemSelect = { label: "Todos os responsáveis", value: "todos" };

function SelectSimples({
  itens,
  valor,
  aoMudar,
  placeholder,
}: {
  itens: readonly ItemSelect[];
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder: string;
}) {
  const selecionado = itens.find((item) => item.value === valor) ?? null;
  const IconeSelecionado = selecionado?.icone;
  return (
    <Select
      items={[...itens]}
      value={selecionado}
      isItemEqualToValue={(a, b) => a.value === b.value}
      onValueChange={(item) => {
        if (item && typeof item === "object" && "value" in item) {
          aoMudar(item.value);
        }
      }}
    >
      <SelectTrigger>
        <div className="flex items-center gap-1.5 truncate">
          {IconeSelecionado ? (
            <IconeSelecionado
              className={cn("size-3.5 shrink-0", selecionado.corTexto)}
              aria-hidden="true"
            />
          ) : null}
          <SelectValue placeholder={placeholder}>
            {selecionado ? selecionado.label : undefined}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectPopup>
        {itens.map((item) => {
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
  );
}

function obterFraseDinamica(nome?: string): string {
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const prefixo = nome ? `${saudacao}, ${nome}` : saudacao;

  const frases = [
    `${prefixo}, o que vamos agendar hoje?`,
    `${prefixo}, quais são seus planos para hoje?`,
    `${prefixo}, pronto para organizar o fluxo de demandas?`,
    `${prefixo}, quais prioridades vamos atacar agora?`,
    `${prefixo}, o que vamos construir hoje?`,
    `${prefixo}, foco no que importa: o que vamos resolver hoje?`,
    `Tudo pronto${nome ? `, ${nome}` : ""}. O que vamos planejar hoje?`,
  ];

  return frases[Math.floor(Math.random() * frases.length)];
}

const FORM_VAZIO = {
  descricao: "",
  projeto_id: "",
  responsavel_id: "",
  prazo: "",
  status: "aberta",
};

export function Dashboard() {
  const navigate = useNavigate();
  const usuarioLogado = useMemo(() => lerUsuario(), []);
  const fraseDinamica = useMemo(
    () => obterFraseDinamica(usuarioLogado?.nome_completo?.split(" ")[0]),
    [usuarioLogado],
  );
  const [textoDigitado, setTextoDigitado] = useState("");

  useEffect(() => {
    let indice = 0;
    setTextoDigitado("");
    const timer = setInterval(() => {
      indice += 1;
      setTextoDigitado(fraseDinamica.slice(0, indice));
      if (indice >= fraseDinamica.length) clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [fraseDinamica]);

  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modoVisualizacao, setModoVisualizacao] = useState<"lista" | "cards">("lista");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [erro, setErro] = useState("");
  const [dialogDemanda, setDialogDemanda] = useState(false);
  const [dialogProjeto, setDialogProjeto] = useState(false);
  const [editando, setEditando] = useState<Demanda | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [projetoNome, setProjetoNome] = useState("");
  const [projetoDescricao, setProjetoDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const demandasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return demandas;
    return demandas.filter((demanda) => {
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
  }, [demandas, busca]);

  const ITENS_POR_PAGINA = 6;
  const totalPaginas = Math.max(1, Math.ceil(demandasFiltradas.length / ITENS_POR_PAGINA));

  const demandasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return demandasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [demandasFiltradas, paginaAtual]);

  const itensResponsavel = useMemo<ItemSelect[]>(
    () => [
      FILTRO_TODOS,
      ...usuarios.map((item) => ({ label: item.nome_completo, value: item.id })),
    ],
    [usuarios],
  );
  const itensProjeto = useMemo<ItemSelect[]>(
    () => projetos.map((item) => ({ label: item.nome, value: item.id })),
    [projetos],
  );
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
    const params = new URLSearchParams();
    if (filtroResponsavel !== "todos") params.set("responsavel_id", filtroResponsavel);
    if (filtroStatus !== "todos") params.set("status", filtroStatus);
    const query = params.toString();
    const dados = await api<Demanda[]>(`/demandas${query ? `?${query}` : ""}`);
    setDemandas(dados);
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
  }, [filtroResponsavel, filtroStatus]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

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

  async function salvarDemanda(evento: FormEvent<HTMLFormElement>) {
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

  async function salvarProjeto(evento: FormEvent<HTMLFormElement>) {
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
      <header className="pt-2">
        <h1 className="font-heading min-h-11 text-4xl font-bold tracking-tight text-foreground">
          {textoDigitado}
          <span
            className={cn(
              "ml-1 inline-block h-8 w-2.5 translate-y-1 bg-primary align-baseline",
              textoDigitado.length < fraseDinamica.length ? "opacity-100" : "animate-pulse",
            )}
            aria-hidden="true"
          />
        </h1>
      </header>

      {/* // Cards para exibição de totais de demandas em aberto, concluídas e atrasadas */}
      <section className="grid gap-3 sm:grid-cols-3">
        {/* // Card de total de demandas cadastradas */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Card
                className="transition-transform duration-200 md:hover:-translate-y-1 md:hover:cursor-pointer"
                onClick={() => setFiltroStatus("todos")}
              >
                <CardHeader>
                  <CardDescription>Total</CardDescription>
                  <CardTitle className="text-3xl">{total}</CardTitle>
                  <CardAction>
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                      <ClipboardList className="size-5" aria-hidden="true" />
                    </div>
                  </CardAction>
                </CardHeader>
              </Card>
            }
          />
          <TooltipPopup>Clique para ver todas as demandas</TooltipPopup>
        </Tooltip>

        {/* // Card de demandas em aberto */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Card
                className="transition-transform duration-200 md:hover:-translate-y-1 md:hover:cursor-pointer"
                onClick={() => setFiltroStatus("aberta")}
              >
                <CardHeader>
                  <CardDescription>Abertas</CardDescription>
                  <CardTitle className="text-3xl">{abertas}</CardTitle>
                  <CardAction>
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                      <CircleDot className="size-5" aria-hidden="true" />
                    </div>
                  </CardAction>
                </CardHeader>
              </Card>
            }
          />
          <TooltipPopup>Clique para filtrar apenas demandas em aberto</TooltipPopup>
        </Tooltip>

        {/* // Card de demandas atrasadas com prazo vencido */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Card className="transition-transform duration-200 md:hover:-translate-y-1">
                <CardHeader>
                  <CardDescription>Atrasadas</CardDescription>
                  <CardTitle className="text-3xl">{atrasadas}</CardTitle>
                  <CardAction>
                    <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                      <AlertTriangle className="size-5" aria-hidden="true" />
                    </div>
                  </CardAction>
                </CardHeader>
              </Card>
            }
          />
          <TooltipPopup>Quantidade de demandas com prazo vencido e não concluídas</TooltipPopup>
        </Tooltip>
      </section>

      {/* // Seção principal de listagem de demandas, filtros e ações */}
      <section className="flex flex-col gap-4">
        {/* // Barra de ferramentas superior: filtros, alternador de visualização, busca e criação */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {/* // Filtros por responsável e status */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* // Filtro por responsável */}
            <Field className="w-full sm:w-52">
              <FieldLabel>Responsável</FieldLabel>
              <SelectSimples
                itens={itensResponsavel}
                valor={filtroResponsavel}
                aoMudar={setFiltroResponsavel}
                placeholder="Responsável"
              />
            </Field>
            {/* // Filtro por status */}
            <Field className="w-full sm:w-52">
              <FieldLabel>Status</FieldLabel>
              <SelectSimples
                itens={FILTRO_STATUS_ITENS}
                valor={filtroStatus}
                aoMudar={setFiltroStatus}
                placeholder="Status"
              />
            </Field>
          </div>

          {/* // Ações da barra de ferramentas: alternador de modo, botões e campo de busca */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {/* // Grupo de botões de ação e alternador */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* // Alternador de modo de visualização (lista em tabela ou grade de cards) */}
              <div className="flex items-center rounded-lg border bg-muted p-0.5 shrink-0">
                <Button
                  type="button"
                  variant={modoVisualizacao === "lista" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2.5"
                  onClick={() => setModoVisualizacao("lista")}
                  title="Visualização em lista"
                  aria-label="Visualização em lista"
                >
                  <List aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={modoVisualizacao === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2.5"
                  onClick={() => setModoVisualizacao("cards")}
                  title="Visualização em cards"
                  aria-label="Visualização em cards"
                >
                  <LayoutGrid aria-hidden="true" className="size-4" />
                </Button>
              </div>

              {/* // Botão para abertura do diálogo de criação de novo projeto */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogProjeto(true)}
                className="flex-1 sm:flex-initial"
              >
                Novo projeto
              </Button>

              {/* // Botão para abertura do diálogo de criação de nova demanda */}
              <Button
                type="button"
                onClick={abrirNovaDemanda}
                className="flex-1 sm:flex-initial"
              >
                <Plus aria-hidden="true" />
                Nova demanda
              </Button>
            </div>

            {/* // Campo de busca em tempo real por entidade demanda */}
            <InputGroup className="w-full sm:w-60">
              <InputGroupAddon>
                <InputGroupText>
                  <Search className="size-4" aria-hidden="true" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Buscar demandas..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                aria-label="Buscar demandas"
              />
            </InputGroup>
          </div>
        </div>

        {/* // Exibição de mensagem de erro global da dashboard */}
        {erro && !dialogDemanda && !dialogProjeto ? (
          <p className="text-destructive text-sm">{erro}</p>
        ) : null}

        {/* // Exibição em tabela (modo lista) */}
        {modoVisualizacao === "lista" ? (
          <Table variant="card">
            {/* // Cabeçalho da tabela de demandas */}
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Ações</TableHead>
              </TableRow>
            </TableHeader>
            {/* // Corpo da tabela de demandas paginadas */}
            <TableBody>
              {demandasPaginadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    {busca ? "Nenhuma demanda encontrada para a busca." : "Nenhuma demanda nesta lista."}
                  </TableCell>
                </TableRow>
              ) : (
                demandasPaginadas.map((demanda) => {
                  const atrasada = demandaAtrasada(demanda.prazo, demanda.status);
                  return (
                    <TableRow
                      key={demanda.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        atrasada ? "bg-destructive/6" : undefined,
                      )}
                      onClick={() => navigate(`/demandas/${demanda.id}`)}
                    >
                      <TableCell className="font-medium">{demanda.projeto_nome}</TableCell>
                      <TableCell className="max-w-xs md:max-w-sm">
                        <div className="flex flex-col gap-1">
                          {/* // Tooltip com descrição completa ao fazer hover */}
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="block truncate cursor-pointer font-medium hover:underline">
                                  {demanda.descricao}
                                </span>
                              }
                            />
                            <TooltipPopup className="max-w-xs sm:max-w-sm whitespace-normal break-words">
                              {demanda.descricao}
                            </TooltipPopup>
                          </Tooltip>
                          {atrasada ? (
                            <Badge variant="destructive" className="w-fit">
                              Atrasada
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{demanda.responsavel_nome}</TableCell>
                      <TableCell>{demanda.prazo.slice(0, 10)}</TableCell>
                      <TableCell className="min-w-44" onClick={(e) => e.stopPropagation()}>
                        {/* // Seletor rápido de status em linha */}
                        <SelectSimples
                          itens={STATUS_ITENS}
                          valor={demanda.status}
                          aoMudar={(status) => trocarStatus(demanda.id, status)}
                          placeholder="Status"
                        />
                      </TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        {/* // Botão de edição da demanda */}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => abrirEdicao(demanda)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        ) : (
          /* // Exibição em grade de cards (modo cards) */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demandasPaginadas.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
                {busca ? "Nenhuma demanda encontrada para a busca." : "Nenhuma demanda nesta lista."}
              </div>
            ) : (
              demandasPaginadas.map((demanda) => {
                const atrasada = demandaAtrasada(demanda.prazo, demanda.status);
                const statusInfo = STATUS_ITENS.find((s) => s.value === demanda.status);
                const StatusIcone = statusInfo?.icone;
                return (
                  /* // Card individual de demanda */
                  <Card
                    key={demanda.id}
                    className={cn(
                      "flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                      atrasada ? "border-destructive/40 bg-destructive/5" : "",
                    )}
                    onClick={() => navigate(`/demandas/${demanda.id}`)}
                  >
                    <CardHeader className="gap-2 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          {demanda.projeto_nome}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {statusInfo ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
                                statusInfo.corBg,
                                statusInfo.corTexto,
                                statusInfo.corBorda,
                              )}
                            >
                              {StatusIcone ? (
                                <StatusIcone className="size-3 shrink-0" aria-hidden="true" />
                              ) : null}
                              {statusInfo.label}
                            </span>
                          ) : null}
                          {atrasada ? (
                            <Badge variant="destructive">Atrasada</Badge>
                          ) : null}
                        </div>
                      </div>
                      <CardTitle
                        className="line-clamp-2 text-base font-medium leading-snug hover:underline"
                        title={demanda.descricao}
                      >
                        {demanda.descricao}
                      </CardTitle>
                    </CardHeader>
                    <CardPanel className="flex flex-col gap-3 pt-0">
                      <div className="text-muted-foreground flex flex-col gap-1 text-xs">
                        <div>
                          <span className="text-foreground font-medium">Responsável:</span>{" "}
                          {demanda.responsavel_nome}
                        </div>
                        <div>
                          <span className="text-foreground font-medium">Prazo:</span>{" "}
                          {demanda.prazo.slice(0, 10)}
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-between gap-2 border-t pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex-1">
                          {/* // Seletor de status dentro do card */}
                          <SelectSimples
                            itens={STATUS_ITENS}
                            valor={demanda.status}
                            aoMudar={(status) => trocarStatus(demanda.id, status)}
                            placeholder="Status"
                          />
                        </div>
                        {/* // Botão de edição dentro do card */}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => abrirEdicao(demanda)}
                        >
                          Editar
                        </Button>
                      </div>
                    </CardPanel>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* // Rodapé fixo de paginação com resumo numérico de itens e controles */}
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            Mostrando {demandas.length === 0 ? 0 : (paginaAtual - 1) * ITENS_POR_PAGINA + 1} a{" "}
            {Math.min(paginaAtual * ITENS_POR_PAGINA, demandas.length)} de {demandas.length} demandas
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className={paginaAtual <= 1 ? "pointer-events-none opacity-50" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (paginaAtual > 1) setPaginaAtual((p) => p - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <PaginationItem key={num}>
                  <PaginationLink
                    href="#"
                    isActive={num === paginaAtual}
                    onClick={(e) => {
                      e.preventDefault();
                      setPaginaAtual(num);
                    }}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={paginaAtual >= totalPaginas ? "pointer-events-none opacity-50" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (paginaAtual < totalPaginas) setPaginaAtual((p) => p + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>

      {/* // Diálogo modal para criar ou editar demanda (com ação de excluir) */}
      <Dialog open={dialogDemanda} onOpenChange={setDialogDemanda}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar demanda" : "Nova demanda"}</DialogTitle>
            <DialogDescription>
              Projeto e responsável vêm das listas cadastradas.
            </DialogDescription>
          </DialogHeader>
          <form className="contents" onSubmit={salvarDemanda}>
            <DialogPanel className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Descrição</FieldLabel>
                <Textarea
                  name="descricao"
                  required
                  value={form.descricao}
                  onChange={(evento) =>
                    setForm((atual) => ({ ...atual, descricao: evento.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Projeto</FieldLabel>
                <SelectSimples
                  itens={itensProjeto}
                  valor={form.projeto_id}
                  aoMudar={(projeto_id) => setForm((atual) => ({ ...atual, projeto_id }))}
                  placeholder="Selecione o projeto"
                />
              </Field>
              <Field>
                <FieldLabel>Responsável</FieldLabel>
                <SelectSimples
                  itens={itensUsuario}
                  valor={form.responsavel_id}
                  aoMudar={(responsavel_id) =>
                    setForm((atual) => ({ ...atual, responsavel_id }))
                  }
                  placeholder="Selecione o responsável"
                />
              </Field>
              <Field>
                <FieldLabel>Prazo</FieldLabel>
                <Input
                  type="date"
                  name="prazo"
                  required
                  value={form.prazo}
                  onChange={(evento) =>
                    setForm((atual) => ({ ...atual, prazo: evento.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <SelectSimples
                  itens={STATUS_ITENS}
                  valor={form.status}
                  aoMudar={(status) => setForm((atual) => ({ ...atual, status }))}
                  placeholder="Status"
                />
              </Field>
              {erro && dialogDemanda ? (
                <p className="text-destructive text-sm">{erro}</p>
              ) : null}
            </DialogPanel>
            <DialogFooter className="sm:justify-between">
              {editando ? (
                <Button
                  type="button"
                  variant="destructive"
                  loading={salvando}
                  onClick={excluirDemanda}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Excluir
                </Button>
              ) : null}
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

      {/* // Diálogo modal para criação de novo projeto */}
      <Dialog open={dialogProjeto} onOpenChange={setDialogProjeto}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Novo projeto</DialogTitle>
            <DialogDescription>Crie o projeto antes de ligar demandas a ele.</DialogDescription>
          </DialogHeader>
          <form className="contents" onSubmit={salvarProjeto}>
            <DialogPanel className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Nome</FieldLabel>
                <Input
                  type="text"
                  name="nome"
                  required
                  value={projetoNome}
                  onChange={(evento) => setProjetoNome(evento.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Descrição</FieldLabel>
                <Textarea
                  name="descricao"
                  value={projetoDescricao}
                  onChange={(evento) => setProjetoDescricao(evento.target.value)}
                />
              </Field>
              {erro && dialogProjeto ? (
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
    </main>
  );
}
