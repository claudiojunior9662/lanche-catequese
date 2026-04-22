import Database from 'better-sqlite3'
import path from 'path'

const globalForDb = global;

function createDb() {
  const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.resolve(process.cwd(), 'dev.db')
  const db = new Database(dbPath)

  db.pragma('foreign_keys = ON')

  // Migra schema se ainda tiver a coluna antiga (dataQuarta)
  const colsGrupo = db.prepare("PRAGMA table_info(Grupo)").all()
  const hasNumero = colsGrupo.some(c => c.name === 'numero')
  if (colsGrupo.length > 0 && !hasNumero) {
    db.exec(`DROP TABLE IF EXISTS Integrante; DROP TABLE IF EXISTS Grupo;`)
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS Grupo (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS Integrante (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      telefone  TEXT NOT NULL,
      alimento  TEXT NOT NULL,
      categoria TEXT NOT NULL DEFAULT 'salgado',
      grupoId   INTEGER NOT NULL,
      FOREIGN KEY (grupoId) REFERENCES Grupo(id) ON DELETE CASCADE
    );
  `)

  // Adiciona coluna categoria se a tabela já existia sem ela
  const colsInt = db.prepare("PRAGMA table_info(Integrante)").all()
  if (!colsInt.some(c => c.name === 'categoria')) {
    db.exec(`ALTER TABLE Integrante ADD COLUMN categoria TEXT NOT NULL DEFAULT 'salgado'`)
  }

  return db
}

export const db = globalForDb.db ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db
