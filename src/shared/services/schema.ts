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

  -- Add categories table
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    color TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  -- Create separate tables for each entry type
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    tags TEXT,
    categoryId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS sparks (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    tags TEXT,
    linkedEntryIds TEXT,
    categoryId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    description TEXT DEFAULT '',
    tags TEXT,
    done INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 0,
    dueDate TEXT,
    subActions TEXT,
    parentId TEXT,
    parentType TEXT,
    categoryId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS loops (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT, -- JSON string (e.g. { type: 'daily' })
    startTimeByDay TEXT, -- JSON string (e.g. { mon: '08:00', tue: '09:00' })
    tags TEXT,
    categoryId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
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
    categoryId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
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

// Add migration functions to alter tables if they exist but are missing columns
export const migrationSQL = `
  -- Add missing columns to actions table if it exists
  PRAGMA foreign_keys=off;
  
  BEGIN TRANSACTION;

  -- Check if actions table exists but is missing columns
  SELECT COUNT(*) AS count_column FROM pragma_table_info('actions') WHERE name='description';
  
  -- Migration for actions table
  ALTER TABLE actions ADD COLUMN description TEXT DEFAULT '';
  ALTER TABLE actions ADD COLUMN completed INTEGER DEFAULT 0;
  ALTER TABLE actions ADD COLUMN priority INTEGER DEFAULT 0;
  
  COMMIT;
  
  PRAGMA foreign_keys=on;
`;

// Function to safely add a column to a table if it doesn't exist
export const addColumnIfNotExists = `
  SELECT CASE 
      WHEN NOT EXISTS(SELECT 1 FROM pragma_table_info(?1) WHERE name=?2) 
      THEN ('ALTER TABLE ' || ?1 || ' ADD COLUMN ' || ?2 || ' ' || ?3)
      ELSE 'SELECT 1 WHERE 0'
  END as sql_stmt;
`; 