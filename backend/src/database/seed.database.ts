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
  { id: 'PEN-001', titulo: 'Envio do balancete de fevereiro/2026', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-02-13', status: 'concluida', criado_em: '2026-02-03T00:00:00' },
  { id: 'PEN-002', titulo: 'Contrato social atualizado e última alteração registrada', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-02-12', status: 'aberta', criado_em: '2026-02-05T00:00:00' },
  { id: 'PEN-003', titulo: 'Relação de funcionários ativos com data de admissão', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-02-18', status: 'concluida', criado_em: '2026-02-06T00:00:00' },
  { id: 'PEN-004', titulo: 'Extratos bancários do primeiro trimestre', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-02-14', status: 'em_andamento', criado_em: '2026-02-09T00:00:00' },
  { id: 'PEN-005', titulo: 'Notas fiscais de serviço emitidas em março', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-02-25', status: 'em_andamento', criado_em: '2026-02-10T00:00:00' },
  { id: 'PEN-006', titulo: 'Composicao da conta de clientes a receber', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-02-19', status: 'concluida', criado_em: '2026-02-11T00:00:00' },
  { id: 'PEN-007', titulo: 'Cópia dos contratos com os cinco maiores fornecedores', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-04', status: 'aberta', criado_em: '2026-02-12T00:00:00' },
  { id: 'PEN-008', titulo: 'Relação de processos judiciais em andamento', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-02-17', status: 'concluida', criado_em: '2026-02-13T00:00:00' },
  { id: 'PEN-009', titulo: 'Política interna de reembolso de despesas', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-02-27', status: 'concluida', criado_em: '2026-02-18T00:00:00' },
  { id: 'PEN-010', titulo: 'Conciliação da conta de estoques', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-03-03', status: 'aberta', criado_em: '2026-02-20T00:00:00' },
  { id: 'PEN-011', titulo: 'Comprovantes de recolhimento de tributos federais', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-03-02', status: 'concluida', criado_em: '2026-02-24T00:00:00' },
  { id: 'PEN-012', titulo: 'Detalhamento das despesas com marketing', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-03-12', status: 'em_andamento', criado_em: '2026-02-26T00:00:00' },
  { id: 'PEN-013', titulo: 'Organograma da area administrativa', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-03-12', status: 'em_andamento', criado_em: '2026-03-02T00:00:00' },
  { id: 'PEN-014', titulo: 'Relação de bens do ativo imobilizado', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-11', status: 'concluida', criado_em: '2026-03-04T00:00:00' },
  { id: 'PEN-015', titulo: 'Contratos de locação vigentes', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-26', status: 'aberta', criado_em: '2026-03-05T00:00:00' },
  { id: 'PEN-016', titulo: 'Apólices de seguro em vigor', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-03-14', status: 'concluida', criado_em: '2026-03-09T00:00:00' },
  { id: 'PEN-017', titulo: 'Relação de partes relacionadas', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-03-24', status: 'aberta', criado_em: '2026-03-11T00:00:00' },
  { id: 'PEN-018', titulo: 'Memoria de calculo da provisao de férias', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-03-20', status: 'concluida', criado_em: '2026-03-12T00:00:00' },
  { id: 'PEN-019', titulo: 'Extrato de empréstimos e financiamentos', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-04-03', status: 'concluida', criado_em: '2026-03-16T00:00:00' },
  { id: 'PEN-020', titulo: 'Relatório de horas extras por colaborador', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-03-24', status: 'aberta', criado_em: '2026-03-18T00:00:00' },
  { id: 'PEN-021', titulo: 'Planilha de comissões pagas no semestre', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-03-29', status: 'em_andamento', criado_em: '2026-03-20T00:00:00' },
  { id: 'PEN-022', titulo: 'Cópia das atas de reuniao de sócios', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-04-04', status: 'aberta', criado_em: '2026-03-23T00:00:00' },
  { id: 'PEN-023', titulo: 'Detalhamento de receitas por linha de serviço', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-04-01', status: 'concluida', criado_em: '2026-03-25T00:00:00' },
  { id: 'PEN-024', titulo: 'Relação de clientes inadimplentes acima de 90 dias', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-04-11', status: 'concluida', criado_em: '2026-03-27T00:00:00' },
  { id: 'PEN-025', titulo: 'Contratos de prestação de serviço de TI', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-04-11', status: 'em_andamento', criado_em: '2026-04-01T00:00:00' },
  { id: 'PEN-026', titulo: 'Comprovante de regularidade fiscal municipal', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-04-14', status: 'concluida', criado_em: '2026-04-06T00:00:00' },
  { id: 'PEN-027', titulo: 'Relação de veículos da frota e respectivos custos', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-04-22', status: 'aberta', criado_em: '2026-04-08T00:00:00' },
  { id: 'PEN-028', titulo: 'Detalhamento da conta de outras despesas operacionais', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-04-14', status: 'em_andamento', criado_em: '2026-04-09T00:00:00' },
  { id: 'PEN-029', titulo: 'Política de alcada de aprovação de compras', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-04-24', status: 'em_andamento', criado_em: '2026-04-13T00:00:00' },
  { id: 'PEN-030', titulo: 'Relatório de inventario físico do último exercício', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-04-22', status: 'aberta', criado_em: '2026-04-15T00:00:00' },
  { id: 'PEN-031', titulo: 'Contratos de trabalho dos diretores', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-05-06', status: 'concluida', criado_em: '2026-04-16T00:00:00' },
  { id: 'PEN-032', titulo: 'Relação de licenças de software contratadas', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-04-26', status: 'em_andamento', criado_em: '2026-04-20T00:00:00' },
  { id: 'PEN-033', titulo: 'Histórico de reajuste de preços no último ano', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-05-01', status: 'concluida', criado_em: '2026-04-22T00:00:00' },
  { id: 'PEN-034', titulo: 'Comprovantes de pagamento do FGTS', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-05-10', status: 'concluida', criado_em: '2026-04-27T00:00:00' },
  { id: 'PEN-035', titulo: 'Mapeamento das contas bancarias ativas', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-05-07', status: 'aberta', criado_em: '2026-04-29T00:00:00' },
  { id: 'PEN-036', titulo: 'Relação de garantias prestadas a terceiros', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-05-14', status: 'em_andamento', criado_em: '2026-05-04T00:00:00' },
  { id: 'PEN-037', titulo: 'Detalhamento de despesas com viagens', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-05-13', status: 'aberta', criado_em: '2026-05-06T00:00:00' },
  { id: 'PEN-038', titulo: 'Cópia do laudo de avaliação patrimonial', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-05-24', status: 'concluida', criado_em: '2026-05-08T00:00:00' },
  { id: 'PEN-039', titulo: 'Relação de contratos com cláusula de exclusividade', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-05-16', status: 'concluida', criado_em: '2026-05-11T00:00:00' },
  { id: 'PEN-040', titulo: 'Planilha de controle de ponto do último trimestre', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-05-25', status: 'em_andamento', criado_em: '2026-05-13T00:00:00' },
  { id: 'PEN-041', titulo: 'Envio do balancete de fevereiro/2026', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-05-24', status: 'concluida', criado_em: '2026-05-15T00:00:00' },
  { id: 'PEN-042', titulo: 'Contrato social atualizado e última alteração registrada', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-05-26', status: 'aberta', criado_em: '2026-05-18T00:00:00' },
  { id: 'PEN-043', titulo: 'Relação de funcionários ativos com data de admissão', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-03', status: 'concluida', criado_em: '2026-05-20T00:00:00' },
  { id: 'PEN-044', titulo: 'Extratos bancários do primeiro trimestre', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-05-28', status: 'em_andamento', criado_em: '2026-05-22T00:00:00' },
  { id: 'PEN-045', titulo: 'Notas fiscais de serviço emitidas em março', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-06-06', status: 'aberta', criado_em: '2026-05-26T00:00:00' },
  { id: 'PEN-046', titulo: 'Composicao da conta de clientes a receber', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-04', status: 'concluida', criado_em: '2026-05-28T00:00:00' },
  { id: 'PEN-047', titulo: 'Cópia dos contratos com os cinco maiores fornecedores', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-06-11', status: 'em_andamento', criado_em: '2026-06-01T00:00:00' },
  { id: 'PEN-048', titulo: 'Relação de processos judiciais em andamento', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-06-11', status: 'concluida', criado_em: '2026-06-03T00:00:00' },
  { id: 'PEN-049', titulo: 'Política interna de reembolso de despesas', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-21', status: 'concluida', criado_em: '2026-06-08T00:00:00' },
  { id: 'PEN-050', titulo: 'Conciliação da conta de estoques', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-15', status: 'aberta', criado_em: '2026-06-10T00:00:00' },
  { id: 'PEN-051', titulo: 'Comprovantes de recolhimento de tributos federais', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-06-21', status: 'concluida', criado_em: '2026-06-12T00:00:00' },
  { id: 'PEN-052', titulo: 'Detalhamento das despesas com marketing', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-06-27', status: 'aberta', criado_em: '2026-06-15T00:00:00' },
  { id: 'PEN-053', titulo: 'Organograma da area administrativa', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-24', status: 'em_andamento', criado_em: '2026-06-17T00:00:00' },
  { id: 'PEN-054', titulo: 'Relação de bens do ativo imobilizado', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-07', status: 'concluida', criado_em: '2026-06-22T00:00:00' },
  { id: 'PEN-055', titulo: 'Contratos de locação vigentes', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-06-30', status: 'aberta', criado_em: '2026-06-24T00:00:00' },
  { id: 'PEN-056', titulo: 'Apólices de seguro em vigor', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-07-06', status: 'concluida', criado_em: '2026-06-26T00:00:00' },
  { id: 'PEN-057', titulo: 'Relação de partes relacionadas', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-07-10', status: 'aberta', criado_em: '2026-07-01T00:00:00' },
  { id: 'PEN-058', titulo: 'Memoria de calculo da provisao de férias', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-07-18', status: 'concluida', criado_em: '2026-07-06T00:00:00' },
  { id: 'PEN-059', titulo: 'Extrato de empréstimos e financiamentos', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-07-15', status: 'concluida', criado_em: '2026-07-08T00:00:00' },
  { id: 'PEN-060', titulo: 'Relatório de horas extras por colaborador', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-07-27', status: 'em_andamento', criado_em: '2026-07-13T00:00:00' },
  { id: 'PEN-061', titulo: 'Planilha de comissões pagas no semestre', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-20', status: 'em_andamento', criado_em: '2026-07-15T00:00:00' },
  { id: 'PEN-062', titulo: 'Cópia das atas de reuniao de sócios', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-07-31', status: 'aberta', criado_em: '2026-07-20T00:00:00' },
  { id: 'PEN-063', titulo: 'Relação de processos judiciais em andamento', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-02-20', status: 'aberta', criado_em: '2026-02-10T00:00:00' },
  { id: 'PEN-064', titulo: 'Política interna de reembolso de despesas', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-carlos-menezes', criado_por_id: 'user-carlos-menezes', prazo: '2026-02-25', status: 'aberta', criado_em: '2026-02-12T00:00:00' },
  { id: 'PEN-065', titulo: 'Conciliação da conta de estoques', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-04-10', status: 'em_andamento', criado_em: '2026-03-30T00:00:00' },
  { id: 'PEN-066', titulo: 'Comprovantes de recolhimento de tributos federais', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-04-14', status: 'concluida', criado_em: '2026-03-31T00:00:00' },
  { id: 'PEN-067', titulo: 'Detalhamento das despesas com marketing', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-10', status: 'aberta', criado_em: '2026-05-28T00:00:00' },
  { id: 'PEN-068', titulo: 'Organograma da area administrativa', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-06-12', status: 'em_andamento', criado_em: '2026-06-01T00:00:00' },
  { id: 'PEN-069', titulo: 'Relação de bens do ativo imobilizado', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-05-05', status: 'aberta', criado_em: '2026-04-15T00:00:00' },
  { id: 'PEN-070', titulo: 'Planilha de comissões pagas no semestre', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-03-21', status: 'aberta', criado_em: '2026-03-10T00:00:00' },
  { id: 'PEN-071', titulo: 'Cópia das atas de reuniao de sócios', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-05-17', status: 'aberta', criado_em: '2026-05-05T00:00:00' },
  { id: 'PEN-072', titulo: 'Detalhamento de receitas por linha de serviço', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-09-07', status: 'aberta', criado_em: '2026-08-25T00:00:00' },
  { id: 'PEN-073', titulo: 'Contratos de trabalho dos diretores', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-07-18', status: 'aberta', criado_em: '2026-07-03T00:00:00' },
  { id: 'PEN-074', titulo: 'Relação de licenças de software contratadas', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-rafael-duarte', criado_por_id: 'user-rafael-duarte', prazo: '2026-07-21', status: 'em_andamento', criado_em: '2026-07-06T00:00:00' },
  { id: 'PEN-075', titulo: 'Histórico de reajuste de preços no último ano', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-07-24', status: 'aberta', criado_em: '2026-07-09T00:00:00' },
  { id: 'PEN-076', titulo: 'Comprovantes de pagamento do FGTS', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-27', status: 'em_andamento', criado_em: '2026-07-12T00:00:00' },
  { id: 'PEN-077', titulo: 'Mapeamento das contas bancarias ativas', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-beatriz-nogueira', criado_por_id: 'user-beatriz-nogueira', prazo: '2026-07-30', status: 'aberta', criado_em: '2026-07-15T00:00:00' },
  { id: 'PEN-078', titulo: 'Organograma da area administrativa', descricao: null, projeto_id: 'proj-bandeirante', responsavel_id: 'user-juliana-castro', criado_por_id: 'user-juliana-castro', prazo: '2026-06-08', status: 'aberta', criado_em: '2026-06-18T00:00:00' },
  { id: 'PEN-079', titulo: 'Relação de bens do ativo imobilizado', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-07-02', status: 'aberta', criado_em: '2026-07-22T00:00:00' },
  { id: 'PEN-004-R2', titulo: 'Extratos bancários do primeiro trimestre', descricao: null, projeto_id: 'proj-delta', responsavel_id: 'user-marcos-vinicius-alves', criado_por_id: 'user-marcos-vinicius-alves', prazo: '2026-05-26', status: 'aberta', criado_em: '2026-05-12T00:00:00' },
  { id: 'PEN-019-R2', titulo: 'Extrato de empréstimos e financiamentos', descricao: null, projeto_id: 'proj-cordilheira', responsavel_id: 'user-ana-paula-ribeiro', criado_por_id: 'user-ana-paula-ribeiro', prazo: '2026-06-19', status: 'aberta', criado_em: '2026-06-09T00:00:00' },
  { id: 'PEN-037-R2', titulo: 'Detalhamento de despesas com viagens', descricao: null, projeto_id: 'proj-aurora', responsavel_id: 'user-fernanda-lima', criado_por_id: 'user-fernanda-lima', prazo: '2026-08-07', status: 'aberta', criado_em: '2026-07-27T00:00:00' },
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
      (id, titulo, descricao, projeto_id, responsavel_id, criado_por_id, prazo, status, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const d of demandas) {
    insertDemanda.run(
      d.id, d.titulo, d.descricao, d.projeto_id, d.responsavel_id, d.criado_por_id,
      d.prazo, d.status, d.criado_em, d.criado_em
    );
  }

  console.log(`Seed concluído: ${usuarios.length} usuários, ${projetos.length} projetos, ${demandas.length} demandas.`);
}

export async function seedDatabaseIfEmpty() {
  const row = db.query("SELECT COUNT(*) as count FROM usuarios").get() as { count: number };
  if (row.count === 0) {
    console.log("Banco de dados vazio. Executando seed inicial automático...");
    // Para evitar o Seed automático nessa instância, basta comentar o trecho abaixo.
    await seedDatabase();
  }
}

if (import.meta.main) {
  await seedDatabase();
}