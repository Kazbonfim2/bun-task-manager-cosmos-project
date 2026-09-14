import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { api } from "@/lib/api";
import { lerToken } from "@/lib/auth";

type Etapa = "email" | "pergunta" | "redefinir" | "sucesso";

export function RecuperarSenha() {
  const navegar = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>("email");
  const [email, setEmail] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [tokenReset, setTokenReset] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (lerToken()) return <Navigate to="/" replace />;

  async function enviarEmail(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await api<{ email: string; pergunta: string }>("/auth/recuperar-pergunta", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setPergunta(res.pergunta);
      setEtapa("pergunta");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao buscar pergunta secreta");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarResposta(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await api<{ token_reset: string }>("/auth/validar-resposta", {
        method: "POST",
        body: JSON.stringify({ email, resposta }),
      });
      setTokenReset(res.token_reset);
      setEtapa("redefinir");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Resposta incorreta");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarNovaSenha(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem");
      return;
    }
    setEnviando(true);
    try {
      await api("/auth/redefinir-senha", {
        method: "POST",
        body: JSON.stringify({ token_reset: tokenReset, nova_senha: novaSenha }),
      });
      setEtapa("sucesso");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao redefinir senha");
    } finally {
      setEnviando(false);
    }
  }

  const etapasVisiveis = [
    { chave: "email", numero: "1", rotulo: "Identificação" },
    { chave: "pergunta", numero: "2", rotulo: "Segurança" },
    { chave: "redefinir", numero: "3", rotulo: "Nova senha" },
  ];

  const getEtapaIndex = () => {
    switch (etapa) {
      case "email":
        return 0;
      case "pergunta":
        return 1;
      case "redefinir":
        return 2;
      case "sucesso":
        return 3;
    }
  };

  const indiceAtual = getEtapaIndex();

  return (
    <AuthLayout
      titulo={
        etapa === "sucesso"
          ? "Senha alterada!"
          : etapa === "redefinir"
            ? "Crie sua nova senha"
            : etapa === "pergunta"
              ? "Confirmação de segurança"
              : "Recuperar acesso"
      }
      subtitulo={
        etapa === "sucesso"
          ? "Sua nova senha foi atualizada com sucesso."
          : etapa === "redefinir"
            ? "Escolha uma nova senha forte para acessar sua conta."
            : etapa === "pergunta"
              ? "Responda à sua pergunta secreta para validar sua identidade."
              : "Informe seu e-mail cadastrado para redefinir sua senha."
      }
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Indicador de progresso das etapas */}
        {etapa !== "sucesso" ? (
          <div className="flex items-center justify-between gap-1 sm:gap-2 pb-1 border-b border-border/40">
            {etapasVisiveis.map((item, idx) => {
              const isAtivo = idx === indiceAtual;
              const isConcluido = idx < indiceAtual;
              return (
                <div
                  key={item.chave}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    isAtivo
                      ? "text-primary font-semibold"
                      : isConcluido
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  }`}
                >
                  <span
                    className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isAtivo
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : isConcluido
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isConcluido ? <Check className="size-3" /> : item.numero}
                  </span>
                  <span className="hidden min-[380px]:inline text-[11px] sm:text-xs">
                    {item.rotulo}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Feedback visual de erro */}
        {erro ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs font-medium text-destructive animate-in fade-in duration-200"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>{erro}</span>
          </div>
        ) : null}

        {/* ETAPA 1: Identificação por e-mail */}
        {etapa === "email" && (
          <form onSubmit={enviarEmail} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="recuperar-email">E-mail da sua conta</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <Mail className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="recuperar-email"
                  type="email"
                  name="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                />
              </InputGroup>
              <FieldDescription>
                Enviaremos a etapa de validação de segurança associada a este e-mail.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full font-medium shadow-xs"
              loading={enviando}
            >
              Continuar
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>

            <p className="text-center text-muted-foreground text-xs sm:text-sm pt-2">
              Lembrou sua senha?{" "}
              <Link
                to="/login"
                className="text-foreground font-semibold underline underline-offset-4 hover:text-primary transition-colors"
              >
                Voltar ao login
              </Link>
            </p>
          </form>
        )}

        {/* ETAPA 2: Resposta da Pergunta Secreta */}
        {etapa === "pergunta" && (
          <form onSubmit={enviarResposta} className="space-y-4">
            {/* Box destacado com a pergunta */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                <span>Pergunta de segurança cadastrada</span>
              </div>
              <p className="text-sm font-medium text-foreground leading-snug">
                {pergunta}
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="recuperar-resposta">Sua resposta</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <KeyRound className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="recuperar-resposta"
                  type="text"
                  name="resposta"
                  required
                  autoFocus
                  placeholder="Digite sua resposta confidencial"
                  value={resposta}
                  onChange={(evento) => setResposta(evento.target.value)}
                />
              </InputGroup>
              <FieldDescription>
                A resposta não diferencia maiúsculas de minúsculas.
              </FieldDescription>
            </Field>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 gap-1.5"
                onClick={() => {
                  setErro("");
                  setEtapa("email");
                }}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Voltar
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1 gap-1.5 font-medium shadow-xs"
                loading={enviando}
              >
                Verificar
                <Check className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}

        {/* ETAPA 3: Redefinição da Senha */}
        {etapa === "redefinir" && (
          <form onSubmit={enviarNovaSenha} className="space-y-4">
            {/* Nova Senha */}
            <Field>
              <FieldLabel htmlFor="recuperar-nova-senha">Nova senha</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <Lock className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="recuperar-nova-senha"
                  type={mostrarNovaSenha ? "text" : "password"}
                  name="nova_senha"
                  required
                  minLength={6}
                  autoFocus
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  value={novaSenha}
                  onChange={(evento) => setNovaSenha(evento.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setMostrarNovaSenha((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={mostrarNovaSenha ? "Ocultar senha" : "Exibir senha"}
                    title={mostrarNovaSenha ? "Ocultar senha" : "Exibir senha"}
                  >
                    {mostrarNovaSenha ? (
                      <EyeOff className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Eye className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            {/* Confirmar Nova Senha */}
            <Field>
              <FieldLabel htmlFor="recuperar-confirmar-senha">Confirmar nova senha</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <Lock className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="recuperar-confirmar-senha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  name="confirmar_senha"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Repita sua nova senha"
                  value={confirmarSenha}
                  onChange={(evento) => setConfirmarSenha(evento.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setMostrarConfirmarSenha((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Exibir senha"}
                    title={mostrarConfirmarSenha ? "Ocultar senha" : "Exibir senha"}
                  >
                    {mostrarConfirmarSenha ? (
                      <EyeOff className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Eye className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                Certifique-se de que ambas as senhas coincidem exatamente.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full font-medium shadow-xs"
              loading={enviando}
            >
              Redefinir senha e salvar
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </form>
        )}

        {/* ETAPA 4: Sucesso */}
        {etapa === "sucesso" && (
          <div className="flex flex-col items-center text-center space-y-5 py-2">
            <div className="size-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Tudo pronto!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sua senha foi redefinida com segurança. Agora você já pode acessar o sistema com suas novas credenciais.
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full font-medium shadow-xs"
              onClick={() => navegar("/login")}
            >
              Ir para o Login
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
