import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export type MemoryEntry = {
  id: number;
  timestamp: string;
  input?: string;
  intent: unknown;
  decision: unknown;
  result: unknown;
};

const dataDir = path.join(process.cwd(), "data");
const databasePath = path.join(dataDir, "system-memory.sqlite");

fs.mkdirSync(dataDir, { recursive: true });

const database = new DatabaseSync(databasePath);

export { database as db };

database.exec(`
  CREATE TABLE IF NOT EXISTS system_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    input TEXT,
    intent TEXT NOT NULL,
    decision TEXT NOT NULL,
    result TEXT NOT NULL
  )
`);

database.exec(`
  CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    type TEXT NOT NULL,
    target_path TEXT NOT NULL,
    before_content TEXT NOT NULL,
    after_content TEXT NOT NULL,
    diff TEXT NOT NULL,
    status TEXT NOT NULL,
    author TEXT NOT NULL
  )
`);

const insertEntry = database.prepare(`
  INSERT INTO system_memory (timestamp, input, intent, decision, result)
  VALUES (?, ?, ?, ?, ?)
`);

const selectEntries = database.prepare(`
  SELECT id, timestamp, input, intent, decision, result
  FROM system_memory
  ORDER BY id DESC
  LIMIT ?
`);

export function remember(entry: Omit<MemoryEntry, "id" | "timestamp">) {
  const timestamp = new Date().toISOString();

  insertEntry.run(
    timestamp,
    entry.input ?? null,
    JSON.stringify(entry.intent),
    JSON.stringify(entry.decision),
    JSON.stringify(entry.result),
  );
}

export function recall(limit = 25): MemoryEntry[] {
  const rows = selectEntries.all(limit) as Array<{
    id: number;
    timestamp: string;
    input: string | null;
    intent: string;
    decision: string;
    result: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    input: row.input ?? undefined,
    intent: JSON.parse(row.intent),
    decision: JSON.parse(row.decision),
    result: JSON.parse(row.result),
  }));
}
