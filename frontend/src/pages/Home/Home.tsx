import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Snowflake,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { lerToken } from "@/lib/auth";

export function Home() {
  const autenticado = Boolean(lerToken());

  return (
    <div className="flex flex-col min-h-svh">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b bg-muted/20 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center flex flex-col items-center">
          <ScrollReveal direction="down" duration={400}>
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1 text-xs font-medium">
              <Snowflake className="size-3.5 text-primary animate-sway" />
              ORION — Gestão de Demandas
            </Badge>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl text-foreground">
              Centralize suas demandas.{" "}
              <span className="text-primary">Organize sua equipe.</span>{" "}
              Elimine planilhas.
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              ORION é a plataforma gratuita que substitui planilhas compartilhadas por um sistema
              estruturado de controle de demandas. Atribua tarefas, acompanhe prazos em tempo real e
              mantenha toda equipe sincronizada—sem complicação.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="mt-4 max-w-xl text-xs sm:text-sm font-medium text-foreground/80 bg-background/80 border rounded-lg px-4 py-2.5 shadow-xs">
              💡 <strong>Visibilidade Total:</strong> Cansado de perder demandas em abas de planilhas?
              Aqui você sabe quem faz o quê, até quando e se está atrasado. Tudo em um só lugar.
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {autenticado ? (
                <Button size="lg" render={<Link to="/dashboard" />} className="gap-2 text-sm font-semibold">
                  <LayoutDashboard className="size-4" />
                  Ir para o Dashboard
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" render={<Link to="/cadastro" />} className="gap-2 text-sm font-semibold">
                    Comece agora — Crie seu primeiro grupo
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button size="lg" variant="outline" render={<Link to="/login" />} className="text-sm font-medium">
                    Já tenho uma conta
                  </Button>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. DIFERENCIAIS VS ALTERNATIVAS */}
      <section className="py-16 sm:py-20 border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Diferencial</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Por que ORION vs. alternativas?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              A clareza e agilidade que seu time precisa, sem burocracia ou ferramentas pesadas.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            <ScrollReveal direction="up" delay={100} className="h-full">
              <Card className="flex flex-col justify-between border-muted-foreground/20 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">vs. Planilhas Compartilhadas</CardTitle>
                  <CardDescription className="text-xs">O fim das abas confusas e versões perdidas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Planilhas:</strong> Vários clicam ao mesmo tempo, versão "desatualiza", histórico invisível.</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground font-medium bg-primary/5 p-2 rounded-md border border-primary/15">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>ORION:</strong> Tempo real, versionamento automático e auditoria completa.</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200} className="h-full">
              <Card className="flex flex-col justify-between border-muted-foreground/20 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">vs. Ferramentas Pesadas</CardTitle>
                  <CardDescription className="text-xs">Jira, Monday, Asana</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Pesadas:</strong> Caras, complexas, curva de aprendizado alta e interface densa.</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground font-medium bg-primary/5 p-2 rounded-md border border-primary/15">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>ORION:</strong> Intuitivo em 2 minutos, grátis, pensado para fluxos simples e ágeis.</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300} className="h-full">
              <Card className="flex flex-col justify-between border-muted-foreground/20 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">vs. WhatsApp + Planilha</CardTitle>
                  <CardDescription className="text-xs">Conversas soltas e prazos esquecidos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Caótico:</strong> Informação espalhada, ninguém sabe o que é prioridade, prazos se perdem.</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground font-medium bg-primary/5 p-2 rounded-md border border-primary/15">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>ORION:</strong> Fonte de verdade única, priorização clara e alertas automáticos.</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. BENEFÍCIOS PRINCIPAIS */}
      <section className="py-16 sm:py-20 border-b bg-muted/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Recursos</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Benefícios Principais
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Cada funcionalidade foi construída para solucionar gargalos diários de equipes de projeto.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ScrollReveal direction="up" delay={100} className="h-full">
              <Card className="bg-card h-full">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="size-5" />
                  </div>
                  <CardTitle className="text-base">1. Visibilidade Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">O que é:</strong> Dashboard em tempo real mostra status de todas as demandas, filtros por projeto/responsável e histórico completo.
                  </p>
                  <p>
                    <strong className="text-foreground">Por que importa:</strong> Ninguém mais pergunta "qual é o status disso?". A resposta está ali, atualizada.
                  </p>
                  <div className="pt-1 font-medium text-primary">
                    📊 Reduz ~70% das mensagens de status em chat/email.
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200} className="h-full">
              <Card className="bg-card h-full">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bell className="size-5" />
                  </div>
                  <CardTitle className="text-base">2. Notificações Inteligentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">O que é:</strong> Avisos automáticos quando uma demanda é atribuída, mencionam você ou ultrapassa o prazo.
                  </p>
                  <p>
                    <strong className="text-foreground">Por que importa:</strong> Você não precisa ficar refrescando a página ou lendo 50 mensagens em canais.
                  </p>
                  <div className="pt-1 font-medium text-primary">
                    🔔 Seu time 100% informado, sem overload de avisos.
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300} className="h-full">
              <Card className="bg-card h-full">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="size-5" />
                  </div>
                  <CardTitle className="text-base">3. Menções e Comentários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">O que é:</strong> Timeline de comentários em cada demanda com suporte a @menções (@usuario), como nas redes sociais.
                  </p>
                  <p>
                    <strong className="text-foreground">Por que importa:</strong> Contexto e discussão vivem perto da tarefa, não espalhados em DMs e threads perdidas.
                  </p>
                  <div className="pt-1 font-medium text-primary">
                    💬 Histórico completo de decisões e discussões à mão.
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150} className="h-full">
              <Card className="bg-card h-full">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="size-5" />
                  </div>
                  <CardTitle className="text-base">4. Controle de Atrasos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">O que é:</strong> Demandas com prazo vencido aparecem marcadas automaticamente. O sistema avisa quem é responsável.
                  </p>
                  <p>
                    <strong className="text-foreground">Por que importa:</strong> Atrasos não passam despercebidos. Equipe sabe exatamente o que está pendente.
                  </p>
                  <div className="pt-1 font-medium text-primary">
                    ⏳ Aumenta cumprimento de prazos e responsabilidade.
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={250} className="h-full">
              <Card className="bg-card h-full">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-5" />
                  </div>
                  <CardTitle className="text-base">5. Multi-Equipe Nativa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">O que é:</strong> Crie grupos (workspaces), convide membros via código único, e cada grupo tem projetos e demandas isolados.
                  </p>
                  <p>
                    <strong className="text-foreground">Por que importa:</strong> Se você trabalha em múltiplos times ou clientes, cada um tem seu espaço seguro.
                  </p>
                  <div className="pt-1 font-medium text-primary">
                    🏢 Escala para N equipes sem perder organização.
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={350} className="h-full">
              <Card className="bg-card h-full">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="size-5" />
                  </div>
                  <CardTitle className="text-base">6. Sem Complicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">O que é:</strong> Acesse pelo navegador, faça login, crie um grupo e comece agora. Nenhuma instalação necessária.
                  </p>
                  <p>
                    <strong className="text-foreground">Por que importa:</strong> Seu time acessa em 2 minutos. Não gasta sprint inteira implementando ferramentas.
                  </p>
                  <div className="pt-1 font-medium text-primary">
                    ⚡ Time 100% operacional no mesmo dia.
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. COMO FUNCIONA (PASSOS) */}
      <section className="py-16 sm:py-20 border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Fluxo</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Como Funciona
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Simples, direto e pronto para o dia a dia.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-center">
            <ScrollReveal direction="up" delay={100}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="text-sm font-semibold text-foreground">Cadastro</h3>
                <p className="text-xs text-muted-foreground mt-1">Crie sua conta em segundos pelo navegador.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="text-sm font-semibold text-foreground">Crie seu Grupo</h3>
                <p className="text-xs text-muted-foreground mt-1">Defina o espaço de trabalho da sua equipe.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="text-sm font-semibold text-foreground">Convide a Equipe</h3>
                <p className="text-xs text-muted-foreground mt-1">Compartilhe o código exclusivo de acesso.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h3 className="text-sm font-semibold text-foreground">Comece a Operar</h3>
                <p className="text-xs text-muted-foreground mt-1">Distribua tarefas, defina prazos e acompanhe.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. DEPOIMENTO & SOCIAL PROOF */}
      <section className="py-16 sm:py-20 border-b bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <ScrollReveal direction="up">
            <div className="rounded-2xl border bg-card p-8 sm:p-10 shadow-xs relative">
              <p className="text-base sm:text-lg italic font-medium text-foreground leading-relaxed">
                “A gente sentia que tava perdendo demanda em planilha. Com ORION em 1 mês ficou claro quem tava responsável por quê. Sem neura.”
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                <span>Feedback de equipes que migraram de planilhas</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. TRANQUILIDADE E CONFIANÇA */}
      <section className="py-16 sm:py-20 border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Confiança</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Tranquilidade & Segurança
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Privacidade e estabilidade garantidas para sua equipe.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            <ScrollReveal direction="up" delay={100} className="h-full">
              <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card h-full">
                <ShieldCheck className="size-6 text-primary mb-1" />
                <h3 className="text-sm font-semibold text-foreground">Dados Seguros</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sua equipe e dados ficam isolados no seu grupo. Nenhuma exposição cruzada, nenhum acesso de terceiros.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200} className="h-full">
              <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card h-full">
                <Check className="size-6 text-primary mb-1" />
                <h3 className="text-sm font-semibold text-foreground">Gratuito & Sempre Online</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sem plano de preço escondido, sem surpresa. Use por quanto tempo quiser com sua equipe.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300} className="h-full">
              <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card h-full">
                <Code2 className="size-6 text-primary mb-1" />
                <h3 className="text-sm font-semibold text-foreground">Código Aberto</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transparência total. Veja como funciona por dentro e tenha total previsibilidade do seu ambiente.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="py-16 sm:py-24 bg-primary/5 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col items-center">
          <ScrollReveal direction="up">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Seu time merece melhor. Comece grátis agora.
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
              Elimine as planilhas confusas e tenha visibilidade total das suas demandas hoje mesmo.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {autenticado ? (
                <Button size="lg" render={<Link to="/dashboard" />} className="gap-2 text-sm font-semibold">
                  <LayoutDashboard className="size-4" />
                  Acessar Painel
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" render={<Link to="/cadastro" />} className="gap-2 text-sm font-semibold">
                    Cadastre-se Gratuitamente
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button size="lg" variant="outline" render={<Link to="/login" />} className="text-sm font-medium">
                    Entrar no Sistema
                  </Button>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t bg-background py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Snowflake className="size-4 text-primary" />
            <span className="font-semibold text-foreground">ORION</span>
            <span>— Gestão de Demandas</span>
          </div>
          <div>
            Fonte de verdade baseada no documento oficial de introdução.
          </div>
        </div>
      </footer>
    </div>
  );
}
