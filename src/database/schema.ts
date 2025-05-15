// src/database/schema.ts

export const createSchemaSQL = `
  CREATE TABLE IF NOT EXISTS sagas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    sagaId TEXT NOT NULL,
    title TEXT,
    chapterNumber INTEGER NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (sagaId) REFERENCES sagas(id)
  );

  -- Create separate tables for each entry type
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    tags TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sparks (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    tags TEXT,
    linkedEntryIds TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    tags TEXT,
    done INTEGER DEFAULT 0,
    dueDate TEXT,
    subActions TEXT,
    parentId TEXT,
    parentType TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS loops (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT, -- JSON string (e.g. { type: 'daily' })
    startTimeByDay TEXT, -- JSON string (e.g. { mon: '08:00', tue: '09:00' })
    tags TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS loop_items (
    id TEXT PRIMARY KEY,
    loopId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    durationMinutes INTEGER,
    quantity TEXT,
    icon TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (loopId) REFERENCES loops(id)
  );

  CREATE TABLE IF NOT EXISTS paths (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    startDate TEXT,
    targetDate TEXT,
    tags TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    pathId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (pathId) REFERENCES paths(id)
  );

  -- Migration support: drop the old captures table if it exists
  DROP TABLE IF EXISTS captures;
`;