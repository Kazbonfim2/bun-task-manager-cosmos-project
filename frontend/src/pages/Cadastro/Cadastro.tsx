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
  Ticket,
  User,
  Users,
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
  const [modoWorkspace, setModoWorkspace] = useState<"criar" | "convite">("criar");
  const [grupoNome, setGrupoNome] = useState("");
  const [codigoConvite, setCodigoConvite] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (lerToken()) return <Navigate to="/" replace />;

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
          nome_completo: nome,
          email,
          senha,
          pergunta_secreta: perguntaSecreta,
          resposta_secreta: respostaSecreta.trim(),
          grupo_nome: modoWorkspace === "criar" ? grupoNome.trim() || undefined : undefined,
          codigo_convite: modoWorkspace === "convite" ? codigoConvite.trim().toUpperCase() || undefined : undefined,
        }),
      });
      salvarSessao(resposta.token, resposta.usuario);
      if (resposta.grupo) {
        salvarGrupoAtivo(resposta.grupo.id);
      }
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
      <form onSubmit={enviar} className="space-y-3.5 sm:space-y-4">
        {/* Campo Nome Completo */}
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

        {/* Campo E-mail */}
        <Field>
          <FieldLabel htmlFor="cadastro-email">E-mail corporativo ou pessoal</FieldLabel>
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

        {/* Campo Senha com Toggle de Visualização */}
        <Field>
          <FieldLabel htmlFor="cadastro-senha">Senha</FieldLabel>
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
              placeholder="Mínimo de 6 caracteres"
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
          <FieldDescription>
            Utilize ao menos 6 caracteres alfanuméricos.
          </FieldDescription>
        </Field>

        {/* Pergunta de Segurança para Recuperação */}
        <Field>
          <div className="flex items-center gap-1.5">
            <FieldLabel>Pergunta de segurança</FieldLabel>
            <HelpCircle className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </div>
          <SelectSimples
            itens={ITENS_PERGUNTAS_SECRETAS}
            valor={perguntaSecreta}
            aoMudar={setPerguntaSecreta}
            placeholder="Selecione uma pergunta secreta"
          />
        </Field>

        {/* Resposta da Pergunta de Segurança */}
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
          <FieldDescription>
            Usada para redefinir sua senha caso você a esqueça.
          </FieldDescription>
        </Field>

        {/* Opção de Workspace: Criar Grupo (+5 Convites) ou Usar Convite */}
        <div className="pt-1 pb-1">
          <div className="p-3 bg-muted/40 border border-border/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Espaço de Trabalho (Tenancy)
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setModoWorkspace("criar")}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    modoWorkspace === "criar"
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Criar Grupo
                </button>
                <button
                  type="button"
                  onClick={() => setModoWorkspace("convite")}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    modoWorkspace === "convite"
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Usar Convite
                </button>
              </div>
            </div>

            {modoWorkspace === "criar" ? (
              <Field>
                <FieldLabel htmlFor="cadastro-grupo" className="text-[11px]">
                  Nome do seu Grupo / Empresa
                </FieldLabel>
                <InputGroup className="w-full">
                  <InputGroupAddon>
                    <InputGroupText>
                      <Users className="size-4" aria-hidden="true" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="cadastro-grupo"
                    type="text"
                    placeholder="Ex: Minha Empresa ou Squad Alpha"
                    value={grupoNome}
                    onChange={(e) => setGrupoNome(e.target.value)}
                  />
                </InputGroup>
                <FieldDescription className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  🎁 Você receberá <strong>05 códigos de convite</strong> para compartilhar com sua equipe.
                </FieldDescription>
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="cadastro-convite" className="text-[11px]">
                  Código de convite recebido
                </FieldLabel>
                <InputGroup className="w-full">
                  <InputGroupAddon>
                    <InputGroupText>
                      <Ticket className="size-4" aria-hidden="true" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="cadastro-convite"
                    type="text"
                    placeholder="Ex: ORION-A83F-9BC2"
                    className="font-mono uppercase tracking-wider"
                    value={codigoConvite}
                    onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                  />
                </InputGroup>
                <FieldDescription className="text-[10px]">
                  Você será adicionado ao grupo de quem te convidou.
                </FieldDescription>
              </Field>
            )}
          </div>
        </div>

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

        {/* Botão de envio */}
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
        <p className="text-center text-muted-foreground text-xs sm:text-sm pt-2">
          Já possui uma conta?{" "}
          <Link
            to="/login"
            className="text-foreground font-semibold underline underline-offset-4 hover:text-primary transition-colors"
          >
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
