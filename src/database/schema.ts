// ----------------------------
// src/database/schema.ts
// ----------------------------

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

  CREATE TABLE IF NOT EXISTS captures (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type = 'capture'),
    subType TEXT,
    title TEXT,
    sagaId TEXT,
    chapterId TEXT,
    tags TEXT,
    linkedCaptureIds TEXT,
    body TEXT,
    mood TEXT,
    prompt TEXT,
    done INTEGER,
    dueDate TEXT,
    subActions TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (sagaId) REFERENCES sagas(id),
    FOREIGN KEY (chapterId) REFERENCES chapters(id)
  );

  CREATE TABLE IF NOT EXISTS loops (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT, -- JSON string (e.g. { type: 'daily' })
    startTimeByDay TEXT, -- JSON string (e.g. { mon: '08:00', tue: '09:00' })
    sagaId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (sagaId) REFERENCES sagas(id)
  );

  CREATE TABLE IF NOT EXISTS loop_items (
    id TEXT PRIMARY KEY,
    loopId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    durationMinutes INTEGER,
    quantity TEXT,
    icon TEXT,
    subActions TEXT, -- JSON array
    sagaId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (loopId) REFERENCES loops(id),
    FOREIGN KEY (sagaId) REFERENCES sagas(id)
  );

  CREATE TABLE IF NOT EXISTS paths (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    startDate TEXT,
    targetDate TEXT,
    sagaId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (sagaId) REFERENCES sagas(id)
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

  CREATE TABLE IF NOT EXISTS path_actions (
    id TEXT PRIMARY KEY,
    milestoneId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    done INTEGER DEFAULT 0,
    dueDate TEXT,
    sagaId TEXT,
    icon TEXT,
    subActions TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (milestoneId) REFERENCES milestones(id),
    FOREIGN KEY (sagaId) REFERENCES sagas(id)
  );
`;
