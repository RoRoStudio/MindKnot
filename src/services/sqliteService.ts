// src/services/sqliteService.ts (update)
import * as SQLite from 'expo-sqlite';
import { NodeModel, LinkModel } from '../types/NodeTypes';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  try {
    console.log("Initializing database...");
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
        label TEXT,
        color TEXT,
        style TEXT,
        type TEXT,
        createdAt INTEGER,
        updatedAt INTEGER,
        FOREIGN KEY (sourceId) REFERENCES nodes(id) ON DELETE CASCADE,
        FOREIGN KEY (targetId) REFERENCES nodes(id) ON DELETE CASCADE
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export async function getAllNodes(): Promise<NodeModel[]> {
  try {
    if (!db) {
      console.warn("Database not initialized when trying to get all nodes");
      return [];
    }
    const result = await db.getAllAsync<NodeModel>('SELECT * FROM nodes;');
    return result;
  } catch (error) {
    console.error("Error getting all nodes:", error);
    return [];
  }
}

export async function getAllLinks(): Promise<LinkModel[]> {
  try {
    if (!db) {
      console.warn("Database not initialized when trying to get all links");
      return [];
    }
    const result = await db.getAllAsync<LinkModel>('SELECT * FROM links;');
    return result;
  } catch (error) {
    console.error("Error getting all links:", error);
    return [];
  }
}

export async function insertNode(node: NodeModel): Promise<boolean> {
  try {
    if (!db) {
      console.error("Database not initialized when trying to insert node");
      return false;
    }
    console.log("Inserting node into database:", node.id);

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
    console.log("Node inserted successfully:", node.id);
    return true;
  } catch (error) {
    console.error("Error inserting node:", error);
    return false;
  }
}

export async function insertLink(link: LinkModel): Promise<boolean> {
  try {
    if (!db) {
      console.error("Database not initialized when trying to insert link");
      return false;
    }
    console.log("Inserting link into database:", link.id);

    await db.runAsync(
      `INSERT OR REPLACE INTO links 
        (id, sourceId, targetId, label, color, style, type, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        link.id,
        link.sourceId,
        link.targetId,
        link.label || '',
        link.color || '',
        link.style || 'solid',
        link.type,
        link.createdAt,
        link.updatedAt || link.createdAt,
      ]
    );
    console.log("Link inserted successfully:", link.id);
    return true;
  } catch (error) {
    console.error("Error inserting link:", error);
    return false;
  }
}

export async function updateNode(node: NodeModel): Promise<boolean> {
  try {
    if (!db) {
      console.error("Database not initialized when trying to update node");
      return false;
    }

    await db.runAsync(
      `UPDATE nodes SET x = ?, y = ?, updatedAt = ? WHERE id = ?;`,
      [node.x, node.y, node.updatedAt, node.id]
    );
    return true;
  } catch (error) {
    console.error("Error updating node:", error);
    return false;
  }
}

export async function deleteLink(linkId: string): Promise<boolean> {
  try {
    if (!db) {
      console.error("Database not initialized when trying to delete link");
      return false;
    }

    await db.runAsync('DELETE FROM links WHERE id = ?;', [linkId]);
    console.log("Link deleted successfully:", linkId);
    return true;
  } catch (error) {
    console.error("Error deleting link:", error);
    return false;
  }
}

export async function getLinksForNode(nodeId: string): Promise<LinkModel[]> {
  try {
    if (!db) {
      console.warn("Database not initialized when trying to get links for node");
      return [];
    }
    const result = await db.getAllAsync<LinkModel>(
      'SELECT * FROM links WHERE sourceId = ? OR targetId = ?;',
      [nodeId, nodeId]
    );
    return result;
  } catch (error) {
    console.error("Error getting links for node:", error);
    return [];
  }
}

export async function deleteAllNodes(): Promise<boolean> {
  try {
    if (!db) {
      console.error("Database not initialized when trying to delete all nodes");
      return false;
    }

    await db.runAsync('DELETE FROM links;');
    await db.runAsync('DELETE FROM nodes;');
    return true;
  } catch (error) {
    console.error("Error deleting all nodes:", error);
    return false;
  }
}