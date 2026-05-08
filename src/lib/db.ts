import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const DB_PATH = 'sqlite.db';

let database: SqlJsDatabase;

async function initDb() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    database = new SQL.Database(buffer);
  } else {
    database = new SQL.Database();
  }
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
