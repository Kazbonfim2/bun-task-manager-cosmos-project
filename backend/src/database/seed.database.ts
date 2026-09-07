// seed.ts
// Script de importação (seed) gerado a partir de Controle_Pendencias.xlsx
// Rodar com: bun run seed.ts
//
// ASSUNÇÕES ASSUMIDAS NA CONVERSÃO (fora do que estava explícito na planilha):
// - Coluna "Observações" não existe no SCHEMA.md -> não foi importada.
// - Nomes de responsável com grafias diferentes (ex: "ana paula ribeiro",
//   "A. Paula Ribeiro", "Ana P. Ribeiro") foram unificados em um único usuário canônico.
// - usuarios.email = nome.completo@cosmos.com (nomes sem acento) e senha fixa
//   "novo123456789" (hasheada via Bun.password), conforme solicitado.
// - demandas.criado_por_id não existe na planilha -> assumido = o próprio responsavel_id.
// - demandas.atualizado_em não existe na planilha -> assumido = igual a criado_em.
// - Linhas separadoras ("--- FASE 2 ---"), em branco e a linha TOTAL foram descartadas.
// - Status da planilha (ok/feito/concluído -> concluida; respondido/aguardando cliente ->
//   em_andamento; pendente/em aberto -> aberta; célula vazia -> aberta).
// - 3 IDs apareceram duplicados na planilha (PEN-004, PEN-019, PEN-037), indicando
//   reabertura de pendência. Como "id" é PK, cada reabertura virou um novo registro
//   com sufixo "-R2" (mesmo projeto/descrição, novo prazo e status).
// - 5 linhas sem "Prazo" preenchido (NOT NULL no schema): assumido = data da
//   solicitação + 15 dias. Marcadas com comentário "// prazo assumido" abaixo.

import { db } from "./connection";

const SENHA_PADRAO = "novo123456789";

// ---------- usuarios ----------
const usuarios = [
  { id: 'user-ana-paula-ribeiro', nome_completo: 'Ana Paula Ribeiro', email: 'ana.paula.ribeiro@cosmos.com' },
  { id: 'user-beatriz-nogueira', nome_completo: 'Beatriz Nogueira', email: 'beatriz.nogueira@cosmos.com' },
  { id: 'user-carlos-menezes', nome_completo: 'Carlos Menezes', email: 'carlos.menezes@cosmos.com' },
  { id: 'user-fernanda-lima', nome_completo: 'Fernanda Lima', email: 'fernanda.lima@cosmos.com' },
  { id: 'user-juliana-castro', nome_completo: 'Juliana Castro', email: 'juliana.castro@cosmos.com' },
  { id: 'user-marcos-vinicius-alves', nome_completo: 'Marcos Vinícius Alves', email: 'marcos.vinicius.alves@cosmos.com' },
  { id: 'user-rafael-duarte', nome_completo: 'Rafael Duarte', email: 'rafael.duarte@cosmos.com' },
];

// ---------- projetos ----------
const projetos = [
  { id: 'proj-aurora', nome: 'Projeto Aurora' },
  { id: 'proj-bandeirante', nome: 'Projeto Bandeirante' },
  { id: 'proj-cordilheira', nome: 'Projeto Cordilheira' },
  { id: 'proj-delta', nome: 'Projeto Delta' },
];

