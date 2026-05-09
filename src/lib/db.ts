import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const DB_PATH = 'sqlite.db';

let database: SqlJsDatabase;

function runMigrations(db: SqlJsDatabase) {
  // Check if users table exists
  const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
  if (result.length === 0) {
    // Read and execute the initial migration
    const migrationPath = path.join(process.cwd(), 'drizzle', '0000_wise_ultimates.sql');
    if (existsSync(migrationPath)) {
      const sql = readFileSync(migrationPath, 'utf-8');
      const statements = sql.split('--> statement-breakpoint');
      for (const stmt of statements) {
        const trimmed = stmt.trim();
        if (trimmed) {
          db.run(trimmed);
        }
      }
      saveDb();
    }
  }

  // Migration 1: Add email verification columns
  const columns = db.exec("PRAGMA table_info('users')");
  const hasEmailVerified = columns[0]?.values.some((row: unknown[]) => row[1] === 'email_verified');
  if (!hasEmailVerified) {
    db.run("ALTER TABLE users ADD COLUMN email_verified integer NOT NULL DEFAULT 0");
    db.run("ALTER TABLE users ADD COLUMN verification_token text");
    db.run("ALTER TABLE users ADD COLUMN token_expires_at text");
    saveDb();
  }
}

async function initDb() {
  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    database = new SQL.Database(buffer);
  } else {
    database = new SQL.Database();
  }
  runMigrations(database);
}

export function saveDb() {
  writeFileSync(DB_PATH, database.export());
}

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    await initDb();
    _db = drizzle(database, { schema });
  }
  return _db;
}
