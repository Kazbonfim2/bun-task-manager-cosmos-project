import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const dbPath = process.env.SQLITE_PATH ?? "./data/orion.db";

mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projetos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    criado_em TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS demandas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    projeto_id TEXT NOT NULL,
    responsavel_id TEXT NOT NULL,
    criado_por_id TEXT NOT NULL,
    prazo TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('aberta', 'em_andamento', 'concluida')),
    criado_em TEXT NOT NULL,
    atualizado_em TEXT NOT NULL,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
    FOREIGN KEY (criado_por_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS notificacoes (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    demanda_id TEXT,
    tipo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comentarios (
    id TEXT PRIMARY KEY,
    demanda_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    texto TEXT NOT NULL,
    criado_em TEXT NOT NULL,
    atualizado_em TEXT NOT NULL,

    FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE INDEX IF NOT EXISTS idx_comentarios_demanda
  ON comentarios(demanda_id);
`);

const colunasDemanda = db.query("PRAGMA table_info(demandas)").all() as Array<{
  name: string;
  notnull: number;
}>;
const colDescricao = colunasDemanda.find((c) => c.name === "descricao");
const temTitulo = colunasDemanda.some((c) => c.name === "titulo");

if (colunasDemanda.length > 0 && (!temTitulo || colDescricao?.notnull === 1)) {
  db.exec(`
    PRAGMA foreign_keys = OFF;
    CREATE TABLE IF NOT EXISTS demandas_nova (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT,
      projeto_id TEXT NOT NULL,
      responsavel_id TEXT NOT NULL,
      criado_por_id TEXT NOT NULL,
      prazo TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('aberta', 'em_andamento', 'concluida')),
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      FOREIGN KEY (projeto_id) REFERENCES projetos(id),
      FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
      FOREIGN KEY (criado_por_id) REFERENCES usuarios(id)
    );
    INSERT INTO demandas_nova (id, titulo, descricao, projeto_id, responsavel_id, criado_por_id, prazo, status, criado_em, atualizado_em)
    SELECT id, ${temTitulo ? "COALESCE(NULLIF(titulo, ''), descricao)" : "descricao"} AS titulo, NULLIF(descricao, '') AS descricao, projeto_id, responsavel_id, criado_por_id, prazo, status, criado_em, atualizado_em FROM demandas;
    DROP TABLE demandas;
    ALTER TABLE demandas_nova RENAME TO demandas;
    PRAGMA foreign_keys = ON;
  `);
}
