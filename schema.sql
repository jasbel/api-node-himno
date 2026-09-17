-- D1 schema for api-himno (same as d1-seed.sql)
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  code TEXT,
  title TEXT,
  "musicalNote" TEXT,
  paragraphs TEXT,
  chorus TEXT
);
