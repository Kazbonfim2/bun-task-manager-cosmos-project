import {
  ArrowRight,
  Asterisk,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
            <div className="mb-6 flex items-center justify-center gap-3 sm:gap-4">
              <span className="font-birthstone text-6xl sm:text-8xl text-foreground font-normal tracking-wide select-none leading-none inline-flex items-center">
                Snow/Board
                <Asterisk className="inline-block size-6 sm:size-12 text-sky-400 dark:text-sky-300 animate-[spin_10s_linear_infinite] select-none ml-1 -mt-4 sm:-mt-6 stroke-[2.5]" />
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl text-foreground">
              Organize as tarefas da equipe{" "}
              <span className="text-primary">sem depender de planilhas</span>.
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Crie grupos de trabalho, distribua demandas com prazos definidos e acompanhe o
              andamento dos projetos em um ambiente compartilhado.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="mt-4 max-w-xl text-xs sm:text-sm font-medium text-foreground/80 bg-background/80 border rounded-lg px-4 py-2.5 shadow-xs">
              💡 <strong>Painel central:</strong> Consulte o responsável, a data de entrega e o
              status de cada atividade sem abrir várias abas.
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {autenticado ? (
                <Button size="lg" render={<Link to="/dashboard" />} className="gap-2 text-sm font-semibold">
                  <LayoutDashboard className="size-4" />
                  Acessar o Painel
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" render={<Link to="/cadastro" />} className="gap-2 text-sm font-semibold">
                    Criar conta e começar
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
            <h2 className="font-protest-riot text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-wide">
              Como o Snow/Board* se compara a outras ferramentas
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Diferenças práticas em relação a planilhas, softwares densos e grupos de mensagens.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            <ScrollReveal direction="up" delay={100} className="h-full">
              <Card className="flex flex-col justify-between border-muted-foreground/20 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Planilhas Compartilhadas</CardTitle>
                  <CardDescription className="text-xs">Edição concorrente e histórico</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Planilhas:</strong> Conflitos de edição simultânea, células sobrescritas e ausência de histórico confiável.</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground font-medium bg-primary/5 p-2 rounded-md border border-primary/15">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Snow/Board*:</strong> Atualização em tempo real, versionamento automático e registro de alterações.</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200} className="h-full">
              <Card className="flex flex-col justify-between border-muted-foreground/20 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Gestores Tradicionais</CardTitle>
                  <CardDescription className="text-xs">Jira, Monday e Asana</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Softwares densos:</strong> Telas com dezenas de campos, rotinas de configuração longas e custo por usuário.</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground font-medium bg-primary/5 p-2 rounded-md border border-primary/15">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Snow/Board*:</strong> Estrutura direta para criar equipes e tarefas em poucos minutos, sem custo de licença.</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300} className="h-full">
              <Card className="flex flex-col justify-between border-muted-foreground/20 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Mensagens Instantâneas</CardTitle>
                  <CardDescription className="text-xs">WhatsApp e canais de chat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                    <span><strong>Conversas avulsas:</strong> Informações espalhadas no fluxo de mensagens, tarefas esquecidas e cobranças manuais.</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground font-medium bg-primary/5 p-2 rounded-md border border-primary/15">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong>Snow/Board*:</strong> Registro único para cada demanda, prioridades visíveis e avisos de prazos próximos.</span>
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
            <h2 className="font-protest-riot text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-wide">
              Recursos Principais
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Funcionalidades projetadas para o acompanhamento diário das tarefas da equipe.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ScrollReveal direction="up" delay={100} className="h-full">
              <Card className="bg-card h-full flex flex-col">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="size-5" />
                  </div>
                  <CardTitle className="text-base">1. Painel de Controle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Como funciona:</strong> Filtre tarefas por projeto, status e responsável com visão consolidada das pendências.
                  </p>
                  <p>
                    <strong className="text-foreground">Aplicação:</strong> Acompanhe o progresso das entregas sem depender de reuniões extras de alinhamento.
                  </p>
                </CardContent>
                <CardFooter className="h-12 pt-0 text-xs font-medium text-primary flex items-center">
                  📊 Visão clara de prazos e responsáveis.
                </CardFooter>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200} className="h-full">
              <Card className="bg-card h-full flex flex-col">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bell className="size-5" />
                  </div>
                  <CardTitle className="text-base">2. Avisos Direcionados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Como funciona:</strong> Receba notificações quando alguém atribui uma demanda a você, menciona seu usuário ou quando um prazo vence.
                  </p>
                  <p>
                    <strong className="text-foreground">Aplicação:</strong> Foque no trabalho em andamento sem precisar atualizar a página repetidamente.
                  </p>
                </CardContent>
                <CardFooter className="h-12 pt-0 text-xs font-medium text-primary flex items-center">
                  🔔 Avisos pertinentes a cada participante.
                </CardFooter>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300} className="h-full">
              <Card className="bg-card h-full flex flex-col">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="size-5" />
                  </div>
                  <CardTitle className="text-base">3. Menções e Comentários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Como funciona:</strong> Adicione observações na timeline de cada demanda e mencione colegas usando @usuario.
                  </p>
                  <p>
                    <strong className="text-foreground">Aplicação:</strong> Guarde decisões e detalhes técnicos no mesmo card da atividade.
                  </p>
                </CardContent>
                <CardFooter className="h-12 pt-0 text-xs font-medium text-primary flex items-center">
                  💬 Conversas concentradas na própria tarefa.
                </CardFooter>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150} className="h-full">
              <Card className="bg-card h-full flex flex-col">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="size-5" />
                  </div>
                  <CardTitle className="text-base">4. Monitoramento de Prazos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Como funciona:</strong> O sistema identifica demandas com data de entrega expirada e indica os responsáveis.
                  </p>
                  <p>
                    <strong className="text-foreground">Aplicação:</strong> Priorize pendências críticas e ajuste datas de entrega antes do fechamento de ciclos.
                  </p>
                </CardContent>
                <CardFooter className="h-12 pt-0 text-xs font-medium text-primary flex items-center">
                  ⏳ Indicação imediata de itens com prazo vencido.
                </CardFooter>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={250} className="h-full">
              <Card className="bg-card h-full flex flex-col">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-5" />
                  </div>
                  <CardTitle className="text-base">5. Múltiplos Grupos de Trabalho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Como funciona:</strong> Crie grupos distintos e convide participantes com um código de acesso exclusivo.
                  </p>
                  <p>
                    <strong className="text-foreground">Aplicação:</strong> Separe as tarefas de diferentes clientes, departamentos ou squads na mesma conta.
                  </p>
                </CardContent>
                <CardFooter className="h-12 pt-0 text-xs font-medium text-primary flex items-center">
                  🏢 Projetos e permissões isolados por grupo.
                </CardFooter>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={350} className="h-full">
              <Card className="bg-card h-full flex flex-col">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="size-5" />
                  </div>
                  <CardTitle className="text-base">6. Acesso Direto pelo Navegador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Como funciona:</strong> Use o sistema pelo navegador em qualquer computador sem instalar extensões ou clientes locais.
                  </p>
                  <p>
                    <strong className="text-foreground">Aplicação:</strong> Inicie o cadastro, monte um grupo e distribua tarefas no primeiro acesso.
                  </p>
                </CardContent>
                <CardFooter className="h-12 pt-0 text-xs font-medium text-primary flex items-center">
                  ⚡ Operação imediata sem etapas de instalação.
                </CardFooter>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. COMO FUNCIONA (PASSOS) */}
      <section className="py-16 sm:py-20 border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="font-protest-riot text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-wide">
              Como Funciona
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Quatro etapas para organizar o fluxo de trabalho da sua equipe.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-center">
            <ScrollReveal direction="up" delay={200}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="text-sm font-semibold text-foreground">Crie sua Conta</h3>
                <p className="text-xs text-muted-foreground mt-1">Informe nome, email e senha para acessar o painel.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="text-sm font-semibold text-foreground">Abra um Grupo</h3>
                <p className="text-xs text-muted-foreground mt-1">Defina o espaço de trabalho da sua equipe ou projeto.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={600}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="text-sm font-semibold text-foreground">Convide Membros</h3>
                <p className="text-xs text-muted-foreground mt-1">Compartilhe o código de entrada com os participantes.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={800}>
              <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border h-full">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h3 className="text-sm font-semibold text-foreground">Distribua Demandas</h3>
                <p className="text-xs text-muted-foreground mt-1">Cadastre tarefas, defina prazos e acompanhe as entregas.</p>
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
                "Substituímos o controle em planilhas pelo Snow/Board*. Cada pessoa sabe exatamente quais tarefas precisa entregar e quais prazos estão próximos."
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                <span>Avaliação de equipe após migração de planilhas</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. TRANQUILIDADE E CONFIANÇA */}
      <section className="py-16 sm:py-20 border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="font-protest-riot text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-wide">
              Privacidade e Operação
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Ambiente preparado para as demandas diárias da equipe.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            <ScrollReveal direction="up" delay={100} className="h-full">
              <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card h-full">
                <ShieldCheck className="size-6 text-primary mb-1" />
                <h3 className="text-sm font-semibold text-foreground">Isolamento de Dados</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As tarefas e conversas de cada grupo ficam restritas aos membros convidados, sem cruzamento com outras equipes.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200} className="h-full">
              <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card h-full">
                <Check className="size-6 text-primary mb-1" />
                <h3 className="text-sm font-semibold text-foreground">Sem Cobrança por Usuário</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Utilize todas as funções de grupos, projetos e tarefas sem restrições de período ou limites de assentos.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300} className="h-full">
              <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card h-full">
                <Code2 className="size-6 text-primary mb-1" />
                <h3 className="text-sm font-semibold text-foreground">Código Aberto</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Código-fonte acessível para auditoria, personalização e implantação em infraestrutura própria.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="py-16 sm:py-24 bg-primary/5 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col items-center">
          <ScrollReveal direction="up" className="flex flex-col items-center text-center">
            <h2 className="font-protest-riot text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-wide">
              Pronto para organizar o fluxo de trabalho da sua equipe?
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-muted-foreground">
              Crie uma conta e monte o primeiro grupo de demandas em poucos minutos.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {autenticado ? (
                <Button size="lg" render={<Link to="/dashboard" />} className="gap-2 text-sm font-semibold">
                  <LayoutDashboard className="size-4" />
                  Acessar o Painel
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" render={<Link to="/cadastro" />} className="gap-2 text-sm font-semibold">
                    Criar Conta
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button size="lg" variant="outline" render={<Link to="/login" />} className="text-sm font-medium">
                    Acessar Conta Existente
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
            <Snowflake className="size-5 text-primary" />
            <span className="font-birthstone text-2xl font-normal text-foreground leading-none">Snow/Board*</span>
          </div>
          <div>
            Plataforma para coordenação de tarefas e equipes.
          </div>
        </div>
      </footer>
    </div>
  );
}