// ---------- demandas ----------
const demandas = [
  { id: 'PEN-001', descricao: 'Envio do balancete de fevereiro/2026', projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-02-13', status: 'concluida', criado_em: '2026-02-03T00:00:00' },
  { id: 'PEN-002', descricao: 'Contrato social atualizado e última alteração registrada', projeto_id: 'proj-bandeirante', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-02-12', status: 'aberta', criado_em: '2026-02-05T00:00:00' },
  { id: 'PEN-003', descricao: 'Relação de funcionários ativos com data de admissão', projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-02-18', status: 'concluida', criado_em: '2026-02-06T00:00:00' },
  { id: 'PEN-004', descricao: 'Extratos bancários do primeiro trimestre', projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-02-14', status: 'em_andamento', criado_em: '2026-02-09T00:00:00' },
  { id: 'PEN-005', descricao: 'Notas fiscais de serviço emitidas em março', projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-02-25', status: 'em_andamento', criado_em: '2026-02-10T00:00:00' },
  { id: 'PEN-006', descricao: 'Composicao da conta de clientes a receber', projeto_id: 'proj-bandeirante', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-02-19', status: 'concluida', criado_em: '2026-02-11T00:00:00' },
  { id: 'PEN-007', descricao: 'Cópia dos contratos com os cinco maiores fornecedores', projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-04', status: 'aberta', criado_em: '2026-02-12T00:00:00' },
  { id: 'PEN-008', descricao: 'Relação de processos judiciais em andamento', projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-02-17', status: 'concluida', criado_em: '2026-02-13T00:00:00' },
  { id: 'PEN-009', descricao: 'Política interna de reembolso de despesas', projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-02-27', status: 'concluida', criado_em: '2026-02-18T00:00:00' },
  { id: 'PEN-010', descricao: 'Conciliação da conta de estoques', projeto_id: 'proj-bandeirante', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-03-03', status: 'aberta', criado_em: '2026-02-20T00:00:00' },
  { id: 'PEN-011', descricao: 'Comprovantes de recolhimento de tributos federais', projeto_id: 'proj-cordilheira', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-03-02', status: 'concluida', criado_em: '2026-02-24T00:00:00' },
  { id: 'PEN-012', descricao: 'Detalhamento das despesas com marketing', projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-03-12', status: 'em_andamento', criado_em: '2026-02-26T00:00:00' },
  { id: 'PEN-013', descricao: 'Organograma da area administrativa', projeto_id: 'proj-aurora', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-03-12', status: 'em_andamento', criado_em: '2026-03-02T00:00:00' },
  { id: 'PEN-014', descricao: 'Relação de bens do ativo imobilizado', projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-11', status: 'concluida', criado_em: '2026-03-04T00:00:00' },
  { id: 'PEN-015', descricao: 'Contratos de locação vigentes', projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-26', status: 'aberta', criado_em: '2026-03-05T00:00:00' },
  { id: 'PEN-016', descricao: 'Apólices de seguro em vigor', projeto_id: 'proj-delta', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-03-14', status: 'concluida', criado_em: '2026-03-09T00:00:00' },
  { id: 'PEN-017', descricao: 'Relação de partes relacionadas', projeto_id: 'proj-aurora', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-03-24', status: 'aberta', criado_em: '2026-03-11T00:00:00' },
  { id: 'PEN-018', descricao: 'Memoria de calculo da provisao de férias', projeto_id: 'proj-bandeirante', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-03-20', status: 'concluida', criado_em: '2026-03-12T00:00:00' },
  { id: 'PEN-019', descricao: 'Extrato de empréstimos e financiamentos', projeto_id: 'proj-cordilheira', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-04-03', status: 'concluida', criado_em: '2026-03-16T00:00:00' },
  { id: 'PEN-020', descricao: 'Relatório de horas extras por colaborador', projeto_id: 'proj-delta', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-03-24', status: 'aberta', criado_em: '2026-03-18T00:00:00' },
  { id: 'PEN-021', descricao: 'Planilha de comissões pagas no semestre', projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-29', status: 'em_andamento', criado_em: '2026-03-20T00:00:00' },
  { id: 'PEN-022', descricao: 'Cópia das atas de reuniao de sócios', projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-04-04', status: 'aberta', criado_em: '2026-03-23T00:00:00' },
  { id: 'PEN-023', descricao: 'Detalhamento de receitas por linha de serviço', projeto_id: 'proj-cordilheira', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-04-01', status: 'concluida', criado_em: '2026-03-25T00:00:00' },
  { id: 'PEN-024', descricao: 'Relação de clientes inadimplentes acima de 90 dias', projeto_id: 'proj-delta', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-04-11', status: 'concluida', criado_em: '2026-03-27T00:00:00' },
  { id: 'PEN-025', descricao: 'Contratos de prestação de serviço de TI', projeto_id: 'proj-aurora', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-04-11', status: 'em_andamento', criado_em: '2026-04-01T00:00:00' },
  { id: 'PEN-026', descricao: 'Comprovante de regularidade fiscal municipal', projeto_id: 'proj-bandeirante', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-04-14', status: 'concluida', criado_em: '2026-04-06T00:00:00' },
  { id: 'PEN-027', descricao: 'Relação de veículos da frota e respectivos custos', projeto_id: 'proj-cordilheira', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-04-22', status: 'aberta', criado_em: '2026-04-08T00:00:00' },
  { id: 'PEN-028', descricao: 'Detalhamento da conta de outras despesas operacionais', projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-04-14', status: 'em_andamento', criado_em: '2026-04-09T00:00:00' },
  { id: 'PEN-029', descricao: 'Política de alcada de aprovação de compras', projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-04-24', status: 'em_andamento', criado_em: '2026-04-13T00:00:00' },
  { id: 'PEN-030', descricao: 'Relatório de inventario físico do último exercício', projeto_id: 'proj-bandeirante', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-04-22', status: 'aberta', criado_em: '2026-04-15T00:00:00' },
  { id: 'PEN-031', descricao: 'Contratos de trabalho dos diretores', projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-05-06', status: 'concluida', criado_em: '2026-04-16T00:00:00' },
  { id: 'PEN-032', descricao: 'Relação de licenças de software contratadas', projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-04-26', status: 'em_andamento', criado_em: '2026-04-20T00:00:00' },
  { id: 'PEN-033', descricao: 'Histórico de reajuste de preços no último ano', projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-05-01', status: 'concluida', criado_em: '2026-04-22T00:00:00' },
  { id: 'PEN-034', descricao: 'Comprovantes de pagamento do FGTS', projeto_id: 'proj-bandeirante', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-05-10', status: 'concluida', criado_em: '2026-04-27T00:00:00' },
  { id: 'PEN-035', descricao: 'Mapeamento das contas bancarias ativas', projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-05-07', status: 'aberta', criado_em: '2026-04-29T00:00:00' },
  { id: 'PEN-036', descricao: 'Relação de garantias prestadas a terceiros', projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-05-14', status: 'em_andamento', criado_em: '2026-05-04T00:00:00' },
  { id: 'PEN-037', descricao: 'Detalhamento de despesas com viagens', projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-05-13', status: 'aberta', criado_em: '2026-05-06T00:00:00' },
  { id: 'PEN-038', descricao: 'Cópia do laudo de avaliação patrimonial', projeto_id: 'proj-bandeirante', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-05-24', status: 'concluida', criado_em: '2026-05-08T00:00:00' },
  { id: 'PEN-039', descricao: 'Relação de contratos com cláusula de exclusividade', projeto_id: 'proj-cordilheira', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-05-16', status: 'concluida', criado_em: '2026-05-11T00:00:00' },
  { id: 'PEN-040', descricao: 'Planilha de controle de ponto do último trimestre', projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-05-25', status: 'em_andamento', criado_em: '2026-05-13T00:00:00' },
  { id: 'PEN-041', descricao: 'Envio do balancete de fevereiro/2026', projeto_id: 'proj-aurora', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-05-24', status: 'concluida', criado_em: '2026-05-15T00:00:00' },
  { id: 'PEN-042', descricao: 'Contrato social atualizado e última alteração registrada', projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-05-26', status: 'aberta', criado_em: '2026-05-18T00:00:00' },
  { id: 'PEN-043', descricao: 'Relação de funcionários ativos com data de admissão', projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-03', status: 'concluida', criado_em: '2026-05-20T00:00:00' },
  { id: 'PEN-044', descricao: 'Extratos bancários do primeiro trimestre', projeto_id: 'proj-delta', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-05-28', status: 'em_andamento', criado_em: '2026-05-22T00:00:00' },
  { id: 'PEN-045', descricao: 'Notas fiscais de serviço emitidas em março', projeto_id: 'proj-aurora', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-06-06', status: 'aberta', criado_em: '2026-05-26T00:00:00' },
  { id: 'PEN-046', descricao: 'Composicao da conta de clientes a receber', projeto_id: 'proj-bandeirante', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-04', status: 'concluida', criado_em: '2026-05-28T00:00:00' },
  { id: 'PEN-047', descricao: 'Cópia dos contratos com os cinco maiores fornecedores', projeto_id: 'proj-cordilheira', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-06-11', status: 'em_andamento', criado_em: '2026-06-01T00:00:00' },
  { id: 'PEN-048', descricao: 'Relação de processos judiciais em andamento', projeto_id: 'proj-delta', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-06-11', status: 'concluida', criado_em: '2026-06-03T00:00:00' },
  { id: 'PEN-049', descricao: 'Política interna de reembolso de despesas', projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-21', status: 'concluida', criado_em: '2026-06-08T00:00:00' },
  { id: 'PEN-050', descricao: 'Conciliação da conta de estoques', projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-15', status: 'aberta', criado_em: '2026-06-10T00:00:00' },
  { id: 'PEN-051', descricao: 'Comprovantes de recolhimento de tributos federais', projeto_id: 'proj-cordilheira', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-06-21', status: 'concluida', criado_em: '2026-06-12T00:00:00' },
  { id: 'PEN-052', descricao: 'Detalhamento das despesas com marketing', projeto_id: 'proj-delta', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-06-27', status: 'aberta', criado_em: '2026-06-15T00:00:00' },
  { id: 'PEN-053', descricao: 'Organograma da area administrativa', projeto_id: 'proj-aurora', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-24', status: 'em_andamento', criado_em: '2026-06-17T00:00:00' },
  { id: 'PEN-054', descricao: 'Relação de bens do ativo imobilizado', projeto_id: 'proj-bandeirante', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-07', status: 'concluida', criado_em: '2026-06-22T00:00:00' },
  { id: 'PEN-055', descricao: 'Contratos de locação vigentes', projeto_id: 'proj-cordilheira', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-06-30', status: 'aberta', criado_em: '2026-06-24T00:00:00' },
  { id: 'PEN-056', descricao: 'Apólices de seguro em vigor', projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-07-06', status: 'concluida', criado_em: '2026-06-26T00:00:00' },
  { id: 'PEN-057', descricao: 'Relação de partes relacionadas', projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-07-10', status: 'aberta', criado_em: '2026-07-01T00:00:00' },
  { id: 'PEN-058', descricao: 'Memoria de calculo da provisao de férias', projeto_id: 'proj-bandeirante', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-07-18', status: 'concluida', criado_em: '2026-07-06T00:00:00' },
  { id: 'PEN-059', descricao: 'Extrato de empréstimos e financiamentos', projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-07-15', status: 'concluida', criado_em: '2026-07-08T00:00:00' },
  { id: 'PEN-060', descricao: 'Relatório de horas extras por colaborador', projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-07-27', status: 'em_andamento', criado_em: '2026-07-13T00:00:00' },
  { id: 'PEN-061', descricao: 'Planilha de comissões pagas no semestre', projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-20', status: 'em_andamento', criado_em: '2026-07-15T00:00:00' },
  { id: 'PEN-062', descricao: 'Cópia das atas de reuniao de sócios', projeto_id: 'proj-bandeirante', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-07-31', status: 'aberta', criado_em: '2026-07-20T00:00:00' },
  { id: 'PEN-063', descricao: 'Relação de processos judiciais em andamento', projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-02-20', status: 'aberta', criado_em: '2026-02-10T00:00:00' },
  { id: 'PEN-064', descricao: 'Política interna de reembolso de despesas', projeto_id: 'proj-bandeirante', responsavel_id: 'user-carlos-menezes', criado_por_id: 'user-carlos-menezes', prazo: '2026-02-25', status: 'aberta', criado_em: '2026-02-12T00:00:00' },
  { id: 'PEN-065', descricao: 'Conciliação da conta de estoques', projeto_id: 'proj-cordilheira', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-04-10', status: 'em_andamento', criado_em: '2026-03-30T00:00:00' },
  { id: 'PEN-066', descricao: 'Comprovantes de recolhimento de tributos federais', projeto_id: 'proj-delta', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-04-14', status: 'concluida', criado_em: '2026-03-31T00:00:00' },
  { id: 'PEN-067', descricao: 'Detalhamento das despesas com marketing', projeto_id: 'proj-aurora', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-10', status: 'aberta', criado_em: '2026-05-28T00:00:00' },
  { id: 'PEN-068', descricao: 'Organograma da area administrativa', projeto_id: 'proj-bandeirante', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-06-12', status: 'em_andamento', criado_em: '2026-06-01T00:00:00' },
  { id: 'PEN-069', descricao: 'Relação de bens do ativo imobilizado', projeto_id: 'proj-cordilheira', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-05-05', status: 'aberta', criado_em: '2026-04-15T00:00:00' },
  { id: 'PEN-070', descricao: 'Planilha de comissões pagas no semestre', projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-03-21', status: 'aberta', criado_em: '2026-03-10T00:00:00' },
  { id: 'PEN-071', descricao: 'Cópia das atas de reuniao de sócios', projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-05-17', status: 'aberta', criado_em: '2026-05-05T00:00:00' },
  { id: 'PEN-072', descricao: 'Detalhamento de receitas por linha de serviço', projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-09-07', status: 'aberta', criado_em: '2026-08-25T00:00:00' },
  { id: 'PEN-073', descricao: 'Contratos de trabalho dos diretores', projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-07-18', status: 'aberta', criado_em: '2026-07-03T00:00:00' },  // prazo assumido (+15 dias da solicitação, ausente na planilha)
  { id: 'PEN-074', descricao: 'Relação de licenças de software contratadas', projeto_id: 'proj-bandeirante', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-07-21', status: 'em_andamento', criado_em: '2026-07-06T00:00:00' },  // prazo assumido (+15 dias da solicitação, ausente na planilha)
  { id: 'PEN-075', descricao: 'Histórico de reajuste de preços no último ano', projeto_id: 'proj-cordilheira', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-07-24', status: 'aberta', criado_em: '2026-07-09T00:00:00' },  // prazo assumido (+15 dias da solicitação, ausente na planilha)
  { id: 'PEN-076', descricao: 'Comprovantes de pagamento do FGTS', projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-27', status: 'em_andamento', criado_em: '2026-07-12T00:00:00' },  // prazo assumido (+15 dias da solicitação, ausente na planilha)
  { id: 'PEN-077', descricao: 'Mapeamento das contas bancarias ativas', projeto_id: 'proj-aurora', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-07-30', status: 'aberta', criado_em: '2026-07-15T00:00:00' },  // prazo assumido (+15 dias da solicitação, ausente na planilha)
  { id: 'PEN-078', descricao: 'Organograma da area administrativa', projeto_id: 'proj-bandeirante', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-08', status: 'aberta', criado_em: '2026-06-18T00:00:00' },
  { id: 'PEN-079', descricao: 'Relação de bens do ativo imobilizado', projeto_id: 'proj-cordilheira', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-02', status: 'aberta', criado_em: '2026-07-22T00:00:00' },
  { id: 'PEN-004-R2', descricao: 'Extratos bancários do primeiro trimestre', projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-05-26', status: 'aberta', criado_em: '2026-05-12T00:00:00' },
  { id: 'PEN-019-R2', descricao: 'Extrato de empréstimos e financiamentos', projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-19', status: 'aberta', criado_em: '2026-06-09T00:00:00' },
  { id: 'PEN-037-R2', descricao: 'Detalhamento de despesas com viagens', projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-08-07', status: 'aberta', criado_em: '2026-07-27T00:00:00' },
];

export async function seedDatabase() {
  const senhaHash = await Bun.password.hash(SENHA_PADRAO);

  const insertUsuario = db.prepare(
    `INSERT OR IGNORE INTO usuarios (id, nome_completo, email, senha_hash, criado_em) VALUES (?, ?, ?, ?, ?)`
  );
  for (const u of usuarios) {
    insertUsuario.run(u.id, u.nome_completo, u.email, senhaHash, new Date().toISOString());
  }

  const insertProjeto = db.prepare(
    `INSERT OR IGNORE INTO projetos (id, nome, descricao, criado_em) VALUES (?, ?, NULL, ?)`
  );
  for (const p of projetos) {
    insertProjeto.run(p.id, p.nome, new Date().toISOString());
  }

  const insertDemanda = db.prepare(
    `INSERT OR IGNORE INTO demandas
      (id, descricao, projeto_id, responsavel_id, criado_por_id, prazo, status, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const d of demandas) {
    insertDemanda.run(
      d.id, d.descricao, d.projeto_id, d.responsavel_id, d.criado_por_id,
      d.prazo, d.status, d.criado_em, d.criado_em
    );
  }

  console.log(`Seed concluído: ${usuarios.length} usuários, ${projetos.length} projetos, ${demandas.length} demandas.`);
}

export async function seedDatabaseIfEmpty() {
  const row = db.query("SELECT COUNT(*) as count FROM usuarios").get() as { count: number };
  if (row.count === 0) {
    console.log("Banco de dados vazio. Executando seed inicial automático...");
    await seedDatabase();
  }
}

if (import.meta.main) {
  await seedDatabase();
}