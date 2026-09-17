import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  User,
  Users,
} from "lucide-react";
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
import { SelectSimples } from "@/components/SelectSimples";
import { api, type RespostaAuth } from "@/lib/api";
import { lerToken, salvarGrupoAtivo, salvarSessao } from "@/lib/auth";
import { ITENS_PERGUNTAS_SECRETAS, PERGUNTAS_SECRETAS } from "@/lib/perguntas-secretas";

export function Cadastro() {
  const navegar = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [perguntaSecreta, setPerguntaSecreta] = useState<string>(PERGUNTAS_SECRETAS[0]);
  const [respostaSecreta, setRespostaSecreta] = useState("");
  const [grupoNome, setGrupoNome] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (lerToken()) return <Navigate to="/dashboard" replace />;

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    if (!perguntaSecreta) {
      setErro("Selecione uma pergunta secreta");
      return;
    }
    if (!respostaSecreta.trim()) {
      setErro("Informe a resposta da pergunta secreta");
      return;
    }
    setEnviando(true);
    try {
      const resposta = await api<RespostaAuth>("/auth/cadastro", {
        method: "POST",
        body: JSON.stringify({
          nome_completo: nome.trim(),
          email: email.trim(),
          senha,
          pergunta_secreta: perguntaSecreta,
          resposta_secreta: respostaSecreta.trim(),
          grupo_nome: grupoNome.trim() || undefined,
        }),
      });
      salvarSessao(resposta.token, resposta.usuario);
      if (resposta.grupo) {
        salvarGrupoAtivo(resposta.grupo.id);
      }
      navegar("/dashboard");
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
      <form onSubmit={enviar} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
          {/* Campo Nome Completo */}
          <ScrollReveal direction="up" delay={50}>
            <Field>
              <FieldLabel htmlFor="cadastro-nome">Nome completo</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <User className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="cadastro-nome"
                  type="text"
                  name="nome_completo"
                  required
                  autoComplete="name"
                  placeholder="Ex: Carlos Oliveira"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                />
              </InputGroup>
            </Field>
          </ScrollReveal>

          {/* Campo E-mail */}
          <ScrollReveal direction="up" delay={100}>
            <Field>
              <FieldLabel htmlFor="cadastro-email">E-mail</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <Mail className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="cadastro-email"
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

          {/* Campo Senha */}
          <ScrollReveal direction="up" delay={150}>
            <Field>
              <FieldLabel htmlFor="cadastro-senha">Senha (mín. 6)</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <Lock className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="cadastro-senha"
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
            </Field>
          </ScrollReveal>

          {/* Pergunta de Segurança */}
          <ScrollReveal direction="up" delay={200}>
            <Field>
              <div className="flex items-center gap-1">
                <FieldLabel>Pergunta de segurança</FieldLabel>
                <HelpCircle className="size-3 text-muted-foreground" aria-hidden="true" />
              </div>
              <SelectSimples
                itens={ITENS_PERGUNTAS_SECRETAS}
                valor={perguntaSecreta}
                aoMudar={setPerguntaSecreta}
                placeholder="Selecione uma pergunta"
              />
            </Field>
          </ScrollReveal>

          {/* Resposta de Segurança */}
          <ScrollReveal direction="up" delay={250}>
            <Field>
              <FieldLabel htmlFor="cadastro-resposta">Resposta de segurança</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <KeyRound className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="cadastro-resposta"
                  type="text"
                  name="resposta_secreta"
                  required
                  placeholder="Sua resposta confidencial"
                  value={respostaSecreta}
                  onChange={(evento) => setRespostaSecreta(evento.target.value)}
                />
              </InputGroup>
            </Field>
          </ScrollReveal>

          {/* Nome do Grupo (Opcional) */}
          <ScrollReveal direction="up" delay={300}>
            <Field>
              <FieldLabel htmlFor="cadastro-grupo">Nome do Grupo / Empresa (opcional)</FieldLabel>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <InputGroupText>
                    <Users className="size-4" aria-hidden="true" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="cadastro-grupo"
                  type="text"
                  placeholder="Ex: Squad Alpha ou Minha Empresa"
                  value={grupoNome}
                  onChange={(e) => setGrupoNome(e.target.value)}
                />
              </InputGroup>
            </Field>
          </ScrollReveal>
        </div>

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
        <ScrollReveal direction="up" delay={350} className="pt-1">
          <Button
            type="submit"
            size="lg"
            className="w-full font-medium shadow-xs"
            loading={enviando}
          >
            Criar minha conta
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>

          {/* Link para login */}
          <p className="text-center text-muted-foreground text-xs sm:text-sm pt-2.5">
            Já possui uma conta?{" "}
            <Link
              to="/login"
              className="text-foreground font-semibold underline underline-offset-4 hover:text-primary transition-colors"
            >
              Entrar
            </Link>
          </p>
        </ScrollReveal>
      </form>
    </AuthLayout>
  );
}
