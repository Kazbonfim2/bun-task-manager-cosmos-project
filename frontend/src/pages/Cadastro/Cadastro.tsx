import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
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

  async function enviar(evento: FormEvent<HTMLFormElement>) {
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
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Nome completo, e-mail e senha. Sem confirmação.</CardDescription>
        </CardHeader>
        <form onSubmit={enviar}>
          <CardPanel className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Nome completo</FieldLabel>
              <Input
                type="text"
                name="nome_completo"
                required
                autoComplete="name"
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
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />
            </Field>
            {erro ? <p className="text-destructive text-sm">{erro}</p> : null}
          </CardPanel>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" loading={enviando}>
              Cadastrar
            </Button>
            <p className="text-muted-foreground text-sm">
              Já tem conta?{" "}
              <Link to="/login" className="text-foreground underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
