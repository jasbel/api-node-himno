// Configuración centralizada de la tabla de canciones
const songTableConfig = {
  tableName: 'songs',
  columns: {
    id: 'id',
    numSong: 'num_song',
    title: 'title',
    description: 'description',
    musicalNote: 'musicalNote',
    paragraphs: 'paragraphs',
    chorus: 'chorus'
  }
};

// Funciones de generación de consultas
function generateInsertQuery(tableConfig: typeof songTableConfig): string {
  const columns = Object.values(tableConfig.columns);
  const placeholders = columns.map(() => '?').join(', ');
  
  return `
    INSERT INTO ${tableConfig.tableName} 
    (${columns.join(', ')}) 
    VALUES (${placeholders})
  `;
}

function generateUpdateQuery(tableConfig: typeof songTableConfig): string {
  const { id, ...updateColumns } = tableConfig.columns;
  const setClause = Object.values(updateColumns)
    .map(column => `${column} = ?`)
    .join(', ');
  
  return `
    UPDATE ${tableConfig.tableName}
    SET ${setClause}
    WHERE ${id} = ?
  `;
}

export const SongsQueries = {
  CREATE: generateInsertQuery(songTableConfig),
  FIND_ALL: `SELECT * FROM songs`,
  FIND_ONE: `SELECT * FROM songs WHERE id = ?`,
  UPDATE: generateUpdateQuery(songTableConfig),
  DELETE: `DELETE FROM songs WHERE id = ?`,
};
