import { HttpError } from "../http-error";
import { projetoRepository } from "./projeto.repository";
import type { NovoProjeto, Projeto } from "./projeto.types";

export const projetoService = {
  criar(dados: NovoProjeto): Projeto {
    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do projeto é obrigatório");

    return projetoRepository.criar({
      id: crypto.randomUUID(),
      nome,
      descricao: dados.descricao?.trim() || null,
      criado_em: new Date().toISOString(),
    });
  },

  listar(): Projeto[] {
    return projetoRepository.listar();
  },
};
