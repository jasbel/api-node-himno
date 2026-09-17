// src/songs/songs.queries.ts
// Consultas preparadas para D1 (SQLite)
// La columna "musicalNote" es camelCase en el esquema D1 y debe ir entrecomillada

export const SongsQueries = {
  CREATE: `
    INSERT INTO songs (id, code, title, "musicalNote", paragraphs, chorus)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  FIND_ALL: `SELECT * FROM songs`,
  FIND_ONE: `SELECT * FROM songs WHERE id = ?`,
  UPDATE: `
    UPDATE songs
    SET code = ?, title = ?, "musicalNote" = ?, paragraphs = ?, chorus = ?
    WHERE id = ?
  `,
  DELETE: `DELETE FROM songs WHERE id = ?`,
};
