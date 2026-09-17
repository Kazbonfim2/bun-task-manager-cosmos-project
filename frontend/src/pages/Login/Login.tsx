import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { api, type RespostaAuth } from "@/lib/api";
import { lerToken, salvarGrupoAtivo, salvarSessao } from "@/lib/auth";

export function Login() {
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (lerToken()) return <Navigate to="/dashboard" replace />;

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await api<RespostaAuth>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), senha }),
      });
      salvarSessao(resposta.token, resposta.usuario);
      if (resposta.grupo?.id) {
        salvarGrupoAtivo(resposta.grupo.id);
      }
      navegar("/dashboard");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha no login");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Acesse sua conta"
      subtitulo="Entre para visualizar e gerenciar demandas em aberto."
    >
      <form onSubmit={enviar} className="space-y-3.5">
        {/* Campo E-mail */}
        <ScrollReveal direction="up" delay={100}>
          <Field>
            <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
            <InputGroup className="w-full">
              <InputGroupAddon>
                <InputGroupText>
                  <Mail className="size-4" aria-hidden="true" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </InputGroup>
          </Field>
        </ScrollReveal>

        {/* Campo Senha com Toggle de Visualização e link de Recuperação */}
        <ScrollReveal direction="up" delay={200}>
          <Field>
            <FieldLabel htmlFor="login-senha">Senha</FieldLabel>
            <InputGroup className="w-full">
              <InputGroupAddon>
                <InputGroupText>
                  <Lock className="size-4" aria-hidden="true" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="login-senha"
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                  title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                >
                  {mostrarSenha ? (
                    <EyeOff className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </InputGroupAddon>
            </InputGroup>

            <div className="flex w-full justify-end pt-1">
              <Link
                to="/recuperar-senha"
                className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Esqueci minha senha?
              </Link>
            </div>
          </Field>
        </ScrollReveal>

        {/* Feedback visual de erro */}
        {erro ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive animate-in fade-in duration-200"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>{erro}</span>
          </div>
        ) : null}

        {/* Botão de envio */}
        <ScrollReveal direction="up" delay={300}>
          <Button
            type="submit"
            size="lg"
            className="w-full font-medium shadow-xs"
            loading={enviando}
          >
            Entrar
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>

          {/* Link para cadastro */}
          <p className="text-center text-muted-foreground text-xs sm:text-sm pt-3">
            Não possui uma conta?{" "}
            <Link
              to="/cadastro"
              className="text-foreground font-semibold underline underline-offset-4 hover:text-primary transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </ScrollReveal>
      </form>
    </AuthLayout>
  );
}
