import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  KeyRound,
  LogIn,
  Plus,
  Settings,
  Sparkles,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { DialogCriarGrupo } from "@/components/DialogCriarGrupo";
import { DialogEntrarGrupo } from "@/components/DialogEntrarGrupo";
import { DialogGerenciarGrupo } from "@/components/DialogGerenciarGrupo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, type Grupo, type Usuario } from "@/lib/api";
import { lerGrupoAtivo, lerToken, lerUsuario, salvarSessao } from "@/lib/auth";

type Aviso = { tipo: "ok" | "erro"; texto: string } | null;

export function Configuracoes() {
  const navigate = useNavigate();
  const usuario = lerUsuario();

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

  // --- Grupos ---
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [dialogCriar, setDialogCriar] = useState(false);
  const [dialogEntrar, setDialogEntrar] = useState(false);
  const [grupoGerenciar, setGrupoGerenciar] = useState<Grupo | null>(null);

  const carregarGrupos = useCallback(async () => {
    try {
      const lista = await api<Grupo[]>("/grupos");
      setGrupos(lista);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await api<Grupo[]>("/grupos");
        if (ativo) setGrupos(lista);
      } catch {
        // silencioso
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

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
    carregarGrupos();
    window.dispatchEvent(new CustomEvent("orion:grupo-alterado"));
  }

  const grupoAtivoId = lerGrupoAtivo();
  const gruposExibidos = grupos.slice(0, 5);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate("/")}
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

        {usuario && (
          <div className="flex items-center gap-2 self-start sm:self-auto pl-12 sm:pl-0">
            <Badge variant="outline" className="text-xs px-2.5 py-1 text-muted-foreground">
              {usuario.email}
            </Badge>
          </div>
        )}
      </div>

      {/* Grid Principal: 2 Colunas no Desktop (>= 768px), 1 Coluna no Mobile (< 768px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* COLUNA DA ESQUERDA: Dados do Perfil + Alterar Senha */}
        <div className="flex flex-col gap-6">
          {/* Card 1: Dados do Perfil */}
          <Card className="border border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <User className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Dados do Perfil
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Atualize seu nome de exibição e e-mail de acesso.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={salvarPerfil}>
              <CardPanel className="p-6 space-y-4">
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
                    className={`flex items-center gap-2 rounded-lg p-3 text-xs border ${
                      avisoPerfil.tipo === "ok"
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

              <CardFooter className="border-t bg-muted/15 px-6 py-3.5 flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
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
              </CardFooter>
            </form>
          </Card>

          {/* Card 2: Alterar Senha */}
          <Card className="border border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <KeyRound className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Alterar Senha
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Mantenha sua conta protegida com uma senha segura.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={salvarSenha}>
              <CardPanel className="p-6 space-y-4">
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
                    className={`flex items-center gap-2 rounded-lg p-3 text-xs border ${
                      avisoSenha.tipo === "ok"
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

              <CardFooter className="border-t bg-muted/15 px-6 py-3.5 flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
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
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* COLUNA DA DIREITA: Grupos & Convites */}
        <div className="flex flex-col gap-6">
          <Card className="border border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Users className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold text-foreground truncate">
                      Grupos & Convites
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                      Espaços de trabalho e equipes colaborativas.
                    </CardDescription>
                  </div>
                </div>

                <CardAction className="flex items-center gap-1.5 shrink-0">
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
                </CardAction>
              </div>
            </CardHeader>

            <CardPanel className="p-6 space-y-3">
              {/* Dica informativa com limite de itens */}
              <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 min-w-0">
                  <Ticket className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {grupos.length === 1
                      ? "1 grupo vinculado"
                      : `${grupos.length} grupos vinculados`}
                    {grupos.length > 5 && " (exibindo os 5 principais)"}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  Max. 5 itens
                </Badge>
              </div>

              {/* Lista / Grid de Grupos Limitada a 5 Itens */}
              {gruposExibidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/10">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2.5">
                    <Building2 className="size-5 opacity-70" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Nenhum grupo vinculado
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                    Crie um novo grupo para sua equipe ou entre em um existente com um código de convite.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
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
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gruposExibidos.map((g) => {
                    const ehAtivo = g.id === grupoAtivoId;
                    return (
                      <div
                        key={g.id}
                        className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all gap-3 bg-card shadow-xs ${
                          ehAtivo
                            ? "border-primary/50 ring-1 ring-primary/20 bg-primary/2"
                            : "border-border hover:border-primary/30 hover:bg-muted/20"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`flex size-7 items-center justify-center rounded-md shrink-0 ${
                                  ehAtivo
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Building2 className="size-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-foreground truncate" title={g.nome}>
                                {g.nome}
                              </span>
                            </div>
                            {ehAtivo && (
                              <Badge
                                variant="default"
                                className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium"
                              >
                                Ativo
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                            <span className="flex items-center gap-1">
                              <Users className="size-3 opacity-70" />
                              {g.total_membros ?? 0} membros
                            </span>
                            <span className="flex items-center gap-1">
                              <Ticket className="size-3 opacity-70" />
                              {g.convites_disponiveis ?? 0} convites
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setGrupoGerenciar(g)}
                          className="w-full gap-1.5 text-xs justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        >
                          <Users className="size-3" />
                          Gerenciar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardPanel>

            <CardFooter className="border-t bg-muted/15 px-6 py-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Sparkles className="size-3.5 text-primary shrink-0" />
                <span>Cada novo grupo recebe 5 convites exclusivos.</span>
              </div>
            </CardFooter>
          </Card>
        </div>
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
    </main>
  );
}
