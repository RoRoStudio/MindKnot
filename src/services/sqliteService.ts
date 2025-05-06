import * as SQLite from 'expo-sqlite';
import { NodeModel } from '../types/NodeTypes';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('mindknot.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      body TEXT,
      icon TEXT,
      color TEXT,
      x REAL,
      y REAL,
      template TEXT,
      status TEXT,
      createdAt INTEGER,
      updatedAt INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY NOT NULL,
      sourceId TEXT,
      targetId TEXT,
      type TEXT,
      createdAt INTEGER
    );
  `);
}

export async function getAllNodes(): Promise<NodeModel[]> {
  if (!db) return [];
  const result = await db.getAllAsync<NodeModel>('SELECT * FROM nodes;');
  return result;
}

export async function insertNode(node: NodeModel): Promise<void> {
  if (!db) return;
  await db.runAsync(
    `INSERT OR REPLACE INTO nodes 
      (id, title, body, icon, color, x, y, template, status, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      node.id,
      node.title,
      node.body || '',
      node.icon || '',
      node.color,
      node.x,
      node.y,
      node.template,
      node.status || '',
      node.createdAt,
      node.updatedAt,
    ]
  );
}

export async function updateNode(node: NodeModel): Promise<void> {
  if (!db) return;
  await db.runAsync(
    `UPDATE nodes SET x = ?, y = ?, updatedAt = ? WHERE id = ?;`,
    [node.x, node.y, node.updatedAt, node.id]
  );
}

export async function deleteAllNodes(): Promise<void> {
  if (!db) return;
  await db.runAsync('DELETE FROM nodes;');
}
