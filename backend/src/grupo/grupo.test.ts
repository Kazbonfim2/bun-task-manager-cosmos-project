import { describe, expect, it } from "bun:test";
import { authService } from "../auth/auth.service";
import { demandaRepository } from "../demanda/demanda.repository";
import { notificacaoService } from "../notificacao/notificacao.service";
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

  it("só o dono remove membro; membro sai do grupo, é notificado e projetos ficam intactos", async () => {
    const dono = await authService.cadastrar({
      nome_completo: "Dono Remover",
      email: `dono-rm-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "X?",
      resposta_secreta: "X",
      grupo_nome: "Grupo Remover Membro",
    });
    const grupoId = dono.grupo!.id;

    const membro = await authService.cadastrar({
      nome_completo: "Membro Removivel",
      email: `membro-rm-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Y?",
      resposta_secreta: "Y",
    });
    const convites = await grupoService.listarConvites(grupoId, dono.usuario.id);
    await grupoService.aceitarConvite(convites[0].codigo, membro.usuario.id);

    const proj = await projetoRepository.criar({
      id: crypto.randomUUID(),
      nome: "Projeto Preservado",
      descricao: null,
      grupo_id: grupoId,
      criado_em: new Date().toISOString(),
    });

    // Membro não pode remover ninguém
    expect(async () => {
      await grupoService.removerMembro(grupoId, dono.usuario.id, membro.usuario.id);
    }).toThrow();

    // Dono não pode remover a si mesmo
    expect(async () => {
      await grupoService.removerMembro(grupoId, dono.usuario.id, dono.usuario.id);
    }).toThrow();

    await grupoService.removerMembro(grupoId, membro.usuario.id, dono.usuario.id);

    const membros = await grupoService.listarMembros(grupoId, dono.usuario.id);
    expect(membros.map((m) => m.usuario_id)).not.toContain(membro.usuario.id);
    expect(membros.map((m) => m.usuario_id)).toContain(dono.usuario.id);

    // Projeto do grupo permanece
    expect(await projetoRepository.buscarPorId(proj.id)).not.toBeNull();

    // Membro removido é notificado
    const notifs = await notificacaoService.listarPorUsuario(membro.usuario.id);
    expect(notifs.some((n) => n.tipo === "removido_grupo")).toBe(true);
  });

  it("só o dono exclui o grupo; remove projetos/demandas, mantém usuários e notifica membros", async () => {
    const dono = await authService.cadastrar({
      nome_completo: "Dono Exclusao",
      email: `dono-del-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "X?",
      resposta_secreta: "X",
      grupo_nome: "Grupo a Excluir",
    });
    const grupoId = dono.grupo!.id;

    // Membro entra via convite
    const membro = await authService.cadastrar({
      nome_completo: "Membro Exclusao",
      email: `membro-del-${Date.now()}@teste.com`,
      senha: "senhaSegura123",
      pergunta_secreta: "Y?",
      resposta_secreta: "Y",
    });
    const convites = await grupoService.listarConvites(grupoId, dono.usuario.id);
    await grupoService.aceitarConvite(convites[0].codigo, membro.usuario.id);

    // Projeto + demanda no grupo
    const proj = await projetoRepository.criar({
      id: crypto.randomUUID(),
      nome: "Projeto Descartável",
      descricao: null,
      grupo_id: grupoId,
      criado_em: new Date().toISOString(),
    });
    await demandaRepository.criar({
      id: crypto.randomUUID(),
      titulo: "Demanda Descartável",
      descricao: null,
      projeto_id: proj.id,
      responsavel_id: dono.usuario.id,
      criado_por_id: dono.usuario.id,
      prazo: "2026-12-31",
      status: "aberta",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });

    // Não-dono não pode excluir
    expect(async () => {
      await grupoService.excluir(grupoId, membro.usuario.id);
    }).toThrow();

    await grupoService.excluir(grupoId, dono.usuario.id);

    // Grupo, projetos e demandas somem
    expect(await grupoRepository.buscarPorId(grupoId)).toBeNull();
    expect((await projetoRepository.listar(grupoId)).length).toBe(0);
    expect(await projetoRepository.buscarPorId(proj.id)).toBeNull();

    // Usuários permanecem
    expect(await authService.login(membro.usuario.email, "senhaSegura123")).toBeDefined();

    // Membro recebe notificação; dono não
    const notifsMembro = await notificacaoService.listarPorUsuario(membro.usuario.id);
    expect(notifsMembro.some((n) => n.tipo === "grupo_excluido")).toBe(true);
    const notifsDono = await notificacaoService.listarPorUsuario(dono.usuario.id);
    expect(notifsDono.some((n) => n.tipo === "grupo_excluido")).toBe(false);
  });
});
