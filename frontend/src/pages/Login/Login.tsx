import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, type RespostaAuth } from "@/lib/api";
import { lerToken, salvarSessao } from "@/lib/auth";

export function Login() {
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (lerToken()) return <Navigate to="/" replace />;

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await api<RespostaAuth>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });
      salvarSessao(resposta.token, resposta.usuario);
      navegar("/");
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
      <form onSubmit={enviar} className="space-y-3 sm:space-y-3.5">
        <Field>
          <FieldLabel>E-mail</FieldLabel>
          <Input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="nome@empresa.com"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Senha</FieldLabel>
          <Input
            type="password"
            name="senha"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />
        </Field>
        {erro ? <p className="text-destructive text-sm font-medium">{erro}</p> : null}

        <Button type="submit" className="w-full" loading={enviando}>
          Entrar
        </Button>

        <p className="text-center text-muted-foreground text-xs sm:text-sm pt-1">
          Sem conta?{" "}
          <Link
            to="/cadastro"
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
