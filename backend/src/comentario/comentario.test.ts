import { describe, expect, it } from "bun:test";
import { db } from "../database/connection";
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

  usuarioRepository.criar(usuario1);
  usuarioRepository.criar(usuario2);
  projetoRepository.criar(projeto);
  demandaRepository.criar(demanda);

  it("deve criar um comentário com sucesso e retornar dados do autor", () => {
    const c = comentarioService.criar(
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

  it("deve rejeitar criação com texto vazio ou apenas espaços", () => {
    expect(() =>
      comentarioService.criar(demanda.id, { texto: "   " }, usuario1.id)
    ).toThrow();
  });

  it("deve rejeitar criação para demanda inexistente", () => {
    expect(() =>
      comentarioService.criar("demanda-fake", { texto: "Ola" }, usuario1.id)
    ).toThrow();
  });

  it("deve listar comentários ordenados cronologicamente (do mais antigo para o mais recente)", () => {
    const c2 = comentarioService.criar(
      demanda.id,
      { texto: "Segundo comentário" },
      usuario2.id
    );

    const lista = comentarioService.listarPorDemanda(demanda.id);
    expect(lista.length).toBeGreaterThanOrEqual(2);
    expect(lista[0].texto).toBe("Primeiro comentário de teste");
    expect(lista[1].texto).toBe("Segundo comentário");
    expect(lista[1].usuario_nome).toBe("Bob Santos");
  });

  it("deve permitir que o autor edite o comentário e atualize atualizado_em", async () => {
    const lista = comentarioService.listarPorDemanda(demanda.id);
    const primeiro = lista[0];

    // Aguarda um pequeno instante para garantir timestamps diferentes
    await new Promise((resolve) => setTimeout(resolve, 10));

    const editado = comentarioService.atualizar(
      primeiro.id,
      { texto: "Texto editado com sucesso" },
      usuario1.id
    );

    expect(editado.texto).toBe("Texto editado com sucesso");
    expect(editado.atualizado_em).not.toBe(primeiro.atualizado_em);
  });

  it("não deve permitir que outro usuário edite o comentário", () => {
    const lista = comentarioService.listarPorDemanda(demanda.id);
    const primeiro = lista[0];

    expect(() =>
      comentarioService.atualizar(
        primeiro.id,
        { texto: "Tentativa indevida" },
        usuario2.id
      )
    ).toThrow();
  });

  it("não deve permitir que outro usuário exclua o comentário", () => {
    const lista = comentarioService.listarPorDemanda(demanda.id);
    const primeiro = lista[0];

    expect(() =>
      comentarioService.excluir(primeiro.id, usuario2.id)
    ).toThrow();
  });

  it("deve permitir que o autor exclua o comentário", () => {
    const listaAntes = comentarioService.listarPorDemanda(demanda.id);
    const primeiro = listaAntes[0];

    comentarioService.excluir(primeiro.id, usuario1.id);

    const listaDepois = comentarioService.listarPorDemanda(demanda.id);
    expect(listaDepois.find((c) => c.id === primeiro.id)).toBeUndefined();
  });

  it("deve disparar notificação para o responsável da demanda quando outro usuário comenta", () => {
    const notificacoesAntes = notificacaoService.listarPorUsuario(usuario1.id);
    const countAntes = notificacoesAntes.length;

    comentarioService.criar(
      demanda.id,
      { texto: "Notificação de teste para o responsável" },
      usuario2.id
    );

    const notificacoesDepois = notificacaoService.listarPorUsuario(usuario1.id);
    expect(notificacoesDepois.length).toBe(countAntes + 1);
    expect(notificacoesDepois[0].demanda_id).toBe(demanda.id);
    expect(notificacoesDepois[0].tipo).toBe("demanda_comentario");
    expect(notificacoesDepois[0].mensagem).toContain("Bob Santos comentou");
  });

  it("deve excluir automaticamente comentários ao excluir a demanda (ON DELETE CASCADE)", () => {
    const novaDemanda = demandaRepository.criar({
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

    const cCascata = comentarioService.criar(
      novaDemanda.id,
      { texto: "Comentário que será deletado em cascata" },
      usuario1.id
    );

    expect(comentarioRepository.buscarPorId(cCascata.id)).not.toBeNull();

    demandaRepository.excluir(novaDemanda.id);

    // O comentário deve ter sido excluído via foreign key cascade
    expect(comentarioRepository.buscarPorId(cCascata.id)).toBeNull();
  });

  it("deve disparar notificação do tipo mencao quando um usuário é marcado no comentário", () => {
    const usuario3 = {
      id: `user-test-${crypto.randomUUID()}`,
      nome_completo: "Clara Mendes",
      email: `clara.${crypto.randomUUID()}@teste.com`,
      senha_hash: "hash123",
      criado_em: agora,
    };
    usuarioRepository.criar(usuario3);

    const notificacoesAntes = notificacaoService.listarPorUsuario(usuario3.id);
    expect(notificacoesAntes.length).toBe(0);

    comentarioService.criar(
      demanda.id,
      { texto: "Olá @Clara Mendes, por favor veja esta tarefa." },
      usuario1.id
    );

    const notificacoesDepois = notificacaoService.listarPorUsuario(usuario3.id);
    expect(notificacoesDepois.length).toBe(1);
    expect(notificacoesDepois[0].tipo).toBe("mencao");
    expect(notificacoesDepois[0].mensagem).toContain("Alice Silva mencionou você");
  });
});

