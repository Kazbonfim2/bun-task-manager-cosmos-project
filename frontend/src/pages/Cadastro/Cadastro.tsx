import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, type RespostaAuth } from "@/lib/api";
import { lerToken, salvarSessao } from "@/lib/auth";

export function Cadastro() {
  const navegar = useNavigate();
  const [nome, setNome] = useState("");
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
      const resposta = await api<RespostaAuth>("/auth/cadastro", {
        method: "POST",
        body: JSON.stringify({ nome_completo: nome, email, senha }),
      });
      salvarSessao(resposta.token, resposta.usuario);
      navegar("/");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha no cadastro");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Crie sua conta"
      subtitulo="Preencha seus dados para começar a gerenciar suas demandas."
    >
      <form onSubmit={enviar} className="space-y-3 sm:space-y-3.5">
        <Field>
          <FieldLabel>Nome completo</FieldLabel>
          <Input
            type="text"
            name="nome_completo"
            required
            autoComplete="name"
            placeholder="Ex: Carlos Oliveira"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
          />
        </Field>
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
            minLength={6}
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />
        </Field>
        {erro ? <p className="text-destructive text-sm font-medium">{erro}</p> : null}

        <Button type="submit" className="w-full" loading={enviando}>
          Cadastrar
        </Button>

        <p className="text-center text-muted-foreground text-xs sm:text-sm pt-1">
          Já possui conta?{" "}
          <Link
            to="/login"
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary"
          >
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
