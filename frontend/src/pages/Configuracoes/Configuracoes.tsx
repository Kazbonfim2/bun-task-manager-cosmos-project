import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Info,
  KeyRound,
  LogIn,
  Plus,
  Settings,
  Sparkles,
  Ticket,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { DialogCriarGrupo } from "@/components/DialogCriarGrupo";
import { DialogEntrarGrupo } from "@/components/DialogEntrarGrupo";
import { DialogGerenciarGrupo } from "@/components/DialogGerenciarGrupo";
import { ScrollReveal, alternarAnimacoes, saoAnimacoesDesabilitadas } from "@/components/ScrollReveal";
import { GruposSkeleton } from "@/components/Skeleton";
import { useCachedFetch, invalidarCache } from "@/hooks/useCachedFetch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardFrame,
  CardFrameAction,
  CardFrameDescription,
  CardFrameFooter,
  CardFrameHeader,
  CardFrameTitle,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Frame, FrameFooter, FramePanel } from "@/components/ui/frame";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, type Grupo, type Usuario } from "@/lib/api";
import { lerGrupoAtivo, lerToken, lerUsuario, limparGrupoAtivo, salvarSessao } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Aviso = { tipo: "ok" | "erro"; texto: string } | null;

export function Configuracoes() {
  const navigate = useNavigate();
  const usuario = lerUsuario();

  // --- Animações ---
  const [desabilitarAnimacoes, setDesabilitarAnimacoes] = useState(() => saoAnimacoesDesabilitadas());

  // --- Perfil ---
  const [nome, setNome] = useState(usuario?.nome_completo ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [avisoPerfil, setAvisoPerfil] = useState<Aviso>(null);

  // --- Senha ---
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [avisoSenha, setAvisoSenha] = useState<Aviso>(null);

  // --- Grupos (cache local + skeleton) ---
  const {
    data: gruposData,
    loading: gruposLoading,
    isCached: gruposCached,
    refetch: recarregarGrupos,
  } = useCachedFetch<Grupo[]>("/grupos");
  const grupos = gruposData ?? [];
  const [dialogCriar, setDialogCriar] = useState(false);
  const [dialogEntrar, setDialogEntrar] = useState(false);
  const [grupoGerenciar, setGrupoGerenciar] = useState<Grupo | null>(null);
  const [grupoExcluir, setGrupoExcluir] = useState<Grupo | null>(null);
  const [excluindoGrupo, setExcluindoGrupo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState("");

  async function salvarPerfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvandoPerfil(true);
    setAvisoPerfil(null);
    try {
      const atualizado = await api<Usuario>("/usuarios/perfil", {
        method: "PUT",
        body: JSON.stringify({ nome_completo: nome.trim(), email: email.trim() }),
      });
      const token = lerToken();
      if (token) salvarSessao(token, atualizado);
      window.dispatchEvent(new CustomEvent("orion:grupo-alterado"));
      setAvisoPerfil({ tipo: "ok", texto: "Perfil atualizado com sucesso." });
    } catch (falha) {
      setAvisoPerfil({
        tipo: "erro",
        texto: falha instanceof Error ? falha.message : "Falha ao atualizar perfil",
      });
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarSenha(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvandoSenha(true);
    setAvisoSenha(null);
    try {
      await api("/usuarios/senha", {
        method: "PUT",
        body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
      });
      setSenhaAtual("");
      setNovaSenha("");
      setAvisoSenha({ tipo: "ok", texto: "Senha alterada com sucesso." });
    } catch (falha) {
      setAvisoSenha({
        tipo: "erro",
        texto: falha instanceof Error ? falha.message : "Falha ao alterar senha",
      });
    } finally {
      setSalvandoSenha(false);
    }
  }

  function onGrupoAlteradoSucesso() {
    invalidarCache("/grupos");
    recarregarGrupos();
    window.dispatchEvent(new CustomEvent("orion:grupo-alterado"));
  }

  async function excluirGrupo() {
    if (!grupoExcluir) return;
    setExcluindoGrupo(true);
    setErroExcluir("");
    try {
      await api(`/grupos/${grupoExcluir.id}`, { method: "DELETE" });
      // Se o grupo excluído era o ativo, limpa a seleção
      if (lerGrupoAtivo() === grupoExcluir.id) limparGrupoAtivo();
      setGrupoExcluir(null);
      onGrupoAlteradoSucesso();
    } catch (falha) {
      setErroExcluir(falha instanceof Error ? falha.message : "Falha ao excluir grupo");
    } finally {
      setExcluindoGrupo(false);
    }
  }

  function obterIniciaisMembros(grupo: Grupo): Array<{ nome: string; iniciais: string }> {
    if (grupo.membros_nomes) {
      const nomes = grupo.membros_nomes.split("||").filter(Boolean);
      return nomes.slice(0, 3).map((nomeCompleto) => {
        const partes = nomeCompleto.trim().split(/\s+/);
        const iniciais =
          partes.length > 1
            ? `${partes[0][0]}${partes[partes.length - 1][0]}`
            : (partes[0]?.slice(0, 2) ?? "U");
        return { nome: nomeCompleto, iniciais: iniciais.toUpperCase() };
      });
    }
    const total = grupo.total_membros ?? 1;
    const arr: Array<{ nome: string; iniciais: string }> = [];
    for (let i = 0; i < Math.min(total, 3); i++) {
      arr.push({ nome: `Membro ${i + 1}`, iniciais: `M${i + 1}` });
    }
    return arr;
  }

  const limiteGrupos = 5;
  const gruposCriados = grupos.filter((g) => g.dono_id === usuario?.id).length;
  const gruposParticipando = grupos.filter((g) => g.dono_id !== usuario?.id).length;
  const totalConvitesDisponiveis = grupos.reduce((acc, g) => acc + (g.convites_disponiveis ?? 0), 0);
  const gruposExibidos = grupos.slice(0, limiteGrupos);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      {/* Cabeçalho da Página */}
      <ScrollReveal direction="down" duration={350}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/dashboard")}
              title="Voltar ao Dashboard"
              aria-label="Voltar ao Dashboard"
              className="cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Settings className="size-4.5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Configurações
                </h1>
                <p className="text-xs text-muted-foreground">
                  Gerencie seus dados pessoais, credenciais de acesso e espaços de trabalho.
                </p>
              </div>
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* Grid Principal: 2 Colunas no Desktop (>= 768px), 1 Coluna no Mobile (< 768px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* COLUNA DA ESQUERDA: Dados do Perfil + Alterar Senha + Animações */}
        <div className="flex flex-col gap-6">
          {/* Card 1: Dados do Perfil */}
          <ScrollReveal direction="up" delay={0} duration={350}>
            <CardFrame className="w-full">
              <CardFrameHeader className="border-b bg-muted/10 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <CardFrameTitle className="text-sm font-semibold text-foreground truncate">
                      Dados do Perfil
                    </CardFrameTitle>
                    <CardFrameDescription className="text-xs text-muted-foreground truncate">
                      Atualize suas informações pessoais e de identificação
                    </CardFrameDescription>
                  </div>
                </div>
              </CardFrameHeader>

              <Card className="border-0 shadow-none rounded-none bg-transparent">
                <form onSubmit={salvarPerfil}>
                  <CardPanel className="p-4 sm:p-6 space-y-4">
                    <Field className="space-y-1.5 w-full">
                      <FieldLabel htmlFor="cfg-nome" className="text-xs font-semibold text-foreground">
                        Nome completo
                      </FieldLabel>
                      <Input
                        id="cfg-nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </Field>

                    <Field className="space-y-1.5 w-full">
                      <FieldLabel htmlFor="cfg-email" className="text-xs font-semibold text-foreground">
                        Endereço de e-mail
                      </FieldLabel>
                      <Input
                        id="cfg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@empresa.com"
                        required
                      />
                    </Field>

                    {avisoPerfil && (
                      <div
                        className={`flex items-center gap-2 rounded-lg p-3 text-xs border ${avisoPerfil.tipo === "ok"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 border-destructive/20 text-destructive"
                          }`}
                      >
                        {avisoPerfil.tipo === "ok" ? (
                          <CheckCircle2 className="size-4 shrink-0" />
                        ) : (
                          <AlertCircle className="size-4 shrink-0" />
                        )}
                        <span>{avisoPerfil.texto}</span>
                      </div>
                    )}
                  </CardPanel>

                  <CardFrameFooter className="border-t bg-muted/15 px-6 py-3.5 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
                      <Info className="size-3.5 text-sky-400 shrink-0" />
                      Visível para colegas de equipe
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={salvandoPerfil}
                      className="gap-1.5 ml-auto cursor-pointer"
                    >
                      {salvandoPerfil ? (
                        <>
                          <Spinner className="size-3.5" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5" />
                          Salvar alterações
                        </>
                      )}
                    </Button>
                  </CardFrameFooter>
                </form>
              </Card>
            </CardFrame>
          </ScrollReveal>

          {/* Card 2: Alterar Senha */}
          <ScrollReveal direction="up" delay={80} duration={350}>
            <CardFrame className="w-full">
              <CardFrameHeader className="border-b bg-muted/10 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <KeyRound className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <CardFrameTitle className="text-sm font-semibold text-foreground truncate">
                      Alterar Senha
                    </CardFrameTitle>
                    <CardFrameDescription className="text-xs text-muted-foreground truncate">
                      Gerencie sua chave de segurança e acesso à plataforma
                    </CardFrameDescription>
                  </div>
                </div>
              </CardFrameHeader>

              <Card className="border-0 shadow-none rounded-none bg-transparent">
                <form onSubmit={salvarSenha}>
                  <CardPanel className="p-4 sm:p-6 space-y-4">
                    <Field className="space-y-1.5 w-full">
                      <FieldLabel htmlFor="cfg-senha-atual" className="text-xs font-semibold text-foreground">
                        Senha atual
                      </FieldLabel>
                      <Input
                        id="cfg-senha-atual"
                        type="password"
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                    </Field>

                    <Field className="space-y-1.5 w-full">
                      <FieldLabel htmlFor="cfg-senha-nova" className="text-xs font-semibold text-foreground">
                        Nova senha
                      </FieldLabel>
                      <Input
                        id="cfg-senha-nova"
                        type="password"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Mínimo de 6 caracteres"
                      />
                    </Field>

                    {avisoSenha && (
                      <div
                        className={`flex items-center gap-2 rounded-lg p-3 text-xs border ${avisoSenha.tipo === "ok"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 border-destructive/20 text-destructive"
                          }`}
                      >
                        {avisoSenha.tipo === "ok" ? (
                          <CheckCircle2 className="size-4 shrink-0" />
                        ) : (
                          <AlertCircle className="size-4 shrink-0" />
                        )}
                        <span>{avisoSenha.texto}</span>
                      </div>
                    )}
                  </CardPanel>

                  <CardFrameFooter className="border-t bg-muted/15 px-6 py-3.5 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
                      <Info className="size-3.5 text-sky-400 shrink-0" />
                      Mínimo de 6 caracteres
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={salvandoSenha}
                      className="gap-1.5 ml-auto cursor-pointer"
                    >
                      {salvandoSenha ? (
                        <>
                          <Spinner className="size-3.5" />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <KeyRound className="size-3.5" />
                          Alterar senha
                        </>
                      )}
                    </Button>
                  </CardFrameFooter>
                </form>
              </Card>
            </CardFrame>
          </ScrollReveal>

          {/* Card 3: Animações & Efeitos */}
          <ScrollReveal direction="up" delay={160} duration={350}>
            <CardFrame className="w-full">
              <CardFrameHeader className="border-b bg-muted/10 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <CardFrameTitle className="text-sm font-semibold text-foreground truncate">
                      Animações & Efeitos
                    </CardFrameTitle>
                    <CardFrameDescription className="text-xs text-muted-foreground truncate">
                      Personalize a renderização visual e transições de tela
                    </CardFrameDescription>
                  </div>
                </div>
              </CardFrameHeader>

              <Card className="border-0 shadow-none rounded-none bg-transparent">
                <CardPanel className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-semibold text-foreground block">
                        Desabilitar animações
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Remove os efeitos de transição e animações em todas as telas — reduz uso de CPU em dispositivos com menos recursos.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={desabilitarAnimacoes}
                      onClick={() => {
                        const novo = !desabilitarAnimacoes;
                        setDesabilitarAnimacoes(novo);
                        alternarAnimacoes(novo);
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                        desabilitarAnimacoes ? "bg-primary" : "bg-input"
                      )}
                      title={desabilitarAnimacoes ? "Ativar animações" : "Desativar animações"}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
                          desabilitarAnimacoes ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </CardPanel>
              </Card>
            </CardFrame>
          </ScrollReveal>
        </div>

        {/* COLUNA DA DIREITA: Grupos & Convites (Baseado em p-card-11.json) */}
        <ScrollReveal direction="up" delay={100} duration={400} className="flex flex-col gap-6">
          <CardFrame className="w-full">
            <CardFrameHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Users className="size-4" />
                </div>
                <div className="min-w-0">
                  <CardFrameTitle className="text-sm font-semibold text-foreground truncate">
                    Grupos & Convites
                  </CardFrameTitle>
                  <CardFrameDescription className="text-xs text-muted-foreground truncate">
                    Gerencie seus grupos, equipes e códigos de acesso
                  </CardFrameDescription>
                </div>
              </div>

              <CardFrameAction className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setDialogEntrar(true)}
                  className="gap-1 text-xs cursor-pointer"
                  title="Entrar com código de convite"
                >
                  <LogIn className="size-3" />
                  Entrar
                </Button>
                <Button
                  type="button"
                  size="xs"
                  onClick={() => setDialogCriar(true)}
                  className="gap-1 text-xs cursor-pointer"
                  title="Criar novo grupo"
                >
                  <Plus className="size-3" />
                  Criar grupo
                </Button>
              </CardFrameAction>
            </CardFrameHeader>

            <Card className="border-0 shadow-none rounded-none bg-transparent">
              <CardPanel className="p-4 sm:p-6 space-y-4">
                {/* Mostrador de Capacidade & Status dos Grupos */}
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/15">
                        <Building2 className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          Capacidade de Grupos
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {grupos.length} de {limiteGrupos} espaços ocupados
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Barra Segmentada de Progresso (5 segmentos) */}
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {Array.from({ length: limiteGrupos }).map((_, index) => {
                      const grupoNoSlot = grupos[index];
                      const ehDono = grupoNoSlot && usuario?.id === grupoNoSlot.dono_id;
                      const ehMembro = grupoNoSlot && !ehDono;

                      return (
                        <div
                          key={index}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            ehDono
                              ? "bg-primary shadow-xs"
                              : ehMembro
                                ? "bg-primary/50"
                                : "bg-muted-foreground/15 border border-dashed border-border"
                          )}
                          title={
                            grupoNoSlot
                              ? `${grupoNoSlot.nome} (${ehDono ? "Criado por você" : "Participando"})`
                              : `Vaga ${index + 1} disponível`
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Resumo em Chips / Métricas */}
                  <div className="grid grid-cols-3 gap-2 pt-0.5 text-xs">
                    <div className="flex items-center gap-1.5 rounded-lg bg-background/80 border border-border/60 px-2.5 py-1.5">
                      <div className="size-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block leading-tight truncate">Criados</span>
                        <span className="font-semibold text-foreground text-xs">{gruposCriados}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-background/80 border border-border/60 px-2.5 py-1.5">
                      <div className="size-2 rounded-full bg-primary/50 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block leading-tight truncate">Ingressados</span>
                        <span className="font-semibold text-foreground text-xs">{gruposParticipando}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-background/80 border border-border/60 px-2.5 py-1.5">
                      <Ticket className="size-3 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block leading-tight truncate">Convites</span>
                        <span className="font-semibold text-foreground text-xs">{totalConvitesDisponiveis} livres</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista / Grid de Grupos Limitada a 5 Itens */}
                {gruposLoading && !gruposCached ? (
                  <GruposSkeleton />
                ) : gruposExibidos.length === 0 ? (
                  <Empty className="py-8 border border-dashed rounded-xl bg-muted/10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Building2 className="size-4.5 text-primary" />
                      </EmptyMedia>
                      <EmptyTitle>Nenhum grupo vinculado</EmptyTitle>
                      <EmptyDescription>
                        Crie um novo grupo para sua equipe ou entre em um existente com um código de convite.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setDialogEntrar(true)}
                          className="gap-1 cursor-pointer"
                        >
                          <LogIn className="size-3" /> Entrar com convite
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => setDialogCriar(true)}
                          className="gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" /> Criar grupo
                        </Button>
                      </div>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {gruposExibidos.map((g) => (
                      <Frame key={g.id} className="w-full">
                        <FramePanel className="p-3.5 space-y-3 bg-card border-border/80 shadow-xs">
                          {/* Cabeçalho do Card */}
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/15">
                                <Building2 className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-foreground truncate block" title={g.nome}>
                                  {g.nome}
                                </span>
                                <span className="text-[11px] text-muted-foreground truncate block">
                                  {usuario?.id === g.dono_id ? "Criado por você" : `Por ${g.dono_nome ?? "colega"}`}
                                </span>
                              </div>
                            </div>

                            {usuario?.id === g.dono_id ? (
                              <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 h-4 shrink-0 font-medium">
                                Dono
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border bg-muted/30 px-1.5 py-0 h-4 shrink-0 font-medium">
                                Membro
                              </Badge>
                            )}
                          </div>

                          {/* Membros com p-avatar-13 & Convites */}
                          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/50 text-xs">
                            {/* Avatares */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex -space-x-1.5 overflow-hidden py-0.5 shrink-0">
                                {obterIniciaisMembros(g).map((item, idx) => (
                                  <Avatar
                                    key={idx}
                                    className="size-6 ring-2 ring-card bg-muted text-[10px] font-bold text-foreground shrink-0"
                                    title={item.nome}
                                  >
                                    <AvatarFallback className="text-[10px] font-bold uppercase bg-secondary/90 text-primary">
                                      {item.iniciais}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {(g.total_membros ?? 0) > 3 && (
                                  <Avatar className="size-6 ring-2 ring-card bg-muted text-[9px] font-bold text-muted-foreground shrink-0">
                                    <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                                      +{(g.total_membros ?? 0) - 3}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground truncate">
                                {g.total_membros ?? 1} {(g.total_membros ?? 1) === 1 ? "membro" : "membros"}
                              </span>
                            </div>

                            {/* Convites */}
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-medium">
                              <Ticket className="size-3 opacity-70" />
                              <span>{g.convites_disponiveis ?? 0}</span>
                            </div>
                          </div>
                        </FramePanel>

                        <FrameFooter className="p-2 px-2.5 flex items-center gap-1.5 bg-transparent">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setGrupoGerenciar(g)}
                            className="flex-1 gap-1.5 text-xs justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground h-7.5"
                          >
                            <Users className="size-3" />
                            Gerenciar
                          </Button>
                          {usuario?.id === g.dono_id && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => {
                                setErroExcluir("");
                                setGrupoExcluir(g);
                              }}
                              title="Excluir grupo"
                              aria-label={`Excluir grupo ${g.nome}`}
                              className="shrink-0 size-7.5 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </FrameFooter>
                      </Frame>
                    ))}
                  </div>
                )}
              </CardPanel>
            </Card>

            <CardFrameFooter className="border-t bg-muted/15 px-6 py-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Info className="size-3.5 text-sky-400 shrink-0" />
                <span>Cada novo grupo recebe 5 convites exclusivos.</span>
              </div>
            </CardFrameFooter>
          </CardFrame>
        </ScrollReveal>
      </div>

      {/* Diálogos Modais do Coss.ui */}
      <DialogGerenciarGrupo
        aberto={!!grupoGerenciar}
        onFechar={() => setGrupoGerenciar(null)}
        grupo={grupoGerenciar}
      />
      <DialogCriarGrupo
        aberto={dialogCriar}
        onFechar={() => setDialogCriar(false)}
        onCriado={onGrupoAlteradoSucesso}
      />
      <DialogEntrarGrupo
        aberto={dialogEntrar}
        onFechar={() => setDialogEntrar(false)}
        onEntrou={onGrupoAlteradoSucesso}
      />

      {/* Confirmação de exclusão de grupo (ação destrutiva, só dono) */}
      <Dialog
        open={!!grupoExcluir}
        onOpenChange={(aberto) => !aberto && !excluindoGrupo && setGrupoExcluir(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <DialogTitle>Excluir grupo</DialogTitle>
                <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogPanel className="space-y-3">
            <p className="text-sm text-foreground">
              Excluir o grupo <strong>{grupoExcluir?.nome}</strong> remove todos os projetos e
              demandas dentro dele. Os usuários não são excluídos e os membros serão notificados.
            </p>
            {erroExcluir && (
              <div className="flex items-center gap-2 rounded-lg p-3 text-xs border bg-destructive/10 border-destructive/20 text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{erroExcluir}</span>
              </div>
            )}
          </DialogPanel>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGrupoExcluir(null)}
              disabled={excluindoGrupo}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={excluirGrupo}
              disabled={excluindoGrupo}
              className="w-full sm:w-auto gap-1.5"
            >
              {excluindoGrupo ? (
                <>
                  <Spinner className="size-3.5" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  Excluir grupo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
