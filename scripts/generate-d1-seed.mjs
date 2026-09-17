// scripts/generate-d1-seed.mjs
// Regenerates d1-seed.sql from public/json/songs.json (source of truth).
// Mapping follows the existing D1 schema:
//   id          <- id
//   code        <- code | num_song (legacy songs use num_song)
//   title       <- title
//   musicalNote <- musicalNote
//   paragraphs  <- JSON string (kept as-is, numeric chorusPos indices)
//   chorus      <- JSON string
// Extra JSON fields (filename, description) are not part of the schema and are dropped.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePath = join(root, 'public', 'json', 'songs.json');
const outputPath = join(root, 'd1-seed.sql');

const songs = JSON.parse(readFileSync(sourcePath, 'utf8'));

const esc = (value) => String(value ?? '').replace(/'/g, "''");

const rows = songs.map((song) => {
  const id = esc(song.id);
  const code = esc(song.code ?? song.num_song ?? null);
  const title = esc(song.title ?? null);
  const musicalNote = esc(song.musicalNote ?? null);
  const paragraphs = esc(JSON.stringify(song.paragraphs ?? []));
  const chorus = esc(JSON.stringify(song.chorus ?? []));
  return `('${id}', '${code}', '${title}', '${musicalNote}', '${paragraphs}', '${chorus}')`;
});

const header = `-- D1 seed for api-himno
-- Auto-generated from public/json/songs.json (${new Date().toISOString()})
-- ${songs.length} songs. Regenerate with: npm run db:generate
-- WARNING: drops and recreates the songs table (clean re-seed).
DROP TABLE IF EXISTS songs;
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  code TEXT,
  title TEXT,
  "musicalNote" TEXT,
  paragraphs TEXT,
  chorus TEXT
);
`;

const insertPrefix = `INSERT INTO songs (id, code, title, "musicalNote", paragraphs, chorus) VALUES\n`;
const body = rows.map((row) => `${insertPrefix}${row};`).join('\n');

writeFileSync(outputPath, `${header}${body}\n`, 'utf8');
console.log(`Generated ${outputPath} with ${songs.length} songs.`);
