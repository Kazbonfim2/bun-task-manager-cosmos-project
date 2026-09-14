import { describe, expect, it } from "bun:test";
import { authService } from "../auth/auth.service";
import { demandaRepository } from "../demanda/demanda.repository";
import { projetoRepository } from "../projeto/projeto.repository";
import { grupoRepository } from "./grupo.repository";
import { grupoService } from "./grupo.service";

describe("Tenancy, Grupos e Convites", () => {
  it("deve criar um grupo com sucesso e gerar exatamente 5 convites únicos", async () => {
    const user = await authService.cadastrar({
      nome_completo: "Dono Teste",
      email: `dono-test-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Animal?",
      resposta_secreta: "Cachorro",
    });
    const resultado = await grupoRepository.criar("Equipe Alpha", user.usuario.id);

    expect(resultado.grupo).toBeDefined();
    expect(resultado.grupo.nome).toBe("Equipe Alpha");
    expect(resultado.convites).toHaveLength(5);

    const codigos = new Set(resultado.convites.map((c) => c.codigo));
    expect(codigos.size).toBe(5);

    for (const c of resultado.convites) {
      expect(c.codigo.startsWith("ORION-")).toBe(true);
      expect(c.status).toBe("disponivel");
      expect(c.usado_por_id).toBeNull();
    }
  });

  it("deve permitir que outro usuário entre no grupo usando um código de convite válido", async () => {
    const dono = await authService.cadastrar({
      nome_completo: "Dono do Grupo",
      email: `dono-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Animal?",
      resposta_secreta: "Gato",
      grupo_nome: "Tech Innovators",
    });

    const convidado = await authService.cadastrar({
      nome_completo: "Membro Convidado",
      email: `convidado-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Cor?",
      resposta_secreta: "Azul",
    });

    expect(dono.grupo).toBeDefined();
    const convites = await grupoService.listarConvites(dono.grupo!.id, dono.usuario.id);
    expect(convites).toHaveLength(5);
    const primeiroConvite = convites[0];

    // Aceitar convite
    const respostaAceite = await grupoService.aceitarConvite(primeiroConvite.codigo, convidado.usuario.id);
    expect(respostaAceite.grupo.id).toBe(dono.grupo!.id);

    // Checar se o membro foi adicionado
    const membros = await grupoService.listarMembros(dono.grupo!.id, dono.usuario.id);
    const idsMembros = membros.map((m) => m.usuario_id);
    expect(idsMembros).toContain(convidado.usuario.id);

    // Checar se o convite agora está marcado como usado
    const convitesAtualizados = await grupoService.listarConvites(dono.grupo!.id, dono.usuario.id);
    const conviteUsado = convitesAtualizados.find((c) => c.id === primeiroConvite.id);
    expect(conviteUsado?.status).toBe("usado");
    expect(conviteUsado?.usado_por_id).toBe(convidado.usuario.id);
  });

  it("não deve permitir reutilizar um código de convite que já foi consumido", async () => {
    const dono = await authService.cadastrar({
      nome_completo: "Dono Reuso",
      email: `dono-reuso-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Time?",
      resposta_secreta: "Vasco",
      grupo_nome: "Squad Beta",
    });

    const user1 = await authService.cadastrar({
      nome_completo: "User Um",
      email: `user1-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Cidade?",
      resposta_secreta: "Rio",
    });

    const user2 = await authService.cadastrar({
      nome_completo: "User Dois",
      email: `user2-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Cidade?",
      resposta_secreta: "SP",
    });

    const convites = await grupoService.listarConvites(dono.grupo!.id, dono.usuario.id);
    const codigo = convites[0].codigo;

    // Primeiro usuário usa com sucesso
    await grupoService.aceitarConvite(codigo, user1.usuario.id);

    // Segundo usuário tenta usar o mesmo código
    expect(async () => {
      await grupoService.aceitarConvite(codigo, user2.usuario.id);
    }).toThrow();
  });

  it("deve isolar projetos e demandas por grupo (multi-tenancy)", async () => {
    // Grupo A
    const donoA = await authService.cadastrar({
      nome_completo: "Dono A",
      email: `dono-a-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "A?",
      resposta_secreta: "A",
      grupo_nome: "Grupo A",
    });

    // Grupo B
    const donoB = await authService.cadastrar({
      nome_completo: "Dono B",
      email: `dono-b-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "B?",
      resposta_secreta: "B",
      grupo_nome: "Grupo B",
    });

    // Criar projeto no Grupo A
    const projA = await projetoRepository.criar({
      id: crypto.randomUUID(),
      nome: "Projeto Exclusivo Grupo A",
      descricao: "Confidencial",
      grupo_id: donoA.grupo!.id,
      criado_em: new Date().toISOString(),
    });

    // Criar projeto no Grupo B
    const projB = await projetoRepository.criar({
      id: crypto.randomUUID(),
      nome: "Projeto Exclusivo Grupo B",
      descricao: "Confidencial",
      grupo_id: donoB.grupo!.id,
      criado_em: new Date().toISOString(),
    });

    // Criar demandas em cada um
    await demandaRepository.criar({
      id: crypto.randomUUID(),
      titulo: "Demanda do Grupo A",
      descricao: "Detalhes A",
      projeto_id: projA.id,
      responsavel_id: donoA.usuario.id,
      criado_por_id: donoA.usuario.id,
      prazo: "2026-12-31",
      status: "aberta",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });

    await demandaRepository.criar({
      id: crypto.randomUUID(),
      titulo: "Demanda do Grupo B",
      descricao: "Detalhes B",
      projeto_id: projB.id,
      responsavel_id: donoB.usuario.id,
      criado_por_id: donoB.usuario.id,
      prazo: "2026-12-31",
      status: "aberta",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });

    // Listar projetos por grupo
    const projetosA = await projetoRepository.listar(donoA.grupo!.id);
    const projetosB = await projetoRepository.listar(donoB.grupo!.id);

    expect(projetosA.map((p) => p.id)).toContain(projA.id);
    expect(projetosA.map((p) => p.id)).not.toContain(projB.id);

    expect(projetosB.map((p) => p.id)).toContain(projB.id);
    expect(projetosB.map((p) => p.id)).not.toContain(projA.id);

    // Listar demandas por grupo
    const demandasA = await demandaRepository.listar({ grupo_id: donoA.grupo!.id });
    const demandasB = await demandaRepository.listar({ grupo_id: donoB.grupo!.id });

    expect(demandasA.some((d) => d.titulo === "Demanda do Grupo A")).toBe(true);
    expect(demandasA.some((d) => d.titulo === "Demanda do Grupo B")).toBe(false);

    expect(demandasB.some((d) => d.titulo === "Demanda do Grupo B")).toBe(true);
    expect(demandasB.some((d) => d.titulo === "Demanda do Grupo A")).toBe(false);
  });
});
