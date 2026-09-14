import { describe, expect, it } from "bun:test";
import { demandaRepository } from "../demanda/demanda.repository";
import { notificacaoService } from "../notificacao/notificacao.service";
import { projetoRepository } from "../projeto/projeto.repository";
import { usuarioRepository } from "../usuario/usuario.repository";
import { comentarioRepository } from "./comentario.repository";
import { comentarioService } from "./comentario.service";

describe("Recurso de Comentários", () => {
  const agora = new Date().toISOString();
  const usuario1 = {
    id: `user-test-${crypto.randomUUID()}`,
    nome_completo: "Alice Silva",
    email: `alice.${crypto.randomUUID()}@teste.com`,
    senha_hash: "hash123",
    criado_em: agora,
  };
  const usuario2 = {
    id: `user-test-${crypto.randomUUID()}`,
    nome_completo: "Bob Santos",
    email: `bob.${crypto.randomUUID()}@teste.com`,
    senha_hash: "hash123",
    criado_em: agora,
  };
  const projeto = {
    id: `proj-test-${crypto.randomUUID()}`,
    nome: "Projeto Teste",
    descricao: "Descricao",
    criado_em: agora,
  };
  const demanda = {
    id: `dem-test-${crypto.randomUUID()}`,
    titulo: "Demanda Teste",
    descricao: "Desc",
    projeto_id: projeto.id,
    responsavel_id: usuario1.id,
    criado_por_id: usuario1.id,
    prazo: "2026-12-31",
    status: "aberta" as const,
    criado_em: agora,
    atualizado_em: agora,
  };

  const setupPromise = (async () => {
    await usuarioRepository.criar(usuario1);
    await usuarioRepository.criar(usuario2);
    await projetoRepository.criar(projeto);
    await demandaRepository.criar(demanda);
  })();

  it("deve criar um comentário com sucesso e retornar dados do autor", async () => {
    await setupPromise;
    const c = await comentarioService.criar(
      demanda.id,
      { texto: "Primeiro comentário de teste" },
      usuario1.id
    );

    expect(c.id).toBeDefined();
    expect(c.demanda_id).toBe(demanda.id);
    expect(c.usuario_id).toBe(usuario1.id);
    expect(c.texto).toBe("Primeiro comentário de teste");
    expect(c.usuario_nome).toBe("Alice Silva");
    expect(c.usuario_email).toBe(usuario1.email);
    expect(c.criado_em).toBeDefined();
    expect(c.atualizado_em).toBeDefined();
  });

  it("deve rejeitar criação com texto vazio ou apenas espaços", async () => {
    await setupPromise;
    expect(async () =>
      comentarioService.criar(demanda.id, { texto: "   " }, usuario1.id)
    ).toThrow();
  });

  it("deve rejeitar criação para demanda inexistente", async () => {
    await setupPromise;
    expect(async () =>
      comentarioService.criar("demanda-fake", { texto: "Ola" }, usuario1.id)
    ).toThrow();
  });

  it("deve listar comentários ordenados cronologicamente (do mais antigo para o mais recente)", async () => {
    await setupPromise;
    await comentarioService.criar(
      demanda.id,
      { texto: "Segundo comentário" },
      usuario2.id
    );

    const lista = await comentarioService.listarPorDemanda(demanda.id);
    expect(lista.length).toBeGreaterThanOrEqual(2);
    expect(lista[0].texto).toBe("Primeiro comentário de teste");
    expect(lista[1].texto).toBe("Segundo comentário");
    expect(lista[1].usuario_nome).toBe("Bob Santos");
  });

  it("deve permitir que o autor edite o comentário e atualize atualizado_em", async () => {
    await setupPromise;
    const lista = await comentarioService.listarPorDemanda(demanda.id);
    const primeiro = lista[0];

    await new Promise((resolve) => setTimeout(resolve, 10));

    const editado = await comentarioService.atualizar(
      primeiro.id,
      { texto: "Texto editado com sucesso" },
      usuario1.id
    );

    expect(editado.texto).toBe("Texto editado com sucesso");
    expect(editado.atualizado_em).not.toBe(primeiro.atualizado_em);
  });

  it("não deve permitir que outro usuário edite o comentário", async () => {
    await setupPromise;
    const lista = await comentarioService.listarPorDemanda(demanda.id);
    const primeiro = lista[0];

    expect(async () =>
      comentarioService.atualizar(
        primeiro.id,
        { texto: "Tentativa indevida" },
        usuario2.id
      )
    ).toThrow();
  });

  it("não deve permitir que outro usuário exclua o comentário", async () => {
    await setupPromise;
    const lista = await comentarioService.listarPorDemanda(demanda.id);
    const primeiro = lista[0];

    expect(async () =>
      comentarioService.excluir(primeiro.id, usuario2.id)
    ).toThrow();
  });

  it("deve permitir que o autor exclua o comentário", async () => {
    await setupPromise;
    const listaAntes = await comentarioService.listarPorDemanda(demanda.id);
    const primeiro = listaAntes[0];

    await comentarioService.excluir(primeiro.id, usuario1.id);

    const listaDepois = await comentarioService.listarPorDemanda(demanda.id);
    expect(listaDepois.find((c) => c.id === primeiro.id)).toBeUndefined();
  });

  it("deve disparar notificação para o responsável da demanda quando outro usuário comenta", async () => {
    await setupPromise;
    const notificacoesAntes = await notificacaoService.listarPorUsuario(usuario1.id);
    const countAntes = notificacoesAntes.length;

    await comentarioService.criar(
      demanda.id,
      { texto: "Notificação de teste para o responsável" },
      usuario2.id
    );

    const notificacoesDepois = await notificacaoService.listarPorUsuario(usuario1.id);
    expect(notificacoesDepois.length).toBe(countAntes + 1);
    expect(notificacoesDepois[0].demanda_id).toBe(demanda.id);
    expect(notificacoesDepois[0].tipo).toBe("demanda_comentario");
    expect(notificacoesDepois[0].mensagem).toContain("Bob Santos comentou");
  });

  it("deve excluir automaticamente comentários ao excluir a demanda (ON DELETE CASCADE)", async () => {
    await setupPromise;
    const novaDemanda = await demandaRepository.criar({
      id: `dem-cascade-${crypto.randomUUID()}`,
      titulo: "Demanda Cascata",
      descricao: "Desc",
      projeto_id: projeto.id,
      responsavel_id: usuario1.id,
      criado_por_id: usuario1.id,
      prazo: "2026-12-31",
      status: "aberta",
      criado_em: agora,
      atualizado_em: agora,
    });

    const cCascata = await comentarioService.criar(
      novaDemanda.id,
      { texto: "Comentário que será deletado em cascata" },
      usuario1.id
    );

    expect(await comentarioRepository.buscarPorId(cCascata.id)).not.toBeNull();

    await demandaRepository.excluir(novaDemanda.id);

    expect(await comentarioRepository.buscarPorId(cCascata.id)).toBeNull();
  });

  it("deve disparar notificação do tipo mencao quando um usuário é marcado no comentário", async () => {
    await setupPromise;
    const usuario3 = {
      id: `user-test-${crypto.randomUUID()}`,
      nome_completo: "Clara Mendes",
      email: `clara.${crypto.randomUUID()}@teste.com`,
      senha_hash: "hash123",
      criado_em: agora,
    };
    await usuarioRepository.criar(usuario3);

    const notificacoesAntes = await notificacaoService.listarPorUsuario(usuario3.id);
    expect(notificacoesAntes.length).toBe(0);

    await comentarioService.criar(
      demanda.id,
      { texto: "Olá @Clara Mendes, por favor veja esta tarefa." },
      usuario1.id
    );

    const notificacoesDepois = await notificacaoService.listarPorUsuario(usuario3.id);
    expect(notificacoesDepois.length).toBe(1);
    expect(notificacoesDepois[0].tipo).toBe("mencao");
    expect(notificacoesDepois[0].mensagem).toContain("Alice Silva mencionou você");
  });
});
