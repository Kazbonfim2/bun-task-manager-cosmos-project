import { HttpError } from "../http-error";
import { ProjetoRepository } from "./projeto.repository";
import type { NovoProjeto, Projeto } from "./projeto.types";

export class ProjetoService {
  constructor(private repository: ProjetoRepository) {}

  criar(dados: NovoProjeto): Projeto {
    const nome = dados.nome?.trim();
    if (!nome) throw new HttpError(400, "Nome do projeto é obrigatório");

    return this.repository.criar({
      id: crypto.randomUUID(),
      nome,
      descricao: dados.descricao?.trim() || null,
      criado_em: new Date().toISOString(),
    });
  }

  listar(): Projeto[] {
    return this.repository.listar();
  }

  buscarOuFalhar(id: string): Projeto {
    const projeto = this.repository.buscarPorId(id);
    if (!projeto) throw new HttpError(404, "Projeto não encontrado");
    return projeto;
  }
}
