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
    descricao TEXT NOT NULL,
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
`);
