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
    pergunta_secreta TEXT,
    resposta_secreta_hash TEXT,
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
  CREATE TABLE IF NOT EXISTS grupos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    dono_id TEXT NOT NULL,
    criado_em TEXT NOT NULL,
    FOREIGN KEY (dono_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS grupo_membros (
    grupo_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    criado_em TEXT NOT NULL,
    PRIMARY KEY (grupo_id, usuario_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS convites (
    id TEXT PRIMARY KEY,
    grupo_id TEXT NOT NULL,
    codigo TEXT NOT NULL UNIQUE,
    criado_por_id TEXT NOT NULL,
    usado_por_id TEXT,
    criado_em TEXT NOT NULL,
    usado_em TEXT,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por_id) REFERENCES usuarios(id),
    FOREIGN KEY (usado_por_id) REFERENCES usuarios(id)
  );

  CREATE INDEX IF NOT EXISTS idx_convites_codigo ON convites(codigo);
  CREATE INDEX IF NOT EXISTS idx_convites_grupo ON convites(grupo_id);
  CREATE INDEX IF NOT EXISTS idx_grupo_membros_usuario ON grupo_membros(usuario_id);
`);

const colunasProjeto = db.query("PRAGMA table_info(projetos)").all() as Array<{ name: string }>;
if (!colunasProjeto.some((c) => c.name === "grupo_id")) {
  db.exec("ALTER TABLE projetos ADD COLUMN grupo_id TEXT REFERENCES grupos(id);");
}

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

const colunasUsuario = db.query("PRAGMA table_info(usuarios)").all() as Array<{ name: string }>;
if (!colunasUsuario.some((c) => c.name === "pergunta_secreta")) {
  db.exec("ALTER TABLE usuarios ADD COLUMN pergunta_secreta TEXT;");
}
if (!colunasUsuario.some((c) => c.name === "resposta_secreta_hash")) {
  db.exec("ALTER TABLE usuarios ADD COLUMN resposta_secreta_hash TEXT;");
}

// Migração retroativa de dados legados para manter compatibilidade
const totalGrupos = (db.query("SELECT COUNT(*) as total FROM grupos").get() as { total: number })?.total ?? 0;
const totalUsuarios = (db.query("SELECT COUNT(*) as total FROM usuarios").get() as { total: number })?.total ?? 0;

if (totalGrupos === 0 && totalUsuarios > 0) {
  const primeiroUsuario = db.query("SELECT id FROM usuarios ORDER BY criado_em ASC LIMIT 1").get() as { id: string } | null;
  if (primeiroUsuario) {
    const grupoPadraoId = "grupo-padrao-orion";
    const agora = new Date().toISOString();
    db.run(
      "INSERT OR IGNORE INTO grupos (id, nome, dono_id, criado_em) VALUES (?, ?, ?, ?)",
      [grupoPadraoId, "Equipe Orion", primeiroUsuario.id, agora]
    );
    const usuarios = db.query("SELECT id FROM usuarios").all() as Array<{ id: string }>;
    for (const u of usuarios) {
      db.run("INSERT OR IGNORE INTO grupo_membros (grupo_id, usuario_id, criado_em) VALUES (?, ?, ?)", [grupoPadraoId, u.id, agora]);
    }
    db.run("UPDATE projetos SET grupo_id = ? WHERE grupo_id IS NULL", [grupoPadraoId]);
    for (let i = 0; i < 5; i++) {
      const codigo = `ORION-${crypto.randomUUID().slice(0, 4).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
      db.run(
        "INSERT INTO convites (id, grupo_id, codigo, criado_por_id, criado_em) VALUES (?, ?, ?, ?, ?)",
        [crypto.randomUUID(), grupoPadraoId, codigo, primeiroUsuario.id, agora]
      );
    }
  }
}

