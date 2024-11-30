// Configuración centralizada de la tabla de canciones


const songTableConfig = {
  tableName: 'songs',
  columns: {
    id: {name: 'id', attr: 'TEXT PRIMARY KEY'},
    code: {name: 'code', attr: 'TEXT'},
    title: {name: 'title', attr: 'TEXT'},
    musicalNote: {name: 'musicalNote', attr: 'TEXT'},
    paragraphs: {name: 'paragraphs', attr: 'TEXT'},
    chorus: {name: 'chorus', attr: 'TEXT'},
  }
};

type ISongTable = (typeof songTableConfig)
type IColSongTable = ISongTable['columns']

// const songTableColumn = Object
//   .values(songTableConfig.columns)
//   .map(c => c.name) as unknown as IColSongTable;

// Funciones de generación de consultas
function generateInsertQuery(tableConfig: typeof songTableConfig): string {
  const columnsArr = Object.values(tableConfig.columns);
  const columns = columnsArr.map(c => c.name);
  const placeholders = columns.map(() => '?').join(', ');

  return `
    INSERT INTO ${tableConfig.tableName} 
    (${columns.join(', ')}) 
    VALUES (${placeholders})
  `;
}

function generateUpdateQuery(tableConfig: typeof songTableConfig): string {
  const { id, ...updateColumns } = tableConfig.columns;
  const setClauseArr = Object.values(updateColumns)
  const setClause = setClauseArr.map(c => c.name)
    .map(column => `${column} = ?`)
    .join(', ');

  return `
    UPDATE ${tableConfig.tableName}
    SET ${setClause}
    WHERE ${id.name} = ?
  `;
}

function generateCreateTableQuery(tableConfig: typeof songTableConfig): string {
  const columnsArr = Object.values(tableConfig.columns);
  const columns = columnsArr.map(c => `${c.name} ${c.attr}`);
  const columnsString = columns.join(', ');

  return `
    CREATE TABLE IF NOT EXISTS songs (${columnsString})
  `;
}

export const SongsQueries = {
  CREATE: generateInsertQuery(songTableConfig),
  FIND_ALL: `SELECT * FROM songs`,
  FIND_ONE: `SELECT * FROM songs WHERE id = ?`,
  UPDATE: generateUpdateQuery(songTableConfig),
  DELETE: `DELETE FROM songs WHERE id = ?`,
  CREATE_TABLE: generateCreateTableQuery(songTableConfig),
};