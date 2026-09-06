import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPanel,
} from "@/components/ui/card";
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

  async function enviar(evento: FormEvent<HTMLFormElement>) {
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
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="mx-auto">
          <Alert>
            <AlertTitle className="text-2xl">Faça login</AlertTitle>
            <AlertDescription>
              Entre para poder visualizar, e gerenciar demandas em aberto.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <form onSubmit={enviar}>
          <CardPanel className="flex flex-col gap-4">
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
                autoComplete="current-password"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />
            </Field>
            {erro ? <p className="text-destructive text-sm">{erro}</p> : null}
          </CardPanel>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" loading={enviando}>
              Entrar
            </Button>
            <p className="text-muted-foreground text-sm">
              Sem conta?{" "}
              <Link to="/cadastro" className="text-foreground underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
