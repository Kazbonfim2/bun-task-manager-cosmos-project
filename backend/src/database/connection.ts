import { createClient } from "@libsql/client";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function carregarEnvRaizSeNecessario() {
  const possiveisCaminhos = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../.env"),
    resolve(import.meta.dir, "../../../.env"),
    resolve(import.meta.dir, "../../.env"),
  ];
  for (const caminho of possiveisCaminhos) {
    if (existsSync(caminho)) {
      const conteudo = readFileSync(caminho, "utf-8");
      for (const linha of conteudo.split("\n")) {
        const limpa = linha.trim();
        if (!limpa || limpa.startsWith("#")) continue;
        const [chave, ...resto] = limpa.split("=");
        if (chave && resto.length > 0) {
          const nomeVar = chave.trim();
          const valorVar = resto.join("=").trim().replace(/^["']|["']$/g, "");
          if (!process.env[nomeVar]) {
            process.env[nomeVar] = valorVar;
          }
        }
      }
      break;
    }
  }
}

carregarEnvRaizSeNecessario();

let dbUrl = process.env.TURSO_DATABASE_URL || `file:${process.env.SQLITE_PATH ?? "./data/orion.db"}`;

if (dbUrl.startsWith("turso://")) {
  dbUrl = dbUrl.replace(/^turso:\/\//, "libsql://");
}
const dbAuthToken = dbUrl.startsWith("file:") ? undefined : process.env.TURSO_AUTH_TOKEN;

if (dbUrl.startsWith("file:")) {
  const filePath = dbUrl.replace(/^file:/, "");
  mkdirSync(dirname(filePath), { recursive: true });
}

export const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

export async function initDatabase() {
  if (dbUrl.startsWith("file:")) {
    try {
      await db.execute("PRAGMA foreign_keys = ON;");
      await db.execute("PRAGMA journal_mode = WAL;");
    } catch {
      // Ignora se não for suportado pelo driver/ambiente
    }
  }

  await db.executeMultiple(`
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
      grupo_id TEXT,
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

    CREATE INDEX IF NOT EXISTS idx_comentarios_demanda ON comentarios(demanda_id);

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

  const colunasProjeto = (await db.execute("PRAGMA table_info(projetos)")).rows as unknown as Array<{ name: string }>;
  if (!colunasProjeto.some((c) => c.name === "grupo_id")) {
    try {
      await db.execute("ALTER TABLE projetos ADD COLUMN grupo_id TEXT REFERENCES grupos(id);");
    } catch { }
  }

  const colunasDemanda = (await db.execute("PRAGMA table_info(demandas)")).rows as unknown as Array<{ name: string }>;
  if (!colunasDemanda.some((c) => c.name === "atraso_notificado_em")) {
    try {
      await db.execute("ALTER TABLE demandas ADD COLUMN atraso_notificado_em TEXT;");
    } catch { }
  }

  const colunasUsuario = (await db.execute("PRAGMA table_info(usuarios)")).rows as unknown as Array<{ name: string }>;
  if (!colunasUsuario.some((c) => c.name === "pergunta_secreta")) {
    try {
      await db.execute("ALTER TABLE usuarios ADD COLUMN pergunta_secreta TEXT;");
    } catch { }
  }
  if (!colunasUsuario.some((c) => c.name === "resposta_secreta_hash")) {
    try {
      await db.execute("ALTER TABLE usuarios ADD COLUMN resposta_secreta_hash TEXT;");
    } catch { }
  }

  const resGrupos = await db.execute("SELECT COUNT(*) as total FROM grupos");
  const totalGrupos = Number(resGrupos.rows[0]?.total ?? 0);

  const resUsuarios = await db.execute("SELECT COUNT(*) as total FROM usuarios");
  const totalUsuarios = Number(resUsuarios.rows[0]?.total ?? 0);

  if (totalGrupos === 0 && totalUsuarios > 0) {
    const resPrimeiro = await db.execute("SELECT id FROM usuarios ORDER BY criado_em ASC LIMIT 1");
    const primeiroUsuario = resPrimeiro.rows[0] as unknown as { id: string } | undefined;
    if (primeiroUsuario) {
      const grupoPadraoId = "grupo-padrao-orion";
      const agora = new Date().toISOString();
      await db.execute({
        sql: "INSERT OR IGNORE INTO grupos (id, nome, dono_id, criado_em) VALUES (?, ?, ?, ?)",
        args: [grupoPadraoId, "Equipe Orion", primeiroUsuario.id, agora],
      });
      const resTodosUsuarios = await db.execute("SELECT id FROM usuarios");
      for (const u of resTodosUsuarios.rows) {
        await db.execute({
          sql: "INSERT OR IGNORE INTO grupo_membros (grupo_id, usuario_id, criado_em) VALUES (?, ?, ?)",
          args: [grupoPadraoId, (u as any).id, agora],
        });
      }
      await db.execute({
        sql: "UPDATE projetos SET grupo_id = ? WHERE grupo_id IS NULL",
        args: [grupoPadraoId],
      });
      for (let i = 0; i < 5; i++) {
        const codigo = `ORION-${crypto.randomUUID().slice(0, 4).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
        await db.execute({
          sql: "INSERT INTO convites (id, grupo_id, codigo, criado_por_id, criado_em) VALUES (?, ?, ?, ?, ?)",
          args: [crypto.randomUUID(), grupoPadraoId, codigo, primeiroUsuario.id, agora],
        });
      }
    }
  }
}

await initDatabase();
